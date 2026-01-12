use notify::{Event, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::{Path, PathBuf};
use std::sync::mpsc::{channel, Receiver};
use std::time::Duration;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum WatcherError {
    #[error("Notify error: {0}")]
    Notify(#[from] notify::Error),

    #[error("Path not found: {0}")]
    PathNotFound(PathBuf),
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
