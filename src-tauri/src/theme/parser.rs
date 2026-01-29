use serde::{Deserialize, Serialize};
use serde_json::Value;
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
/// Handles both JSON format (with window/advanced sections) and legacy text format
pub fn parse_theme_content(content: &str, path: Option<PathBuf>) -> Result<Theme, ThemeError> {
    let trimmed = content.trim();

    // Check if it's JSON format
    if trimmed.starts_with('{') && trimmed.ends_with('}') {
        return parse_json_theme(content, path);
    }

    // Fall back to legacy text format
    parse_text_theme(content, path)
}

/// Parse JSON format theme (with "window" and "advanced" sections)
fn parse_json_theme(content: &str, path: Option<PathBuf>) -> Result<Theme, ThemeError> {
    let json: Value = serde_json::from_str(content).map_err(|e| {
        ThemeError::InvalidFormat(format!("Invalid JSON: {}", e))
    })?;

    let mut theme = Theme::new();
    theme.path = path;

    if let Value::Object(map) = &json {
        // Handle "window" section
        if let Some(Value::Object(window)) = map.get("window") {
            for (key, value) in window {
                if let Value::String(color_value) = value {
                    theme.colors.insert(key.clone(), color_value.clone());
                }
            }
        }

        // Handle "advanced" section
        if let Some(Value::Object(advanced)) = map.get("advanced") {
            for (key, value) in advanced {
                if let Value::String(color_value) = value {
                    theme.colors.insert(key.clone(), color_value.clone());
                }
            }
        }

        // Handle "arranger" section (used in some older themes)
        if let Some(Value::Object(arranger)) = map.get("arranger") {
            for (key, value) in arranger {
                if let Value::String(color_value) = value {
                    theme.colors.insert(key.clone(), color_value.clone());
                }
            }
        }

        // If no sections found, try parsing as flat key-value object
        if theme.colors.is_empty() {
            for (key, value) in map {
                if let Value::String(color_value) = value {
                    if color_value.starts_with('#') {
                        theme.colors.insert(key.clone(), color_value.clone());
                    }
                }
            }
        }
    }

    Ok(theme)
}

/// Parse legacy text format theme
fn parse_text_theme(content: &str, path: Option<PathBuf>) -> Result<Theme, ThemeError> {
    let mut theme = Theme::new();
    theme.path = path;

    for line in content.lines() {
        let line = line.trim();

        // Skip empty lines
        if line.is_empty() {
            continue;
        }

        // Parse comments for metadata (handle both # and // comment styles)
        let comment = if line.starts_with('#') {
            Some(line.trim_start_matches('#').trim())
        } else if line.starts_with("//") {
            Some(line.trim_start_matches("//").trim())
        } else {
            None
        };

        if let Some(comment) = comment {
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

        // Parse color definitions
        // Handle both formats:
        // - key=value (legacy format)
        // - Key: #value // optional comment (Bitwig Theme Editor format)
        let (key, raw_value) = if let Some((k, v)) = line.split_once(": ") {
            (k, v)
        } else if let Some((k, v)) = line.split_once('=') {
            (k, v)
        } else {
            continue;
        };

        let key = key.trim().to_string();
        // Remove any trailing comment (after //)
        let value = raw_value
            .split("//")
            .next()
            .unwrap_or(raw_value)
            .trim()
            .to_string();

        // Validate color format (should be hex color with 6 or 8 hex chars)
        if value.starts_with('#') && (value.len() == 7 || value.len() == 9) {
            theme.colors.insert(key, value);
        }
    }

    Ok(theme)
}

/// Convert JSON theme content to BTE text format
/// Outputs the text format expected by patched Bitwig (key: value pairs)
pub fn convert_json_to_bte(json_content: &str, theme_name: Option<&str>) -> Result<String, ThemeError> {
    let json: Value = serde_json::from_str(json_content).map_err(|e| {
        ThemeError::InvalidFormat(format!("Invalid JSON: {}", e))
    })?;

    let mut colors: Vec<(String, String)> = Vec::new();

    if let Value::Object(map) = &json {
        // Handle "window" section
        if let Some(Value::Object(window)) = map.get("window") {
            for (key, value) in window {
                if let Value::String(color_value) = value {
                    colors.push((key.clone(), color_value.clone()));
                }
            }
        }

        // Handle "advanced" section
        if let Some(Value::Object(advanced)) = map.get("advanced") {
            for (key, value) in advanced {
                if let Value::String(color_value) = value {
                    colors.push((key.clone(), color_value.clone()));
                }
            }
        }

        // Handle "arranger" section
        if let Some(Value::Object(arranger)) = map.get("arranger") {
            for (key, value) in arranger {
                if let Value::String(color_value) = value {
                    colors.push((key.clone(), color_value.clone()));
                }
            }
        }

        // If no sections found, treat as flat format
        if colors.is_empty() {
            for (key, value) in map {
                if let Value::String(color_value) = value {
                    if color_value.starts_with('#') {
                        colors.push((key.clone(), color_value.clone()));
                    }
                }
            }
        }
    }

    // Validate that we found some colors
    if colors.is_empty() {
        return Err(ThemeError::InvalidFormat(
            "No color definitions found in theme".to_string(),
        ));
    }

    // Sort colors by key for consistent output
    colors.sort_by(|a, b| a.0.cmp(&b.0));

    // Build text format output
    let mut output = String::new();
    output.push_str("// Theme converted from JSON format\n");
    if let Some(name) = theme_name {
        output.push_str(&format!("// Theme: {}\n", name));
    }
    output.push('\n');

    for (key, value) in colors {
        output.push_str(&format!("{}: {}\n", key, value));
    }

    Ok(output)
}

/// Detect if content is JSON format
pub fn is_json_content(content: &str) -> bool {
    let trimmed = content.trim();
    trimmed.starts_with('{') && trimmed.ends_with('}')
}

/// Categorize a theme property into its appropriate section (window, arranger, or advanced)
/// Based on Bitwig 5's JSON theme format which uses 3 sections
fn categorize_property(key: &str) -> &'static str {
    // Advanced section - only Timeline Playhead
    if key == "Timeline Playhead" {
        return "advanced";
    }

    // Arranger section keywords - check specific patterns
    // These properties relate to the timeline, arranger, and modular views

    // Timeline-related (but not "Timeline edit tool chooser background" which is window)
    if key.starts_with("Timeline ") && key != "Timeline edit tool chooser background" {
        return "arranger";
    }

    // Dark/Light/Irrelevant/Top Level Timeline backgrounds
    if key.contains("Timeline Background") || key.contains("Timeline Header") {
        return "arranger";
    }

    // Time Selection properties
    if key.starts_with("Time Selection") {
        return "arranger";
    }

    // Header Time Selection and Header Loop Region
    if key.starts_with("Header Time Selection") || key.starts_with("Header Loop") {
        return "arranger";
    }

    // Loop Region properties
    if key.starts_with("Loop Region") {
        return "arranger";
    }

    // Automation-related in arranger context
    if key.contains("Automation") && (key.contains("button") || key.contains("glow") || key.contains("Button") || key.contains("Color")) {
        // But not "Automation Color" or "Automation Chooser Background" which are window
        if key == "Automation Color" || key == "Automation Chooser Background" || key.starts_with("Arranger Automation") {
            return "window";
        }
        return "arranger";
    }

    // Modulation buttons in arranger
    if key == "Add Modulation Button Color" || key == "Multiply Modulation Button Color" {
        return "arranger";
    }

    // Connection in modular environment
    if key.contains("connection in modular environment") || key.contains("Port in modular environment") {
        return "arranger";
    }

    // Track/Clip Automation and Modulation
    if key.starts_with("Track Automation") || key.starts_with("Clip Automation") || key.starts_with("Clip Modulation") {
        return "arranger";
    }

    // Note Expression
    if key == "Note Expression Color" {
        return "arranger";
    }

    // Send values
    if key.starts_with("Send (pre)") || key.starts_with("Send (post)") {
        return "arranger";
    }

    // Matrix slot
    if key.contains("matrix slot") {
        return "arranger";
    }

    // Record button (implicit and glow are arranger)
    if key == "Record button color implicit" || key == "Record button glow color" {
        return "arranger";
    }

    // Insert preview time
    if key == "Insert preview time" {
        return "arranger";
    }

    // Polyphonic Desktop and Current Atom
    if key.starts_with("Polyphonic Desktop") || key.starts_with("Current Atom") {
        return "arranger";
    }

    // Background color of the modular environment
    if key == "Background color of the modular environment." {
        return "arranger";
    }

    // Everything else goes to window section
    "window"
}

/// Convert BTE text format to JSON format (for Bitwig 5 compatibility)
/// Outputs the JSON format expected by Bitwig 5's native theme system
pub fn convert_bte_to_json(content: &str, _theme_name: Option<&str>) -> Result<String, ThemeError> {
    let mut window: Vec<(String, String)> = Vec::new();
    let mut arranger: Vec<(String, String)> = Vec::new();
    let mut advanced: Vec<(String, String)> = Vec::new();

    for line in content.lines() {
        let line = line.trim();

        // Skip empty lines and comments
        if line.is_empty() || line.starts_with('#') || line.starts_with("//") {
            continue;
        }

        // Parse color definitions (Key: #value or Key: #value // comment)
        let (key, raw_value) = if let Some((k, v)) = line.split_once(": ") {
            (k, v)
        } else if let Some((k, v)) = line.split_once('=') {
            (k, v)
        } else {
            continue;
        };

        let key = key.trim().to_string();
        // Remove any trailing comment (after //)
        let value = raw_value
            .split("//")
            .next()
            .unwrap_or(raw_value)
            .trim()
            .to_string();

        // Skip non-color values
        if !value.starts_with('#') || (value.len() != 7 && value.len() != 9) {
            continue;
        }

        // Categorize into appropriate section
        match categorize_property(&key) {
            "advanced" => advanced.push((key, value)),
            "arranger" => arranger.push((key, value)),
            _ => window.push((key, value)),
        }
    }

    // Validate that we found some colors
    if window.is_empty() && arranger.is_empty() && advanced.is_empty() {
        return Err(ThemeError::InvalidFormat(
            "No color definitions found in theme".to_string(),
        ));
    }

    // Sort colors within each section for consistent output
    window.sort_by(|a, b| a.0.cmp(&b.0));
    arranger.sort_by(|a, b| a.0.cmp(&b.0));
    advanced.sort_by(|a, b| a.0.cmp(&b.0));

    // Build JSON output
    let mut json_map = serde_json::Map::new();

    // Add advanced section if not empty
    if !advanced.is_empty() {
        let mut advanced_map = serde_json::Map::new();
        for (key, value) in advanced {
            advanced_map.insert(key, serde_json::Value::String(value));
        }
        json_map.insert("advanced".to_string(), serde_json::Value::Object(advanced_map));
    }

    // Add window section (usually the largest)
    if !window.is_empty() {
        let mut window_map = serde_json::Map::new();
        for (key, value) in window {
            window_map.insert(key, serde_json::Value::String(value));
        }
        json_map.insert("window".to_string(), serde_json::Value::Object(window_map));
    }

    // Add arranger section if not empty
    if !arranger.is_empty() {
        let mut arranger_map = serde_json::Map::new();
        for (key, value) in arranger {
            arranger_map.insert(key, serde_json::Value::String(value));
        }
        json_map.insert("arranger".to_string(), serde_json::Value::Object(arranger_map));
    }

    // Serialize to pretty JSON
    let json_value = serde_json::Value::Object(json_map);
    serde_json::to_string_pretty(&json_value).map_err(|e| {
        ThemeError::InvalidFormat(format!("Failed to serialize JSON: {}", e))
    })
}

/// Parse theme content, auto-detecting format (BTE or JSON)
pub fn parse_theme_auto(content: &str, path: Option<PathBuf>, theme_name: Option<&str>) -> Result<Theme, ThemeError> {
    if is_json_content(content) {
        let bte_content = convert_json_to_bte(content, theme_name)?;
        parse_theme_content(&bte_content, path)
    } else {
        parse_theme_content(content, path)
    }
}

/// Serialize a theme to .bte text format
/// Outputs the text format expected by patched Bitwig (key: value pairs)
pub fn serialize_theme(theme: &Theme) -> String {
    let mut output = String::new();

    // Add metadata comments
    if let Some(name) = &theme.metadata.name {
        output.push_str(&format!("// Theme: {}\n", name));
    }
    if let Some(author) = &theme.metadata.author {
        output.push_str(&format!("// Author: {}\n", author));
    }
    if let Some(description) = &theme.metadata.description {
        output.push_str(&format!("// Description: {}\n", description));
    }
    if let Some(version) = &theme.metadata.version {
        output.push_str(&format!("// Version: {}\n", version));
    }

    if !output.is_empty() {
        output.push('\n');
    }

    // Sort colors by key for consistent output
    let mut colors: Vec<(&String, &String)> = theme.colors.iter().collect();
    colors.sort_by(|a, b| a.0.cmp(b.0));

    // Output color definitions
    for (key, value) in colors {
        output.push_str(&format!("{}: {}\n", key, value));
    }

    output
}

/// Save a theme to a file
pub fn save_theme(theme: &Theme, path: &Path) -> Result<(), ThemeError> {
    let content = serialize_theme(theme);
    fs::write(path, content)?;
    Ok(())
}

/// Get the theme directory for a specific Bitwig version.
///
/// This must match where bitwig-theme-editor patcher expects themes:
/// - All platforms: `<user_home>/.bitwig-theme-editor/versions/<version>/`
///
/// The Java patcher uses `-Duser.home` which is the user's home directory on all platforms.
pub fn get_theme_directory(bitwig_version: &str) -> Option<PathBuf> {
    // Use home directory on ALL platforms - this matches what the Java patcher expects
    // The patcher uses -Duser.home which is:
    // - Linux/macOS: /home/<user> or /Users/<user>
    // - Windows: C:\Users\<user> (NOT AppData!)
    let base = dirs::home_dir()?
        .join(".bitwig-theme-editor")
        .join("versions")
        .join(bitwig_version);

    // Check for legacy path (without "versions" subdirectory)
    let legacy = dirs::home_dir()?
        .join(".bitwig-theme-editor")
        .join(bitwig_version);

    if legacy.exists() && !base.exists() {
        return Some(legacy);
    }
    Some(base)
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

        if path.is_file() && path.extension().is_some_and(|ext| ext == "bte") {
            themes.push(path);
        }
    }

    themes.sort();
    Ok(themes)
}

/// Convert a Bitwig 5 theme to Bitwig 6 format
/// Maps old property names to new ones and adds required Bitwig 6 properties
pub fn convert_bw5_to_bw6(content: &str) -> String {
    let mut properties: HashMap<String, String> = HashMap::new();
    let mut metadata_lines = Vec::new();

    // Parse existing properties
    for line in content.lines() {
        let trimmed = line.trim();

        // Preserve metadata comments
        if trimmed.starts_with("//") {
            metadata_lines.push(trimmed.to_string());
            continue;
        }

        // Skip empty lines and non-property lines
        if trimmed.is_empty() || !trimmed.contains(':') {
            continue;
        }

        // Parse key: value
        if let Some(colon_pos) = trimmed.find(':') {
            let key = trimmed[..colon_pos].trim();
            let value_part = trimmed[colon_pos + 1..].trim();
            // Remove inline comments
            let value = value_part.split("//").next().unwrap_or(value_part).trim();

            if !key.is_empty() && !value.is_empty() {
                properties.insert(key.to_string(), value.to_string());
            }
        }
    }

    // === PART 1: Official renamed property mappings (BW5 name -> BW6 name) ===
    // From bitwig-theme-editor by Berikai (Editor.java matchColorNameToBitwig6)
    let renamed_mappings: Vec<(&str, &str)> = vec![
        ("On", "Accent (default)"),
        ("Hitech on", "Accent (hitech)"),
        ("Hole (dark)", "Grey 0"),
        ("Dark Timeline Background", "Grey 1"),
        ("Light Timeline Background", "Grey 2"),
        ("Hole (medium)", "Grey 3"),
        ("Panel body", "Grey 5"),
        ("Selected Panel body", "Grey 6"),
    ];

    // Apply renamed mappings: BW5 property value -> BW6 property name
    for (bw5_name, bw6_name) in &renamed_mappings {
        if let Some(value) = properties.get(*bw5_name) {
            properties.insert(bw6_name.to_string(), value.clone());
        }
    }

    // === PART 2: BW6-only properties - get color from closest BW5 property ===
    // These properties only exist in BW6, so we find the BW5 property with
    // the most similar default color and use that theme's color
    // Format: (bw6_property, bw5_source_property)
    let bw6_from_bw5: Vec<(&str, &str)> = vec![
        ("Audio Event Background", "White"),
        ("Audio Event Waveform", "Bitwig Essentials"),
        ("Clip Expression Background Color", "Button stroke"),
        ("Grey 4", "Knob Line"),
        ("Modulation Mapping Background (monophonic)", "Clip Modulation Color Point Fill"),
        ("Muted by Audition", "Knob Body Darkest"),
        ("Onset Color Max", "Compressed Audio Port in modular environment"),
        ("Onset Color Min", "Send (post) value color"),
        ("Panel Stroke (focused)", "Layers Tree Cursor Frame Color"),
        ("Record text color", "Record button color"),
        ("White Selection", "Active Toggle Icon (Playing)"),
        ("White Selection (standby)", "Active Toggle Icon (Playing)"),
    ];

    // Apply BW6-from-BW5 mappings: use BW5 color for new BW6 property
    for (bw6_name, bw5_source) in &bw6_from_bw5 {
        if let Some(value) = properties.get(*bw5_source) {
            if !properties.contains_key(*bw6_name) {
                properties.insert(bw6_name.to_string(), value.clone());
            }
        }
    }

    // Remove properties that don't exist in Bitwig 6
    let removed_in_bw6 = [
        "On", "On (subtle)", "On (subtler)", "Pressed On",
        "Selection", "Standby selection",
        "Panel body", "Panel stroke", "Active Panel stroke",
        "Selected Panel body", "Selected Panel stroke",
        "Selected Panel body (standby)", "Selected Panel stroke (standby)",
        "Dialog background",
        "Hole (dark)", "Hole (medium)", "Hole (light)",
        "Content Background",
        "Dark Separator Line",
        "Emboss Highlight", "Emboss Shadow",
        "Rubber button stroke", "Rubber highlight button stroke",
        "Rubber Button Emboss Highlight", "Light button stroke",
        "Meter Background",
        "Hitech on", "Hitech background",
        "Inspector Section Background", "Inspector Section Background (light)",
        "Inspector Section Background (dark)", "Inspector Section Frame",
        "Inspector Style / Push Button / Stroke Color",
        "Inspector Style / Push Button / Highlight Color",
        "Inspector Style / Push Button / Normal BG Color",
        "Inspector Style / Push Button / Pressed BG Color",
        "Inspector Style / Push Button / Normal Text Color",
        "Inspector Style / Push Button / Pressed Text Color",
        "Top Level Timeline Background", "Dark Timeline Background",
        "Light Timeline Background", "Irrelevant Timeline Background",
        "Irrelevant Timeline Overlay", "Timeline Background Pattern",
        "Timeline Primary Grid", "Timeline Secondary Grid",
        "Top Level Timeline Header Background", "Dark Timeline Header Background",
        "Light Timeline Header Background", "Irrelevant Timeline Header Background",
        "Irrelevant Timeline Header Overlay",
        "Timeline Header Primary Grid", "Timeline Header Secondary Grid",
        "Matrix slot color", "Selected matrix slot color",
        "Onset Marker Color",
        "Layers Tree Unselected Background Color",
        "Layers Tree Selected Background Color",
        "Layers Tree Standby Selected Background Color",
        "Layers Tree Cursor Frame Color",
        "Current Atom Value Color",
        "Current Atom Value Color Point Fill", "Current Atom Value Color Curve Fill",
        "Current Atom Value Color Selected Stroke", "Current Atom Value Color Selected Point Fill",
        "Current Atom Value Color Highlighed Stroke",
        "Track Automation Color",
        "Track Automation Color Point Fill", "Track Automation Color Curve Fill",
        "Track Automation Color Selected Stroke", "Track Automation Color Selected Point Fill",
        "Track Automation Color Highlighed Stroke",
        "Clip Automation Color",
        "Clip Automation Color Point Fill", "Clip Automation Color Curve Fill",
        "Clip Automation Color Selected Stroke", "Clip Automation Color Selected Point Fill",
        "Clip Automation Color Highlighed Stroke",
        "Clip Modulation Color",
        "Clip Modulation Color Point Fill", "Clip Modulation Color Curve Fill",
        "Clip Modulation Color Selected Stroke", "Clip Modulation Color Selected Point Fill",
        "Clip Modulation Color Highlighed Stroke",
        "Note Expression Color Point Fill", "Note Expression Color Curve Fill",
        "Note Expression Color Selected Stroke", "Note Expression Color Selected Point Fill",
        "Note Expression Color Highlighed Stroke",
        "Cue Marker Fill", "Cue Marker Stroke",
        "Cue Marker Selected Fill", "Cue Marker Selected Stroke",
        "Modulation Mapping Background Color",
    ];

    for prop in &removed_in_bw6 {
        properties.remove(*prop);
    }

    // Build output
    let mut output = String::new();

    // Add metadata
    for line in &metadata_lines {
        if !line.contains("<end>") {
            output.push_str(line);
            output.push('\n');
        }
    }
    output.push_str("// Converted to Bitwig 6 format\n\n");

    // Sort and output properties
    let mut sorted_props: Vec<_> = properties.iter().collect();
    sorted_props.sort_by(|a, b| a.0.cmp(b.0));

    for (key, value) in sorted_props {
        output.push_str(&format!("{}: {}\n", key, value));
    }

    output.push_str("// <end>\n");
    output
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

        assert!(output.contains("// Theme: Test Theme"));
        assert!(output.contains("// Author: test_user"));
        assert!(output.contains("background.main: #1a1a2e"));
        assert!(output.contains("accent.primary: #e94560"));
    }

    #[test]
    fn test_infer_color_group() {
        assert_eq!(infer_color_group("background.main"), "Background");
        assert_eq!(infer_color_group("accent.primary"), "Accent");
        assert_eq!(infer_color_group("text.primary"), "Text");
        assert_eq!(infer_color_group("button.hover"), "Controls");
        assert_eq!(infer_color_group("unknown.property"), "Other");
    }

    #[test]
    fn test_parse_bte_colon_format() {
        let content = r#"
// Theme: Ghosty
// Author: notoyz

Background color: #1a1a2e // Main background
Accent color: #e94560
"#;

        let theme = parse_theme_content(content, None).unwrap();

        assert_eq!(theme.metadata.name, Some("Ghosty".to_string()));
        assert_eq!(theme.metadata.author, Some("notoyz".to_string()));
        assert_eq!(
            theme.colors.get("Background color"),
            Some(&"#1a1a2e".to_string())
        );
        assert_eq!(
            theme.colors.get("Accent color"),
            Some(&"#e94560".to_string())
        );
    }

    #[test]
    fn test_convert_json_to_bte() {
        let json = r##"{
            "arranger": {
                "Background color": "#1a1a2e",
                "Accent color": "#e94560"
            },
            "window": {
                "Text color": "#ffffff"
            }
        }"##;

        let bte = convert_json_to_bte(json, Some("Test Theme")).unwrap();

        assert!(bte.contains("// Theme: Test Theme"));
        assert!(bte.contains("Accent color: #e94560"));
        assert!(bte.contains("Background color: #1a1a2e"));
        assert!(bte.contains("Text color: #ffffff"));
        // Verify it's text format, not JSON
        assert!(!bte.contains("{"));
        assert!(!bte.contains("}"));
    }

    #[test]
    fn test_is_json_content() {
        assert!(is_json_content(r#"{"key": "value"}"#));
        assert!(is_json_content(r#"  { "key": "value" }  "#));
        assert!(!is_json_content("# Theme: Test\nkey=#ffffff"));
        assert!(!is_json_content("Background: #1a1a2e"));
    }

    #[test]
    fn test_categorize_property() {
        // Advanced section
        assert_eq!(categorize_property("Timeline Playhead"), "advanced");

        // Arranger section
        assert_eq!(categorize_property("Timeline Background Pattern"), "arranger");
        assert_eq!(categorize_property("Timeline Header Primary Grid"), "arranger");
        assert_eq!(categorize_property("Time Selection Fill"), "arranger");
        assert_eq!(categorize_property("Header Time Selection Fill"), "arranger");
        assert_eq!(categorize_property("Loop Region Background"), "arranger");
        assert_eq!(categorize_property("Automation button glow color"), "arranger");
        assert_eq!(categorize_property("Track Automation Color"), "arranger");
        assert_eq!(categorize_property("Clip Automation Button Color"), "arranger");
        assert_eq!(categorize_property("Add Modulation Button Color"), "arranger");
        assert_eq!(categorize_property("Audio connection in modular environment"), "arranger");
        assert_eq!(categorize_property("Note Expression Color"), "arranger");
        assert_eq!(categorize_property("Send (pre) value color"), "arranger");
        assert_eq!(categorize_property("Record button color implicit"), "arranger");
        assert_eq!(categorize_property("Insert preview time"), "arranger");
        assert_eq!(categorize_property("Polyphonic Desktop Object"), "arranger");
        assert_eq!(categorize_property("Background color of the modular environment."), "arranger");
        assert_eq!(categorize_property("Dark Timeline Background"), "arranger");

        // Window section (default)
        assert_eq!(categorize_property("Window background"), "window");
        assert_eq!(categorize_property("Button background"), "window");
        assert_eq!(categorize_property("Menu background"), "window");
        assert_eq!(categorize_property("Automation Color"), "window");
        assert_eq!(categorize_property("Timeline edit tool chooser background"), "window");
        assert_eq!(categorize_property("Record button color"), "window");
    }

    #[test]
    fn test_convert_bte_to_json() {
        let bte = r#"
// Theme: Test Theme
// Author: tester

Window background: #1a1a2e
Button background: #2a2a3e
Timeline Playhead: #ff0000
Timeline Background Pattern: #333333
Time Selection Fill: #444444
Track Automation Color: #555555
"#;

        let json = convert_bte_to_json(bte, Some("Test Theme")).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();

        // Check advanced section
        assert_eq!(
            parsed["advanced"]["Timeline Playhead"],
            serde_json::Value::String("#ff0000".to_string())
        );

        // Check window section
        assert_eq!(
            parsed["window"]["Window background"],
            serde_json::Value::String("#1a1a2e".to_string())
        );
        assert_eq!(
            parsed["window"]["Button background"],
            serde_json::Value::String("#2a2a3e".to_string())
        );

        // Check arranger section
        assert_eq!(
            parsed["arranger"]["Timeline Background Pattern"],
            serde_json::Value::String("#333333".to_string())
        );
        assert_eq!(
            parsed["arranger"]["Time Selection Fill"],
            serde_json::Value::String("#444444".to_string())
        );
        assert_eq!(
            parsed["arranger"]["Track Automation Color"],
            serde_json::Value::String("#555555".to_string())
        );
    }
}
