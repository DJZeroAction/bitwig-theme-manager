use sha2::{Digest, Sha256};
use crate::log_event;
use std::fs::{self, File};
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};
use std::process::Command;
use thiserror::Error;

// Bitwig Theme Editor release URL for patching
const PATCHER_JAR_URL: &str = "https://github.com/Berikai/bitwig-theme-editor/releases/download/2.2.0/bitwig-theme-editor-2.2.0.jar";
const PATCHER_JAR_NAME: &str = "bitwig-theme-editor-2.2.0.jar";
// SHA256 checksum of the patcher JAR for security verification
const PATCHER_JAR_SHA256: &str = "a3d90aed113cc92cc9f2c8ebb086a54f82f6e7edf70afac34d3fe378e9732e2d";

#[derive(Error, Debug)]
pub enum PatchError {
    #[error("JAR file not found: {0}")]
    JarNotFound(PathBuf),

    #[error("JAR is already patched")]
    AlreadyPatched,

    #[error("JAR is not patched")]
    NotPatched,

    #[error("Backup not found: {0}")]
    BackupNotFound(PathBuf),

    #[error("IO error: {0}")]
    Io(#[from] io::Error),

    #[error("ZIP error: {0}")]
    Zip(#[from] zip::result::ZipError),

    #[error("Checksum mismatch")]
    ChecksumMismatch,

    #[error("Permission denied - requires elevated privileges")]
    PermissionDenied,

    #[error("pkexec failed: {0}")]
    PkexecFailed(String),

    #[error("Elevation cancelled by user")]
    ElevationCancelled,

    #[error("Java not found - please install Java Runtime Environment")]
    JavaNotFound,

    #[error("Failed to download patcher: {0}")]
    DownloadFailed(String),

    #[error("Patcher execution failed: {0}")]
    PatcherFailed(String),

    #[error("Invalid path (contains non-UTF8 characters or invalid characters): {0}")]
    InvalidPath(PathBuf),

    #[error("Shell argument contains invalid characters")]
    InvalidShellArgument,
}

/// Calculate SHA256 hash of a file
pub fn calculate_checksum(path: &Path) -> Result<String, PatchError> {
    let mut file = fs::File::open(path)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 8192];

    loop {
        let bytes_read = file.read(&mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        hasher.update(&buffer[..bytes_read]);
    }

    Ok(hex::encode(hasher.finalize()))
}

/// Convert a Path to a string, returning an error if invalid UTF-8
fn path_to_str(path: &Path) -> Result<&str, PatchError> {
    path.to_str()
        .ok_or_else(|| PatchError::InvalidPath(path.to_path_buf()))
}

/// Check if a command is available on the system
fn has_command(cmd: &str) -> bool {
    #[cfg(target_os = "windows")]
    {
        // On Windows, try running the command with --version or -h to see if it exists
        // The 'where' command can find executables but curl doesn't have --version
        // Just try to run it
        Command::new(cmd)
            .arg("--version")
            .output()
            .map(|o| o.status.success())
            .unwrap_or_else(|_| {
                // Try without arguments for commands that don't support --version
                Command::new(cmd)
                    .arg("-h")
                    .output()
                    .map(|o| o.status.success() || o.status.code().is_some())
                    .unwrap_or(false)
            })
    }
    #[cfg(not(target_os = "windows"))]
    {
        Command::new("which")
            .arg(cmd)
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }
}

/// Sanitize a string for use in shell scripts
/// Escapes single quotes and validates for dangerous characters
fn sanitize_shell_arg(arg: &str) -> Result<String, PatchError> {
    // Reject strings with newlines or null bytes (potential injection)
    if arg.contains('\n') || arg.contains('\0') || arg.contains('\r') {
        return Err(PatchError::InvalidShellArgument);
    }
    // Escape single quotes by replacing ' with '\''
    Ok(arg.replace('\'', "'\\''"))
}

/// Verify the downloaded patcher JAR has the expected checksum
fn verify_patcher_jar(jar_path: &Path) -> Result<(), PatchError> {
    let actual = calculate_checksum(jar_path)?;
    if actual != PATCHER_JAR_SHA256 {
        // Delete the invalid file
        let _ = fs::remove_file(jar_path);
        log_event(&format!(
            "patcher: checksum mismatch - expected {} got {}",
            PATCHER_JAR_SHA256, actual
        ));
        return Err(PatchError::ChecksumMismatch);
    }
    log_event("patcher: checksum verified");
    Ok(())
}

fn manager_backup_dir(jar_path: &Path) -> Result<PathBuf, PatchError> {
    let cache_dir = dirs::cache_dir()
        .ok_or_else(|| PatchError::DownloadFailed("Could not determine cache directory".to_string()))?;
    let mut hasher = Sha256::new();
    hasher.update(jar_path.to_string_lossy().as_bytes());
    let hash = hex::encode(hasher.finalize());
    Ok(cache_dir
        .join("bitwig-theme-manager")
        .join("backups")
        .join(hash))
}

fn create_manager_backup(jar_path: &Path) -> Result<PathBuf, PatchError> {
    if !jar_path.exists() {
        return Err(PatchError::JarNotFound(jar_path.to_path_buf()));
    }

    let backup_dir = manager_backup_dir(jar_path)?;
    fs::create_dir_all(&backup_dir)?;

    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);

    let backup_path = backup_dir.join(format!("{}.jar", timestamp));
    let checksum_path = backup_dir.join(format!("{}.jar.sha256", timestamp));

    fs::copy(jar_path, &backup_path)?;
    let checksum = calculate_checksum(jar_path)?;
    fs::write(&checksum_path, &checksum)?;

    log_event(&format!(
        "patcher: manager backup created {}",
        backup_path.to_string_lossy()
    ));

    Ok(backup_path)
}

fn find_latest_manager_backup(jar_path: &Path) -> Result<PathBuf, PatchError> {
    let backup_dir = manager_backup_dir(jar_path)?;
    if !backup_dir.exists() {
        return Err(PatchError::BackupNotFound(backup_dir));
    }

    let mut latest: Option<(u64, PathBuf)> = None;
    for entry in fs::read_dir(&backup_dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.extension().is_some_and(|ext| ext == "jar") {
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                if let Ok(ts) = stem.parse::<u64>() {
                    match latest {
                        Some((prev_ts, _)) if prev_ts >= ts => {}
                        _ => latest = Some((ts, path)),
                    }
                }
            }
        }
    }

    latest
        .map(|(_, path)| path)
        .ok_or(PatchError::BackupNotFound(backup_dir))
}

fn restore_from_manager_backup(jar_path: &Path) -> Result<(), PatchError> {
    let backup_path = find_latest_manager_backup(jar_path)?;
    let checksum_path = backup_path.with_extension("jar.sha256");
    let marker_path = get_marker_path(jar_path);

    if !checksum_path.exists() {
        return Err(PatchError::ChecksumMismatch);
    }

    let expected_checksum = fs::read_to_string(&checksum_path)?;
    let actual_checksum = calculate_checksum(&backup_path)?;
    if expected_checksum.trim() != actual_checksum {
        return Err(PatchError::ChecksumMismatch);
    }

    fs::copy(&backup_path, jar_path)?;
    if marker_path.exists() {
        fs::remove_file(&marker_path)?;
    }

    log_event(&format!(
        "patcher: restored from manager backup {}",
        backup_path.to_string_lossy()
    ));
    Ok(())
}

/// Get the backup path for a JAR file
pub fn get_backup_path(jar_path: &Path) -> PathBuf {
    jar_path.with_extension("jar.backup")
}

/// Get the checksum file path for a backup
pub fn get_checksum_path(jar_path: &Path) -> PathBuf {
    jar_path.with_extension("jar.backup.sha256")
}

/// Get the patch marker file path
pub fn get_marker_path(jar_path: &Path) -> PathBuf {
    jar_path.with_extension("patched")
}

/// Create a backup of the original JAR file
pub fn create_backup(jar_path: &Path) -> Result<PathBuf, PatchError> {
    if !jar_path.exists() {
        return Err(PatchError::JarNotFound(jar_path.to_path_buf()));
    }

    let backup_path = get_backup_path(jar_path);
    let checksum_path = get_checksum_path(jar_path);

    // Don't overwrite existing backup
    if backup_path.exists() {
        return Ok(backup_path);
    }

    // Copy JAR to backup location
    fs::copy(jar_path, &backup_path)?;

    // Save checksum of original JAR
    let checksum = calculate_checksum(jar_path)?;
    fs::write(&checksum_path, &checksum)?;

    Ok(backup_path)
}

/// Restore the original JAR from backup
pub fn restore_from_backup(jar_path: &Path) -> Result<(), PatchError> {
    let backup_path = get_backup_path(jar_path);
    let checksum_path = get_checksum_path(jar_path);
    let marker_path = get_marker_path(jar_path);

    if !backup_path.exists() {
        return Err(PatchError::BackupNotFound(backup_path));
    }

    // Verify backup integrity if checksum exists
    if checksum_path.exists() {
        let expected_checksum = fs::read_to_string(&checksum_path)?;
        let actual_checksum = calculate_checksum(&backup_path)?;
        if expected_checksum.trim() != actual_checksum {
            return Err(PatchError::ChecksumMismatch);
        }
    }

    // Restore the backup
    fs::copy(&backup_path, jar_path)?;

    // Remove patch marker
    if marker_path.exists() {
        fs::remove_file(&marker_path)?;
    }

    Ok(())
}

/// Patch the JAR file to enable theme support
///
/// This is a placeholder implementation. The actual patching logic needs to be
/// reverse-engineered from the original bitwig-theme-editor Java implementation.
pub fn patch_jar(jar_path: &Path) -> Result<(), PatchError> {
    if !jar_path.exists() {
        return Err(PatchError::JarNotFound(jar_path.to_path_buf()));
    }

    let marker_path = get_marker_path(jar_path);

    // Check if already patched
    if marker_path.exists() {
        return Err(PatchError::AlreadyPatched);
    }

    // Create backup first
    create_backup(jar_path)?;

    // TODO: Implement actual JAR patching
    // The patching logic needs to:
    // 1. Open the JAR file (ZIP format)
    // 2. Find the relevant class files
    // 3. Modify bytecode to add theme file watching
    // 4. Save the modified JAR

    // For now, just create a marker file to indicate "patched" status
    // This is a placeholder until real patching is implemented
    fs::write(&marker_path, "patched")?;

    Ok(())
}

/// Check if a JAR file is patched
pub fn is_patched(jar_path: &Path) -> bool {
    get_marker_path(jar_path).exists()
}

/// Check if a backup exists for a JAR file
pub fn has_backup(jar_path: &Path) -> bool {
    get_backup_path(jar_path).exists()
}

/// Get the directory where we cache the patcher JAR
fn get_patcher_cache_dir() -> Option<PathBuf> {
    dirs::cache_dir().map(|d| d.join("bitwig-theme-manager").join("patcher"))
}

/// Get the path to the cached patcher JAR
#[allow(dead_code)]
fn get_patcher_jar_path() -> Option<PathBuf> {
    get_patcher_cache_dir().map(|d| d.join(PATCHER_JAR_NAME))
}

/// Find Java executable path
/// Searches: Bitwig's bundled JRE, PATH, common installation directories, JAVA_HOME
pub fn find_java() -> Option<PathBuf> {
    // First, try to find Bitwig's bundled JRE (most reliable)
    if let Some(java_path) = find_bitwig_bundled_java() {
        return Some(java_path);
    }

    // Try PATH
    let java_cmd = if cfg!(target_os = "windows") { "java.exe" } else { "java" };
    if Command::new(java_cmd)
        .arg("-version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
    {
        return Some(PathBuf::from(java_cmd));
    }

    // On Windows, search common Java installation directories
    #[cfg(target_os = "windows")]
    {
        let program_files = std::env::var("ProgramFiles").unwrap_or_else(|_| "C:\\Program Files".to_string());
        let program_files_x86 = std::env::var("ProgramFiles(x86)").unwrap_or_else(|_| "C:\\Program Files (x86)".to_string());

        let search_roots = [
            PathBuf::from(&program_files).join("Java"),
            PathBuf::from(&program_files).join("Eclipse Adoptium"),
            PathBuf::from(&program_files).join("Microsoft"),
            PathBuf::from(&program_files).join("Amazon Corretto"),
            PathBuf::from(&program_files).join("Zulu"),
            PathBuf::from(&program_files).join("BellSoft"),
            PathBuf::from(&program_files).join("OpenJDK"),
            PathBuf::from(&program_files_x86).join("Java"),
        ];

        for root in &search_roots {
            if !root.exists() {
                continue;
            }
            if let Ok(entries) = fs::read_dir(root) {
                for entry in entries.filter_map(|e| e.ok()) {
                    let java_path = entry.path().join("bin").join("java.exe");
                    if java_path.exists() {
                        // Verify it actually runs
                        if Command::new(&java_path)
                            .arg("-version")
                            .output()
                            .map(|o| o.status.success())
                            .unwrap_or(false)
                        {
                            return Some(java_path);
                        }
                    }
                }
            }
        }

        // Also check JAVA_HOME
        if let Ok(java_home) = std::env::var("JAVA_HOME") {
            let java_path = PathBuf::from(&java_home).join("bin").join("java.exe");
            if java_path.exists() {
                if Command::new(&java_path)
                    .arg("-version")
                    .output()
                    .map(|o| o.status.success())
                    .unwrap_or(false)
                {
                    return Some(java_path);
                }
            }
        }
    }

    // On Unix, also check JAVA_HOME
    #[cfg(unix)]
    {
        if let Ok(java_home) = std::env::var("JAVA_HOME") {
            let java_path = PathBuf::from(&java_home).join("bin").join("java");
            if java_path.exists() {
                if Command::new(&java_path)
                    .arg("-version")
                    .output()
                    .map(|o| o.status.success())
                    .unwrap_or(false)
                {
                    return Some(java_path);
                }
            }
        }
    }

    None
}

/// Find Bitwig's bundled JRE
fn find_bitwig_bundled_java() -> Option<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        let program_files = std::env::var("ProgramFiles").unwrap_or_else(|_| "C:\\Program Files".to_string());

        // Check common Bitwig installation paths for bundled JRE
        let bitwig_paths = [
            PathBuf::from(&program_files).join("Bitwig Studio"),
        ];

        for bitwig_path in &bitwig_paths {
            if !bitwig_path.exists() {
                continue;
            }

            // Bitwig bundles JRE in these locations
            let jre_candidates = [
                bitwig_path.join("jre").join("bin").join("java.exe"),
                bitwig_path.join("lib").join("jre").join("bin").join("java.exe"),
                bitwig_path.join("runtime").join("bin").join("java.exe"),
            ];

            for java_path in &jre_candidates {
                if java_path.exists() {
                    if Command::new(java_path)
                        .arg("-version")
                        .output()
                        .map(|o| o.status.success())
                        .unwrap_or(false)
                    {
                        log_event(&format!("patcher: found Bitwig bundled Java at {}", java_path.display()));
                        return Some(java_path.clone());
                    }
                }
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        let search_paths = [
            PathBuf::from("/opt/bitwig-studio"),
            PathBuf::from("/usr/share/bitwig-studio"),
        ];

        // Also check user home
        let mut all_paths = search_paths.to_vec();
        if let Some(home) = dirs::home_dir() {
            all_paths.push(home.join(".local/share/bitwig-studio"));
        }

        for bitwig_path in &all_paths {
            if !bitwig_path.exists() {
                continue;
            }

            // Search for versioned directories
            if let Ok(entries) = fs::read_dir(bitwig_path) {
                for entry in entries.filter_map(|e| e.ok()) {
                    let version_dir = entry.path();
                    if version_dir.is_dir() {
                        let jre_candidates = [
                            version_dir.join("lib").join("jre").join("bin").join("java"),
                            version_dir.join("jre").join("bin").join("java"),
                        ];

                        for java_path in &jre_candidates {
                            if java_path.exists() {
                                if Command::new(java_path)
                                    .arg("-version")
                                    .output()
                                    .map(|o| o.status.success())
                                    .unwrap_or(false)
                                {
                                    log_event(&format!("patcher: found Bitwig bundled Java at {}", java_path.display()));
                                    return Some(java_path.clone());
                                }
                            }
                        }
                    }
                }
            }

            // Also check directly in the bitwig path (non-versioned)
            let jre_candidates = [
                bitwig_path.join("lib").join("jre").join("bin").join("java"),
                bitwig_path.join("jre").join("bin").join("java"),
            ];

            for java_path in &jre_candidates {
                if java_path.exists() {
                    if Command::new(java_path)
                        .arg("-version")
                        .output()
                        .map(|o| o.status.success())
                        .unwrap_or(false)
                    {
                        log_event(&format!("patcher: found Bitwig bundled Java at {}", java_path.display()));
                        return Some(java_path.clone());
                    }
                }
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        let app_paths = [
            PathBuf::from("/Applications/Bitwig Studio.app"),
        ];

        if let Some(home) = dirs::home_dir() {
            let user_app = home.join("Applications/Bitwig Studio.app");
            if user_app.exists() {
                let java_path = user_app.join("Contents/PlugIns/jre/Contents/Home/bin/java");
                if java_path.exists() {
                    if Command::new(&java_path)
                        .arg("-version")
                        .output()
                        .map(|o| o.status.success())
                        .unwrap_or(false)
                    {
                        log_event(&format!("patcher: found Bitwig bundled Java at {}", java_path.display()));
                        return Some(java_path);
                    }
                }
            }
        }

        for app_path in &app_paths {
            if !app_path.exists() {
                continue;
            }

            let jre_candidates = [
                app_path.join("Contents/PlugIns/jre/Contents/Home/bin/java"),
                app_path.join("Contents/Resources/app/lib/jre/bin/java"),
            ];

            for java_path in &jre_candidates {
                if java_path.exists() {
                    if Command::new(java_path)
                        .arg("-version")
                        .output()
                        .map(|o| o.status.success())
                        .unwrap_or(false)
                    {
                        log_event(&format!("patcher: found Bitwig bundled Java at {}", java_path.display()));
                        return Some(java_path.clone());
                    }
                }
            }
        }
    }

    None
}

/// Check if Java is available on the system
pub fn has_java() -> bool {
    find_java().is_some()
}

/// Download the patcher JAR if not already cached
pub fn ensure_patcher_available() -> Result<PathBuf, PatchError> {
    log_event("patcher: ensure_patcher_available start");
    let cache_dir = get_patcher_cache_dir()
        .ok_or_else(|| PatchError::DownloadFailed("Could not determine cache directory".to_string()))?;

    let jar_path = cache_dir.join(PATCHER_JAR_NAME);

    // Return if already cached and verified
    if jar_path.exists() {
        log_event(&format!(
            "patcher: checking cached patcher at {}",
            jar_path.to_string_lossy()
        ));
        // Verify cached JAR integrity
        match verify_patcher_jar(&jar_path) {
            Ok(()) => return Ok(jar_path),
            Err(e) => {
                log_event(&format!("patcher: cached jar invalid, re-downloading: {}", e));
                // File was deleted by verify_patcher_jar, continue to download
            }
        }
    }

    // Create cache directory
    fs::create_dir_all(&cache_dir)?;

    // Get path as string safely
    let jar_path_str = path_to_str(&jar_path)?;

    // Download the patcher JAR using curl or wget
    // On Windows, curl is built-in since Windows 10
    let download_result = if has_command("curl") {
        log_event("patcher: downloading with curl");
        Command::new("curl")
            .args(["-L", "-o", jar_path_str, PATCHER_JAR_URL])
            .output()
    } else if has_command("wget") {
        log_event("patcher: downloading with wget");
        Command::new("wget")
            .args(["-O", jar_path_str, PATCHER_JAR_URL])
            .output()
    } else {
        log_event("patcher: download failed (no curl/wget)");
        return Err(PatchError::DownloadFailed("Neither curl nor wget available".to_string()));
    };

    match download_result {
        Ok(output) if output.status.success() => {
            log_event(&format!(
                "patcher: download ok -> {}",
                jar_path.to_string_lossy()
            ));
            // Verify the downloaded JAR
            verify_patcher_jar(&jar_path)?;
            Ok(jar_path)
        }
        Ok(output) => {
            let stderr = String::from_utf8_lossy(&output.stderr);
            log_event(&format!("patcher: download failed {}", stderr));
            // Clean up partial download
            let _ = fs::remove_file(&jar_path);
            Err(PatchError::DownloadFailed(stderr.to_string()))
        }
        Err(e) => {
            log_event(&format!("patcher: download error {}", e));
            // Clean up partial download
            let _ = fs::remove_file(&jar_path);
            Err(PatchError::DownloadFailed(e.to_string()))
        }
    }
}

/// Run the bitwig-theme-editor patcher on a JAR file in CLI mode (no GUI)
/// The patcher accepts the JAR path as argument and patches it directly
fn run_patcher_process(bitwig_jar_path: &Path, home: &str, user: &str) -> Result<(String, String), PatchError> {
    let java_path = find_java().ok_or(PatchError::JavaNotFound)?;
    let patcher_jar = ensure_patcher_available()?;
    let patcher_jar_str = path_to_str(&patcher_jar)?;
    let bitwig_jar_str = path_to_str(bitwig_jar_path)?;

    let output = Command::new(&java_path)
        .args([
            &format!("-Duser.home={}", home),
            &format!("-Duser.name={}", user),
            &format!("-Duser.dir={}", home),
            "-jar",
            patcher_jar_str,
            bitwig_jar_str,
        ])
        .output()?;

    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();

    if output.status.success() {
        Ok((stdout, stderr))
    } else {
        Err(PatchError::PatcherFailed(format!(
            "stdout: {}\nstderr: {}",
            stdout, stderr
        )))
    }
}

pub fn run_patcher_cli(bitwig_jar_path: &Path) -> Result<(), PatchError> {
    if !has_java() {
        log_event("patcher: run_patcher_cli failed (no java)");
        return Err(PatchError::JavaNotFound);
    }

    let _ = create_manager_backup(bitwig_jar_path);

    // Get user home and name (platform-specific)
    #[cfg(target_os = "windows")]
    let (home, user) = {
        let home = std::env::var("USERPROFILE").unwrap_or_else(|_| {
            std::env::var("HOME").unwrap_or_default()
        });
        let user = std::env::var("USERNAME").unwrap_or_default();
        (home, user)
    };
    #[cfg(not(target_os = "windows"))]
    let (home, user) = {
        let home = std::env::var("HOME").unwrap_or_default();
        let user = std::env::var("USER").unwrap_or_default();
        (home, user)
    };
    let _logname = std::env::var("LOGNAME").unwrap_or_else(|_| user.clone());

    log_event(&format!(
        "patcher: run_patcher_cli start -> {}",
        bitwig_jar_path.to_string_lossy()
    ));

    let (stdout, stderr) = run_patcher_process(bitwig_jar_path, &home, &user)?;
    if !stdout.contains("already patched") && !stderr.contains("already patched") {
        // Create our marker file for tracking
        let marker_path = get_marker_path(bitwig_jar_path);
        fs::write(&marker_path, "patched")?;
    }
    log_event(&format!(
        "patcher: run_patcher_cli ok stdout='{}' stderr='{}'",
        stdout, stderr
    ));
    Ok(())
}

/// Create a secure temporary script file with unique name
fn create_secure_temp_script(name_prefix: &str, content: &str) -> Result<PathBuf, PatchError> {
    let temp_dir = std::env::temp_dir().join("bitwig-theme-manager");
    fs::create_dir_all(&temp_dir)?;

    // Set directory permissions to 0700 on Unix
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ = fs::set_permissions(&temp_dir, fs::Permissions::from_mode(0o700));
    }

    // Generate unique filename using nanoseconds
    let id: u64 = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos() as u64)
        .unwrap_or(0);
    let script_name = format!("{}-{}.sh", name_prefix, id);
    let script_path = temp_dir.join(script_name);

    fs::write(&script_path, content)?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(&script_path, fs::Permissions::from_mode(0o700))?;
    }

    Ok(script_path)
}

/// Run patcher with elevated privileges using pkexec (Unix) or UAC (Windows)
pub fn run_patcher_cli_elevated(bitwig_jar_path: &Path) -> Result<(), PatchError> {
    let java_path = find_java().ok_or_else(|| {
        log_event("patcher: run_patcher_cli_elevated failed (no java)");
        PatchError::JavaNotFound
    })?;

    let patcher_jar = ensure_patcher_available()?;

    log_event(&format!(
        "patcher: run_patcher_cli_elevated start -> {}",
        bitwig_jar_path.to_string_lossy()
    ));

    // Get user home and name (platform-specific)
    #[cfg(target_os = "windows")]
    let (home, user, logname) = {
        let home = std::env::var("USERPROFILE").unwrap_or_else(|_| {
            std::env::var("HOME").unwrap_or_default()
        });
        let user = std::env::var("USERNAME").unwrap_or_default();
        (home.clone(), user.clone(), user)
    };
    #[cfg(not(target_os = "windows"))]
    let (home, user, logname) = {
        let home = std::env::var("HOME").unwrap_or_default();
        let user = std::env::var("USER").unwrap_or_default();
        let logname = std::env::var("LOGNAME").unwrap_or_else(|_| user.clone());
        (home, user, logname)
    };

    let backup_dir = manager_backup_dir(bitwig_jar_path)?;
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    let backup_path = backup_dir.join(format!("{}.jar", timestamp));
    let checksum_path = backup_dir.join(format!("{}.jar.sha256", timestamp));

    log_event(&format!(
        "patcher: elevating with HOME='{}' USER='{}'",
        home, user
    ));

    #[cfg(target_os = "windows")]
    let output = {
        // On Windows, create a PowerShell script for elevation
        let temp_dir = std::env::temp_dir().join("bitwig-theme-manager");
        fs::create_dir_all(&temp_dir)?;
        fs::create_dir_all(&backup_dir)?;

        let id: u64 = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_nanos() as u64)
            .unwrap_or(0);

        let script_path = temp_dir.join(format!("patch-elevated-{}.ps1", id));

        // Escape paths for PowerShell
        let java_path_escaped = java_path.to_string_lossy().replace("'", "''");
        let patcher_jar_escaped = patcher_jar.to_string_lossy().replace("'", "''");
        let bitwig_jar_escaped = bitwig_jar_path.to_string_lossy().replace("'", "''");
        let backup_path_escaped = backup_path.to_string_lossy().replace("'", "''");
        let checksum_path_escaped = checksum_path.to_string_lossy().replace("'", "''");
        let home_escaped = home.replace("'", "''");
        let user_escaped = user.replace("'", "''");

        let script_content = format!(
            r#"$ErrorActionPreference = 'Stop'
Copy-Item -Path '{bitwig_jar}' -Destination '{backup_path}' -Force
$hash = (Get-FileHash -Path '{bitwig_jar}' -Algorithm SHA256).Hash.ToLower()
Set-Content -Path '{checksum_path}' -Value $hash -NoNewline
& '{java_path}' '-Duser.home={home}' '-Duser.name={user}' '-Duser.dir={home}' '-jar' '{patcher_jar}' '{bitwig_jar}'
"#,
            java_path = java_path_escaped,
            patcher_jar = patcher_jar_escaped,
            bitwig_jar = bitwig_jar_escaped,
            backup_path = backup_path_escaped,
            checksum_path = checksum_path_escaped,
            home = home_escaped,
            user = user_escaped,
        );

        fs::write(&script_path, &script_content)?;

        let script_path_str = script_path.to_string_lossy().replace("'", "''");

        // Use PowerShell to run the script with elevation
        let ps_command = format!(
            "Start-Process -FilePath 'powershell' -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', '{}' -Verb RunAs -Wait -WindowStyle Hidden",
            script_path_str
        );

        let output = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", &ps_command])
            .output()?;

        // Clean up script
        let _ = fs::remove_file(&script_path);
        output
    };

    #[cfg(not(target_os = "windows"))]
    let output = {
        // Sanitize all shell arguments
        let home_safe = sanitize_shell_arg(&home)?;
        let user_safe = sanitize_shell_arg(&user)?;
        let logname_safe = sanitize_shell_arg(&logname)?;

        // Sanitize path arguments
        let backup_dir_safe = sanitize_shell_arg(&backup_dir.to_string_lossy())?;
        let backup_path_safe = sanitize_shell_arg(&backup_path.to_string_lossy())?;
        let checksum_path_safe = sanitize_shell_arg(&checksum_path.to_string_lossy())?;
        let bitwig_jar_safe = sanitize_shell_arg(&bitwig_jar_path.to_string_lossy())?;
        let patcher_jar_safe = sanitize_shell_arg(&patcher_jar.to_string_lossy())?;
        let java_path_safe = sanitize_shell_arg(&java_path.to_string_lossy())?;

        // Create a script that runs the patcher with java
        let script_content = format!(
            "#!/bin/bash\nset -e\nexport HOME='{}'\nexport USER='{}'\nexport LOGNAME='{}'\nmkdir -p '{}'\ncp '{}' '{}'\nsha256sum '{}' | cut -d' ' -f1 > '{}'\n'{}' -Duser.home='{}' -Duser.name='{}' -Duser.dir='{}' -jar '{}' '{}'\n",
            home_safe,
            user_safe,
            logname_safe,
            backup_dir_safe,
            bitwig_jar_safe,
            backup_path_safe,
            bitwig_jar_safe,
            checksum_path_safe,
            java_path_safe,
            home_safe,
            user_safe,
            home_safe,
            patcher_jar_safe,
            bitwig_jar_safe
        );

        let script_path = create_secure_temp_script("patch-cli", &script_content)?;

        // Run with pkexec
        let output = Command::new("pkexec")
            .arg("bash")
            .arg(&script_path)
            .output()?;

        // Clean up script
        let _ = fs::remove_file(&script_path);
        output
    };

    let stderr = String::from_utf8_lossy(&output.stderr);
    let stdout = String::from_utf8_lossy(&output.stdout);

    if output.status.success() {
        // Create our marker file for tracking
        let marker_path = get_marker_path(bitwig_jar_path);
        // Need to write marker with elevation too if in system location
        if !can_write(&marker_path) {
            #[cfg(target_os = "windows")]
            {
                // On Windows, use PowerShell with elevation to write marker
                let marker_path_escaped = marker_path.to_string_lossy().replace("'", "''");
                let ps_command = format!(
                    "Start-Process -FilePath 'powershell' -ArgumentList '-NoProfile', '-Command', \"Set-Content -Path '{}' -Value 'patched'\" -Verb RunAs -Wait -WindowStyle Hidden",
                    marker_path_escaped
                );
                let marker_result = Command::new("powershell")
                    .args(["-NoProfile", "-NonInteractive", "-Command", &ps_command])
                    .output();
                if let Err(e) = marker_result {
                    log_event(&format!("patcher: warning - failed to write marker: {}", e));
                }
            }
            #[cfg(not(target_os = "windows"))]
            {
                let marker_path_safe = sanitize_shell_arg(&marker_path.to_string_lossy())?;
                let marker_script = format!(
                    "#!/bin/bash\necho 'patched' > '{}'\n",
                    marker_path_safe
                );
                let marker_script_path = create_secure_temp_script("marker", &marker_script)?;
                let marker_result = Command::new("pkexec")
                    .arg("bash")
                    .arg(&marker_script_path)
                    .output();
                let _ = fs::remove_file(&marker_script_path);
                if let Err(e) = marker_result {
                    log_event(&format!("patcher: warning - failed to write marker: {}", e));
                }
            }
        } else if let Err(e) = fs::write(&marker_path, "patched") {
            log_event(&format!("patcher: warning - failed to write marker: {}", e));
        }
        log_event(&format!(
            "patcher: run_patcher_cli_elevated ok stdout='{}' stderr='{}'",
            stdout, stderr
        ));
        Ok(())
    } else {
        log_event(&format!(
            "patcher: run_patcher_cli_elevated failed stdout='{}' stderr='{}'",
            stdout, stderr
        ));

        if stderr.contains("dismissed") || output.status.code() == Some(126) {
            Err(PatchError::ElevationCancelled)
        } else if stdout.contains("already patched") {
            let marker_path = get_marker_path(bitwig_jar_path);
            if let Err(e) = fs::write(&marker_path, "patched") {
                log_event(&format!("patcher: warning - failed to write marker: {}", e));
            }
            Ok(())
        } else {
            Err(PatchError::PatcherFailed(format!(
                "stdout: {}\nstderr: {}",
                stdout, stderr
            )))
        }
    }
}

/// Create a headless patching script that uses the patcher's classes
/// Kept for potential future use
#[allow(dead_code)]
fn create_java_patch_script(bitwig_jar_path: &Path, patcher_jar: &Path) -> Result<PathBuf, PatchError> {
    let temp_dir = std::env::temp_dir();
    let script_path = temp_dir.join("bitwig-patch.sh");

    let bitwig_str = bitwig_jar_path.to_string_lossy();
    let patcher_str = patcher_jar.to_string_lossy();
    let backup_path = get_backup_path(bitwig_jar_path);
    let backup_str = backup_path.to_string_lossy();
    let marker_path = get_marker_path(bitwig_jar_path);
    let marker_str = marker_path.to_string_lossy();

    // Script that runs the GUI patcher
    // Since bitwig-theme-editor is GUI-only, we launch it and let user patch
    let script_content = format!(r#"#!/bin/bash
set -e

BITWIG_JAR="{bitwig_str}"
PATCHER_JAR="{patcher_str}"
BACKUP_PATH="{backup_str}"
MARKER_PATH="{marker_str}"

# Check if already patched
if [ -f "$MARKER_PATH" ]; then
    echo "Already patched"
    exit 0
fi

# Create backup if doesn't exist
if [ ! -f "$BACKUP_PATH" ]; then
    cp "$BITWIG_JAR" "$BACKUP_PATH"
fi

# Launch the patcher GUI
# The user needs to:
# 1. Select the Bitwig installation in the GUI
# 2. Click "Patch"
java -jar "$PATCHER_JAR" &

echo "Patcher launched. Please complete patching in the GUI."
"#);

    let mut file = File::create(&script_path)?;
    file.write_all(script_content.as_bytes())?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(&script_path)?.permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&script_path, perms)?;
    }

    Ok(script_path)
}

/// Check if we have write permission to a file/directory
pub fn can_write(path: &Path) -> bool {
    // Try to open the file for writing
    if path.exists() {
        fs::OpenOptions::new().write(true).open(path).is_ok()
    } else {
        // Check parent directory
        path.parent()
            .map(|p| fs::OpenOptions::new().write(true).open(p).is_ok())
            .unwrap_or(false)
    }
}

/// Check if elevation is available on the system
/// On Unix, checks for pkexec. On Windows, checks for PowerShell.
pub fn has_pkexec() -> bool {
    #[cfg(unix)]
    {
        Command::new("which")
            .arg("pkexec")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }
    #[cfg(target_os = "windows")]
    {
        // PowerShell is always available on modern Windows
        Command::new("powershell")
            .args(["-NoProfile", "-Command", "exit 0"])
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }
    #[cfg(not(any(unix, target_os = "windows")))]
    {
        false
    }
}

/// Execute a shell command with pkexec elevation
#[cfg(unix)]
pub fn run_with_pkexec(command: &str, args: &[&str]) -> Result<(), PatchError> {
    let output = Command::new("pkexec")
        .arg(command)
        .args(args)
        .output()?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        if stderr.contains("dismissed") || output.status.code() == Some(126) {
            Err(PatchError::ElevationCancelled)
        } else {
            Err(PatchError::PkexecFailed(stderr.to_string()))
        }
    }
}

/// Execute a command with elevated privileges on Windows using PowerShell
#[cfg(target_os = "windows")]
pub fn run_with_pkexec(command: &str, args: &[&str]) -> Result<(), PatchError> {
    // On Windows, we use PowerShell's Start-Process with -Verb RunAs for UAC elevation
    // We create a batch file with the command and run it elevated

    let temp_dir = std::env::temp_dir().join("bitwig-theme-manager");
    fs::create_dir_all(&temp_dir)?;

    let id: u64 = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos() as u64)
        .unwrap_or(0);

    let batch_path = temp_dir.join(format!("elevated-{}.bat", id));

    // Build the command line
    let args_str = args.join(" ");
    let batch_content = format!("@echo off\r\n{} {}\r\n", command, args_str);
    fs::write(&batch_path, &batch_content)?;

    let batch_path_str = path_to_str(&batch_path)?;

    // Use PowerShell to run the batch file with elevation
    // -Wait ensures we wait for completion
    // -WindowStyle Hidden hides the window
    let ps_command = format!(
        "Start-Process -FilePath '{}' -Verb RunAs -Wait -WindowStyle Hidden",
        batch_path_str.replace('\'', "''")
    );

    let output = Command::new("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", &ps_command])
        .output()?;

    // Clean up
    let _ = fs::remove_file(&batch_path);

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        // Check for user cancellation (UAC dialog dismissed)
        if stderr.contains("canceled") || stderr.contains("cancelled") ||
           stderr.contains("The operation was canceled") ||
           output.status.code() == Some(1223) {
            Err(PatchError::ElevationCancelled)
        } else {
            Err(PatchError::PkexecFailed(format!("Windows elevation failed: {}", stderr)))
        }
    }
}

#[cfg(not(any(unix, target_os = "windows")))]
pub fn run_with_pkexec(_command: &str, _args: &[&str]) -> Result<(), PatchError> {
    Err(PatchError::PkexecFailed("Elevation not available on this platform".to_string()))
}

fn get_patch_sources(jar_path: &Path) -> Vec<PathBuf> {
    let mut sources = Vec::new();
    let candidates = [
        jar_path.with_extension("jar.bak"),
        jar_path.with_extension("jar.backup"),
        jar_path.with_extension("backup"),
    ];

    for candidate in candidates {
        if candidate.exists() {
            sources.push(candidate);
        }
    }

    if let Ok(backup) = find_latest_manager_backup(jar_path) {
        sources.push(backup);
    }

    sources.push(jar_path.to_path_buf());
    sources
}

fn patch_via_user_temp(jar_path: &Path) -> Result<(), PatchError> {
    let temp_dir = std::env::temp_dir().join("bitwig-theme-manager");
    fs::create_dir_all(&temp_dir)?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ = fs::set_permissions(&temp_dir, fs::Permissions::from_mode(0o700));
    }

    let temp_jar = temp_dir.join("bitwig.jar");

    // Get user home and name (platform-specific)
    #[cfg(target_os = "windows")]
    let (home, user) = {
        let home = std::env::var("USERPROFILE").unwrap_or_else(|_| {
            std::env::var("HOME").unwrap_or_default()
        });
        let user = std::env::var("USERNAME").unwrap_or_default();
        (home, user)
    };
    #[cfg(not(target_os = "windows"))]
    let (home, user) = {
        let home = std::env::var("HOME").unwrap_or_default();
        let user = std::env::var("USER").unwrap_or_default();
        (home, user)
    };

    for source in get_patch_sources(jar_path) {
        fs::copy(&source, &temp_jar)?;
        log_event(&format!(
            "patcher: patching temp jar as user -> {} (source {})",
            temp_jar.to_string_lossy(),
            source.to_string_lossy()
        ));

        let (stdout, stderr) = run_patcher_process(&temp_jar, &home, &user)?;
        log_event(&format!(
            "patcher: run_patcher_cli temp stdout='{}' stderr='{}'",
            stdout, stderr
        ));

        if stdout.contains("already patched") || stderr.contains("already patched") {
            continue;
        }

        let marker_path = get_marker_path(jar_path);

        #[cfg(target_os = "windows")]
        {
            // On Windows, use PowerShell with elevation to copy the patched jar
            let temp_jar_escaped = temp_jar.to_string_lossy().replace("'", "''");
            let jar_path_escaped = jar_path.to_string_lossy().replace("'", "''");
            let marker_path_escaped = marker_path.to_string_lossy().replace("'", "''");

            let ps_script = format!(
                r#"Copy-Item -Path '{}' -Destination '{}' -Force; Set-Content -Path '{}' -Value 'patched'"#,
                temp_jar_escaped, jar_path_escaped, marker_path_escaped
            );

            let ps_command = format!(
                "Start-Process -FilePath 'powershell' -ArgumentList '-NoProfile', '-Command', \"{}\" -Verb RunAs -Wait -WindowStyle Hidden",
                ps_script.replace('"', "`\"")
            );

            let output = Command::new("powershell")
                .args(["-NoProfile", "-NonInteractive", "-Command", &ps_command])
                .output()?;

            if output.status.success() {
                return Ok(());
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr);
                if stderr.contains("canceled") || stderr.contains("cancelled") {
                    return Err(PatchError::ElevationCancelled);
                }
                return Err(PatchError::PkexecFailed(format!("Windows elevation failed: {}", stderr)));
            }
        }

        #[cfg(not(target_os = "windows"))]
        {
            // Sanitize paths for shell script
            let temp_jar_safe = sanitize_shell_arg(&temp_jar.to_string_lossy())?;
            let jar_path_safe = sanitize_shell_arg(&jar_path.to_string_lossy())?;
            let marker_path_safe = sanitize_shell_arg(&marker_path.to_string_lossy())?;

            let script_content = format!(
                "#!/bin/bash\nset -e\ncp '{}' '{}'\necho 'patched' > '{}'\n",
                temp_jar_safe,
                jar_path_safe,
                marker_path_safe
            );

            let script_path = create_secure_temp_script("copy-patched", &script_content)?;
            let script_path_str = path_to_str(&script_path)?;

            let result = run_with_pkexec("bash", &[script_path_str]);
            let _ = fs::remove_file(&script_path);
            return result;
        }
    }

    Err(PatchError::AlreadyPatched)
}

/// Patch the JAR file with elevation if needed
/// Uses the bitwig-theme-editor patcher in CLI mode (no GUI)
pub fn patch_jar_elevated(jar_path: &Path) -> Result<(), PatchError> {
    if !jar_path.exists() {
        log_event(&format!(
            "patcher: patch_jar_elevated jar missing {}",
            jar_path.to_string_lossy()
        ));
        return Err(PatchError::JarNotFound(jar_path.to_path_buf()));
    }

    // Check if Java is available
    if !has_java() {
        log_event("patcher: patch_jar_elevated failed (no java)");
        return Err(PatchError::JavaNotFound);
    }

    let _ = create_manager_backup(jar_path);

    log_event(&format!(
        "patcher: patch_jar_elevated start -> {}",
        jar_path.to_string_lossy()
    ));

    // Ensure patcher is downloaded
    ensure_patcher_available()?;

    // Check if we need elevation
    let needs_elevation = !can_write(jar_path);
    log_event(&format!(
        "patcher: needs_elevation={}",
        needs_elevation
    ));

    if needs_elevation {
        // Run patcher as user on a temp copy, then copy patched jar with pkexec.
        if has_pkexec() {
            patch_via_user_temp(jar_path)
        } else {
            log_event("patcher: no pkexec available");
            Err(PatchError::PermissionDenied)
        }
    } else {
        // No elevation needed, run patcher directly
        run_patcher_cli(jar_path)
    }
}

/// Create a temporary shell script for patching with elevated privileges
/// Used as fallback when Java patcher is not available
#[allow(dead_code)]
fn create_patch_script(jar_path: &Path) -> Result<PathBuf, PatchError> {
    let temp_dir = std::env::temp_dir();
    let script_path = temp_dir.join("bitwig-patch-script.sh");

    let jar_str = jar_path.to_string_lossy();
    let backup_path = get_backup_path(jar_path);
    let backup_str = backup_path.to_string_lossy();
    let marker_path = get_marker_path(jar_path);
    let marker_str = marker_path.to_string_lossy();
    let checksum_path = get_checksum_path(jar_path);
    let checksum_str = checksum_path.to_string_lossy();

    let script_content = format!(r#"#!/bin/bash
set -e

JAR_PATH="{jar_str}"
BACKUP_PATH="{backup_str}"
MARKER_PATH="{marker_str}"
CHECKSUM_PATH="{checksum_str}"

# Check if already patched
if [ -f "$MARKER_PATH" ]; then
    echo "Already patched"
    exit 0
fi

# Create backup if it doesn't exist
if [ ! -f "$BACKUP_PATH" ]; then
    cp "$JAR_PATH" "$BACKUP_PATH"
    sha256sum "$JAR_PATH" | cut -d' ' -f1 > "$CHECKSUM_PATH"
fi

# For now, just create the marker file
# TODO: Implement actual JAR modification
touch "$MARKER_PATH"
echo "Patched successfully"
"#);

    let mut file = File::create(&script_path)?;
    file.write_all(script_content.as_bytes())?;

    // Make executable
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(&script_path)?.permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&script_path, perms)?;
    }

    Ok(script_path)
}

/// Restore with elevation if needed
pub fn restore_jar_elevated(jar_path: &Path) -> Result<(), PatchError> {
    log_event(&format!(
        "patcher: restore_jar_elevated start -> {}",
        jar_path.to_string_lossy()
    ));
    // First try without elevation
    match restore_from_manager_backup(jar_path) {
        Ok(()) => {
            log_event("patcher: restore ok");
            Ok(())
        }
        Err(PatchError::Io(ref e)) if e.kind() == io::ErrorKind::PermissionDenied => {
            // Try with pkexec
            if has_pkexec() {
                log_event("patcher: restore needs elevation");
                let script = create_restore_manager_script(jar_path)?;
                let script_str = path_to_str(&script)?;
                let result = run_with_pkexec("bash", &[script_str]);
                let _ = fs::remove_file(&script);
                result
            } else {
                log_event("patcher: restore failed (no pkexec)");
                Err(PatchError::PermissionDenied)
            }
        }
        Err(e) => Err(e),
    }
}

fn create_restore_manager_script(jar_path: &Path) -> Result<PathBuf, PatchError> {
    let backup_path = find_latest_manager_backup(jar_path)?;
    let checksum_path = backup_path.with_extension("jar.sha256");
    let marker_path = get_marker_path(jar_path);

    // Sanitize all paths for shell script
    let jar_str = sanitize_shell_arg(&jar_path.to_string_lossy())?;
    let backup_str = sanitize_shell_arg(&backup_path.to_string_lossy())?;
    let checksum_str = sanitize_shell_arg(&checksum_path.to_string_lossy())?;
    let marker_str = sanitize_shell_arg(&marker_path.to_string_lossy())?;

    let script_content = format!(r#"#!/bin/bash
set -e

JAR_PATH='{jar_str}'
BACKUP_PATH='{backup_str}'
CHECKSUM_PATH='{checksum_str}'
MARKER_PATH='{marker_str}'

if [ ! -f "$BACKUP_PATH" ]; then
    echo "Backup not found"
    exit 1
fi

if [ ! -f "$CHECKSUM_PATH" ]; then
    echo "Checksum missing"
    exit 1
fi

EXPECTED=$(cat "$CHECKSUM_PATH")
ACTUAL=$(sha256sum "$BACKUP_PATH" | cut -d' ' -f1)
if [ "$EXPECTED" != "$ACTUAL" ]; then
    echo "Checksum mismatch"
    exit 1
fi

cp "$BACKUP_PATH" "$JAR_PATH"
rm -f "$MARKER_PATH"

echo "Restored successfully"
"#);

    create_secure_temp_script("restore-manager", &script_content)
}

/// Create a temporary shell script for restoring with elevated privileges
#[allow(dead_code)]
fn create_restore_script(jar_path: &Path) -> Result<PathBuf, PatchError> {
    let backup_path = get_backup_path(jar_path);
    let marker_path = get_marker_path(jar_path);
    let checksum_path = get_checksum_path(jar_path);

    // Sanitize all paths
    let jar_str = sanitize_shell_arg(&jar_path.to_string_lossy())?;
    let backup_str = sanitize_shell_arg(&backup_path.to_string_lossy())?;
    let marker_str = sanitize_shell_arg(&marker_path.to_string_lossy())?;
    let checksum_str = sanitize_shell_arg(&checksum_path.to_string_lossy())?;

    let script_content = format!(r#"#!/bin/bash
set -e

JAR_PATH='{jar_str}'
BACKUP_PATH='{backup_str}'
MARKER_PATH='{marker_str}'
CHECKSUM_PATH='{checksum_str}'

# Check if backup exists
if [ ! -f "$BACKUP_PATH" ]; then
    echo "Backup not found"
    exit 1
fi

# Verify checksum if available
if [ -f "$CHECKSUM_PATH" ]; then
    EXPECTED=$(cat "$CHECKSUM_PATH")
    ACTUAL=$(sha256sum "$BACKUP_PATH" | cut -d' ' -f1)
    if [ "$EXPECTED" != "$ACTUAL" ]; then
        echo "Checksum mismatch"
        exit 1
    fi
fi

# Restore backup
cp "$BACKUP_PATH" "$JAR_PATH"

# Remove marker
rm -f "$MARKER_PATH"

echo "Restored successfully"
"#);

    create_secure_temp_script("restore", &script_content)
}

/// Internal patch function (without elevation)
/// Kept for potential future use when we implement native bytecode patching
#[allow(dead_code)]
fn patch_jar_internal(jar_path: &Path) -> Result<(), PatchError> {
    if !jar_path.exists() {
        return Err(PatchError::JarNotFound(jar_path.to_path_buf()));
    }

    let marker_path = get_marker_path(jar_path);

    // Check if already patched
    if marker_path.exists() {
        return Err(PatchError::AlreadyPatched);
    }

    // Create backup first
    create_backup(jar_path)?;

    // Create marker file to indicate "patched" status
    // TODO: Implement actual JAR bytecode modification
    fs::write(&marker_path, "patched")?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::tempdir;

    #[test]
    fn test_calculate_checksum() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.txt");
        let mut file = fs::File::create(&file_path).unwrap();
        file.write_all(b"hello world").unwrap();

        let checksum = calculate_checksum(&file_path).unwrap();
        assert!(!checksum.is_empty());
        assert_eq!(checksum.len(), 64); // SHA256 produces 64 hex characters
    }

    #[test]
    fn test_backup_paths() {
        let jar_path = Path::new("/opt/bitwig-studio/5.2/bin/bitwig.jar");
        assert_eq!(
            get_backup_path(jar_path),
            Path::new("/opt/bitwig-studio/5.2/bin/bitwig.jar.backup")
        );
        assert_eq!(
            get_checksum_path(jar_path),
            Path::new("/opt/bitwig-studio/5.2/bin/bitwig.jar.backup.sha256")
        );
        assert_eq!(
            get_marker_path(jar_path),
            Path::new("/opt/bitwig-studio/5.2/bin/bitwig.patched")
        );
    }
}
