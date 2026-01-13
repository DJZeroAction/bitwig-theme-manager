import { useState, useEffect, useCallback, useRef } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import * as api from "../api/bitwig";

export interface UseWatcherOptions {
  onThemeChange?: (changedFiles: string[]) => void;
  autoStart?: boolean;
  watchPath?: string;
}

export function useWatcher(options: UseWatcherOptions = {}) {
  const { onThemeChange, autoStart = false, watchPath } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const unlistenRef = useRef<UnlistenFn | null>(null);
  const callbackRef = useRef(onThemeChange);

  // Keep callback ref up to date
  callbackRef.current = onThemeChange;

  // Set up event listener
  useEffect(() => {
    const setupListener = async () => {
      if (unlistenRef.current) {
        await unlistenRef.current();
      }

      unlistenRef.current = await listen<api.ThemeChangeEvent>(
        "theme-changed",
        (event) => {
          if (callbackRef.current) {
            callbackRef.current(event.payload.changed_files);
          }
        }
      );
    };

    setupListener();

    return () => {
      if (unlistenRef.current) {
        unlistenRef.current();
      }
    };
  }, []);

  // Refresh status
  const refreshStatus = useCallback(async () => {
    try {
      const status = await api.getWatcherStatus();
      setIsRunning(status.is_running);
      setCurrentPath(status.watched_path);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  // Start watching
  const start = useCallback(async (path: string) => {
    setError(null);
    try {
      await api.startWatching(path);
      setIsRunning(true);
      setCurrentPath(path);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  }, []);

  // Stop watching
  const stop = useCallback(async () => {
    setError(null);
    try {
      await api.stopWatching();
      setIsRunning(false);
      setCurrentPath(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  }, []);

  // Auto-start if enabled and path provided
  useEffect(() => {
    if (autoStart && watchPath && !isRunning) {
      start(watchPath);
    }

    return () => {
      // Don't auto-stop on unmount - let the watcher continue
    };
  }, [autoStart, watchPath, start, isRunning]);

  // Get initial status
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    isRunning,
    currentPath,
    error,
    start,
    stop,
    refreshStatus,
  };
}
