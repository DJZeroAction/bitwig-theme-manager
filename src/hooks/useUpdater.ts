import { useState, useEffect, useCallback } from "react";
import * as api from "../api/bitwig";

export interface UpdateState {
  checking: boolean;
  available: boolean;
  installing: boolean;
  error: string | null;
  updateInfo: api.UpdateInfo | null;
  currentVersion: string;
}

export function useUpdater(checkOnMount: boolean = false, skippedVersion: string | null = null) {
  const [state, setState] = useState<UpdateState>({
    checking: false,
    available: false,
    installing: false,
    error: null,
    updateInfo: null,
    currentVersion: "0.0.0",
  });

  // Load current version on mount
  useEffect(() => {
    api.getAppVersion().then((version) => {
      setState((prev) => ({ ...prev, currentVersion: version }));
    });
  }, []);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    setState((prev) => ({ ...prev, checking: true, error: null }));

    try {
      const updateInfo = await api.checkForUpdates();

      if (updateInfo) {
        // Check if this version should be skipped
        if (skippedVersion && updateInfo.version === skippedVersion) {
          setState((prev) => ({
            ...prev,
            checking: false,
            available: false,
            updateInfo: null,
          }));
          return null;
        }

        setState((prev) => ({
          ...prev,
          checking: false,
          available: true,
          updateInfo,
        }));
        return updateInfo;
      } else {
        setState((prev) => ({
          ...prev,
          checking: false,
          available: false,
          updateInfo: null,
        }));
        return null;
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setState((prev) => ({
        ...prev,
        checking: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [skippedVersion]);

  // Install the update
  const installUpdate = useCallback(async () => {
    if (!state.updateInfo) {
      setState((prev) => ({
        ...prev,
        error: "No update available to install",
      }));
      return false;
    }

    setState((prev) => ({ ...prev, installing: true, error: null }));

    try {
      await api.installUpdate();
      setState((prev) => ({
        ...prev,
        installing: false,
      }));
      return true;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setState((prev) => ({
        ...prev,
        installing: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [state.updateInfo]);

  // Dismiss the update notification
  const dismissUpdate = useCallback(() => {
    setState((prev) => ({
      ...prev,
      available: false,
      updateInfo: null,
    }));
  }, []);

  // Check for updates on mount if enabled
  useEffect(() => {
    if (checkOnMount) {
      checkForUpdates();
    }
  }, [checkOnMount, checkForUpdates]);

  return {
    ...state,
    checkForUpdates,
    installUpdate,
    dismissUpdate,
  };
}
