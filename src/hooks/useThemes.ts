import { useState, useEffect, useCallback } from "react";
import type { Theme } from "../api/types";
import * as api from "../api/bitwig";

export function useThemes(bitwigVersion: string = "5.2") {
  const [themes, setThemes] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [activeThemePath, setActiveThemePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadThemeList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const themeList = await api.listThemes(bitwigVersion);
      setThemes(themeList);
      const activePath = await api.getActiveThemePath(bitwigVersion);
      setActiveThemePath(activePath);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [bitwigVersion]);

  useEffect(() => {
    loadThemeList();
  }, [loadThemeList]);

  const loadTheme = useCallback(async (path: string) => {
    setError(null);
    try {
      const theme = await api.loadTheme(path);
      setCurrentTheme(theme);
      return theme;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    }
  }, []);

  const saveTheme = useCallback(async (theme: Theme, path: string) => {
    setError(null);
    try {
      await api.saveTheme(theme, path);
      setCurrentTheme(theme);
      await loadThemeList();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  }, [loadThemeList]);

  const createTheme = useCallback(async (name: string) => {
    setError(null);
    try {
      const theme = await api.createTheme(name, bitwigVersion);
      setCurrentTheme(theme);
      await loadThemeList();
      return theme;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    }
  }, [bitwigVersion, loadThemeList]);

  const applyTheme = useCallback(async (themePath: string): Promise<string | null> => {
    setError(null);
    try {
      const message = await api.applyTheme(themePath, bitwigVersion);
      setActiveThemePath(themePath);
      return message;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    }
  }, [bitwigVersion]);

  const updateColor = useCallback((key: string, value: string) => {
    if (!currentTheme) return;
    setCurrentTheme({
      ...currentTheme,
      colors: {
        ...currentTheme.colors,
        [key]: value,
      },
    });
  }, [currentTheme]);

  const updateMetadata = useCallback((field: keyof Theme["metadata"], value: string) => {
    if (!currentTheme) return;
    setCurrentTheme({
      ...currentTheme,
      metadata: {
        ...currentTheme.metadata,
        [field]: value,
      },
    });
  }, [currentTheme]);

  const importTheme = useCallback(async (sourcePath: string) => {
    setError(null);
    try {
      const newPath = await api.importTheme(sourcePath, bitwigVersion);
      await loadThemeList();
      return newPath;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    }
  }, [bitwigVersion, loadThemeList]);

  const exportTheme = useCallback(async (themePath: string, destPath: string) => {
    setError(null);
    try {
      await api.exportTheme(themePath, destPath);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  }, []);

  const deleteTheme = useCallback(async (themePath: string) => {
    setError(null);
    try {
      await api.deleteTheme(themePath);
      if (currentTheme?.path === themePath) {
        setCurrentTheme(null);
      }
      await loadThemeList();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  }, [currentTheme?.path, loadThemeList]);

  return {
    themes,
    currentTheme,
    activeThemePath,
    loading,
    error,
    loadTheme,
    saveTheme,
    createTheme,
    applyTheme,
    updateColor,
    updateMetadata,
    importTheme,
    exportTheme,
    deleteTheme,
    refresh: loadThemeList,
  };
}
