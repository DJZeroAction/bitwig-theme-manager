use regex::{Regex, RegexBuilder};
use reqwest::Url;
use serde::{Deserialize, Serialize};
use thiserror::Error;

const AWESOME_THEMES_URL: &str =
    "https://raw.githubusercontent.com/Berikai/awesome-bitwig-themes/main/README.md";

const COMMUNITY_THEMES_BASE: &str =
    "https://raw.githubusercontent.com/DJZeroAction/bitwig-theme-manager/main/community-themes";

const COMMUNITY_THEMES_INDEX: &str =
    "https://raw.githubusercontent.com/DJZeroAction/bitwig-theme-manager/main/community-themes/index.json";

#[derive(Error, Debug)]
pub enum FetchError {
    #[error("HTTP request failed: {0}")]
    Http(#[from] reqwest::Error),

    #[error("Failed to parse repository: {0}")]
    Parse(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("JSON parse error: {0}")]
    Json(#[from] serde_json::Error),
}

/// A theme entry from the awesome-bitwig-themes repository
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepositoryTheme {
    pub name: String,
    pub author: String,
    pub author_url: Option<String>,
    pub repo_url: String,
    pub preview_url: Option<String>,
    pub description: Option<String>,
    /// Direct download URL (for community themes that don't need repo scraping)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub download_url: Option<String>,
}

/// A theme entry from the community-themes index.json
#[derive(Debug, Clone, Deserialize)]
struct CommunityThemeEntry {
    #[allow(dead_code)]
    id: String,
    name: String,
    author: String,
    file: String,
    preview: Option<String>,
    description: Option<String>,
}

/// The community themes index file structure
#[derive(Debug, Clone, Deserialize)]
struct CommunityThemesIndex {
    #[allow(dead_code)]
    version: u32,
    themes: Vec<CommunityThemeEntry>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ThemeFileKind {
    Text,
    Zip,
}

#[derive(Debug, Clone)]
pub struct ThemeFile {
    pub url: String,
    pub kind: ThemeFileKind,
}

/// Convert GitHub/Codeberg blob URLs to raw URLs for direct file access
fn convert_to_raw_url(url: &str) -> String {
    // Convert https://github.com/user/repo/blob/branch/path
    // to https://raw.githubusercontent.com/user/repo/branch/path
    if url.contains("github.com") && url.contains("/blob/") {
        url.replace("github.com", "raw.githubusercontent.com")
            .replace("/blob/", "/")
    } else if url.contains("github.com") && !url.contains("raw.githubusercontent") && !url.contains("camo.githubusercontent") {
        // Add ?raw=true for other github URLs
        if url.contains('?') {
            format!("{}&raw=true", url)
        } else {
            format!("{}?raw=true", url)
        }
    } else if url.contains("codeberg.org") && url.contains("/src/branch/") {
        // Convert https://codeberg.org/user/repo/src/branch/main/file
        // to https://codeberg.org/user/repo/raw/branch/main/file
        url.replace("/src/branch/", "/raw/branch/")
    } else {
        url.to_string()
    }
}

pub fn normalize_preview_url(url: &str) -> String {
    let mut normalized = convert_to_raw_url(url);
    if normalized.contains("codeberg.org") && normalized.contains("/media/") {
        normalized = normalized.replace("/media/", "/raw/");
    }
    normalized
}

#[derive(Debug, Clone)]
struct ReadmeCandidate {
    url: String,
    base_url: Option<String>,
    accept_raw: bool,
}

fn repo_owner_name(repo_url: &str) -> Option<(String, String)> {
    let url = Url::parse(repo_url).ok()?;
    let mut segments = url.path_segments()?;
    let owner = segments.next()?.to_string();
    let repo = segments.next()?.trim_end_matches(".git").to_string();
    if owner.is_empty() || repo.is_empty() {
        return None;
    }
    Some((owner, repo))
}

fn readme_candidates(repo_url: &str) -> Vec<ReadmeCandidate> {
    let mut candidates = Vec::new();
    let url = match Url::parse(repo_url) {
        Ok(url) => url,
        Err(_) => return candidates,
    };
    let Some((owner, repo)) = repo_owner_name(repo_url) else {
        return candidates;
    };

    if matches!(url.domain(), Some("github.com")) {
        let main_base = format!("https://raw.githubusercontent.com/{}/{}/main/", owner, repo);
        let master_base = format!("https://raw.githubusercontent.com/{}/{}/master/", owner, repo);
        for base in [main_base, master_base] {
            candidates.push(ReadmeCandidate {
                url: format!("{}README.md", base),
                base_url: Some(base.clone()),
                accept_raw: false,
            });
            candidates.push(ReadmeCandidate {
                url: format!("{}readme.md", base),
                base_url: Some(base.clone()),
                accept_raw: false,
            });
            candidates.push(ReadmeCandidate {
                url: format!("{}README.MD", base),
                base_url: Some(base.clone()),
                accept_raw: false,
            });
        }
        candidates.push(ReadmeCandidate {
            url: format!(
                "https://api.github.com/repos/{}/{}/readme",
                owner, repo
            ),
            base_url: None,
            accept_raw: true,
        });
    } else if matches!(url.domain(), Some("codeberg.org")) {
        let main_base = format!("https://codeberg.org/{}/{}/raw/branch/main/", owner, repo);
        let master_base = format!("https://codeberg.org/{}/{}/raw/branch/master/", owner, repo);
        for base in [main_base, master_base] {
            candidates.push(ReadmeCandidate {
                url: format!("{}README.md", base),
                base_url: Some(base.clone()),
                accept_raw: false,
            });
            candidates.push(ReadmeCandidate {
                url: format!("{}readme.md", base),
                base_url: Some(base.clone()),
                accept_raw: false,
            });
            candidates.push(ReadmeCandidate {
                url: format!("{}README.MD", base),
                base_url: Some(base.clone()),
                accept_raw: false,
            });
        }
    }

    candidates
}

fn resolve_url(url: &str, base_url: Option<&str>) -> String {
    if url.starts_with("http://") || url.starts_with("https://") || url.starts_with("data:") {
        return url.to_string();
    }
    if let Some(base) = base_url {
        if let Ok(base_url) = Url::parse(base) {
            if let Ok(joined) = base_url.join(url) {
                return joined.to_string();
            }
        }
    }
    url.to_string()
}

fn url_extension(url: &str) -> Option<&'static str> {
    let lower = url.to_ascii_lowercase();
    let clean = lower
        .split(['?', '#'])
        .next()
        .unwrap_or(&lower);
    if clean.ends_with(".bte") {
        Some("bte")
    } else if clean.ends_with(".json")
        && !clean.ends_with("package.json")
        && !clean.ends_with("manifest.json") {
        Some("json")
    } else if clean.ends_with(".zip") {
        Some("zip")
    } else {
        None
    }
}

fn extract_preview_url(content: &str, base_url: Option<&str>) -> Option<String> {
    let preview_img_re = Regex::new(r#"<img\s+[^>]*src="([^"]+)""#).ok()?;
    let preview_md_re = Regex::new(r"!\[[^\]]*\]\(([^)]+)\)").ok()?;
    let raw_url = preview_img_re
        .captures(content)
        .and_then(|caps| caps.get(1).map(|m| m.as_str().to_string()))
        .or_else(|| {
            preview_md_re
                .captures(content)
                .and_then(|caps| caps.get(1).map(|m| m.as_str().to_string()))
        })?;
    let resolved = resolve_url(&raw_url, base_url);
    Some(normalize_preview_url(&resolved))
}

fn extract_theme_url_from_html(content: &str, base_url: Option<&str>) -> Option<String> {
    let link_re = RegexBuilder::new(r#"href="([^"]+)""#)
        .case_insensitive(true)
        .build()
        .ok()?;

    let mut bte_url = None;
    let mut json_url = None;
    let mut zip_url = None;

    for caps in link_re.captures_iter(content) {
        if let Some(m) = caps.get(1) {
            let raw = m.as_str();
            if let Some(ext) = url_extension(raw) {
                let resolved = resolve_url(raw, base_url);
                match ext {
                    "bte" => {
                        bte_url = Some(resolved);
                        break;
                    }
                    "json" => {
                        if json_url.is_none() {
                            json_url = Some(resolved);
                        }
                    }
                    "zip" => {
                        if zip_url.is_none() {
                            zip_url = Some(resolved);
                        }
                    }
                    _ => {}
                }
            }
        }
    }

    bte_url.or(json_url).or(zip_url).map(|url| convert_to_raw_url(&url))
}

fn extract_theme_url(content: &str, base_url: Option<&str>) -> Option<String> {
    // Try .bte files first
    let md_link_re = RegexBuilder::new(r"\(([^)]+\.bte)\)")
        .case_insensitive(true)
        .build()
        .ok()?;
    let html_link_re = RegexBuilder::new(r#"href="([^"]+\.bte)""#)
        .case_insensitive(true)
        .build()
        .ok()?;

    if let Some(raw_url) = md_link_re
        .captures(content)
        .and_then(|caps| caps.get(1).map(|m| m.as_str().to_string()))
        .or_else(|| {
            html_link_re
                .captures(content)
                .and_then(|caps| caps.get(1).map(|m| m.as_str().to_string()))
        })
    {
        let resolved = resolve_url(&raw_url, base_url);
        return Some(convert_to_raw_url(&resolved));
    }

    // Fall back to .json files (excluding package.json)
    let md_json_re = RegexBuilder::new(r"\(([^)]+\.json)\)")
        .case_insensitive(true)
        .build()
        .ok()?;
    let html_json_re = RegexBuilder::new(r#"href="([^"]+\.json)""#)
        .case_insensitive(true)
        .build()
        .ok()?;

    for caps in md_json_re.captures_iter(content) {
        if let Some(m) = caps.get(1) {
            let url = m.as_str();
            if !url.contains("package.json") && !url.contains("manifest.json") {
                let resolved = resolve_url(url, base_url);
                return Some(convert_to_raw_url(&resolved));
            }
        }
    }

    for caps in html_json_re.captures_iter(content) {
        if let Some(m) = caps.get(1) {
            let url = m.as_str();
            if !url.contains("package.json") && !url.contains("manifest.json") {
                let resolved = resolve_url(url, base_url);
                return Some(convert_to_raw_url(&resolved));
            }
        }
    }

    // Fall back to .zip files (release assets or bundled themes)
    let md_zip_re = RegexBuilder::new(r"\(([^)]+\.zip)\)")
        .case_insensitive(true)
        .build()
        .ok()?;
    let html_zip_re = RegexBuilder::new(r#"href="([^"]+\.zip)""#)
        .case_insensitive(true)
        .build()
        .ok()?;

    if let Some(raw_url) = md_zip_re
        .captures(content)
        .and_then(|caps| caps.get(1).map(|m| m.as_str().to_string()))
        .or_else(|| {
            html_zip_re
                .captures(content)
                .and_then(|caps| caps.get(1).map(|m| m.as_str().to_string()))
        })
    {
        let resolved = resolve_url(&raw_url, base_url);
        return Some(convert_to_raw_url(&resolved));
    }

    None
}

/// Parse the awesome-bitwig-themes README to extract theme entries
pub fn parse_readme(content: &str) -> Vec<RepositoryTheme> {
    let mut themes = Vec::new();

    // Pattern to match theme entries like:
    // ## [Theme Name](repo_url) by [@author](author_url)
    // <img src="preview_url" .../>

    // Regex for theme header: ## [Name](url) by [@author](author_url)
    let theme_re = Regex::new(r"##\s*\[([^\]]+)\]\(([^)]+)\)\s*by\s*\[@([^\]]+)\]\(([^)]+)\)").unwrap();

    // Also try simpler format: ### [Name](url) then by [@author](url) on next line
    let theme_re_simple = Regex::new(r"###?\s*\[([^\]]+)\]\(([^)]+)\)").unwrap();
    let author_re = Regex::new(r"by\s*\[@([^\]]+)\]\(([^)]+)\)").unwrap();

    // Preview image: <img src="url" or ![alt](url)
    let preview_img_re = Regex::new(r#"<img\s+src="([^"]+)""#).unwrap();
    let preview_md_re = Regex::new(r"!\[[^\]]*\]\(([^)]+)\)").unwrap();

    // Split by ## headers (theme sections)
    let sections: Vec<&str> = content.split("\n## ").collect();

    for section in sections.iter().skip(1) {
        let full_section = format!("## {}", section);

        // Try the combined format first: ## [Name](url) by [@author](url)
        if let Some(caps) = theme_re.captures(&full_section) {
            let name = caps.get(1).map(|m| m.as_str().to_string()).unwrap_or_default();
            let repo_url = caps.get(2).map(|m| m.as_str().to_string()).unwrap_or_default();
            let author = caps.get(3).map(|m| m.as_str().to_string()).unwrap_or_default();
            let author_url = caps.get(4).map(|m| m.as_str().to_string());

            // Extract preview image URL (try <img> first, then markdown)
            let preview_url = preview_img_re
                .captures(&full_section)
                .and_then(|caps| caps.get(1).map(|m| normalize_preview_url(m.as_str())))
                .or_else(|| {
                    preview_md_re
                        .captures(&full_section)
                        .and_then(|caps| caps.get(1).map(|m| normalize_preview_url(m.as_str())))
                });

            if !name.is_empty() && !repo_url.is_empty() {
                themes.push(RepositoryTheme {
                    name,
                    author,
                    author_url,
                    repo_url,
                    preview_url,
                    description: None,
                    download_url: None,
                });
            }
        } else if let Some(caps) = theme_re_simple.captures(&full_section) {
            // Fallback to simpler format
            let name = caps.get(1).map(|m| m.as_str().to_string()).unwrap_or_default();
            let repo_url = caps.get(2).map(|m| m.as_str().to_string()).unwrap_or_default();

            let (author, author_url) = if let Some(author_caps) = author_re.captures(&full_section) {
                (
                    author_caps.get(1).map(|m| m.as_str().to_string()).unwrap_or_default(),
                    author_caps.get(2).map(|m| m.as_str().to_string()),
                )
            } else {
                ("Unknown".to_string(), None)
            };

            let preview_url = preview_img_re
                .captures(&full_section)
                .and_then(|caps| caps.get(1).map(|m| normalize_preview_url(m.as_str())))
                .or_else(|| {
                    preview_md_re
                        .captures(&full_section)
                        .and_then(|caps| caps.get(1).map(|m| normalize_preview_url(m.as_str())))
                });

            if !name.is_empty() && !repo_url.is_empty() {
                themes.push(RepositoryTheme {
                    name,
                    author,
                    author_url,
                    repo_url,
                    preview_url,
                    description: None,
                    download_url: None,
                });
            }
        }
    }

    themes
}

/// Known working preview URLs for themes (fetched from their READMEs)
fn get_known_preview_url(theme_name: &str) -> Option<String> {
    let name = theme_name.to_lowercase();
    let url = match name.as_str() {
        "ghosty" => "https://raw.githubusercontent.com/notoyz/ghosty-theme-bitwig/main/extra/screenshots/dark.png",
        "dark mellow" => "https://raw.githubusercontent.com/dariolupo/dark-mellow_bitwig/main/Screenshots/1.6/DM_Arranger.png",
        "gruvbit" => "https://raw.githubusercontent.com/stianfan/GruvBit/main/Screenshot.png",
        "dark neon" => "https://wsrv.nl/?url=https://raw.githubusercontent.com/dariolupo/dark-neon_bitwig/main/Screenshots/Dark%20Neon%20-%20Screenshot%200%2050.png&w=800&output=jpg&q=80",
        "frost" => "https://i.imgur.com/VFly7HF.png",
        "logwig" => "https://i.imgur.com/LOrFEVk.png",
        "magnetic revival" => "https://raw.githubusercontent.com/mradziwanowski/magentic-revival-bitwig-theme/master/example.png",
        "macchiato" => "https://raw.githubusercontent.com/lenninst/Macchiato_BitwigTheme/main/macchiato.png",
        "mothwig" | "mothwog" => "https://raw.githubusercontent.com/woodmoth/mothwig-bitwig-theme/main/Prewiev.png",
        "nord" => "https://raw.githubusercontent.com/lenninst/Nord_BitwigTheme/main/img/Nord_BitwigTheme.png",
        "horizon" => "https://raw.githubusercontent.com/PatrickWulfe/horizon-bitwig-theme/main/screenshots/Screenshot%202024-09-01%20010344.png",
        "light cat" => "https://codeberg.org/themefiend/bitwig-light-cat/raw/branch/main/screenshots/arr.png",
        "cubitwig" => "https://raw.githubusercontent.com/Yucatec98/cubase-bitwig-theme/main/images/Cubitwig.jpg",
        "lightnordish" => "https://codeberg.org/pmhn/bitwig-light-nordish/raw/branch/main/resources/light-nordish-bitwig-6-theme.png",
        "dracula" => "https://raw.githubusercontent.com/sleeplessKomodo/bitwig-dracula-theme/main/images/dracula.png",
        _ => return None,
    };
    Some(url.to_string())
}

/// Fetch the awesome-bitwig-themes repository README
pub async fn fetch_repository() -> Result<Vec<RepositoryTheme>, FetchError> {
    let client = reqwest::Client::builder()
        .user_agent("bitwig-theme-manager")
        .build()?;
    let response = client.get(AWESOME_THEMES_URL).send().await?;
    let content = response.text().await?;

    let mut themes = parse_readme(&content);

    // Fetch preview images from each theme repository README
    for theme in &mut themes {
        if let Some(preview) = fetch_preview_from_repo(&client, &theme.repo_url).await? {
            theme.preview_url = Some(normalize_preview_url(&preview));
        }
    }

    // Use known working preview URLs as a fallback (override known misses)
    for theme in &mut themes {
        if let Some(preview) = get_known_preview_url(&theme.name) {
            theme.preview_url = Some(normalize_preview_url(&preview));
        }
    }

    Ok(themes)
}

/// Fetch community themes from this repo's community-themes directory
pub async fn fetch_community_themes() -> Result<Vec<RepositoryTheme>, FetchError> {
    let client = reqwest::Client::builder()
        .user_agent("bitwig-theme-manager")
        .build()?;

    let response = client.get(COMMUNITY_THEMES_INDEX).send().await?;

    if !response.status().is_success() {
        // Community themes are optional, return empty if not found
        return Ok(Vec::new());
    }

    let content = response.text().await?;
    let index: CommunityThemesIndex = serde_json::from_str(&content)?;

    let themes = index
        .themes
        .into_iter()
        .map(|entry| {
            let download_url = format!("{}/{}", COMMUNITY_THEMES_BASE, entry.file);
            let preview_url = entry
                .preview
                .map(|p| format!("{}/{}", COMMUNITY_THEMES_BASE, p));

            RepositoryTheme {
                name: entry.name,
                author: entry.author,
                author_url: None,
                repo_url: "https://github.com/DJZeroAction/bitwig-theme-manager/tree/main/community-themes".to_string(),
                preview_url,
                description: entry.description,
                download_url: Some(download_url),
            }
        })
        .collect();

    Ok(themes)
}

/// Fetch all themes from both awesome-bitwig-themes and community themes
pub async fn fetch_all_themes() -> Result<Vec<RepositoryTheme>, FetchError> {
    let mut themes = fetch_repository().await?;
    let community_themes = fetch_community_themes().await.unwrap_or_default();
    themes.extend(community_themes);
    Ok(themes)
}

async fn fetch_preview_from_repo(
    client: &reqwest::Client,
    repo_url: &str,
) -> Result<Option<String>, FetchError> {
    for candidate in readme_candidates(repo_url) {
        let mut request = client.get(&candidate.url);
        if candidate.accept_raw {
            request = request.header("Accept", "application/vnd.github.v3.raw");
        }
        let response = request.send().await?;
        if !response.status().is_success() {
            continue;
        }
        let content = response.text().await?;
        if let Some(preview) = extract_preview_url(&content, candidate.base_url.as_deref()) {
            return Ok(Some(preview));
        }
    }

    Ok(None)
}

async fn fetch_theme_from_repo_readme(
    client: &reqwest::Client,
    repo_url: &str,
) -> Result<Option<ThemeFile>, FetchError> {
    for candidate in readme_candidates(repo_url) {
        let mut request = client.get(&candidate.url);
        if candidate.accept_raw {
            request = request.header("Accept", "application/vnd.github.v3.raw");
        }
        let response = request.send().await?;
        if !response.status().is_success() {
            continue;
        }
        let content = response.text().await?;
        if let Some(theme_url) = extract_theme_url(&content, candidate.base_url.as_deref()) {
            return Ok(Some(theme_file_from_url(theme_url)));
        }
    }

    Ok(None)
}

async fn fetch_theme_from_repo_html(
    client: &reqwest::Client,
    repo_url: &str,
) -> Result<Option<ThemeFile>, FetchError> {
    let response = client.get(repo_url).send().await?;
    if !response.status().is_success() {
        return Ok(None);
    }
    let content = response.text().await?;
    if let Some(theme_url) = extract_theme_url_from_html(&content, Some(repo_url)) {
        return Ok(Some(theme_file_from_url(theme_url)));
    }
    Ok(None)
}

async fn check_github_releases_html(
    client: &reqwest::Client,
    repo_url: &str,
) -> Result<Option<ThemeFile>, FetchError> {
    let (owner, repo) = match repo_owner_name(repo_url) {
        Some(parts) => parts,
        None => return Ok(None),
    };
    let base = format!("https://github.com/{}/{}/releases", owner, repo);
    let candidates = [format!("{}/latest", base), base.clone()];

    // Compile regex once before the loop
    let expanded_re = regex::Regex::new(r#"expanded_assets/([^"]+)"#).ok();

    for url in candidates {
        let response = client.get(&url).send().await?;
        if !response.status().is_success() {
            continue;
        }
        let content = response.text().await?;

        // Check for expanded_assets URL (GitHub loads assets via AJAX)
        if let Some(ref re) = expanded_re {
            if let Some(caps) = re.captures(&content) {
                if let Some(tag) = caps.get(1) {
                    let expanded_url = format!(
                        "https://github.com/{}/{}/releases/expanded_assets/{}",
                        owner, repo, tag.as_str()
                    );
                    if let Ok(resp) = client.get(&expanded_url).send().await {
                        if resp.status().is_success() {
                            if let Ok(expanded_content) = resp.text().await {
                                if let Some(theme_url) = extract_theme_url_from_html(
                                    &expanded_content,
                                    Some("https://github.com/"),
                                ) {
                                    return Ok(Some(theme_file_from_url(theme_url)));
                                }
                            }
                        }
                    }
                }
            }
        }

        if let Some(theme_url) =
            extract_theme_url_from_html(&content, Some("https://github.com/"))
        {
            return Ok(Some(theme_file_from_url(theme_url)));
        }
    }

    Ok(None)
}

/// Try to find the theme file in a GitHub repository
/// Returns the raw URL to the .bte file if found
pub async fn find_theme_file(repo_url: &str) -> Result<Option<ThemeFile>, FetchError> {
    let client = reqwest::Client::builder()
        .user_agent("bitwig-theme-manager")
        .build()?;

    let url = match Url::parse(repo_url) {
        Ok(url) => url,
        Err(_) => return Ok(None),
    };

    if !matches!(url.domain(), Some("github.com")) {
        if let Some(theme_file) = fetch_theme_from_repo_readme(&client, repo_url).await? {
            return Ok(Some(theme_file));
        }
        if let Some(theme_file) = fetch_theme_from_repo_html(&client, repo_url).await? {
            return Ok(Some(theme_file));
        }
        return Ok(None);
    }

    if let Some(theme_file) = fetch_theme_from_repo_readme(&client, repo_url).await? {
        return Ok(Some(theme_file));
    }

    if let Some(theme_file) = check_github_releases_html(&client, repo_url).await? {
        return Ok(Some(theme_file));
    }

    // Convert GitHub repo URL to API URL
    // e.g., https://github.com/user/repo -> https://api.github.com/repos/user/repo/contents
    let api_url = repo_url
        .replace("https://github.com/", "https://api.github.com/repos/")
        + "/contents";

    let response = client.get(&api_url).send().await?;

    // Handle 404 - repo doesn't exist or is private
    if response.status().as_u16() == 404 {
        return Err(FetchError::Parse(format!(
            "Repository not found or is private: {}",
            repo_url
        )));
    }

    if !response.status().is_success() {
        return Ok(None);
    }

    #[derive(Deserialize)]
    struct GitHubFile {
        name: String,
        download_url: Option<String>,
        #[serde(rename = "type")]
        file_type: String,
    }

    let files: Vec<GitHubFile> = response.json().await?;

    // Look for .bte files first, then .json files
    for file in &files {
        if file.file_type == "file" && file.name.ends_with(".bte") {
            return Ok(file.download_url.clone().map(theme_file_from_url));
        }
    }
    // Fall back to .json theme files (common format in community themes)
    for file in &files {
        if file.file_type == "file" && file.name.ends_with(".json") && !file.name.eq_ignore_ascii_case("package.json") && !file.name.eq_ignore_ascii_case("manifest.json") {
            return Ok(file.download_url.clone().map(theme_file_from_url));
        }
    }
    // Then .zip archives
    for file in &files {
        if file.file_type == "file" && file.name.ends_with(".zip") {
            return Ok(file.download_url.clone().map(theme_file_from_url));
        }
    }

    // If no .bte file in root, check common subdirectories
    let subdirs = [
        "themes",
        "theme",
        "src",
        "files",
        "extra",
        "dist",
        "download",
        "downloads",
        "release",
        "releases",
        "assets",
        "bitwig",
    ];
    for subdir in subdirs {
        let subdir_url = format!("{}/{}", api_url, subdir);
        if let Ok(response) = client.get(&subdir_url).send().await {
            if response.status().is_success() {
                if let Ok(files) = response.json::<Vec<GitHubFile>>().await {
                    // Look for .bte first
                    for file in &files {
                        if file.file_type == "file" && file.name.ends_with(".bte") {
                            return Ok(file.download_url.clone().map(theme_file_from_url));
                        }
                    }
                    // Then .json
                    for file in &files {
                        if file.file_type == "file" && file.name.ends_with(".json") && !file.name.eq_ignore_ascii_case("package.json") && !file.name.eq_ignore_ascii_case("manifest.json") {
                            return Ok(file.download_url.clone().map(theme_file_from_url));
                        }
                    }
                    // Then .zip
                    for file in &files {
                        if file.file_type == "file" && file.name.ends_with(".zip") {
                            return Ok(file.download_url.clone().map(theme_file_from_url));
                        }
                    }
                }
            }
        }
    }

    // Check GitHub releases for .bte files
    if let Some(theme_file) = check_github_releases(&client, repo_url).await? {
        return Ok(Some(theme_file));
    }

    if let Some(theme_file) = check_github_releases_html(&client, repo_url).await? {
        return Ok(Some(theme_file));
    }

    // Check all directories recursively (one level deeper)
    let response = client.get(&api_url).send().await?;
    if response.status().is_success() {
        if let Ok(files) = response.json::<Vec<GitHubFile>>().await {
            for file in files {
                if file.file_type == "dir" {
                    let dir_url = format!("{}/{}", api_url, file.name);
                    if let Ok(response) = client.get(&dir_url).send().await {
                        if response.status().is_success() {
                            if let Ok(sub_files) = response.json::<Vec<GitHubFile>>().await {
                                // Look for .bte first
                                for sub_file in &sub_files {
                                    if sub_file.file_type == "file"
                                        && sub_file.name.ends_with(".bte")
                                    {
                                        return Ok(sub_file.download_url.clone().map(theme_file_from_url));
                                    }
                                }
                                // Then .json
                                for sub_file in &sub_files {
                                    if sub_file.file_type == "file"
                                        && sub_file.name.ends_with(".json")
                                        && !sub_file.name.eq_ignore_ascii_case("package.json") && !sub_file.name.eq_ignore_ascii_case("manifest.json")
                                    {
                                        return Ok(sub_file.download_url.clone().map(theme_file_from_url));
                                    }
                                }
                                // Then .zip
                                for sub_file in &sub_files {
                                    if sub_file.file_type == "file"
                                        && sub_file.name.ends_with(".zip")
                                    {
                                        return Ok(sub_file.download_url.clone().map(theme_file_from_url));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(None)
}

/// Check GitHub releases for .bte files
async fn check_github_releases(
    client: &reqwest::Client,
    repo_url: &str,
) -> Result<Option<ThemeFile>, FetchError> {
    let releases_url = repo_url
        .replace("https://github.com/", "https://api.github.com/repos/")
        + "/releases";

    let response = client.get(&releases_url).send().await?;

    if !response.status().is_success() {
        return Ok(None);
    }

    #[derive(Deserialize)]
    struct GitHubAsset {
        name: String,
        browser_download_url: String,
    }

    #[derive(Deserialize)]
    struct GitHubRelease {
        assets: Vec<GitHubAsset>,
    }

    let releases: Vec<GitHubRelease> = match response.json().await {
        Ok(r) => r,
        Err(_) => return Ok(None),
    };

    // Check latest release first, then others - prefer .bte over .json, then .zip
    for release in &releases {
        for asset in &release.assets {
            if asset.name.ends_with(".bte") {
                return Ok(Some(theme_file_from_url(asset.browser_download_url.clone())));
            }
        }
    }
    // Fall back to .json files
    for release in &releases {
        for asset in &release.assets {
            if asset.name.ends_with(".json") && !asset.name.eq_ignore_ascii_case("package.json") && !asset.name.eq_ignore_ascii_case("manifest.json") {
                return Ok(Some(theme_file_from_url(asset.browser_download_url.clone())));
            }
        }
    }
    // Then .zip archives
    for release in releases {
        for asset in release.assets {
            if asset.name.ends_with(".zip") {
                return Ok(Some(theme_file_from_url(asset.browser_download_url)));
            }
        }
    }

    Ok(None)
}

/// Download a theme file from a URL
pub async fn download_theme_bytes(url: &str) -> Result<Vec<u8>, FetchError> {
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (X11; Linux x86_64) bitwig-theme-manager/0.1.0")
        .build()?;
    let response = client.get(url).send().await?;
    let bytes = response.bytes().await?;
    Ok(bytes.to_vec())
}

fn theme_file_from_url(url: String) -> ThemeFile {
    let kind = if url.to_ascii_lowercase().ends_with(".zip") {
        ThemeFileKind::Zip
    } else {
        ThemeFileKind::Text
    };
    ThemeFile { url, kind }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_readme() {
        let content = r#"
# Awesome Bitwig Themes

Some intro text...

## [Ghosty](https://github.com/notoyz/ghosty-bitwig) by [@notoyz](https://github.com/notoyz)
<img src="https://example.com/preview.png" alt="Ghosty" width="768"/>

## [Dark Mellow](https://github.com/dariolupo/dark-mellow) by [@dariolupo](https://github.com/dariolupo)
<img src="https://example.com/dark-mellow.png" alt="Dark Mellow" width="768"/>
"#;

        let themes = parse_readme(content);

        assert_eq!(themes.len(), 2);
        assert_eq!(themes[0].name, "Ghosty");
        assert_eq!(themes[0].author, "notoyz");
        assert_eq!(themes[0].repo_url, "https://github.com/notoyz/ghosty-bitwig");
        assert_eq!(
            themes[0].preview_url,
            Some("https://example.com/preview.png".to_string())
        );

        assert_eq!(themes[1].name, "Dark Mellow");
        assert_eq!(themes[1].author, "dariolupo");
    }
}
