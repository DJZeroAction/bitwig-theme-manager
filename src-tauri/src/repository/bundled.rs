use serde::Deserialize;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use thiserror::Error;

use super::RepositoryTheme;

#[derive(Error, Debug)]
pub enum BundledError {
    #[error("Failed to resolve resource path: {0}")]
    ResourcePath(String),

    #[error("Failed to read resource: {0}")]
    ReadResource(#[from] std::io::Error),

    #[error("Failed to parse index: {0}")]
    ParseIndex(#[from] serde_json::Error),
}

/// A theme entry from the bundled index.json
#[derive(Debug, Clone, Deserialize)]
struct BundledThemeEntry {
    id: String,
    name: String,
    author: String,
    file: String,
    preview: Option<String>,
    description: Option<String>,
}

/// The bundled themes index file structure
#[derive(Debug, Clone, Deserialize)]
struct BundledThemesIndex {
    #[allow(dead_code)]
    version: u32,
    themes: Vec<BundledThemeEntry>,
}

/// Load all bundled themes from the app resources
pub fn load_bundled_themes(app: &AppHandle) -> Result<Vec<RepositoryTheme>, BundledError> {
    // Resolve the path to the bundled index.json
    let index_path = app
        .path()
        .resolve("themes/index.json", tauri::path::BaseDirectory::Resource)
        .map_err(|e| BundledError::ResourcePath(e.to_string()))?;

    let content = std::fs::read_to_string(&index_path)?;
    let index: BundledThemesIndex = serde_json::from_str(&content)?;

    let themes = index
        .themes
        .into_iter()
        .map(|entry| {
            // Extract just the filename from the path (e.g., "themes/blackwig.json" -> "blackwig.json")
            let file_name = entry
                .file
                .rsplit('/')
                .next()
                .unwrap_or(&entry.file)
                .to_string();

            // Get the preview file path (frontend will convert to asset URL)
            let preview_url = entry.preview.and_then(|p| {
                let preview_name = p.rsplit('/').next().unwrap_or(&p);
                app.path()
                    .resolve(
                        format!("themes/previews/{}", preview_name),
                        tauri::path::BaseDirectory::Resource,
                    )
                    .ok()
                    .map(|path| path.to_string_lossy().to_string())
            });

            RepositoryTheme {
                name: entry.name,
                author: entry.author,
                author_url: None,
                repo_url: format!("bundled://{}", entry.id),
                preview_url,
                description: entry.description,
                download_url: Some(format!("bundled://{}", file_name)),
            }
        })
        .collect();

    Ok(themes)
}

/// Get the content of a bundled theme file
pub fn get_bundled_theme_content(app: &AppHandle, filename: &str) -> Result<String, BundledError> {
    // Resolve the path to the theme file in resources
    let theme_path = app
        .path()
        .resolve(
            format!("themes/files/{}", filename),
            tauri::path::BaseDirectory::Resource,
        )
        .map_err(|e| BundledError::ResourcePath(e.to_string()))?;

    let content = std::fs::read_to_string(&theme_path)?;
    Ok(content)
}

/// Get the filesystem path to a bundled theme file (for direct copy operations)
pub fn get_bundled_theme_path(app: &AppHandle, filename: &str) -> Result<PathBuf, BundledError> {
    let theme_path = app
        .path()
        .resolve(
            format!("themes/files/{}", filename),
            tauri::path::BaseDirectory::Resource,
        )
        .map_err(|e| BundledError::ResourcePath(e.to_string()))?;

    Ok(theme_path)
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_filename_extraction() {
        let path = "themes/blackwig.json";
        let filename = path.rsplit('/').next().unwrap_or(path);
        assert_eq!(filename, "blackwig.json");
    }
}
