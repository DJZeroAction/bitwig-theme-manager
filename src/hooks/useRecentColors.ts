import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "bitwig-theme-manager-recent-colors";
const MAX_COLORS = 10;

export function useRecentColors() {
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentColors(parsed.slice(0, MAX_COLORS));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Add a color to recent colors
  const addRecentColor = useCallback((color: string) => {
    // Normalize to uppercase
    const normalized = color.toUpperCase().substring(0, 7); // Strip alpha if present

    // Validate it's a proper hex color
    if (!/^#[0-9A-F]{6}$/.test(normalized)) return;

    setRecentColors((prev) => {
      // Remove if already exists
      const filtered = prev.filter((c) => c !== normalized);
      // Add to front
      const updated = [normalized, ...filtered].slice(0, MAX_COLORS);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }

      return updated;
    });
  }, []);

  return { recentColors, addRecentColor };
}

// Create a singleton for global recent colors state
let globalRecentColors: string[] = [];
let globalListeners: Set<() => void> = new Set();

function loadFromStorage(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, MAX_COLORS);
      }
    }
  } catch {
    // Ignore
  }
  return [];
}

function saveToStorage(colors: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  } catch {
    // Ignore
  }
}

// Initialize on module load
globalRecentColors = loadFromStorage();

export function addGlobalRecentColor(color: string) {
  const normalized = color.toUpperCase().substring(0, 7);
  if (!/^#[0-9A-F]{6}$/.test(normalized)) return;

  const filtered = globalRecentColors.filter((c) => c !== normalized);
  globalRecentColors = [normalized, ...filtered].slice(0, MAX_COLORS);
  saveToStorage(globalRecentColors);

  // Notify all listeners
  globalListeners.forEach((fn) => fn());
}

export function getGlobalRecentColors(): string[] {
  return globalRecentColors;
}

export function subscribeToRecentColors(callback: () => void): () => void {
  globalListeners.add(callback);
  return () => globalListeners.delete(callback);
}
