import { useState, useEffect, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { relaunch } from "@tauri-apps/plugin-process";
import * as api from "../api/bitwig";

export interface DownloadProgress {
  downloaded: number;
  total: number | null;
}

export interface UpdateState {
  checking: boolean;
  available: boolean;
  downloading: boolean;
  downloadProgress: DownloadProgress | null;
  readyToInstall: boolean;
  installing: boolean;
  error: string | null;
  updateInfo: api.UpdateInfo | null;
  currentVersion: string;
}

export function useUpdater(checkOnMount: boolean = false, skippedVersion: string | null = null) {
  const [state, setState] = useState<UpdateState>({
    checking: false,
    available: false,
    downloading: false,
    downloadProgress: null,
    readyToInstall: false,
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

  // Listen for download progress events
  useEffect(() => {
    const unlistenProgress = listen<DownloadProgress>("update-download-progress", (event) => {
      setState((prev) => ({
        ...prev,
        downloadProgress: event.payload,
      }));
    });

    const unlistenReady = listen("update-ready", () => {
      setState((prev) => ({
        ...prev,
        downloading: false,
        readyToInstall: true,
      }));
    });

    return () => {
      unlistenProgress.then((unlisten) => unlisten());
      unlistenReady.then((unlisten) => unlisten());
    };
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

  // Download the update
  const downloadUpdate = useCallback(async () => {
    if (!state.updateInfo) {
      setState((prev) => ({
        ...prev,
        error: "No update available to download",
      }));
      return false;
    }

    setState((prev) => ({
      ...prev,
      downloading: true,
      downloadProgress: { downloaded: 0, total: null },
      error: null
    }));

    try {
      await api.installUpdate();
      // The readyToInstall state will be set by the event listener
      return true;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setState((prev) => ({
        ...prev,
        downloading: false,
        downloadProgress: null,
        error: errorMessage,
      }));
      return false;
    }
  }, [state.updateInfo]);

  // Restart the app to apply the update
  const restartApp = useCallback(async () => {
    setState((prev) => ({ ...prev, installing: true }));
    try {
      await relaunch();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setState((prev) => ({
        ...prev,
        installing: false,
        error: errorMessage,
      }));
    }
  }, []);

  // Legacy install function (download + restart in one step)
  const installUpdate = useCallback(async () => {
    const success = await downloadUpdate();
    // The app will restart automatically after the update is ready
    return success;
  }, [downloadUpdate]);

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
    downloadUpdate,
    installUpdate,
    restartApp,
    dismissUpdate,
  };
}
