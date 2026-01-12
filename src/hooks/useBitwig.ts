import { useState, useEffect, useCallback } from "react";
import type { BitwigInstallation } from "../api/types";
import * as api from "../api/bitwig";

export function useBitwigInstallations() {
  const [installations, setInstallations] = useState<BitwigInstallation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detected = await api.detectBitwigInstallations();
      setInstallations(detected);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addManualPath = useCallback(async (path: string) => {
    try {
      const installation = await api.validateBitwigPath(path);
      if (installation) {
        setInstallations((prev) => {
          const exists = prev.some((i) => i.jar_path === installation.jar_path);
          if (exists) return prev;
          return [...prev, installation];
        });
        return true;
      }
      return false;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  }, []);

  const patchInstallation = useCallback(async (jarPath: string) => {
    try {
      await api.patchBitwig(jarPath);
      setInstallations((prev) =>
        prev.map((i) =>
          i.jar_path === jarPath ? { ...i, is_patched: true } : i
        )
      );
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  }, []);

  const restoreInstallation = useCallback(async (jarPath: string) => {
    try {
      await api.restoreBitwig(jarPath);
      setInstallations((prev) =>
        prev.map((i) =>
          i.jar_path === jarPath ? { ...i, is_patched: false } : i
        )
      );
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  }, []);

  return {
    installations,
    loading,
    error,
    refresh,
    addManualPath,
    patchInstallation,
    restoreInstallation,
  };
}
