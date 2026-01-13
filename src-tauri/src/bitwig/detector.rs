use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum InstallationType {
    /// System package (AUR, deb, rpm) - JAR in /opt/, needs sudo to patch
    System,
    /// Flatpak installation - sandboxed, different paths
    Flatpak,
    /// User-local installation - no elevation needed
    UserLocal,
    /// Unknown installation type
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BitwigInstallation {
    pub path: PathBuf,
    pub version: String,
    pub jar_path: PathBuf,
    pub is_patched: bool,
    pub installation_type: InstallationType,
    /// Whether patching requires elevated privileges
    pub needs_sudo: bool,
}

/// Represents a search path with its expected installation type
struct SearchPath {
    path: PathBuf,
    installation_type: InstallationType,
}

/// Get platform-specific default installation paths for Bitwig Studio
fn get_default_search_paths() -> Vec<SearchPath> {
    let mut paths = Vec::new();

    #[cfg(target_os = "linux")]
    {
        // ============================================================
        // Standard system paths (AUR, deb, rpm, pacman, zypper, dnf)
        // ============================================================
        paths.push(SearchPath {
            path: PathBuf::from("/opt/bitwig-studio"),
            installation_type: InstallationType::System,
        });
        paths.push(SearchPath {
            path: PathBuf::from("/usr/share/bitwig-studio"),
            installation_type: InstallationType::System,
        });
        paths.push(SearchPath {
            path: PathBuf::from("/usr/local/share/bitwig-studio"),
            installation_type: InstallationType::System,
        });

        // ============================================================
        // Snap installations (Ubuntu, Linux Mint, etc.)
        // ============================================================
        paths.push(SearchPath {
            path: PathBuf::from("/snap/bitwig-studio/current"),
            installation_type: InstallationType::System,
        });

        // ============================================================
        // Flatpak installations (system-wide)
        // ============================================================
        paths.push(SearchPath {
            path: PathBuf::from("/var/lib/flatpak/app/com.bitwig.BitwigStudio"),
            installation_type: InstallationType::Flatpak,
        });

        // Check custom flatpak system installation path
        if let Ok(flatpak_path) = std::env::var("FLATPAK_SYSTEM_DIR") {
            paths.push(SearchPath {
                path: PathBuf::from(flatpak_path).join("app/com.bitwig.BitwigStudio"),
                installation_type: InstallationType::Flatpak,
            });
        }

        // ============================================================
        // NixOS paths
        // ============================================================
        if let Ok(profile) = std::env::var("NIX_PROFILE") {
            paths.push(SearchPath {
                path: PathBuf::from(profile).join("share/bitwig-studio"),
                installation_type: InstallationType::System,
            });
        }
        // Default nix profile location
        paths.push(SearchPath {
            path: PathBuf::from("/nix/var/nix/profiles/default/share/bitwig-studio"),
            installation_type: InstallationType::System,
        });

        // ============================================================
        // User-specific paths
        // ============================================================
        if let Some(home) = dirs::home_dir() {
            // User-local installations - no sudo needed
            paths.push(SearchPath {
                path: home.join(".local/share/bitwig-studio"),
                installation_type: InstallationType::UserLocal,
            });
            paths.push(SearchPath {
                path: home.join("bitwig-studio"),
                installation_type: InstallationType::UserLocal,
            });
            paths.push(SearchPath {
                path: home.join(".local/bin/bitwig-studio"),
                installation_type: InstallationType::UserLocal,
            });

            // Snap user installation
            paths.push(SearchPath {
                path: home.join("snap/bitwig-studio/current"),
                installation_type: InstallationType::UserLocal,
            });

            // Flatpak user installation
            paths.push(SearchPath {
                path: home.join(".local/share/flatpak/app/com.bitwig.BitwigStudio"),
                installation_type: InstallationType::Flatpak,
            });

            // NixOS user profile
            paths.push(SearchPath {
                path: home.join(".nix-profile/share/bitwig-studio"),
                installation_type: InstallationType::UserLocal,
            });

            // AppImage extracted location (common convention)
            paths.push(SearchPath {
                path: home.join(".local/share/applications/bitwig-studio"),
                installation_type: InstallationType::UserLocal,
            });
        }

        // ============================================================
        // XDG compliance - check XDG_DATA_HOME and XDG_DATA_DIRS
        // ============================================================
        if let Ok(xdg_data_home) = std::env::var("XDG_DATA_HOME") {
            paths.push(SearchPath {
                path: PathBuf::from(xdg_data_home).join("bitwig-studio"),
                installation_type: InstallationType::UserLocal,
            });
        }

        if let Ok(xdg_data_dirs) = std::env::var("XDG_DATA_DIRS") {
            for dir in xdg_data_dirs.split(':') {
                if !dir.is_empty() {
                    paths.push(SearchPath {
                        path: PathBuf::from(dir).join("bitwig-studio"),
                        installation_type: InstallationType::System,
                    });
                }
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        paths.push(SearchPath {
            path: PathBuf::from("/Applications"),
            installation_type: InstallationType::System,
        });
        if let Some(home) = dirs::home_dir() {
            paths.push(SearchPath {
                path: home.join("Applications"),
                installation_type: InstallationType::UserLocal,
            });
        }
    }

    #[cfg(target_os = "windows")]
    {
        // Use environment variables for proper paths (handles non-C: installations)
        if let Ok(pf) = std::env::var("ProgramFiles") {
            paths.push(SearchPath {
                path: PathBuf::from(&pf).join("Bitwig Studio"),
                installation_type: InstallationType::System,
            });
        }

        if let Ok(pf86) = std::env::var("ProgramFiles(x86)") {
            paths.push(SearchPath {
                path: PathBuf::from(&pf86).join("Bitwig Studio"),
                installation_type: InstallationType::System,
            });
        }

        // Enumerate all drives for Bitwig installations
        for letter in b'A'..=b'Z' {
            let drive = format!("{}:", letter as char);
            let drive_path = PathBuf::from(&drive);
            // Only check drives that exist
            if drive_path.join("\\").exists() {
                // Check Program Files on this drive
                let pf_path = drive_path.join("Program Files").join("Bitwig Studio");
                if !paths.iter().any(|p| p.path == pf_path) {
                    paths.push(SearchPath {
                        path: pf_path,
                        installation_type: InstallationType::System,
                    });
                }
                let pf86_path = drive_path.join("Program Files (x86)").join("Bitwig Studio");
                if !paths.iter().any(|p| p.path == pf86_path) {
                    paths.push(SearchPath {
                        path: pf86_path,
                        installation_type: InstallationType::System,
                    });
                }
            }
        }

        // Local app data (user installation)
        if let Ok(local) = std::env::var("LOCALAPPDATA") {
            paths.push(SearchPath {
                path: PathBuf::from(local).join("Programs").join("Bitwig Studio"),
                installation_type: InstallationType::UserLocal,
            });
        }

        // Also check using dirs crate as fallback
        if let Some(local_app_data) = dirs::data_local_dir() {
            let user_path = local_app_data.join("Programs").join("Bitwig Studio");
            if !paths.iter().any(|p| p.path == user_path) {
                paths.push(SearchPath {
                    path: user_path,
                    installation_type: InstallationType::UserLocal,
                });
            }
        }
    }

    paths
}

/// Determine if a path requires sudo to modify
fn path_needs_sudo(path: &Path) -> bool {
    #[cfg(unix)]
    {
        use std::os::unix::fs::MetadataExt;
        if let Ok(metadata) = path.metadata() {
            // Check if owned by root (uid 0) and not world-writable
            let uid = metadata.uid();
            let mode = metadata.mode();
            let world_writable = mode & 0o002 != 0;
            return uid == 0 && !world_writable;
        }
        // If we can't read metadata, assume it needs sudo
        true
    }
    #[cfg(not(unix))]
    {
        // On Windows, check if path is in Program Files
        let path_str = path.to_string_lossy().to_lowercase();
        path_str.contains("program files")
    }
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

fn get_version_from_build_info(jar_path: &Path) -> Option<String> {
    let install_root = jar_path.parent()?.parent()?;
    let candidates = [
        install_root.join("resources").join("build-info.sh"),
        install_root.join("Resources").join("build-info.sh"),
    ];

    for path in candidates {
        if let Ok(content) = std::fs::read_to_string(&path) {
            for line in content.lines() {
                if let Some(value) = line.strip_prefix("BITWIG_STUDIO_VERSION_NAME=") {
                    let trimmed = value.trim().trim_matches('"');
                    if !trimmed.is_empty() {
                        return Some(trimmed.to_string());
                    }
                }
            }
        }
    }

    None
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
        if !search_path.path.exists() {
            continue;
        }

        // Check if this is a direct Bitwig installation
        if let Some(jar_path) = find_bitwig_jar(&search_path.path) {
            let version = get_version_from_build_info(&jar_path)
                .unwrap_or_else(|| extract_version(&search_path.path));
            let is_patched = is_jar_patched(&jar_path);
            let needs_sudo = path_needs_sudo(&jar_path);

            installations.push(BitwigInstallation {
                path: search_path.path.clone(),
                version,
                jar_path,
                is_patched,
                installation_type: search_path.installation_type.clone(),
                needs_sudo,
            });
            continue;
        }

        // Search for versioned subdirectories (e.g., /opt/bitwig-studio/5.2)
        // Also handles Flatpak directory structure
        if let Ok(entries) = std::fs::read_dir(&search_path.path) {
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
                                let needs_sudo = path_needs_sudo(&jar_path);

                                installations.push(BitwigInstallation {
                                    path: entry_path,
                                    version,
                                    jar_path,
                                    is_patched,
                                    installation_type: search_path.installation_type.clone(),
                                    needs_sudo,
                                });
                            }
                        }
                    }

                    // Check for regular directories (including Flatpak's current/active symlinks)
                    if let Some(jar_path) = find_bitwig_jar(&entry_path) {
                        let version = get_version_from_build_info(&jar_path)
                            .unwrap_or_else(|| extract_version(&entry_path));
                        let is_patched = is_jar_patched(&jar_path);
                        let needs_sudo = path_needs_sudo(&jar_path);

                        installations.push(BitwigInstallation {
                            path: entry_path,
                            version,
                            jar_path,
                            is_patched,
                            installation_type: search_path.installation_type.clone(),
                            needs_sudo,
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
        let version = get_version_from_build_info(&jar_path)
            .unwrap_or_else(|| extract_version(path));
        let is_patched = is_jar_patched(&jar_path);
        let needs_sudo = path_needs_sudo(&jar_path);

        // Determine installation type from path
        let path_str = path.to_string_lossy().to_lowercase();
        let installation_type = if path_str.contains("flatpak") {
            InstallationType::Flatpak
        } else if path_str.contains("/snap/") || path_str.contains("\\snap\\") {
            // Snap installations - system snap is in /snap, user snap is in ~/snap
            if path_str.starts_with("/snap/") {
                InstallationType::System
            } else {
                InstallationType::UserLocal
            }
        } else if path_str.starts_with("/opt") || path_str.starts_with("/usr") ||
                  path_str.starts_with("/nix") {
            InstallationType::System
        } else if path_str.contains("program files") {
            // Windows system installation
            InstallationType::System
        } else if let Some(home) = dirs::home_dir() {
            if path.starts_with(&home) {
                InstallationType::UserLocal
            } else {
                InstallationType::Unknown
            }
        } else {
            InstallationType::Unknown
        };

        Some(BitwigInstallation {
            path: path.to_path_buf(),
            version,
            jar_path,
            is_patched,
            installation_type,
            needs_sudo,
        })
    } else {
        None
    }
}

/// Get the latest Bitwig version from the version file or detected installations
pub fn get_latest_version() -> String {
    // First try to read from Bitwig's own version file
    if let Some(home) = dirs::home_dir() {
        let version_file = home.join(".BitwigStudio/latest-launched-version.txt");
        if let Ok(version) = std::fs::read_to_string(&version_file) {
            let version = version.trim();
            if !version.is_empty() {
                // Return the full version string including beta/rc tags
                // bitwig-theme-editor uses the full version for theme directories
                return version.to_string();
            }
        }
    }

    // Fall back to detected installations
    let installations = detect_installations();
    if let Some(install) = installations.first() {
        return install.version.clone();
    }

    // Default fallback
    "5.2".to_string()
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
