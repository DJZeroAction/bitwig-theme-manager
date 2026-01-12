use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ThemeError {
    #[error("IO error: {0}")]
    Io(#[from] io::Error),

    #[error("Invalid theme format: {0}")]
    InvalidFormat(String),

    #[error("Theme not found: {0}")]
    NotFound(PathBuf),
}

/// A color property in a theme
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeColor {
    pub key: String,
    pub value: String,
    pub group: Option<String>,
}

/// Metadata for a theme
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ThemeMetadata {
    pub name: Option<String>,
    pub author: Option<String>,
    pub description: Option<String>,
    pub version: Option<String>,
}

/// A complete theme definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Theme {
    pub metadata: ThemeMetadata,
    pub colors: HashMap<String, String>,
    pub path: Option<PathBuf>,
}

impl Theme {
    /// Create a new empty theme
    pub fn new() -> Self {
        Self {
            metadata: ThemeMetadata::default(),
            colors: HashMap::new(),
            path: None,
        }
    }

    /// Create a theme with the given name
    pub fn with_name(name: &str) -> Self {
        Self {
            metadata: ThemeMetadata {
                name: Some(name.to_string()),
                ..Default::default()
            },
            colors: HashMap::new(),
            path: None,
        }
    }

    /// Get colors grouped by category
    pub fn get_grouped_colors(&self) -> HashMap<String, Vec<ThemeColor>> {
        let mut groups: HashMap<String, Vec<ThemeColor>> = HashMap::new();

        for (key, value) in &self.colors {
            let group = infer_color_group(key);
            let color = ThemeColor {
                key: key.clone(),
                value: value.clone(),
                group: Some(group.clone()),
            };
            groups.entry(group).or_default().push(color);
        }

        // Sort colors within each group
        for colors in groups.values_mut() {
            colors.sort_by(|a, b| a.key.cmp(&b.key));
        }

        groups
    }
}

impl Default for Theme {
    fn default() -> Self {
        Self::new()
    }
}

/// Infer the color group from a property key
fn infer_color_group(key: &str) -> String {
    let key_lower = key.to_lowercase();

    if key_lower.contains("background") || key_lower.contains("bg") {
        "Background".to_string()
    } else if key_lower.contains("accent") || key_lower.contains("highlight") {
        "Accent".to_string()
    } else if key_lower.contains("text") || key_lower.contains("font") || key_lower.contains("label")
    {
        "Text".to_string()
    } else if key_lower.contains("border") || key_lower.contains("outline") {
        "Border".to_string()
    } else if key_lower.contains("button") || key_lower.contains("control") {
        "Controls".to_string()
    } else if key_lower.contains("track") || key_lower.contains("clip") {
        "Tracks".to_string()
    } else if key_lower.contains("selection") || key_lower.contains("selected") {
        "Selection".to_string()
    } else {
        "Other".to_string()
    }
}

/// Parse a .bte theme file
pub fn parse_theme_file(path: &Path) -> Result<Theme, ThemeError> {
    if !path.exists() {
        return Err(ThemeError::NotFound(path.to_path_buf()));
    }

    let content = fs::read_to_string(path)?;
    parse_theme_content(&content, Some(path.to_path_buf()))
}

/// Parse theme content from a string
pub fn parse_theme_content(content: &str, path: Option<PathBuf>) -> Result<Theme, ThemeError> {
    let mut theme = Theme::new();
    theme.path = path;

    for line in content.lines() {
        let line = line.trim();

        // Skip empty lines
        if line.is_empty() {
            continue;
        }

        // Parse comments for metadata
        if line.starts_with('#') {
            let comment = line.trim_start_matches('#').trim();

            if let Some(name) = comment.strip_prefix("Theme:") {
                theme.metadata.name = Some(name.trim().to_string());
            } else if let Some(author) = comment.strip_prefix("Author:") {
                theme.metadata.author = Some(author.trim().to_string());
            } else if let Some(desc) = comment.strip_prefix("Description:") {
                theme.metadata.description = Some(desc.trim().to_string());
            } else if let Some(version) = comment.strip_prefix("Version:") {
                theme.metadata.version = Some(version.trim().to_string());
            }
            continue;
        }

        // Parse color definitions (key=value format)
        if let Some((key, value)) = line.split_once('=') {
            let key = key.trim().to_string();
            let value = value.trim().to_string();

            // Validate color format (should be hex color)
            if value.starts_with('#') && (value.len() == 7 || value.len() == 9) {
                theme.colors.insert(key, value);
            }
        }
    }

    Ok(theme)
}

/// Serialize a theme to .bte format
pub fn serialize_theme(theme: &Theme) -> String {
    let mut output = String::new();

    // Write metadata as comments
    if let Some(name) = &theme.metadata.name {
        output.push_str(&format!("# Theme: {}\n", name));
    }
    if let Some(author) = &theme.metadata.author {
        output.push_str(&format!("# Author: {}\n", author));
    }
    if let Some(desc) = &theme.metadata.description {
        output.push_str(&format!("# Description: {}\n", desc));
    }
    if let Some(version) = &theme.metadata.version {
        output.push_str(&format!("# Version: {}\n", version));
    }

    if !output.is_empty() {
        output.push('\n');
    }

    // Write colors sorted by key
    let mut colors: Vec<_> = theme.colors.iter().collect();
    colors.sort_by(|a, b| a.0.cmp(b.0));

    for (key, value) in colors {
        output.push_str(&format!("{}={}\n", key, value));
    }

    output
}

/// Save a theme to a file
pub fn save_theme(theme: &Theme, path: &Path) -> Result<(), ThemeError> {
    let content = serialize_theme(theme);
    fs::write(path, content)?;
    Ok(())
}

/// Get the theme directory for a specific Bitwig version
pub fn get_theme_directory(bitwig_version: &str) -> Option<PathBuf> {
    let base_dir = dirs::config_dir().or_else(dirs::home_dir)?;

    #[cfg(target_os = "windows")]
    {
        Some(
            dirs::data_dir()?
                .join(".bitwig-theme-editor")
                .join(bitwig_version),
        )
    }

    #[cfg(not(target_os = "windows"))]
    {
        Some(base_dir.join(".bitwig-theme-editor").join(bitwig_version))
    }
}

/// Get the active theme file path for a Bitwig version
pub fn get_active_theme_path(bitwig_version: &str) -> Option<PathBuf> {
    get_theme_directory(bitwig_version).map(|dir| dir.join("theme.bte"))
}

/// List all theme files in the theme directory
pub fn list_themes(bitwig_version: &str) -> Result<Vec<PathBuf>, ThemeError> {
    let theme_dir = get_theme_directory(bitwig_version)
        .ok_or_else(|| ThemeError::NotFound(PathBuf::from("theme directory")))?;

    if !theme_dir.exists() {
        return Ok(Vec::new());
    }

    let mut themes = Vec::new();

    for entry in fs::read_dir(&theme_dir)? {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() && path.extension().map_or(false, |ext| ext == "bte") {
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
    fn test_parse_theme_content() {
        let content = r#"
# Theme: Test Theme
# Author: test_user

background.main=#1a1a2e
accent.primary=#e94560
text.primary=#ffffff
"#;

        let theme = parse_theme_content(content, None).unwrap();

        assert_eq!(theme.metadata.name, Some("Test Theme".to_string()));
        assert_eq!(theme.metadata.author, Some("test_user".to_string()));
        assert_eq!(theme.colors.get("background.main"), Some(&"#1a1a2e".to_string()));
        assert_eq!(theme.colors.get("accent.primary"), Some(&"#e94560".to_string()));
        assert_eq!(theme.colors.get("text.primary"), Some(&"#ffffff".to_string()));
    }

    #[test]
    fn test_serialize_theme() {
        let mut theme = Theme::with_name("Test Theme");
        theme.metadata.author = Some("test_user".to_string());
        theme.colors.insert("background.main".to_string(), "#1a1a2e".to_string());
        theme.colors.insert("accent.primary".to_string(), "#e94560".to_string());

        let output = serialize_theme(&theme);

        assert!(output.contains("# Theme: Test Theme"));
        assert!(output.contains("# Author: test_user"));
        assert!(output.contains("background.main=#1a1a2e"));
        assert!(output.contains("accent.primary=#e94560"));
    }

    #[test]
    fn test_infer_color_group() {
        assert_eq!(infer_color_group("background.main"), "Background");
        assert_eq!(infer_color_group("accent.primary"), "Accent");
        assert_eq!(infer_color_group("text.primary"), "Text");
        assert_eq!(infer_color_group("button.hover"), "Controls");
        assert_eq!(infer_color_group("unknown.property"), "Other");
    }
}
