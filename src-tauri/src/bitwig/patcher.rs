use sha2::{Digest, Sha256};
use std::fs;
use std::io::{self, Read};
use std::path::{Path, PathBuf};
use thiserror::Error;

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

    #[error("Checksum mismatch")]
    ChecksumMismatch,
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
