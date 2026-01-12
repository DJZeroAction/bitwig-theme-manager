import { invoke } from "@tauri-apps/api/core";
import type { BitwigInstallation, Theme } from "./types";

export async function detectBitwigInstallations(): Promise<BitwigInstallation[]> {
  return invoke<BitwigInstallation[]>("detect_bitwig_installations");
}

export async function validateBitwigPath(path: string): Promise<BitwigInstallation | null> {
  return invoke<BitwigInstallation | null>("validate_bitwig_path", { path });
}

export async function getPatchStatus(jarPath: string): Promise<boolean> {
  return invoke<boolean>("get_patch_status", { jarPath });
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

export async function applyTheme(themePath: string, bitwigVersion: string): Promise<void> {
  return invoke<void>("apply_theme", { themePath, bitwigVersion });
}

export async function createTheme(name: string): Promise<Theme> {
  return invoke<Theme>("create_theme", { name });
}
