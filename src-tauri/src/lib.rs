pub mod bitwig;
pub mod repository;
pub mod settings;
pub mod theme;

use bitwig::{detector, patcher};
use repository::{bundled, cache, fetcher};
use serde::{Deserialize, Serialize};
use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{Emitter, Manager};
use tauri_plugin_updater::{Update, UpdaterExt};
use theme::parser;

// Re-export types for frontend
pub use bitwig::BitwigInstallation;
pub use repository::RepositoryTheme;
pub use theme::{Theme, ThemeMetadata};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppError {
    pub message: String,
}

impl From<theme::ThemeError> for AppError {
    fn from(e: theme::ThemeError) -> Self {
        AppError {
            message: e.to_string(),
        }
    }
}

impl From<patcher::PatchError> for AppError {
    fn from(e: patcher::PatchError) -> Self {
        AppError {
            message: e.to_string(),
        }
    }
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError {
            message: e.to_string(),
        }
    }
}

impl From<fetcher::FetchError> for AppError {
    fn from(e: fetcher::FetchError) -> Self {
        AppError {
            message: e.to_string(),
        }
    }
}

impl From<cache::CacheError> for AppError {
    fn from(e: cache::CacheError) -> Self {
        AppError {
            message: e.to_string(),
        }
    }
}

impl From<theme::WatcherError> for AppError {
    fn from(e: theme::WatcherError) -> Self {
        AppError {
            message: e.to_string(),
        }
    }
}

impl From<settings::SettingsError> for AppError {
    fn from(e: settings::SettingsError) -> Self {
        AppError {
            message: e.to_string(),
        }
    }
}

impl From<bundled::BundledError> for AppError {
    fn from(e: bundled::BundledError) -> Self {
        AppError {
            message: e.to_string(),
        }
    }
}

// Update Info for frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub version: String,
    pub current_version: String,
    pub body: Option<String>,
    pub date: Option<String>,
}

// State to hold pending update
pub struct PendingUpdate(pub Mutex<Option<Update>>);

// Tauri Commands - Updates

/// Check for available updates
#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<Option<UpdateInfo>, AppError> {
    let updater = app.updater().map_err(|e| AppError {
        message: format!("Failed to get updater: {}", e),
    })?;

    match updater.check().await {
        Ok(Some(update)) => {
            let info = UpdateInfo {
                version: update.version.clone(),
                current_version: update.current_version.clone(),
                body: update.body.clone(),
                date: update.date.map(|d| d.to_string()),
            };

            // Store the update for later installation
            if let Some(state) = app.try_state::<PendingUpdate>() {
                let mut pending = state.0.lock().unwrap();
                *pending = Some(update);
            }

            Ok(Some(info))
        }
        Ok(None) => Ok(None),
        Err(e) => Err(AppError {
            message: format!("Failed to check for updates: {}", e),
        }),
    }
}

/// Get the current app version
#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Download progress event payload
#[derive(Clone, serde::Serialize)]
struct DownloadProgress {
    downloaded: usize,
    total: Option<u64>,
}

/// Download and install the pending update
#[tauri::command]
async fn install_update(app: tauri::AppHandle) -> Result<(), AppError> {
    let update = {
        let state = app.state::<PendingUpdate>();
        let mut pending = state.0.lock().unwrap();
        pending.take()
    };

    match update {
        Some(update) => {
            // Download and install the update
            let mut downloaded = 0;
            let app_handle = app.clone();

            update
                .download_and_install(
                    move |chunk_length, content_length| {
                        downloaded += chunk_length;
                        log_event(&format!(
                            "Update download progress: {} / {:?}",
                            downloaded, content_length
                        ));
                        // Emit progress event to frontend
                        let _ = app_handle.emit("update-download-progress", DownloadProgress {
                            downloaded,
                            total: content_length,
                        });
                    },
                    || {
                        log_event("Update download completed, preparing to install");
                    },
                )
                .await
                .map_err(|e| AppError {
                    message: format!("Failed to install update: {}", e),
                })?;

            // Emit completion event
            let _ = app.emit("update-ready", ());
            log_event("Update installed successfully, restart required");
            Ok(())
        }
        None => Err(AppError {
            message: "No pending update available. Please check for updates first.".to_string(),
        }),
    }
}

// Tauri Commands - Bitwig Detection

/// Detect all Bitwig Studio installations on the system
#[tauri::command]
fn detect_bitwig_installations() -> Vec<BitwigInstallation> {
    detector::detect_installations()
}

/// Validate a manually provided Bitwig installation path
#[tauri::command]
fn validate_bitwig_path(path: String) -> Option<BitwigInstallation> {
    detector::validate_installation(&PathBuf::from(path))
}

/// Get the patch status of a Bitwig installation
#[tauri::command]
fn get_patch_status(jar_path: String) -> bool {
    patcher::is_patched(&PathBuf::from(jar_path))
}

/// Get the latest Bitwig version
#[tauri::command]
fn get_latest_bitwig_version() -> String {
    detector::get_latest_version()
}

fn get_log_path_buf() -> Option<PathBuf> {
    dirs::cache_dir()
        .map(|dir| dir.join("bitwig-theme-manager").join("logs").join("app.log"))
}

pub fn log_event(message: &str) {
    let path = match get_log_path_buf() {
        Some(path) => path,
        None => return,
    };

    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    let line = format!("[{}] {}\n", timestamp, message);

    if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) {
        let _ = file.write_all(line.as_bytes());
    }
}

/// Get the log file path
#[tauri::command]
fn get_log_path() -> Option<String> {
    get_log_path_buf().map(|p| p.to_string_lossy().to_string())
}

/// Patch a Bitwig installation (with automatic elevation if needed)
#[tauri::command]
fn patch_bitwig(jar_path: String) -> Result<(), AppError> {
    patcher::patch_jar_elevated(&PathBuf::from(jar_path)).map_err(|e| e.into())
}

/// Restore a Bitwig installation from backup (with automatic elevation if needed)
#[tauri::command]
fn restore_bitwig(jar_path: String) -> Result<(), AppError> {
    patcher::restore_jar_elevated(&PathBuf::from(jar_path)).map_err(|e| e.into())
}

/// Check if a backup exists for a JAR file
#[tauri::command]
fn has_backup(jar_path: String) -> bool {
    patcher::has_backup(&PathBuf::from(jar_path))
}

/// Check if Java is available on the system
#[tauri::command]
fn has_java() -> bool {
    patcher::has_java()
}

/// Download and cache the patcher JAR, return its path
#[tauri::command]
fn ensure_patcher_available() -> Result<String, AppError> {
    patcher::ensure_patcher_available()
        .map(|p| p.to_string_lossy().to_string())
        .map_err(|e| e.into())
}

// Tauri Commands - Theme Files

/// Get the theme directory for a Bitwig version
#[tauri::command]
fn get_theme_directory(bitwig_version: String) -> Option<String> {
    parser::get_theme_directory(&bitwig_version).map(|p| p.to_string_lossy().to_string())
}

/// List all themes for a Bitwig version
#[tauri::command]
fn list_themes(bitwig_version: String) -> Result<Vec<String>, AppError> {
    let themes = parser::list_themes(&bitwig_version)?;
    Ok(themes
        .into_iter()
        .map(|p| p.to_string_lossy().to_string())
        .collect())
}

/// Load a theme from a file
#[tauri::command]
fn load_theme(path: String) -> Result<Theme, AppError> {
    parser::parse_theme_file(&PathBuf::from(path)).map_err(|e| e.into())
}

/// Save a theme to a file
#[tauri::command]
fn save_theme(theme: Theme, path: String) -> Result<(), AppError> {
    parser::save_theme(&theme, &PathBuf::from(path)).map_err(|e| e.into())
}

/// Get the active theme path for a Bitwig version
#[tauri::command]
fn get_active_theme_path(bitwig_version: String) -> Option<String> {
    parser::get_active_theme_path(&bitwig_version).map(|p| p.to_string_lossy().to_string())
}

/// Apply a theme by copying it to the active theme location
/// Also patches Bitwig if not already patched
#[tauri::command]
fn apply_theme(theme_path: String, bitwig_version: String) -> Result<String, AppError> {
    let source = PathBuf::from(theme_path);
    let target = parser::get_active_theme_path(&bitwig_version).ok_or_else(|| AppError {
        message: "Could not determine active theme path".to_string(),
    })?;

    let installations = detector::detect_installations();
    let mut details = Vec::new();
    details.push(format!("Version: {}", bitwig_version));
    details.push(format!("Source: {}", source.to_string_lossy()));
    details.push(format!("Source exists: {}", source.exists()));
    details.push(format!("Target: {}", target.to_string_lossy()));
    details.push(format!("Target exists (before): {}", target.exists()));
    if let Some(parent) = target.parent() {
        details.push(format!("Theme dir: {}", parent.to_string_lossy()));
    }
    details.push(format!("Installations detected: {}", installations.len()));
    for install in &installations {
        details.push(format!(
            "- {} (version {}, patched {}, needs_sudo {})",
            install.jar_path.to_string_lossy(),
            install.version,
            install.is_patched,
            install.needs_sudo
        ));
    }

    log_event(&format!("apply_theme start\n{}", details.join("\n")));

    // Create theme directory if it doesn't exist
    if let Some(parent) = target.parent() {
        std::fs::create_dir_all(parent)?;
    }

    // Copy or convert theme file
    let mut converted = false;
    if let Ok(content) = std::fs::read_to_string(&source) {
        if parser::is_json_content(&content) {
            let theme_name = source
                .file_stem()
                .and_then(|s| s.to_str())
                .map(|s| s.to_string());
            let converted_content = parser::convert_json_to_bte(&content, theme_name.as_deref())
                .map_err(|e| AppError {
                    message: format!("Failed to convert JSON theme: {}", e),
                })?;
            std::fs::write(&target, converted_content).map_err(|e| {
                log_event(&format!("apply_theme write failed: {}", e));
                AppError {
                    message: format!(
                        "Failed to write theme: {}.\n\nDetails:\n{}",
                        e,
                        details.join("\n")
                    ),
                }
            })?;
            converted = true;
            log_event("apply_theme converted json to bte");
        }
    }

    if !converted {
        std::fs::copy(&source, &target).map_err(|e| {
            log_event(&format!("apply_theme copy failed: {}", e));
            AppError {
                message: format!(
                    "Failed to copy theme: {}.\n\nDetails:\n{}",
                    e,
                    details.join("\n")
                ),
            }
        })?;
        log_event("apply_theme copy ok");
    }

    // Check if Bitwig needs patching
    let mut patched_now = false;

    for install in &installations {
        if !install.is_patched {
            // Try to patch
            match patcher::patch_jar_elevated(&install.jar_path) {
                Ok(()) => {
                    patched_now = true;
                }
                Err(e) => {
                    // Return error but theme is already copied
                    log_event(&format!("apply_theme patch failed: {}", e));
                    return Err(AppError {
                        message: format!(
                            "Theme copied but patching failed: {}. Please patch Bitwig manually in the Patch Manager.\n\nDetails:\n{}",
                            e,
                            details.join("\n")
                        ),
                    });
                }
            }
        }
    }

    if patched_now {
        log_event("apply_theme patched");
        Ok(format!(
            "Theme applied and Bitwig patched! Restart Bitwig to see changes.\n\nDetails:\n{}",
            details.join("\n")
        ))
    } else if installations.iter().any(|i| i.is_patched) {
        log_event("apply_theme done (already patched)");
        Ok(format!(
            "Theme applied! Restart Bitwig to see changes.\n\nDetails:\n{}",
            details.join("\n")
        ))
    } else {
        log_event("apply_theme done (no installations found)");
        Ok(format!(
            "Theme copied. No Bitwig installation found to patch.\n\nDetails:\n{}",
            details.join("\n")
        ))
    }
}

/// Reset to default theme by removing the active theme file
#[tauri::command]
fn reset_theme(bitwig_version: String) -> Result<String, AppError> {
    let theme_path = parser::get_active_theme_path(&bitwig_version).ok_or_else(|| AppError {
        message: "Could not determine active theme path".to_string(),
    })?;

    if theme_path.exists() {
        std::fs::remove_file(&theme_path)?;
        log_event(&format!("reset_theme: removed {}", theme_path.display()));
        Ok("Theme reset to default. Restart Bitwig to see changes.".to_string())
    } else {
        Ok("No custom theme was active.".to_string())
    }
}

/// Create a new theme with default values
#[tauri::command]
fn create_theme(name: String, bitwig_version: String) -> Result<Theme, AppError> {
    let theme_dir = parser::get_theme_directory(&bitwig_version).ok_or_else(|| AppError {
        message: "Could not determine theme directory".to_string(),
    })?;

    std::fs::create_dir_all(&theme_dir)?;

    let safe_name: String = name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();
    let mut dest = theme_dir.join(format!("{}.bte", safe_name));
    if dest.exists() {
        let mut counter = 1;
        loop {
            let candidate = theme_dir.join(format!("{}_{}.bte", safe_name, counter));
            if !candidate.exists() {
                dest = candidate;
                break;
            }
            counter += 1;
        }
    }

    let base_theme = parser::get_active_theme_path(&bitwig_version)
        .filter(|path| path.exists())
        .and_then(|path| parser::parse_theme_file(&path).ok())
        .unwrap_or_default();

    let mut theme = Theme::with_name(&name);
    theme.colors = base_theme.colors;
    theme.metadata.author = base_theme.metadata.author;
    theme.metadata.description = base_theme.metadata.description;
    theme.metadata.version = base_theme.metadata.version;
    theme.path = Some(dest.clone());

    parser::save_theme(&theme, &dest)?;

    Ok(theme)
}

/// Import a theme from an external path to the themes directory
#[tauri::command]
fn import_theme(source_path: String, bitwig_version: String) -> Result<String, AppError> {
    let source = PathBuf::from(&source_path);

    // Get filename from source
    let filename = source
        .file_name()
        .ok_or_else(|| AppError {
            message: "Invalid source path".to_string(),
        })?
        .to_string_lossy()
        .to_string();

    // Get theme directory
    let theme_dir = parser::get_theme_directory(&bitwig_version).ok_or_else(|| AppError {
        message: "Could not determine theme directory".to_string(),
    })?;

    // Create theme directory if needed
    std::fs::create_dir_all(&theme_dir)?;

    // Copy file to themes directory
    let dest = theme_dir.join(&filename);
    std::fs::copy(&source, &dest)?;

    Ok(dest.to_string_lossy().to_string())
}

/// Export a theme to an external path
#[tauri::command]
fn export_theme(theme_path: String, dest_path: String) -> Result<(), AppError> {
    let source = PathBuf::from(&theme_path);
    let dest = PathBuf::from(&dest_path);

    std::fs::copy(&source, &dest)?;

    Ok(())
}

/// Delete a theme file
#[tauri::command]
fn delete_theme(theme_path: String) -> Result<(), AppError> {
    let path = PathBuf::from(&theme_path);

    if path.exists() {
        std::fs::remove_file(&path)?;
    }

    Ok(())
}

/// Save downloaded theme content to the themes directory
#[tauri::command]
fn save_downloaded_theme(
    theme_name: String,
    content: String,
    bitwig_version: String,
) -> Result<String, AppError> {
    let theme_dir = parser::get_theme_directory(&bitwig_version).ok_or_else(|| AppError {
        message: "Could not determine theme directory".to_string(),
    })?;

    std::fs::create_dir_all(&theme_dir)?;

    // Sanitize the theme name for use as a filename
    let safe_name: String = theme_name
        .chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' || c == '_' || c == ' ' {
                c
            } else {
                '_'
            }
        })
        .collect();

    let mut dest = theme_dir.join(format!("{}.bte", safe_name));

    // Handle duplicate names
    if dest.exists() {
        let mut counter = 1;
        loop {
            let candidate = theme_dir.join(format!("{}_{}.bte", safe_name, counter));
            if !candidate.exists() {
                dest = candidate;
                break;
            }
            counter += 1;
        }
    }

    std::fs::write(&dest, &content)?;

    Ok(dest.to_string_lossy().to_string())
}

// Tauri Commands - Repository

/// Fetch themes from bundled resources (no network required)
#[tauri::command]
fn fetch_repository_themes(
    app: tauri::AppHandle,
    _force_refresh: bool,
) -> Result<Vec<RepositoryTheme>, AppError> {
    // Load themes from bundled resources
    let themes = bundled::load_bundled_themes(&app)?;
    Ok(themes)
}

/// Get cached repository themes (no network request)
#[tauri::command]
fn get_cached_repository_themes() -> Result<Vec<RepositoryTheme>, AppError> {
    match cache::load_cached_themes()? {
        Some(cached) => Ok(cached.themes),
        None => Ok(Vec::new()),
    }
}

/// Get theme content from bundled resources
#[tauri::command]
fn download_repository_theme(
    app: tauri::AppHandle,
    theme_name: String,
    _repo_url: String,
    download_url: Option<String>,
) -> Result<String, AppError> {
    // Extract filename from the bundled:// URL
    let filename = download_url
        .as_ref()
        .and_then(|url| url.strip_prefix("bundled://"))
        .ok_or_else(|| AppError {
            message: format!("Invalid bundled theme URL for: {}", theme_name),
        })?;

    // Read theme content from bundled resources
    let raw_content = bundled::get_bundled_theme_content(&app, filename)?;

    // Convert JSON themes to BTE format if needed
    let is_json = parser::is_json_content(&raw_content);
    let content = if is_json {
        parser::convert_json_to_bte(&raw_content, Some(&theme_name))?
    } else {
        raw_content
    };

    Ok(content)
}

/// Cache a preview image for a theme
#[tauri::command]
async fn cache_theme_preview(theme_name: String, preview_url: String) -> Result<String, AppError> {
    let path = cache::cache_preview_image(&theme_name, &preview_url).await?;
    Ok(path.to_string_lossy().to_string())
}

/// Get the cached preview path for a theme
#[tauri::command]
fn get_cached_preview_path(theme_name: String) -> Option<String> {
    cache::get_cached_preview(&theme_name).map(|p| p.to_string_lossy().to_string())
}

/// List all cached theme files
#[tauri::command]
fn list_cached_themes() -> Result<Vec<String>, AppError> {
    let themes = cache::list_cached_themes()?;
    Ok(themes
        .into_iter()
        .map(|p| p.to_string_lossy().to_string())
        .collect())
}

/// Clear all cached data
#[tauri::command]
fn clear_cache() -> Result<(), AppError> {
    cache::clear_cache().map_err(|e| e.into())
}

// Tauri Commands - Settings

/// Load application settings
#[tauri::command]
fn load_settings() -> Result<settings::Settings, AppError> {
    settings::load_settings().map_err(|e| e.into())
}

/// Save application settings
#[tauri::command]
fn save_settings(new_settings: settings::Settings) -> Result<(), AppError> {
    settings::save_settings(&new_settings).map_err(|e| e.into())
}

/// Get the settings file path
#[tauri::command]
fn get_settings_path() -> Result<String, AppError> {
    settings::settings_path()
        .map(|p| p.to_string_lossy().to_string())
        .map_err(|e| e.into())
}

// Tauri Commands - File Watcher

/// Start watching a directory for theme file changes
#[tauri::command]
fn start_watching(
    path: String,
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, theme::WatcherManager>,
) -> Result<(), AppError> {
    state.start(app_handle, PathBuf::from(path)).map_err(|e| e.into())
}

/// Stop watching for theme file changes
#[tauri::command]
fn stop_watching(
    state: tauri::State<'_, theme::WatcherManager>,
) -> Result<(), AppError> {
    state.stop().map_err(|e| e.into())
}

/// Get the current watcher status
#[tauri::command]
fn get_watcher_status(
    state: tauri::State<'_, theme::WatcherManager>,
) -> theme::WatcherStatus {
    theme::WatcherStatus {
        is_running: state.is_running(),
        watched_path: state.watched_path().map(|p| p.to_string_lossy().to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .manage(theme::WatcherManager::new())
        .manage(PendingUpdate(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            // Bitwig detection
            detect_bitwig_installations,
            validate_bitwig_path,
            get_patch_status,
            get_latest_bitwig_version,
            patch_bitwig,
            restore_bitwig,
            has_backup,
            has_java,
            ensure_patcher_available,
            // Theme files
            get_theme_directory,
            list_themes,
            load_theme,
            save_theme,
            get_active_theme_path,
            apply_theme,
            reset_theme,
            create_theme,
            import_theme,
            export_theme,
            delete_theme,
            save_downloaded_theme,
            // Repository
            fetch_repository_themes,
            get_cached_repository_themes,
            download_repository_theme,
            cache_theme_preview,
            get_cached_preview_path,
            list_cached_themes,
            clear_cache,
            get_log_path,
            // Settings
            load_settings,
            save_settings,
            get_settings_path,
            // File watcher
            start_watching,
            stop_watching,
            get_watcher_status,
            // Updates
            check_for_updates,
            get_app_version,
            install_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
