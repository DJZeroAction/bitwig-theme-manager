use bitwig_theme_manager_lib::repository::fetcher;
use bitwig_theme_manager_lib::theme::parser;
use std::io::Read;
use zip::ZipArchive;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let runtime = tokio::runtime::Runtime::new()?;
    let themes = runtime.block_on(fetcher::fetch_repository())?;
    let mut failures = Vec::new();

    for theme in &themes {
        let result = match runtime.block_on(fetcher::find_theme_file(&theme.repo_url)) {
            Ok(Some(theme_file)) => match runtime.block_on(fetcher::download_theme_bytes(&theme_file.url)) {
                Ok(bytes) => match theme_file.kind {
                    fetcher::ThemeFileKind::Zip => match extract_theme_from_zip(&bytes) {
                        Ok(content) => parser::parse_theme_content(&content, None)
                            .map(|_| ())
                            .map_err(|e| e.to_string()),
                        Err(e) => Err(e),
                    },
                    fetcher::ThemeFileKind::Text => match String::from_utf8(bytes) {
                        Ok(content) => parser::parse_theme_content(&content, None)
                            .map(|_| ())
                            .map_err(|e| e.to_string()),
                        Err(e) => Err(format!("Invalid UTF-8: {}", e)),
                    },
                },
                Err(e) => Err(format!("Download failed: {}", e)),
            },
            Ok(None) => Err("No theme file found".to_string()),
            Err(e) => Err(format!("Lookup failed: {}", e)),
        };

        if let Err(error) = result {
            failures.push(format!("{}: {}", theme.name, error));
        } else {
            println!("OK: {}", theme.name);
        }
    }

    if failures.is_empty() {
        println!("All {} themes downloaded and parsed successfully.", themes.len());
        Ok(())
    } else {
        eprintln!("{} theme(s) failed:", failures.len());
        for failure in failures {
            eprintln!("  - {}", failure);
        }
        std::process::exit(1);
    }
}

fn extract_theme_from_zip(bytes: &[u8]) -> Result<String, String> {
    let cursor = std::io::Cursor::new(bytes);
    let mut archive = ZipArchive::new(cursor).map_err(|e| format!("Invalid zip: {}", e))?;

    let mut bte_index = None;
    let mut json_index = None;

    for i in 0..archive.len() {
        let file = archive
            .by_index(i)
            .map_err(|e| format!("Failed reading zip entry: {}", e))?;
        let name = file.name().to_ascii_lowercase();
        if name.ends_with('/') {
            continue;
        }
        if name.ends_with(".bte") {
            bte_index = Some(i);
            break;
        }
        if name.ends_with(".json") && !name.ends_with("package.json") && json_index.is_none() {
            json_index = Some(i);
        }
    }

    let index = bte_index
        .or(json_index)
        .ok_or_else(|| "No theme file found in zip".to_string())?;
    let mut file = archive
        .by_index(index)
        .map_err(|e| format!("Failed reading zip entry: {}", e))?;
    let mut content = String::new();
    file.read_to_string(&mut content)
        .map_err(|e| format!("Failed reading theme content: {}", e))?;
    Ok(content)
}
