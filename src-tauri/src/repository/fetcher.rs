use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum FetchError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("JSON parse error: {0}")]
    Json(#[from] serde_json::Error),
}

/// A theme entry from the repository
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepositoryTheme {
    pub name: String,
    pub author: String,
    pub author_url: Option<String>,
    pub repo_url: String,
    pub preview_url: Option<String>,
    pub description: Option<String>,
    /// Direct download URL (for bundled themes)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub download_url: Option<String>,
}
