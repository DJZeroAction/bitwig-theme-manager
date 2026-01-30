import { useState, useEffect, useCallback } from "react";
import type { Theme } from "../api/types";
import * as api from "../api/bitwig";
import {
  getDefaultValues,
  type BitwigVersion,
} from "../data/properties";
import { TEMPLATES } from "../data/properties/templates";

// Helper to get Bitwig major version ("5" or "6") from full version string
function getMajorVersion(version: string): BitwigVersion {
  return version.startsWith("6") ? "6" : "5";
}

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

  // Preview a theme without saving - applies current in-memory theme state
  const previewTheme = useCallback(async (theme: Theme): Promise<string | null> => {
    setError(null);
    try {
      // Serialize theme to BTE format
      let content = "";

      // Add metadata comments
      if (theme.metadata.name) {
        content += `/ Theme: ${theme.metadata.name}\n`;
      }
      if (theme.metadata.author) {
        content += `/ Author: ${theme.metadata.author}\n`;
      }
      if (theme.metadata.description) {
        content += `/ Description: ${theme.metadata.description}\n`;
      }
      if (theme.metadata.version) {
        content += `/ Version: ${theme.metadata.version}\n`;
      }
      if (content) {
        content += "\n";
      }

      // Sort colors by key and add them
      const sortedKeys = Object.keys(theme.colors).sort();
      for (const key of sortedKeys) {
        content += `${key}: ${theme.colors[key]}\n`;
      }

      const message = await api.previewTheme(content, bitwigVersion);
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

  // Update multiple colors at once (for group/bulk updates)
  const updateColors = useCallback((updates: Record<string, string>) => {
    if (!currentTheme) return;
    setCurrentTheme({
      ...currentTheme,
      colors: {
        ...currentTheme.colors,
        ...updates,
      },
    });
  }, [currentTheme]);

  // Create a theme from a template
  const createThemeFromTemplate = useCallback(async (name: string, templateId: string) => {
    setError(null);
    try {
      const template = TEMPLATES.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Create base theme first
      const theme = await api.createTheme(name, bitwigVersion);

      // Merge template colors into the theme
      const updatedTheme: Theme = {
        ...theme,
        colors: {
          ...theme.colors,
          ...template.colors,
        },
      };

      // Save the updated theme
      if (theme.path) {
        await api.saveTheme(updatedTheme, theme.path);
      }

      setCurrentTheme(updatedTheme);
      await loadThemeList();
      return updatedTheme;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    }
  }, [bitwigVersion, loadThemeList]);

  // Populate a theme with all properties for the current version
  // This ensures new themes have all 265 properties visible
  const populateTheme = useCallback((theme: Theme): Theme => {
    const majorVersion = getMajorVersion(bitwigVersion);
    const defaults = getDefaultValues(majorVersion);

    const populatedColors = { ...defaults };

    // Override defaults with existing theme values
    for (const [key, value] of Object.entries(theme.colors)) {
      if (key in populatedColors) {
        populatedColors[key] = value;
      }
    }

    return {
      ...theme,
      colors: populatedColors,
    };
  }, [bitwigVersion]);

  // Get the major version for use in components
  const majorVersion = getMajorVersion(bitwigVersion);

  return {
    themes,
    currentTheme,
    activeThemePath,
    loading,
    error,
    majorVersion,
    loadTheme,
    saveTheme,
    createTheme,
    createThemeFromTemplate,
    applyTheme,
    previewTheme,
    updateColor,
    updateColors,
    updateMetadata,
    importTheme,
    exportTheme,
    deleteTheme,
    populateTheme,
    refresh: loadThemeList,
  };
}
