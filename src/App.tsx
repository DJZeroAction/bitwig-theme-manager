import { useState } from "react";

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

  return (
    <div className="flex h-screen bg-gray-900 text-white">
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
                placeholder="Search themes..."
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {currentView === "browse" && <BrowseView />}
          {currentView === "editor" && <EditorView />}
          {currentView === "patch" && <PatchView />}
          {currentView === "settings" && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

function BrowseView() {
  const placeholderThemes = [
    { name: "Ghosty", author: "notoyz", colors: ["#1a1a2e", "#e94560", "#0f3460"] },
    { name: "Dark Mellow", author: "dariolupo", colors: ["#2d2d2d", "#ff9f43", "#1abc9c"] },
    { name: "GruvBit", author: "stianfan", colors: ["#282828", "#fb4934", "#b8bb26"] },
    { name: "Nord", author: "lenninst", colors: ["#2e3440", "#88c0d0", "#bf616a"] },
    { name: "Dracula", author: "sleeplessKomodo", colors: ["#282a36", "#bd93f9", "#ff79c6"] },
    { name: "Frost", author: "ibsenproducer", colors: ["#1e2128", "#61afef", "#98c379"] },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {placeholderThemes.map((theme) => (
        <div key={theme.name} className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer">
          {/* Preview */}
          <div className="h-32 flex" style={{ background: theme.colors[0] }}>
            <div className="w-1/3" style={{ background: theme.colors[1] }} />
            <div className="w-1/3" style={{ background: theme.colors[2] }} />
            <div className="w-1/3" style={{ background: theme.colors[0] }} />
          </div>
          {/* Info */}
          <div className="p-4">
            <h3 className="font-semibold">{theme.name}</h3>
            <p className="text-sm text-gray-400">by @{theme.author}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function EditorView() {
  const colorGroups = [
    { name: "Background", colors: [{ label: "Main", value: "#1a1a2e" }, { label: "Secondary", value: "#16213e" }] },
    { name: "Accent", colors: [{ label: "Primary", value: "#e94560" }, { label: "Secondary", value: "#0f3460" }] },
    { name: "Text", colors: [{ label: "Primary", value: "#ffffff" }, { label: "Secondary", value: "#a0a0a0" }] },
  ];

  return (
    <div className="flex gap-6">
      {/* Color Properties */}
      <div className="flex-1 space-y-6">
        {colorGroups.map((group) => (
          <div key={group.name} className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-4">{group.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              {group.colors.map((color) => (
                <div key={color.label} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border border-gray-600 cursor-pointer hover:border-purple-500"
                    style={{ background: color.value }}
                  />
                  <div>
                    <div className="text-sm">{color.label}</div>
                    <div className="text-xs text-gray-400 font-mono">{color.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Panel */}
      <div className="w-80 bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-4">Preview</h3>
        <div className="bg-gray-900 rounded-lg p-4 space-y-2">
          <div className="h-8 bg-gray-700 rounded" />
          <div className="flex gap-2">
            <div className="h-20 flex-1 bg-purple-600 rounded" />
            <div className="h-20 flex-1 bg-gray-700 rounded" />
          </div>
          <div className="h-4 bg-gray-600 rounded w-3/4" />
          <div className="h-4 bg-gray-600 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

function PatchView() {
  const installations = [
    { path: "/opt/bitwig-studio/5.2", version: "5.2", patched: true },
    { path: "/opt/bitwig-studio/5.1", version: "5.1", patched: false },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-4">Detected Bitwig Installations</h3>
        <div className="space-y-3">
          {installations.map((install) => (
            <div key={install.path} className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="font-medium">Bitwig Studio {install.version}</div>
                <div className="text-sm text-gray-400 font-mono">{install.path}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${install.patched ? "bg-green-600" : "bg-gray-600"}`}>
                {install.patched ? "Patched" : "Not Patched"}
              </div>
              <button className={`px-4 py-2 rounded-lg ${install.patched ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"}`}>
                {install.patched ? "Restore" : "Patch"}
              </button>
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
            placeholder="/path/to/bitwig-studio"
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
          />
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">Add</button>
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-4">General</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span>Check for updates on startup</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500" />
          </label>
          <label className="flex items-center justify-between">
            <span>Auto-refresh theme repository</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500" />
          </label>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-4">Theme Files</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Theme Directory</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value="~/.bitwig-theme-editor/5.2/"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-400"
              />
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg">Browse</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-4">About</h3>
        <div className="text-sm text-gray-400 space-y-1">
          <p>Bitwig Theme Manager v0.1.0</p>
          <p>Built with Tauri + React</p>
          <p className="text-purple-400 hover:text-purple-300 cursor-pointer">GitHub Repository</p>
        </div>
      </div>
    </div>
  );
}

export default App;
