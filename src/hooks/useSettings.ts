import { useState, useEffect, useCallback } from "react";
import * as api from "../api/bitwig";

export function useSettings() {
  const [settings, setSettings] = useState<api.Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const load = async () => {
      try {
        const loaded = await api.loadSettings();
        setSettings(loaded);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Update a single setting
  const updateSetting = useCallback(
    async <K extends keyof api.Settings>(key: K, value: api.Settings[K]) => {
      if (!settings) return;

      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // Save immediately
      setSaving(true);
      try {
        await api.saveSettings(newSettings);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        // Revert on error
        setSettings(settings);
      } finally {
        setSaving(false);
      }
    },
    [settings]
  );

  // Update multiple settings at once
  const updateSettings = useCallback(
    async (updates: Partial<api.Settings>) => {
      if (!settings) return;

      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      setSaving(true);
      try {
        await api.saveSettings(newSettings);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        // Revert on error
        setSettings(settings);
      } finally {
        setSaving(false);
      }
    },
    [settings]
  );

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    const defaults: api.Settings = {
      check_updates_on_startup: true,
      auto_refresh_repository: true,
      watch_theme_directory: true,
      selected_bitwig_version: null,
      custom_theme_directory: null,
      cache_duration_hours: 1,
      show_preview_images: true,
      last_view: "browse",
    };

    setSettings(defaults);
    setSaving(true);
    try {
      await api.saveSettings(defaults);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    settings,
    loading,
    error,
    saving,
    updateSetting,
    updateSettings,
    resetToDefaults,
  };
}
