pub mod bitwig;
pub mod theme;

use bitwig::{detector, patcher};
use theme::parser;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

// Re-export types for frontend
pub use bitwig::BitwigInstallation;
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

// Tauri Commands

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

/// Patch a Bitwig installation
#[tauri::command]
fn patch_bitwig(jar_path: String) -> Result<(), AppError> {
    patcher::patch_jar(&PathBuf::from(jar_path)).map_err(|e| e.into())
}

/// Restore a Bitwig installation from backup
#[tauri::command]
fn restore_bitwig(jar_path: String) -> Result<(), AppError> {
    patcher::restore_from_backup(&PathBuf::from(jar_path)).map_err(|e| e.into())
}

/// Check if a backup exists for a JAR file
#[tauri::command]
fn has_backup(jar_path: String) -> bool {
    patcher::has_backup(&PathBuf::from(jar_path))
}

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
#[tauri::command]
fn apply_theme(theme_path: String, bitwig_version: String) -> Result<(), AppError> {
    let source = PathBuf::from(theme_path);
    let target = parser::get_active_theme_path(&bitwig_version)
        .ok_or_else(|| AppError {
            message: "Could not determine active theme path".to_string(),
        })?;

    // Create theme directory if it doesn't exist
    if let Some(parent) = target.parent() {
        std::fs::create_dir_all(parent)?;
    }

    // Copy theme file
    std::fs::copy(&source, &target)?;

    Ok(())
}

/// Create a new theme with default values
#[tauri::command]
fn create_theme(name: String) -> Theme {
    Theme::with_name(&name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            detect_bitwig_installations,
            validate_bitwig_path,
            get_patch_status,
            patch_bitwig,
            restore_bitwig,
            has_backup,
            get_theme_directory,
            list_themes,
            load_theme,
            save_theme,
            get_active_theme_path,
            apply_theme,
            create_theme,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
