export interface BitwigInstallation {
  path: string;
  version: string;
  jar_path: string;
  is_patched: boolean;
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
