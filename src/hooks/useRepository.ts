import { useState, useEffect, useCallback } from "react";
import type { RepositoryTheme } from "../api/types";
import * as api from "../api/bitwig";

const normalizePreviewUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (url.includes("github.com") && url.includes("/blob/")) {
    return url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
  }
  if (url.includes("codeberg.org") && url.includes("/media/")) {
    return url.replace("/media/", "/raw/");
  }
  if (url.includes("github.com") && !url.includes("raw.githubusercontent") && !url.includes("camo.githubusercontent")) {
    return url.includes("?") ? `${url}&raw=true` : `${url}?raw=true`;
  }
  return url;
};

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

  const refresh = useCallback(async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedThemes = await api.fetchRepositoryThemes(forceRefresh);
      setThemes(
        fetchedThemes.map((theme) => ({
          ...theme,
          preview_url: normalizePreviewUrl(theme.preview_url),
        }))
      );
    } catch (e) {
      setError(getErrorMessage(e));
      // Try to load from cache on error
      try {
        const cachedThemes = await api.getCachedRepositoryThemes();
        if (cachedThemes.length > 0) {
          setThemes(
            cachedThemes.map((theme) => ({
              ...theme,
              preview_url: normalizePreviewUrl(theme.preview_url),
            }))
          );
        }
      } catch {
        // Ignore cache errors
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh(false);
  }, [refresh]);

  const downloadTheme = useCallback(async (theme: RepositoryTheme) => {
    try {
      const content = await api.downloadRepositoryTheme(theme.name, theme.repo_url);
      return content;
    } catch (e) {
      setError(getErrorMessage(e));
      return null;
    }
  }, []);

  const downloadAndInstallTheme = useCallback(
    async (theme: RepositoryTheme, bitwigVersion: string) => {
      try {
        // First download the theme content
        const content = await api.downloadRepositoryTheme(theme.name, theme.repo_url);
        if (!content) {
          throw new Error("Failed to download theme content");
        }

        // Then save it to the themes directory
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
    downloadTheme,
    downloadAndInstallTheme,
  };
}
