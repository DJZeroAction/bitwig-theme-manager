use notify::{Event, RecommendedWatcher, RecursiveMode, Watcher};
use serde::Serialize;
use std::path::{Path, PathBuf};
use std::sync::mpsc::{channel, Receiver, Sender};
use std::sync::{Arc, Mutex};
use std::thread::{self, JoinHandle};
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum WatcherError {
    #[error("Notify error: {0}")]
    Notify(#[from] notify::Error),

    #[error("Path not found: {0}")]
    PathNotFound(PathBuf),

    #[error("Watcher already running")]
    AlreadyRunning,

    #[error("Watcher not running")]
    NotRunning,
}

/// Event payload sent to the frontend when theme files change
#[derive(Clone, Serialize)]
pub struct ThemeChangeEvent {
    pub changed_files: Vec<String>,
    pub watched_path: String,
}

/// A file watcher for theme files
pub struct ThemeWatcher {
    watcher: RecommendedWatcher,
    receiver: Receiver<Result<Event, notify::Error>>,
    watched_path: PathBuf,
}

impl ThemeWatcher {
    /// Create a new theme watcher for a specific file or directory
    pub fn new(path: &Path) -> Result<Self, WatcherError> {
        if !path.exists() {
            return Err(WatcherError::PathNotFound(path.to_path_buf()));
        }

        let (tx, rx) = channel();

        let watcher = RecommendedWatcher::new(
            move |res| {
                let _ = tx.send(res);
            },
            notify::Config::default()
                .with_poll_interval(Duration::from_millis(500)),
        )?;

        Ok(Self {
            watcher,
            receiver: rx,
            watched_path: path.to_path_buf(),
        })
    }

    /// Start watching the path
    pub fn start(&mut self) -> Result<(), WatcherError> {
        self.watcher
            .watch(&self.watched_path, RecursiveMode::NonRecursive)?;
        Ok(())
    }

    /// Stop watching the path
    pub fn stop(&mut self) -> Result<(), WatcherError> {
        self.watcher.unwatch(&self.watched_path)?;
        Ok(())
    }

    /// Check for file changes (non-blocking)
    pub fn poll(&self) -> Option<Vec<PathBuf>> {
        let mut changed_files = Vec::new();

        while let Ok(result) = self.receiver.try_recv() {
            if let Ok(event) = result {
                match event.kind {
                    notify::EventKind::Modify(_) | notify::EventKind::Create(_) => {
                        for path in event.paths {
                            if path.extension().map_or(false, |ext| ext == "bte") {
                                changed_files.push(path);
                            }
                        }
                    }
                    _ => {}
                }
            }
        }

        if changed_files.is_empty() {
            None
        } else {
            Some(changed_files)
        }
    }

    /// Block and wait for the next change event
    pub fn wait_for_change(&self) -> Result<Vec<PathBuf>, WatcherError> {
        loop {
            if let Ok(result) = self.receiver.recv() {
                if let Ok(event) = result {
                    match event.kind {
                        notify::EventKind::Modify(_) | notify::EventKind::Create(_) => {
                            let changed_files: Vec<PathBuf> = event
                                .paths
                                .into_iter()
                                .filter(|p| p.extension().map_or(false, |ext| ext == "bte"))
                                .collect();

                            if !changed_files.is_empty() {
                                return Ok(changed_files);
                            }
                        }
                        _ => {}
                    }
                }
            }
        }
    }
}

/// Internal state for the watcher thread
struct WatcherThreadState {
    stop_signal: Sender<()>,
    handle: JoinHandle<()>,
    watched_path: PathBuf,
}

/// Manages theme file watching with Tauri event integration
pub struct WatcherManager {
    state: Arc<Mutex<Option<WatcherThreadState>>>,
}

impl Default for WatcherManager {
    fn default() -> Self {
        Self::new()
    }
}

impl WatcherManager {
    pub fn new() -> Self {
        Self {
            state: Arc::new(Mutex::new(None)),
        }
    }

    /// Check if the watcher is currently running
    pub fn is_running(&self) -> bool {
        self.state.lock().unwrap().is_some()
    }

    /// Get the currently watched path, if any
    pub fn watched_path(&self) -> Option<PathBuf> {
        self.state
            .lock()
            .unwrap()
            .as_ref()
            .map(|s| s.watched_path.clone())
    }

    /// Start watching a directory for theme file changes
    pub fn start<R: tauri::Runtime>(
        &self,
        app_handle: AppHandle<R>,
        path: PathBuf,
    ) -> Result<(), WatcherError> {
        let mut state = self.state.lock().unwrap();

        if state.is_some() {
            return Err(WatcherError::AlreadyRunning);
        }

        if !path.exists() {
            return Err(WatcherError::PathNotFound(path));
        }

        let (stop_tx, stop_rx) = channel::<()>();
        let watched_path = path.clone();

        let handle = thread::spawn(move || {
            let (tx, rx) = channel();

            let mut watcher = match RecommendedWatcher::new(
                move |res| {
                    let _ = tx.send(res);
                },
                notify::Config::default().with_poll_interval(Duration::from_millis(500)),
            ) {
                Ok(w) => w,
                Err(e) => {
                    eprintln!("Failed to create watcher: {}", e);
                    return;
                }
            };

            if let Err(e) = watcher.watch(&path, RecursiveMode::NonRecursive) {
                eprintln!("Failed to start watching: {}", e);
                return;
            }

            loop {
                // Check for stop signal (non-blocking)
                if stop_rx.try_recv().is_ok() {
                    break;
                }

                // Check for file events with timeout
                match rx.recv_timeout(Duration::from_millis(100)) {
                    Ok(Ok(event)) => {
                        match event.kind {
                            notify::EventKind::Modify(_)
                            | notify::EventKind::Create(_)
                            | notify::EventKind::Remove(_) => {
                                let changed_files: Vec<String> = event
                                    .paths
                                    .iter()
                                    .filter(|p| {
                                        p.extension().map_or(false, |ext| ext == "bte")
                                    })
                                    .map(|p| p.to_string_lossy().to_string())
                                    .collect();

                                if !changed_files.is_empty() {
                                    let event = ThemeChangeEvent {
                                        changed_files,
                                        watched_path: path.to_string_lossy().to_string(),
                                    };

                                    // Emit Tauri event to frontend
                                    if let Err(e) = app_handle.emit("theme-changed", &event) {
                                        eprintln!("Failed to emit theme-changed event: {}", e);
                                    }
                                }
                            }
                            _ => {}
                        }
                    }
                    Ok(Err(e)) => {
                        eprintln!("Watch error: {}", e);
                    }
                    Err(std::sync::mpsc::RecvTimeoutError::Timeout) => {
                        // Continue loop
                    }
                    Err(std::sync::mpsc::RecvTimeoutError::Disconnected) => {
                        break;
                    }
                }
            }
        });

        *state = Some(WatcherThreadState {
            stop_signal: stop_tx,
            handle,
            watched_path,
        });

        Ok(())
    }

    /// Stop watching for theme file changes
    pub fn stop(&self) -> Result<(), WatcherError> {
        let mut state = self.state.lock().unwrap();

        match state.take() {
            Some(thread_state) => {
                // Send stop signal
                let _ = thread_state.stop_signal.send(());

                // Wait for thread to finish (with timeout)
                let _ = thread_state.handle.join();

                Ok(())
            }
            None => Err(WatcherError::NotRunning),
        }
    }
}

/// Watcher status information for frontend
#[derive(Clone, Serialize)]
pub struct WatcherStatus {
    pub is_running: bool,
    pub watched_path: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_watcher_creation() {
        let dir = tempdir().unwrap();
        let watcher = ThemeWatcher::new(dir.path());
        assert!(watcher.is_ok());
    }

    #[test]
    fn test_watcher_nonexistent_path() {
        let path = Path::new("/nonexistent/path");
        let watcher = ThemeWatcher::new(path);
        assert!(watcher.is_err());
    }

    #[test]
    fn test_watcher_poll_no_changes() {
        let dir = tempdir().unwrap();
        let mut watcher = ThemeWatcher::new(dir.path()).unwrap();
        watcher.start().unwrap();

        // No changes yet
        assert!(watcher.poll().is_none());
    }
}
