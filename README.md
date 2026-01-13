# Bitwig Theme Manager

A cross-platform desktop application for managing and editing Bitwig Studio themes.
<img width="1203" height="831" alt="image" src="https://github.com/user-attachments/assets/55d2be7d-403d-4dad-a9df-80d809d21db4" />

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Theme Browser**: Browse and install themes from the [awesome-bitwig-themes](https://github.com/Berikai/awesome-bitwig-themes) repository
- **Theme Editor**: Create and customize themes with a visual color picker
- **Patch Manager**: Safely patch Bitwig Studio to enable theme support
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Installation

Download the latest release for your platform from the [Releases](https://github.com/yourusername/bitwig-theme-manager/releases) page.

### Building from Source

Prerequisites:
- Node.js 20+
- Rust 1.70+
- Platform-specific dependencies (see [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites))

```bash
# Clone the repository
git clone https://github.com/yourusername/bitwig-theme-manager.git
cd bitwig-theme-manager

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Usage

### Patching Bitwig Studio

1. Open the **Patch Manager** tab
2. Select your Bitwig Studio installation
3. Click **Patch** to enable theme support
4. Restart Bitwig Studio

### Applying Themes

1. Open the **Theme Browser** tab
2. Browse or search for themes
3. Click on a theme to apply it
4. Changes apply immediately when Bitwig is running

### Creating Custom Themes

1. Open the **Theme Editor** tab
2. Click **New Theme** or duplicate an existing theme
3. Adjust colors using the visual editor
4. Save and apply your theme

## How It Works

This app works by patching `bitwig.jar` to watch a theme file for changes. When you apply or edit a theme, the changes are written to this file and Bitwig updates its UI in real-time.

Based on the approach from [bitwig-theme-editor](https://github.com/Berikai/bitwig-theme-editor).

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [bitwig-theme-editor](https://github.com/Berikai/bitwig-theme-editor) - Original theme editor
- [awesome-bitwig-themes](https://github.com/Berikai/awesome-bitwig-themes) - Community theme repository
