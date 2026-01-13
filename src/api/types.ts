export type InstallationType = "System" | "Flatpak" | "UserLocal" | "Unknown";

export interface BitwigInstallation {
  path: string;
  version: string;
  jar_path: string;
  is_patched: boolean;
  installation_type: InstallationType;
  needs_sudo: boolean;
}

export interface ThemeMetadata {
  name?: string;
  author?: string;
  description?: string;
  version?: string;
}

export interface Theme {
  metadata: ThemeMetadata;
  colors: Record<string, string>;
  path?: string;
}

export interface ThemeColor {
  key: string;
  value: string;
  group?: string;
}

export interface AppError {
  message: string;
}

export interface RepositoryTheme {
  name: string;
  author: string;
  author_url?: string;
  repo_url: string;
  preview_url?: string;
  description?: string;
  download_url?: string;
}
