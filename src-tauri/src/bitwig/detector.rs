use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BitwigInstallation {
    pub path: PathBuf,
    pub version: String,
    pub jar_path: PathBuf,
    pub is_patched: bool,
}

/// Get platform-specific default installation paths for Bitwig Studio
fn get_default_search_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    #[cfg(target_os = "linux")]
    {
        paths.push(PathBuf::from("/opt/bitwig-studio"));
        paths.push(PathBuf::from("/usr/share/bitwig-studio"));
        if let Some(home) = dirs::home_dir() {
            paths.push(home.join(".local/share/bitwig-studio"));
            paths.push(home.join("bitwig-studio"));
        }
        // Check for Flatpak installation
        if let Some(home) = dirs::home_dir() {
            paths.push(home.join(".var/app/com.bitwig.BitwigStudio/data/bitwig-studio"));
        }
    }

    #[cfg(target_os = "macos")]
    {
        paths.push(PathBuf::from("/Applications"));
        if let Some(home) = dirs::home_dir() {
            paths.push(home.join("Applications"));
        }
    }

    #[cfg(target_os = "windows")]
    {
        paths.push(PathBuf::from("C:\\Program Files\\Bitwig Studio"));
        paths.push(PathBuf::from("C:\\Program Files (x86)\\Bitwig Studio"));
        if let Some(local_app_data) = dirs::data_local_dir() {
            paths.push(local_app_data.join("Programs\\Bitwig Studio"));
        }
    }

    paths
}

/// Find the bitwig.jar file within an installation directory
fn find_bitwig_jar(install_path: &Path) -> Option<PathBuf> {
    // Common locations for bitwig.jar
    let possible_paths = [
        install_path.join("bin/bitwig.jar"),
        install_path.join("bitwig.jar"),
        install_path.join("Contents/app/bin/bitwig.jar"), // macOS .app bundle
        install_path.join("Contents/Resources/app/bin/bitwig.jar"),
    ];

    for path in &possible_paths {
        if path.exists() && path.is_file() {
            return Some(path.clone());
        }
    }

    // Fallback: search recursively for bitwig.jar
    for entry in WalkDir::new(install_path)
        .max_depth(5)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_name() == "bitwig.jar" {
            return Some(entry.path().to_path_buf());
        }
    }

    None
}

/// Extract version from installation path or directory name
fn extract_version(path: &Path) -> String {
    let path_str = path.to_string_lossy();

    // Try to find version number in path (e.g., "5.2", "5.1.9")
    let re = regex::Regex::new(r"(\d+\.\d+(?:\.\d+)?)").unwrap();
    if let Some(caps) = re.captures(&path_str) {
        return caps.get(1).map(|m| m.as_str().to_string()).unwrap_or_default();
    }

    // Default to "unknown"
    "unknown".to_string()
}

/// Check if bitwig.jar has been patched for theme support
pub fn is_jar_patched(jar_path: &Path) -> bool {
    // For now, we'll check for the existence of a marker file
    // In the future, this should verify the JAR contents
    let marker_path = jar_path.with_extension("patched");
    marker_path.exists()
}

/// Detect all Bitwig Studio installations on the system
pub fn detect_installations() -> Vec<BitwigInstallation> {
    let mut installations = Vec::new();
    let search_paths = get_default_search_paths();

    for search_path in search_paths {
        if !search_path.exists() {
            continue;
        }

        // Check if this is a direct Bitwig installation
        if let Some(jar_path) = find_bitwig_jar(&search_path) {
            let version = extract_version(&search_path);
            let is_patched = is_jar_patched(&jar_path);

            installations.push(BitwigInstallation {
                path: search_path.clone(),
                version,
                jar_path,
                is_patched,
            });
            continue;
        }

        // Search for versioned subdirectories (e.g., /opt/bitwig-studio/5.2)
        if let Ok(entries) = std::fs::read_dir(&search_path) {
            for entry in entries.filter_map(|e| e.ok()) {
                let entry_path = entry.path();
                if entry_path.is_dir() {
                    // Check for macOS .app bundles
                    #[cfg(target_os = "macos")]
                    {
                        let name = entry.file_name().to_string_lossy().to_string();
                        if name.starts_with("Bitwig Studio") && name.ends_with(".app") {
                            if let Some(jar_path) = find_bitwig_jar(&entry_path) {
                                let version = extract_version(&entry_path);
                                let is_patched = is_jar_patched(&jar_path);

                                installations.push(BitwigInstallation {
                                    path: entry_path,
                                    version,
                                    jar_path,
                                    is_patched,
                                });
                            }
                        }
                    }

                    // Check for regular directories
                    if let Some(jar_path) = find_bitwig_jar(&entry_path) {
                        let version = extract_version(&entry_path);
                        let is_patched = is_jar_patched(&jar_path);

                        installations.push(BitwigInstallation {
                            path: entry_path,
                            version,
                            jar_path,
                            is_patched,
                        });
                    }
                }
            }
        }
    }

    // Remove duplicates based on jar_path
    installations.sort_by(|a, b| a.jar_path.cmp(&b.jar_path));
    installations.dedup_by(|a, b| a.jar_path == b.jar_path);

    // Sort by version descending (newest first)
    installations.sort_by(|a, b| b.version.cmp(&a.version));

    installations
}

/// Validate a manually provided Bitwig installation path
pub fn validate_installation(path: &Path) -> Option<BitwigInstallation> {
    if let Some(jar_path) = find_bitwig_jar(path) {
        let version = extract_version(path);
        let is_patched = is_jar_patched(&jar_path);

        Some(BitwigInstallation {
            path: path.to_path_buf(),
            version,
            jar_path,
            is_patched,
        })
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_version() {
        assert_eq!(extract_version(Path::new("/opt/bitwig-studio/5.2")), "5.2");
        assert_eq!(
            extract_version(Path::new("/Applications/Bitwig Studio 5.1.9.app")),
            "5.1.9"
        );
        assert_eq!(
            extract_version(Path::new("/some/path/without/version")),
            "unknown"
        );
    }

    #[test]
    fn test_get_default_search_paths() {
        let paths = get_default_search_paths();
        assert!(!paths.is_empty());
    }
}
