use serde::{Deserialize, Serialize};
use std::fs;
use std::io;
use std::path::PathBuf;
use std::time::{Duration, SystemTime};
use thiserror::Error;

use super::RepositoryTheme;

#[derive(Error, Debug)]
pub enum CacheError {
    #[error("IO error: {0}")]
    Io(#[from] io::Error),

    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Cache directory not found")]
    CacheDirNotFound,
}

/// Metadata for cached themes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheMetadata {
    pub last_updated: u64,
    pub themes: Vec<RepositoryTheme>,
}

/// Get the cache directory for the theme manager
pub fn get_cache_dir() -> Option<PathBuf> {
    dirs::cache_dir().map(|d| d.join("bitwig-theme-manager"))
}

/// Get the path to the repository cache file
fn get_cache_file() -> Option<PathBuf> {
    get_cache_dir().map(|d| d.join("repository.json"))
}

/// Get the path to cached theme files
pub fn get_themes_cache_dir() -> Option<PathBuf> {
    get_cache_dir().map(|d| d.join("themes"))
}

/// Get the path to cached preview images
pub fn get_previews_cache_dir() -> Option<PathBuf> {
    get_cache_dir().map(|d| d.join("previews"))
}

/// Load cached repository themes
pub fn load_cached_themes() -> Result<Option<CacheMetadata>, CacheError> {
    let cache_file = get_cache_file().ok_or(CacheError::CacheDirNotFound)?;

    if !cache_file.exists() {
        return Ok(None);
    }

    let content = fs::read_to_string(&cache_file)?;
    let metadata: CacheMetadata = serde_json::from_str(&content)?;

    Ok(Some(metadata))
}

/// Save themes to cache
pub fn save_cached_themes(themes: &[RepositoryTheme]) -> Result<(), CacheError> {
    let cache_dir = get_cache_dir().ok_or(CacheError::CacheDirNotFound)?;
    fs::create_dir_all(&cache_dir)?;

    let cache_file = cache_dir.join("repository.json");

    let metadata = CacheMetadata {
        last_updated: SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        themes: themes.to_vec(),
    };

    let content = serde_json::to_string_pretty(&metadata)?;
    fs::write(cache_file, content)?;

    Ok(())
}

/// Check if the cache is stale (older than specified duration)
pub fn is_cache_stale(max_age: Duration) -> bool {
    let cache = match load_cached_themes() {
        Ok(Some(cache)) => cache,
        _ => return true,
    };

    let now = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    now - cache.last_updated > max_age.as_secs()
}

/// Save a downloaded theme file to the cache
pub fn save_theme_file(theme_name: &str, content: &str) -> Result<PathBuf, CacheError> {
    let themes_dir = get_themes_cache_dir().ok_or(CacheError::CacheDirNotFound)?;
    fs::create_dir_all(&themes_dir)?;

    // Sanitize theme name for filename
    let safe_name: String = theme_name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();

    let file_path = themes_dir.join(format!("{}.bte", safe_name));
    fs::write(&file_path, content)?;

    Ok(file_path)
}

/// Load a cached theme file
pub fn load_cached_theme_file(theme_name: &str) -> Result<Option<String>, CacheError> {
    let themes_dir = get_themes_cache_dir().ok_or(CacheError::CacheDirNotFound)?;

    let safe_name: String = theme_name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();

    let file_path = themes_dir.join(format!("{}.bte", safe_name));

    if !file_path.exists() {
        return Ok(None);
    }

    let content = fs::read_to_string(file_path)?;
    Ok(Some(content))
}

/// Download and cache a preview image
pub async fn cache_preview_image(theme_name: &str, url: &str) -> Result<PathBuf, CacheError> {
    let previews_dir = get_previews_cache_dir().ok_or(CacheError::CacheDirNotFound)?;
    fs::create_dir_all(&previews_dir)?;

    let safe_name: String = theme_name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();

    // Determine file extension from URL
    let ext = url
        .rsplit('.')
        .next()
        .filter(|e| ["png", "jpg", "jpeg", "gif", "webp"].contains(&e.to_lowercase().as_str()))
        .unwrap_or("png");

    let file_path = previews_dir.join(format!("{}.{}", safe_name, ext));

    // Skip if already cached
    if file_path.exists() {
        return Ok(file_path);
    }

    // Download the image
    let client = reqwest::Client::new();
    let response = client.get(url).send().await.map_err(|e| {
        CacheError::Io(io::Error::other(e.to_string()))
    })?;

    let bytes = response.bytes().await.map_err(|e| {
        CacheError::Io(io::Error::other(e.to_string()))
    })?;

    fs::write(&file_path, bytes)?;

    Ok(file_path)
}

/// Get the cached preview image path if it exists
pub fn get_cached_preview(theme_name: &str) -> Option<PathBuf> {
    let previews_dir = get_previews_cache_dir()?;

    let safe_name: String = theme_name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();

    for ext in &["png", "jpg", "jpeg", "gif", "webp"] {
        let file_path = previews_dir.join(format!("{}.{}", safe_name, ext));
        if file_path.exists() {
            return Some(file_path);
        }
    }

    None
}

/// Clear all cached data
pub fn clear_cache() -> Result<(), CacheError> {
    let cache_dir = get_cache_dir().ok_or(CacheError::CacheDirNotFound)?;

    if cache_dir.exists() {
        fs::remove_dir_all(&cache_dir)?;
    }

    Ok(())
}

/// Get list of all cached theme files
pub fn list_cached_themes() -> Result<Vec<PathBuf>, CacheError> {
    let themes_dir = get_themes_cache_dir().ok_or(CacheError::CacheDirNotFound)?;

    if !themes_dir.exists() {
        return Ok(Vec::new());
    }

    let mut themes = Vec::new();

    for entry in fs::read_dir(&themes_dir)? {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() && path.extension().is_some_and(|ext| ext == "bte") {
            themes.push(path);
        }
    }

    themes.sort();
    Ok(themes)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_cache_dir() {
        let dir = get_cache_dir();
        assert!(dir.is_some());
    }

    #[test]
    fn test_sanitize_theme_name() {
        let name = "Theme/With:Special*Chars";
        let safe: String = name
            .chars()
            .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
            .collect();
        assert_eq!(safe, "Theme_With_Special_Chars");
    }
}
