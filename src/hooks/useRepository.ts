import { useState, useEffect, useCallback } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import type { RepositoryTheme } from "../api/types";
import * as api from "../api/bitwig";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? "Unknown error");
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

export function useRepositoryThemes() {
  const [themes, setThemes] = useState<RepositoryTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (_forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      // Themes are now bundled with the app - no network required
      const fetchedThemes = await api.fetchRepositoryThemes(false);
      // Convert preview file paths to asset protocol URLs
      const themesWithAssetUrls = fetchedThemes.map((theme) => ({
        ...theme,
        preview_url: theme.preview_url ? convertFileSrc(theme.preview_url) : undefined,
      }));
      setThemes(themesWithAssetUrls);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh(false);
  }, [refresh]);

  const installTheme = useCallback(async (theme: RepositoryTheme) => {
    try {
      const content = await api.downloadRepositoryTheme(theme.name, theme.repo_url, theme.download_url);
      return content;
    } catch (e) {
      setError(getErrorMessage(e));
      return null;
    }
  }, []);

  const installAndSaveTheme = useCallback(
    async (theme: RepositoryTheme, bitwigVersion: string) => {
      try {
        // Get theme content from bundled resources
        const content = await api.downloadRepositoryTheme(theme.name, theme.repo_url, theme.download_url);
        if (!content) {
          throw new Error("Failed to load theme content");
        }

        // Save it to the themes directory
        const savedPath = await api.saveDownloadedTheme(
          theme.name,
          content,
          bitwigVersion
        );

        return savedPath;
      } catch (e) {
        setError(getErrorMessage(e));
        return null;
      }
    },
    []
  );

  return {
    themes,
    loading,
    error,
    refresh,
    installTheme,
    installAndSaveTheme,
    // Keep old names as aliases for backwards compatibility
    downloadTheme: installTheme,
    downloadAndInstallTheme: installAndSaveTheme,
  };
}
