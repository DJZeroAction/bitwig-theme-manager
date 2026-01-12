# Bitwig Theme Manager - Architecture & Design

## Overview

A cross-platform desktop application for managing and editing Bitwig Studio themes. Replicates and extends the functionality of [bitwig-theme-editor](https://github.com/Berikai/bitwig-theme-editor) with a modern UI and integrated theme repository browser.

## Tech Stack Decision

### Chosen: Tauri + React + TypeScript

**Why Tauri over Electron?**
- ~10x smaller bundle size (10-20MB vs 150MB+)
- Lower memory footprint
- Rust backend ideal for binary manipulation (JAR patching)
- Native OS integration
- Security-first architecture

**Why React + TypeScript?**
- Rich ecosystem for UI components (color pickers, search, etc.)
- Type safety for complex theme data structures
- Excellent developer experience
- Easy to build responsive, accessible UIs

**Why not Java (like original)?**
- Modern web UI is more flexible for theme editing
- Easier to maintain and extend
- Better cross-platform distribution (no JRE dependency for users)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Tauri Application                         │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                              │
│  ┌─────────────┬─────────────┬─────────────┬──────────────┐ │
│  │ Theme       │ Theme       │ Patch       │ Settings     │ │
│  │ Browser     │ Editor      │ Manager     │ Panel        │ │
│  └─────────────┴─────────────┴─────────────┴──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Tauri IPC Bridge (Commands & Events)                       │
├─────────────────────────────────────────────────────────────┤
│  Backend (Rust)                                             │
│  ┌─────────────┬─────────────┬─────────────┬──────────────┐ │
│  │ Bitwig      │ JAR         │ Theme       │ Repository   │ │
│  │ Detector    │ Patcher     │ File I/O    │ Fetcher      │ │
│  └─────────────┴─────────────┴─────────────┴──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  File System                                                │
│  ┌─────────────┬─────────────┬─────────────────────────────┐│
│  │ Theme       │ JAR         │ Config & Cache              ││
│  │ Files       │ Backups     │                             ││
│  └─────────────┴─────────────┴─────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Bitwig Detector (`src-tauri/src/bitwig/detector.rs`)

Auto-detects Bitwig Studio installations across platforms:

| Platform | Default Paths |
|----------|---------------|
| Windows  | `C:\Program Files\Bitwig Studio\*` |
| macOS    | `/Applications/Bitwig Studio*.app` |
| Linux    | `/opt/bitwig-studio/*`, `~/.local/share/bitwig-studio/*` |

Features:
- Scans common installation directories
- Detects multiple installed versions
- Validates `bitwig.jar` presence
- Allows manual path override

### 2. JAR Patcher (`src-tauri/src/bitwig/patcher.rs`)

Patches `bitwig.jar` to enable theme file watching:

1. **Verify State**: Check if JAR is already patched
2. **Backup**: Create timestamped backup before patching
3. **Patch**: Inject theme-watching bytecode
4. **Validate**: Confirm patch was applied correctly

Safety features:
- SHA256 checksum verification
- Atomic backup/restore operations
- Never re-patches an already patched JAR

### 3. Theme File Manager (`src-tauri/src/theme/`)

Handles `.bte` theme file format:

**Theme file location (per-OS):**
- Windows: `%APPDATA%\.bitwig-theme-editor\<version>\`
- macOS/Linux: `~/.bitwig-theme-editor/<version>/`

**Operations:**
- Read/write `.bte` files
- Parse color definitions
- Live-reload support (file watching)
- Import/export themes

### 4. Repository Browser (`src-tauri/src/repository/`)

Fetches and caches themes from [awesome-bitwig-themes](https://github.com/Berikai/awesome-bitwig-themes):

- Parse GitHub repository README for theme list
- Fetch theme files from linked repositories
- Cache themes locally for offline use
- Display preview images when available

### 5. Frontend Components

**Theme Browser (`src/components/ThemeBrowser/`)**
- Grid/list view of available themes
- Search and filter
- Preview images
- One-click install

**Theme Editor (`src/components/ThemeEditor/`)**
- Visual color picker for each theme property
- Color grouping by UI element type
- Live preview (when Bitwig is running)
- Undo/redo support

**Patch Manager (`src/components/PatchManager/`)**
- List detected Bitwig installations
- Show patch status
- Patch/restore buttons
- Backup management

## Data Flow

### Applying a Theme
```
User clicks "Apply" → Frontend sends IPC command
                    → Rust writes theme.bte file
                    → Patched Bitwig detects change
                    → UI updates in Bitwig
```

### Patching Bitwig
```
User clicks "Patch" → Frontend sends IPC command
                    → Rust backs up bitwig.jar
                    → Rust patches JAR with theme-watcher
                    → Returns success/failure to frontend
```

## File Formats

### Theme File (.bte)
```
# Theme: My Custom Theme
# Author: username
background.main=#1a1a2e
accent.primary=#e94560
text.primary=#ffffff
...
```

### Config File (config.json)
```json
{
  "bitwigPaths": ["/opt/bitwig-studio/5.2"],
  "activeTheme": "my-theme.bte",
  "cacheDir": "~/.cache/bitwig-theme-manager",
  "checkUpdates": true
}
```

## Security Considerations

1. **JAR Patching**: Only modify specific bytecode, never arbitrary code injection
2. **File Access**: Sandboxed to theme directories and Bitwig installation
3. **Network**: Only fetch from trusted GitHub repositories
4. **Backups**: Always create backups before any destructive operation

## Testing Strategy

- **Unit Tests**: Rust backend logic (parsing, patching verification)
- **Integration Tests**: Full theme apply/restore cycles
- **E2E Tests**: UI workflows with Playwright
- **Manual Tests**: Actual Bitwig Studio integration

## Release Strategy

- GitHub Releases with platform-specific binaries
- Auto-updater for new versions
- Portable and installer variants
