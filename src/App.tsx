import { useState, useMemo, useEffect, useCallback } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useBitwigInstallations } from "./hooks/useBitwig";
import { useRepositoryThemes } from "./hooks/useRepository";
import { useThemes } from "./hooks/useThemes";
import { useSettings } from "./hooks/useSettings";
import { useUpdater } from "./hooks/useUpdater";
import { ColorGroup } from "./components/ColorPicker";
import { UpdateNotification } from "./components/UpdateNotification";
import * as api from "./api/bitwig";
import type { BitwigInstallation, RepositoryTheme } from "./api/types";

type View = "browse" | "editor" | "patch" | "settings";

const NavIcon = ({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
      active ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"
    }`}
  >
    {children}
  </button>
);

function App() {
  const [currentView, setCurrentView] = useState<View>("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const { settings, updateSetting } = useSettings();

  // Initialize updater
  const {
    available: updateAvailable,
    updateInfo,
    downloading: updateDownloading,
    downloadProgress,
    readyToInstall,
    installing: updateInstalling,
    downloadUpdate,
    restartApp,
    dismissUpdate,
  } = useUpdater(
    settings?.check_updates_on_startup ?? false,
    settings?.skipped_version ?? null
  );

  // Handle skip version
  const handleSkipVersion = useCallback(() => {
    if (updateInfo) {
      updateSetting("skipped_version", updateInfo.version);
      dismissUpdate();
    }
  }, [updateInfo, updateSetting, dismissUpdate]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Update notification banner */}
      {(updateAvailable || readyToInstall) && updateInfo && (
        <UpdateNotification
          updateInfo={updateInfo}
          downloading={updateDownloading}
          downloadProgress={downloadProgress}
          readyToInstall={readyToInstall}
          installing={updateInstalling}
          onDownload={downloadUpdate}
          onRestart={restartApp}
          onDismiss={dismissUpdate}
          onSkipVersion={handleSkipVersion}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <nav className="w-16 bg-gray-800 flex flex-col items-center py-4 gap-2">
        <NavIcon active={currentView === "browse"} onClick={() => setCurrentView("browse")}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </NavIcon>
        <NavIcon active={currentView === "editor"} onClick={() => setCurrentView("editor")}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </NavIcon>
        <NavIcon active={currentView === "patch"} onClick={() => setCurrentView("patch")}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </NavIcon>
        <div className="flex-1" />
        <NavIcon active={currentView === "settings"} onClick={() => setCurrentView("settings")}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </NavIcon>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-gray-800 flex items-center px-6 border-b border-gray-700">
          <h1 className="text-lg font-semibold">
            {currentView === "browse" && "Theme Browser"}
            {currentView === "editor" && "Theme Editor"}
            {currentView === "patch" && "Patch Manager"}
            {currentView === "settings" && "Settings"}
          </h1>
          {currentView === "browse" && (
            <div className="ml-auto flex items-center gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search themes..."
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 w-64"
              />
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {currentView === "browse" && <BrowseView searchQuery={searchQuery} />}
          {currentView === "editor" && <EditorView />}
          {currentView === "patch" && <PatchView />}
          {currentView === "settings" && <SettingsView />}
        </div>
      </main>
      </div>
    </div>
  );
}

interface BrowseViewProps {
  searchQuery: string;
}

function BrowseView({ searchQuery }: BrowseViewProps) {
  const { themes, loading, error, refresh, downloadAndInstallTheme } = useRepositoryThemes();
  const { installations } = useBitwigInstallations();
  const { settings, updateSetting } = useSettings();
  const [selectedTheme, setSelectedTheme] = useState<RepositoryTheme | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [localThemes, setLocalThemes] = useState<string[]>([]);
  const [downloadedPath, setDownloadedPath] = useState<string | null>(null);

  // Get available Bitwig versions from installations
  const [detectedVersion, setDetectedVersion] = useState<string | null>(null);

  useEffect(() => {
    api.getLatestBitwigVersion().then(setDetectedVersion);
  }, []);

  const availableVersions = installations.length > 0
    ? [...new Set(installations.map((i) => i.version))]
    : detectedVersion ? [detectedVersion] : ["5.2"];
  const inferredVersion = installations.length > 0 ? availableVersions[0] : detectedVersion;
  const [selectedVersion, setSelectedVersion] = useState(availableVersions[0]);
  const resolvedVersion = installations.length > 0 && !availableVersions.includes(selectedVersion)
    ? availableVersions[0]
    : selectedVersion;

  // Update selected version when detected version loads
  useEffect(() => {
    if (installations.length === 0 && detectedVersion && !availableVersions.includes(selectedVersion)) {
      setSelectedVersion(detectedVersion);
    }
  }, [installations.length, detectedVersion, availableVersions, selectedVersion]);

  useEffect(() => {
    if (installations.length > 0 && !availableVersions.includes(selectedVersion)) {
      setSelectedVersion(availableVersions[0]);
    }
  }, [installations.length, availableVersions, selectedVersion]);

  useEffect(() => {
    if (settings?.selected_bitwig_version && settings.selected_bitwig_version !== selectedVersion) {
      setSelectedVersion(settings.selected_bitwig_version);
    }
  }, [settings?.selected_bitwig_version, selectedVersion]);

  useEffect(() => {
    if (!settings || !inferredVersion) return;
    if (!settings.selected_bitwig_version || !availableVersions.includes(settings.selected_bitwig_version)) {
      updateSetting("selected_bitwig_version", inferredVersion);
      setSelectedVersion(inferredVersion);
    }
  }, [settings, inferredVersion, availableVersions, updateSetting]);

  useEffect(() => {
    setFailedImages(new Set());
  }, [themes]);

  // Load local themes when version changes
  useEffect(() => {
    const loadLocalThemes = async () => {
      try {
        const themes = await api.listThemes(resolvedVersion);
        setLocalThemes(themes);
      } catch {
        setLocalThemes([]);
      }
    };
    loadLocalThemes();
  }, [resolvedVersion]);

  // Check if selected theme is already downloaded
  const getExistingThemePath = (themeName: string): string | null => {
    const safeName = themeName.replace(/[^a-zA-Z0-9\-_ ]/g, "_");
    const found = localThemes.find((path) => {
      const fileName = path.split(/[/\\]/).pop()?.replace(".bte", "") || "";
      return fileName === safeName || fileName.startsWith(safeName + "_") || fileName === themeName;
    });
    return found || null;
  };

  const selectedThemeLocalPath = selectedTheme ? (downloadedPath || getExistingThemePath(selectedTheme.name)) : null;

  const handleImageError = (themeName: string) => {
    setFailedImages(prev => new Set(prev).add(themeName));
  };

  // Filter themes based on search query
  const filteredThemes = themes.filter((theme) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      theme.name.toLowerCase().includes(query) ||
      theme.author.toLowerCase().includes(query) ||
      (theme.description?.toLowerCase().includes(query) ?? false)
    );
  });

  // Generate a color palette from the theme name for placeholder preview
  const getThemeColors = (name: string): string[] => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue1 = hash % 360;
    const hue2 = (hash * 2) % 360;
    return [
      `hsl(${hue1}, 20%, 15%)`,
      `hsl(${hue1}, 60%, 50%)`,
      `hsl(${hue2}, 50%, 45%)`,
    ];
  };

  const handleDownload = async (theme: RepositoryTheme) => {
    setDownloading(true);
    setDownloadStatus("Downloading theme...");
    try {
      const savedPath = await downloadAndInstallTheme(theme, resolvedVersion);
      if (savedPath) {
        setDownloadedPath(savedPath);
        setLocalThemes((prev) => [...prev, savedPath]);
        setDownloadStatus("Downloaded! Click Apply to activate.");
      } else {
        setDownloadStatus("Failed to download theme");
      }
    } catch (e) {
      setDownloadStatus(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleApply = async (themePath: string) => {
    setDownloading(true);
    setDownloadStatus("Applying theme...");
    try {
      const message = await api.applyTheme(themePath, resolvedVersion);
      setDownloadStatus(message);
      setTimeout(() => {
        setDownloadStatus(null);
        setSelectedTheme(null);
        setDownloadedPath(null);
      }, 5000);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      // Check if it's a structured error from Tauri
      const parsed = typeof e === 'object' && e !== null && 'message' in e ? (e as {message: string}).message : errorMsg;
      setDownloadStatus(`Error: ${parsed}`);
    } finally {
      setDownloading(false);
    }
  };

  // Reset downloaded path when selecting a different theme
  useEffect(() => {
    setDownloadedPath(null);
    setDownloadStatus(null);
  }, [selectedTheme?.name]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading themes from repository...</div>
      </div>
    );
  }

  if (error && themes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-400">{error}</div>
        <button
          onClick={() => refresh(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {error && (
          <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-3 text-yellow-200 text-sm">
            {error} - Showing cached themes
          </div>
        )}
        {searchQuery && (
          <div className="text-sm text-gray-400">
            Found {filteredThemes.length} theme{filteredThemes.length !== 1 ? "s" : ""} matching "{searchQuery}"
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredThemes.map((theme) => {
            const colors = getThemeColors(theme.name);
            return (
              <div
                key={theme.name}
                onClick={() => setSelectedTheme(theme)}
                className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer"
              >
                {/* Preview */}
                {theme.preview_url && !failedImages.has(theme.name) ? (
                  <div className="h-32 bg-gray-700 relative">
                    <img
                      src={theme.preview_url}
                      alt={`${theme.name} preview`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(theme.name)}
                    />
                  </div>
                ) : (
                  <div className="h-32 flex" style={{ background: colors[0] }}>
                    <div className="w-1/3" style={{ background: colors[1] }} />
                    <div className="w-1/3" style={{ background: colors[2] }} />
                    <div className="w-1/3" style={{ background: colors[0] }} />
                  </div>
                )}
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold">{theme.name}</h3>
                  <p className="text-sm text-gray-400">
                    by{" "}
                    {theme.author_url ? (
                      <a
                        href={theme.author_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        @{theme.author}
                      </a>
                    ) : (
                      `@${theme.author}`
                    )}
                  </p>
                  {theme.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {theme.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {filteredThemes.length === 0 && searchQuery && (
          <div className="text-center py-8 text-gray-400">
            No themes found matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Theme Detail Modal */}
      {selectedTheme && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelectedTheme(null)}
        >
          <div
            className="bg-gray-800 rounded-lg w-[90%] h-[90%] mx-4 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Preview - 80% of modal height */}
            {selectedTheme.preview_url ? (
              <div className="bg-gray-900 flex-1 min-h-0 flex items-center justify-center" style={{ height: '80%' }}>
                <img
                  src={selectedTheme.preview_url}
                  alt={`${selectedTheme.name} preview`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-1" style={{ height: '80%', background: getThemeColors(selectedTheme.name)[0] }}>
                <div className="w-1/3" style={{ background: getThemeColors(selectedTheme.name)[1] }} />
                <div className="w-1/3" style={{ background: getThemeColors(selectedTheme.name)[2] }} />
                <div className="w-1/3" style={{ background: getThemeColors(selectedTheme.name)[0] }} />
              </div>
            )}
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-2">{selectedTheme.name}</h2>
              <p className="text-gray-400 mb-4">
                by{" "}
                {selectedTheme.author_url ? (
                  <a
                    href={selectedTheme.author_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    @{selectedTheme.author}
                  </a>
                ) : (
                  `@${selectedTheme.author}`
                )}
              </p>
              {selectedTheme.description && (
                <p className="text-gray-300 mb-4">{selectedTheme.description}</p>
              )}
              {/* Version Selector */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Bitwig Version</label>
                <select
                  value={resolvedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                >
                  {availableVersions.map((v) => (
                    <option key={v} value={v}>Bitwig Studio {v}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                {selectedThemeLocalPath ? (
                  // Theme is already downloaded - show Apply button
                  <button
                    onClick={() => handleApply(selectedThemeLocalPath)}
                    disabled={downloading}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg"
                  >
                    {downloading ? "Applying..." : "Apply Theme"}
                  </button>
                ) : (
                  // Theme not downloaded - show Download button
                  <button
                    onClick={() => handleDownload(selectedTheme)}
                    disabled={downloading}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg"
                  >
                    {downloading ? "Downloading..." : "Download"}
                  </button>
                )}
                <a
                  href={selectedTheme.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
                >
                  Repo
                </a>
                <button
                  onClick={() => { setSelectedTheme(null); setDownloadedPath(null); }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Close
                </button>
              </div>
              {selectedThemeLocalPath && !downloadStatus && (
                <div className="mt-3 text-sm text-green-400 text-center">
                  Already downloaded
                </div>
              )}
              {downloadStatus && (
                <div className={`mt-3 text-sm text-center whitespace-pre-wrap ${downloadStatus.includes("applied") || downloadStatus.includes("Downloaded") ? "text-green-400" : downloadStatus.includes("Error") ? "text-red-400" : "text-gray-400"}`}>
                  {downloadStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EditorView() {
  const { settings } = useSettings();
  const { installations } = useBitwigInstallations();
  const [detectedVersion, setDetectedVersion] = useState<string | null>(null);

  useEffect(() => {
    api.getLatestBitwigVersion().then(setDetectedVersion);
  }, []);

  const availableVersions = installations.length > 0
    ? [...new Set(installations.map((i) => i.version))]
    : detectedVersion ? [detectedVersion] : ["5.2"];
  const selectedVersion = settings?.selected_bitwig_version || availableVersions[0];

  const {
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
    importTheme,
    exportTheme,
    deleteTheme,
  } = useThemes(selectedVersion);

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  const isActiveTheme = currentTheme?.path === activeThemePath;

  // Group colors by their inferred category
  const colorGroups = useMemo(() => {
    if (!currentTheme) return [];

    const groups: Record<string, Array<{ key: string; value: string; label: string }>> = {};

    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      // Infer group from key name
      let groupName = "Other";
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes("background") || lowerKey.includes("bg")) groupName = "Background";
      else if (lowerKey.includes("text") || lowerKey.includes("font")) groupName = "Text";
      else if (lowerKey.includes("accent") || lowerKey.includes("primary")) groupName = "Accent";
      else if (lowerKey.includes("border") || lowerKey.includes("outline")) groupName = "Borders";
      else if (lowerKey.includes("button") || lowerKey.includes("btn")) groupName = "Buttons";
      else if (lowerKey.includes("header") || lowerKey.includes("title")) groupName = "Headers";

      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push({
        key,
        value,
        label: key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").trim(),
      });
    });

    return Object.entries(groups).map(([name, colors]) => ({ name, colors }));
  }, [currentTheme]);

  const handleColorChange = (key: string, value: string) => {
    updateColor(key, value);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!currentTheme || !currentTheme.path) return;
    setSaving(true);
    await saveTheme(currentTheme, currentTheme.path);
    setSaving(false);
    setHasUnsavedChanges(false);
  };

  const handleApply = async () => {
    if (!currentTheme?.path) return;
    setApplying(true);
    setApplyMessage(null);
    const message = await applyTheme(currentTheme.path);
    if (message) {
      setApplyMessage(message);
      setTimeout(() => setApplyMessage(null), 5000);
    }
    setApplying(false);
  };

  const handleCreate = async () => {
    if (!newThemeName.trim()) return;
    await createTheme(newThemeName.trim());
    setNewThemeName("");
    setShowNewDialog(false);
    setHasUnsavedChanges(false);
  };

  const handleImport = async () => {
    const selected = await open({
      filters: [{ name: "Bitwig Theme", extensions: ["bte"] }],
      multiple: false,
    });
    if (selected) {
      await importTheme(selected);
    }
  };

  const handleExport = async () => {
    if (!currentTheme?.path) return;
    const themeName = currentTheme.metadata.name || "theme";
    const destPath = await save({
      defaultPath: `${themeName}.bte`,
      filters: [{ name: "Bitwig Theme", extensions: ["bte"] }],
    });
    if (destPath) {
      await exportTheme(currentTheme.path, destPath);
    }
  };

  const handleDelete = async () => {
    if (!currentTheme?.path) return;
    await deleteTheme(currentTheme.path);
    setShowDeleteDialog(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading themes...</div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Theme Selector Sidebar */}
      <div className="w-64 flex flex-col gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Themes</h3>
            <div className="flex gap-1">
              <button
                onClick={handleImport}
                className="p-1 hover:bg-gray-700 rounded"
                title="Import Theme"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
              <button
                onClick={() => setShowNewDialog(true)}
                className="p-1 hover:bg-gray-700 rounded"
                title="New Theme"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {themes.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-4">
              No themes found. Create one or download from the browser.
            </div>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {themes.map((themePath) => {
                // Handle both Unix (/) and Windows (\) path separators
                const name = themePath.split(/[/\\]/).pop()?.replace(".bte", "") || themePath;
                const isSelected = currentTheme?.path === themePath;
                const isApplied = activeThemePath === themePath;
                return (
                  <button
                    key={themePath}
                    onClick={() => loadTheme(themePath)}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between ${
                      isSelected ? "bg-purple-600" : "hover:bg-gray-700"
                    }`}
                  >
                    <span>{name}</span>
                    {isApplied && (
                      <span className="text-xs bg-green-600 px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-3 text-red-200 text-sm whitespace-pre-wrap">
            {error}
          </div>
        )}
        {applyMessage && (
          <div className="bg-green-900/50 border border-green-600 rounded-lg p-3 text-green-200 text-sm whitespace-pre-wrap">
            {applyMessage}
          </div>
        )}
      </div>

      {/* Color Editor */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {!currentTheme ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Select a theme to edit or create a new one
          </div>
        ) : (
          <>
            {/* Theme Header */}
            <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{currentTheme.metadata.name || "Untitled Theme"}</h2>
                {currentTheme.metadata.author && (
                  <p className="text-sm text-gray-400">by {currentTheme.metadata.author}</p>
                )}
              </div>
              <div className="flex gap-2">
                {hasUnsavedChanges && (
                  <span className="text-yellow-400 text-sm self-center mr-2">Unsaved changes</span>
                )}
                <button
                  onClick={handleExport}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
                  title="Export Theme"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                  title="Delete Theme"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !hasUnsavedChanges}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 rounded-lg"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying || isActiveTheme}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg"
                  title={isActiveTheme ? "This theme is already active" : "Apply theme to Bitwig"}
                >
                  {applying ? "Applying..." : isActiveTheme ? "Active" : "Apply to Bitwig"}
                </button>
              </div>
            </div>

            {/* Color Groups */}
            {colorGroups.map((group) => (
              <ColorGroup
                key={group.name}
                name={group.name}
                colors={group.colors}
                onChange={handleColorChange}
              />
            ))}
          </>
        )}
      </div>

      {/* Preview Panel */}
      <div className="w-80 bg-gray-800 rounded-lg p-4 h-fit sticky top-0">
        <h3 className="font-semibold mb-4">Live Preview</h3>
        <div
          className="rounded-lg p-4 space-y-2"
          style={{ background: currentTheme?.colors?.["background"] || "#1a1a2e" }}
        >
          <div
            className="h-8 rounded"
            style={{ background: currentTheme?.colors?.["header_background"] || "#2d2d3a" }}
          />
          <div className="flex gap-2">
            <div
              className="h-20 flex-1 rounded"
              style={{ background: currentTheme?.colors?.["accent"] || "#e94560" }}
            />
            <div
              className="h-20 flex-1 rounded"
              style={{ background: currentTheme?.colors?.["secondary_background"] || "#16213e" }}
            />
          </div>
          <div
            className="h-4 rounded w-3/4"
            style={{ background: currentTheme?.colors?.["text"] || "#ffffff" }}
          />
          <div
            className="h-4 rounded w-1/2"
            style={{ background: currentTheme?.colors?.["text_secondary"] || "#a0a0a0" }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Preview updates as you change colors
        </p>
      </div>

      {/* New Theme Dialog */}
      {showNewDialog && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowNewDialog(false)}
        >
          <div
            className="bg-gray-800 rounded-lg p-6 w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Create New Theme</h3>
            <input
              type="text"
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              placeholder="Theme name"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowNewDialog(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newThemeName.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && currentTheme && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowDeleteDialog(false)}
        >
          <div
            className="bg-gray-800 rounded-lg p-6 w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Delete Theme</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete "{currentTheme.metadata.name || "this theme"}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PatchView() {
  const { installations, loading, error, javaAvailable, backups, addManualPath, patchInstallation, restoreInstallation, refresh } = useBitwigInstallations();
  const [manualPath, setManualPath] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [patchResult, setPatchResult] = useState<{ success: boolean; message: string } | null>(null);

  const handlePatch = async (installation: BitwigInstallation) => {
    setActionLoading(installation.jar_path);
    setPatchResult(null);
    const success = await patchInstallation(installation.jar_path);
    if (success) {
      setPatchResult({ success: true, message: "Patched successfully! Restart Bitwig to apply themes." });
    } else {
      setPatchResult({ success: false, message: "Patching failed. Check if you have the required permissions." });
    }
    setActionLoading(null);
    refresh();
  };

  const handleRestore = async (installation: BitwigInstallation) => {
    setActionLoading(installation.jar_path + "-restore");
    setPatchResult(null);
    const success = await restoreInstallation(installation.jar_path);
    if (success) {
      setPatchResult({ success: true, message: "Restored to original! Restart Bitwig for changes to take effect." });
    } else {
      setPatchResult({ success: false, message: "Restore failed. Check if you have the required permissions." });
    }
    setActionLoading(null);
    refresh();
  };

  const handleResetTheme = async (version: string) => {
    setActionLoading(version + "-reset");
    setPatchResult(null);
    try {
      const message = await api.resetTheme(version);
      setPatchResult({ success: true, message });
    } catch (e) {
      setPatchResult({ success: false, message: `Reset failed: ${e instanceof Error ? e.message : String(e)}` });
    }
    setActionLoading(null);
  };

  const handleAddManual = async () => {
    if (!manualPath) return;
    const success = await addManualPath(manualPath);
    if (success) {
      setManualPath("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Java Status Banner */}
      {javaAvailable === false && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold">Java Not Found</span>
          </div>
          <p className="mt-2 text-sm text-gray-300">
            Java Runtime Environment is required for patching Bitwig. Please install Java and restart the app.
          </p>
        </div>
      )}

      {/* Patch Result Banner */}
      {patchResult && (
        <div className={`${patchResult.success ? 'bg-green-900/50 border-green-700' : 'bg-red-900/50 border-red-700'} border rounded-lg p-4`}>
          <div className={`flex items-center gap-2 ${patchResult.success ? 'text-green-400' : 'text-red-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {patchResult.success ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
            <span className="font-semibold">{patchResult.success ? 'Success' : 'Error'}</span>
          </div>
          <p className="mt-2 text-sm text-gray-300">{patchResult.message}</p>
          <button
            onClick={() => setPatchResult(null)}
            className="mt-3 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Detected Bitwig Installations</h3>
          <button
            onClick={refresh}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="text-gray-400 text-center py-8">Scanning for Bitwig installations...</div>
        )}

        {error && (
          <div className="text-red-400 text-center py-4">{error}</div>
        )}

        {!loading && installations.length === 0 && (
          <div className="text-gray-400 text-center py-8">
            No Bitwig installations detected. Add one manually below.
          </div>
        )}

        <div className="space-y-3">
          {installations.map((install) => (
            <div key={install.jar_path} className="p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    Bitwig Studio {install.version}
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      install.installation_type === "Flatpak"
                        ? "bg-blue-600"
                        : install.installation_type === "System"
                        ? "bg-orange-600"
                        : "bg-gray-600"
                    }`}>
                      {install.installation_type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 font-mono truncate">{install.path}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${install.is_patched ? "bg-green-600" : "bg-gray-600"}`}>
                  {install.is_patched ? "Patched" : "Not Patched"}
                </div>
                <button
                  onClick={() => handlePatch(install)}
                  disabled={actionLoading === install.jar_path || actionLoading === install.jar_path + "-restore"}
                  className="px-4 py-2 rounded-lg disabled:opacity-50 bg-purple-600 hover:bg-purple-700"
                >
                  {actionLoading === install.jar_path
                    ? "Processing..."
                    : install.is_patched ? "Repatch" : "Patch"
                  }
                </button>
                {backups[install.jar_path] && (
                  <button
                    onClick={() => handleRestore(install)}
                    disabled={actionLoading === install.jar_path || actionLoading === install.jar_path + "-restore"}
                    className="px-4 py-2 rounded-lg disabled:opacity-50 bg-orange-600 hover:bg-orange-700"
                    title="Restore original unpatched JAR from backup"
                  >
                    {actionLoading === install.jar_path + "-restore"
                      ? "Restoring..."
                      : "Restore JAR"
                    }
                  </button>
                )}
                {install.is_patched && (
                  <button
                    onClick={() => handleResetTheme(install.version)}
                    disabled={actionLoading === install.version + "-reset"}
                    className="px-4 py-2 rounded-lg disabled:opacity-50 bg-gray-600 hover:bg-gray-500"
                    title="Remove custom theme (keeps patching)"
                  >
                    {actionLoading === install.version + "-reset"
                      ? "Resetting..."
                      : "Reset Theme"
                    }
                  </button>
                )}
              </div>
              {install.needs_sudo && !install.is_patched && (
                <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Requires administrator privileges (sudo/pkexec)
                </div>
              )}
              {install.installation_type === "Flatpak" && (
                <div className="mt-2 text-xs text-blue-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Flatpak installation - theme files in ~/.var/app/com.bitwig.BitwigStudio/
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Manual Path</h3>
        <p className="text-sm text-gray-400 mb-4">If your Bitwig installation wasn't detected, enter the path manually.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualPath}
            onChange={(e) => setManualPath(e.target.value)}
            placeholder="/path/to/bitwig-studio"
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleAddManual}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  const { settings, loading, saving, updateSetting, resetToDefaults } = useSettings();
  const { installations } = useBitwigInstallations();
  const [themeDir, setThemeDir] = useState<string | null>(null);
  const [logPath, setLogPath] = useState<string | null>(null);
  const [manualVersion, setManualVersion] = useState("");
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [appVersion, setAppVersion] = useState<string | null>(null);

  // Fetch app version
  useEffect(() => {
    import("@tauri-apps/api/app").then((app) => {
      app.getVersion().then(setAppVersion);
    });
  }, []);

  // Get available Bitwig versions
  const availableVersions = installations.length > 0
    ? [...new Set(installations.map((i) => i.version))]
    : ["5.2"];
  const inferredVersion = installations.length > 0 ? availableVersions[0] : null;

  // Load theme directory when version changes
  useEffect(() => {
    const loadThemeDir = async () => {
      const version = settings?.selected_bitwig_version || availableVersions[0];
      const dir = await api.getThemeDirectory(version);
      setThemeDir(dir);
    };
    if (settings) {
      loadThemeDir();
    }
  }, [settings?.selected_bitwig_version, availableVersions, settings]);

  useEffect(() => {
    api.getLogPath().then(setLogPath).catch(() => setLogPath(null));
  }, []);

  useEffect(() => {
    if (settings?.selected_bitwig_version) {
      setManualVersion(settings.selected_bitwig_version);
    }
  }, [settings?.selected_bitwig_version]);

  useEffect(() => {
    if (!settings || availableVersions.length === 0 || !inferredVersion) return;
    if (!settings.selected_bitwig_version || !availableVersions.includes(settings.selected_bitwig_version)) {
      updateSetting("selected_bitwig_version", inferredVersion);
    }
  }, [settings, availableVersions, inferredVersion, updateSetting]);

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await api.clearCache();
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 3000);
    } catch {
      // Error handling
    } finally {
      setClearingCache(false);
    }
  };

  const handleBrowseThemeDir = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select Theme Directory",
    });
    if (selected) {
      updateSetting("custom_theme_directory", selected);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* General Settings */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-4">General</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span>Check for updates on startup</span>
              <p className="text-sm text-gray-500">Automatically check for app updates when launched</p>
            </div>
            <input
              type="checkbox"
              checked={settings.check_updates_on_startup}
              onChange={(e) => updateSetting("check_updates_on_startup", e.target.checked)}
              className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span>Auto-refresh theme repository</span>
              <p className="text-sm text-gray-500">Fetch latest themes from repository on startup</p>
            </div>
            <input
              type="checkbox"
              checked={settings.auto_refresh_repository}
              onChange={(e) => updateSetting("auto_refresh_repository", e.target.checked)}
              className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span>Watch theme directory</span>
              <p className="text-sm text-gray-500">Auto-reload when theme files change externally</p>
            </div>
            <input
              type="checkbox"
              checked={settings.watch_theme_directory}
              onChange={(e) => updateSetting("watch_theme_directory", e.target.checked)}
              className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span>Show preview images</span>
              <p className="text-sm text-gray-500">Display theme screenshots in browser</p>
            </div>
            <input
              type="checkbox"
              checked={settings.show_preview_images}
              onChange={(e) => updateSetting("show_preview_images", e.target.checked)}
              className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
            />
          </label>
        </div>
      </div>

      {/* Bitwig Version */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-4">Bitwig Version</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Bitwig Version</label>
            <select
              value={settings.selected_bitwig_version || availableVersions[0]}
              onChange={(e) => updateSetting("selected_bitwig_version", e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            >
              {availableVersions.map((version) => (
                <option key={version} value={version}>
                  Bitwig Studio {version}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Themes are specific to each Bitwig version
            </p>
            {settings.selected_bitwig_version &&
              !availableVersions.includes(settings.selected_bitwig_version) && (
                <p className="text-sm text-yellow-400 mt-1">
                  Selected version is not in detected installations. Use manual override if needed.
                </p>
              )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Manual Version Override</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualVersion}
                onChange={(e) => setManualVersion(e.target.value)}
                placeholder="e.g. 5.3.13"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => updateSetting("selected_bitwig_version", manualVersion.trim() || null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
              >
                Use
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Use this if your install path doesn’t include a version.
            </p>
          </div>
        </div>
      </div>

      {/* Theme Files */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-4">Theme Files</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Theme Directory</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={settings.custom_theme_directory || themeDir || "Loading..."}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-400 font-mono text-sm"
              />
              <button
                onClick={handleBrowseThemeDir}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
              >
                Browse
              </button>
            </div>
            {settings.custom_theme_directory && (
              <button
                onClick={() => updateSetting("custom_theme_directory", null)}
                className="text-sm text-purple-400 hover:text-purple-300 mt-1"
              >
                Reset to default
              </button>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Cache Duration</label>
            <select
              value={settings.cache_duration_hours}
              onChange={(e) => updateSetting("cache_duration_hours", parseInt(e.target.value, 10))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value={1}>1 hour</option>
              <option value={6}>6 hours</option>
              <option value={24}>24 hours</option>
              <option value={168}>1 week</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              How long to keep cached repository data before refreshing
            </p>
          </div>
        </div>
      </div>

      {/* Cache Management */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-4">Cache</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300">Clear cached themes and previews</p>
            <p className="text-sm text-gray-500">This will remove downloaded themes and preview images</p>
          </div>
          <button
            onClick={handleClearCache}
            disabled={clearingCache}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg"
          >
            {clearingCache ? "Clearing..." : "Clear Cache"}
          </button>
        </div>
        {cacheCleared && (
          <div className="mt-2 text-green-400 text-sm">Cache cleared successfully</div>
        )}
      </div>

      {/* Logs */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-4">Logs</h3>
        <div className="space-y-2">
          <label className="block text-sm text-gray-400 mb-1">Log File</label>
          <input
            type="text"
            readOnly
            value={logPath || "Unavailable"}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-400 font-mono text-sm"
          />
          <p className="text-sm text-gray-500">
            Apply actions write here for troubleshooting.
          </p>
        </div>
      </div>

      {/* Reset */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-4">Reset</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300">Reset all settings to defaults</p>
            <p className="text-sm text-gray-500">This will not affect your installed themes</p>
          </div>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
          >
            Reset Settings
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-4">About</h3>
        <div className="text-sm text-gray-400 space-y-2">
          <p><span className="text-gray-300">Bitwig Theme Manager</span> v{appVersion || "..."}</p>
          <p>Built with Tauri + React + TypeScript</p>
          <p>
            <a
              href="https://github.com/DJZeroAction/bitwig-theme-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              View on GitHub
            </a>
          </p>
          <p className="pt-2 border-t border-gray-700 mt-2">
            Theme repository:{" "}
            <a
              href="https://github.com/Berikai/awesome-bitwig-themes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              awesome-bitwig-themes
            </a>
          </p>
        </div>
      </div>

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300">
          Saving...
        </div>
      )}
    </div>
  );
}

export default App;
