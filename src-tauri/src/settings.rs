use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SettingsError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Could not determine config directory")]
    NoConfigDir,
}

/// Application settings
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct Settings {
    /// Check for app updates on startup
    pub check_updates_on_startup: bool,

    /// Auto-refresh theme repository on startup
    pub auto_refresh_repository: bool,

    /// Watch theme directory for changes
    pub watch_theme_directory: bool,

    /// Selected Bitwig version for themes
    pub selected_bitwig_version: Option<String>,

    /// Custom theme directory override (if not using default)
    pub custom_theme_directory: Option<String>,

    /// Repository cache duration in hours
    pub cache_duration_hours: u32,

    /// Show preview images in browser
    pub show_preview_images: bool,

    /// Last opened view
    pub last_view: String,

    /// Version that user chose to skip (won't prompt for this version)
    pub skipped_version: Option<String>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            check_updates_on_startup: true,
            auto_refresh_repository: true,
            watch_theme_directory: true,
            selected_bitwig_version: None,
            custom_theme_directory: None,
            cache_duration_hours: 1,
            show_preview_images: true,
            last_view: "browse".to_string(),
            skipped_version: None,
        }
    }
}

/// Get the settings file path
pub fn settings_path() -> Result<PathBuf, SettingsError> {
    let config_dir = dirs::config_dir().ok_or(SettingsError::NoConfigDir)?;
    let app_config = config_dir.join("bitwig-theme-manager");
    Ok(app_config.join("settings.json"))
}

/// Load settings from disk
pub fn load_settings() -> Result<Settings, SettingsError> {
    let path = settings_path()?;

    if !path.exists() {
        return Ok(Settings::default());
    }

    let content = fs::read_to_string(&path)?;
    let settings: Settings = serde_json::from_str(&content)?;
    Ok(settings)
}

/// Save settings to disk
pub fn save_settings(settings: &Settings) -> Result<(), SettingsError> {
    let path = settings_path()?;

    // Create parent directories if needed
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    let content = serde_json::to_string_pretty(settings)?;
    fs::write(&path, content)?;
    Ok(())
}

/// Update a single setting
pub fn update_setting<F>(updater: F) -> Result<Settings, SettingsError>
where
    F: FnOnce(&mut Settings),
{
    let mut settings = load_settings()?;
    updater(&mut settings);
    save_settings(&settings)?;
    Ok(settings)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_settings() {
        let settings = Settings::default();
        assert!(settings.check_updates_on_startup);
        assert!(settings.auto_refresh_repository);
        assert!(settings.watch_theme_directory);
    }

    #[test]
    fn test_settings_serialization() {
        let settings = Settings::default();
        let json = serde_json::to_string(&settings).unwrap();
        let deserialized: Settings = serde_json::from_str(&json).unwrap();
        assert_eq!(settings.check_updates_on_startup, deserialized.check_updates_on_startup);
    }
}
