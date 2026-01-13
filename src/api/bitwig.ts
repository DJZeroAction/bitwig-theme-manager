import { invoke } from "@tauri-apps/api/core";
import type { BitwigInstallation, Theme, RepositoryTheme } from "./types";

export async function detectBitwigInstallations(): Promise<BitwigInstallation[]> {
  return invoke<BitwigInstallation[]>("detect_bitwig_installations");
}

export async function validateBitwigPath(path: string): Promise<BitwigInstallation | null> {
  return invoke<BitwigInstallation | null>("validate_bitwig_path", { path });
}

export async function getPatchStatus(jarPath: string): Promise<boolean> {
  return invoke<boolean>("get_patch_status", { jarPath });
}

export async function getLatestBitwigVersion(): Promise<string> {
  return invoke<string>("get_latest_bitwig_version");
}

export async function patchBitwig(jarPath: string): Promise<void> {
  return invoke<void>("patch_bitwig", { jarPath });
}

export async function restoreBitwig(jarPath: string): Promise<void> {
  return invoke<void>("restore_bitwig", { jarPath });
}

export async function hasBackup(jarPath: string): Promise<boolean> {
  return invoke<boolean>("has_backup", { jarPath });
}

export async function hasJava(): Promise<boolean> {
  return invoke<boolean>("has_java");
}

export async function ensurePatcherAvailable(): Promise<string> {
  return invoke<string>("ensure_patcher_available");
}


export async function getThemeDirectory(bitwigVersion: string): Promise<string | null> {
  return invoke<string | null>("get_theme_directory", { bitwigVersion });
}

export async function listThemes(bitwigVersion: string): Promise<string[]> {
  return invoke<string[]>("list_themes", { bitwigVersion });
}

export async function loadTheme(path: string): Promise<Theme> {
  return invoke<Theme>("load_theme", { path });
}

export async function saveTheme(theme: Theme, path: string): Promise<void> {
  return invoke<void>("save_theme", { theme, path });
}

export async function getActiveThemePath(bitwigVersion: string): Promise<string | null> {
  return invoke<string | null>("get_active_theme_path", { bitwigVersion });
}

export async function applyTheme(themePath: string, bitwigVersion: string): Promise<string> {
  return invoke<string>("apply_theme", { themePath, bitwigVersion });
}

export async function createTheme(name: string, bitwigVersion: string): Promise<Theme> {
  return invoke<Theme>("create_theme", { name, bitwigVersion });
}

export async function importTheme(sourcePath: string, bitwigVersion: string): Promise<string> {
  return invoke<string>("import_theme", { sourcePath, bitwigVersion });
}

export async function exportTheme(themePath: string, destPath: string): Promise<void> {
  return invoke<void>("export_theme", { themePath, destPath });
}

export async function deleteTheme(themePath: string): Promise<void> {
  return invoke<void>("delete_theme", { themePath });
}

export async function saveDownloadedTheme(
  themeName: string,
  content: string,
  bitwigVersion: string
): Promise<string> {
  return invoke<string>("save_downloaded_theme", { themeName, content, bitwigVersion });
}

// Repository API

export async function fetchRepositoryThemes(forceRefresh: boolean = false): Promise<RepositoryTheme[]> {
  return invoke<RepositoryTheme[]>("fetch_repository_themes", { forceRefresh });
}

export async function getCachedRepositoryThemes(): Promise<RepositoryTheme[]> {
  return invoke<RepositoryTheme[]>("get_cached_repository_themes");
}

export async function downloadRepositoryTheme(themeName: string, repoUrl: string, downloadUrl?: string): Promise<string> {
  return invoke<string>("download_repository_theme", { themeName, repoUrl, downloadUrl });
}

export async function cacheThemePreview(themeName: string, previewUrl: string): Promise<string> {
  return invoke<string>("cache_theme_preview", { themeName, previewUrl });
}

export async function getCachedPreviewPath(themeName: string): Promise<string | null> {
  return invoke<string | null>("get_cached_preview_path", { themeName });
}

export async function listCachedThemes(): Promise<string[]> {
  return invoke<string[]>("list_cached_themes");
}

export async function clearCache(): Promise<void> {
  return invoke<void>("clear_cache");
}

// File Watcher API

export interface WatcherStatus {
  is_running: boolean;
  watched_path: string | null;
}

export interface ThemeChangeEvent {
  changed_files: string[];
  watched_path: string;
}

export async function startWatching(path: string): Promise<void> {
  return invoke<void>("start_watching", { path });
}

export async function stopWatching(): Promise<void> {
  return invoke<void>("stop_watching");
}

export async function getWatcherStatus(): Promise<WatcherStatus> {
  return invoke<WatcherStatus>("get_watcher_status");
}

// Settings API

export interface Settings {
  check_updates_on_startup: boolean;
  auto_refresh_repository: boolean;
  watch_theme_directory: boolean;
  selected_bitwig_version: string | null;
  custom_theme_directory: string | null;
  cache_duration_hours: number;
  show_preview_images: boolean;
  last_view: string;
  skipped_version: string | null;
}

export async function loadSettings(): Promise<Settings> {
  return invoke<Settings>("load_settings");
}

export async function saveSettings(settings: Settings): Promise<void> {
  return invoke<void>("save_settings", { newSettings: settings });
}

export async function getSettingsPath(): Promise<string> {
  return invoke<string>("get_settings_path");
}

export async function getLogPath(): Promise<string | null> {
  return invoke<string | null>("get_log_path");
}

// Update API

export interface UpdateInfo {
  version: string;
  current_version: string;
  body: string | null;
  date: string | null;
}

export async function checkForUpdates(): Promise<UpdateInfo | null> {
  return invoke<UpdateInfo | null>("check_for_updates");
}

export async function getAppVersion(): Promise<string> {
  return invoke<string>("get_app_version");
}

export async function installUpdate(): Promise<void> {
  return invoke<void>("install_update");
}
