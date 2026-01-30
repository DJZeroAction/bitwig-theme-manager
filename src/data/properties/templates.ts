// Pre-built theme templates from THEMING_GUIDE.md Quick Start section
// These provide starting points for new theme creation

import type { BitwigVersion } from './index';

export interface ThemeTemplate {
  id: string;
  name: string;
  description: string;
  bitwigVersions: BitwigVersion[];
  colors: Record<string, string>;
}

// Minimal Dark Theme - neutral dark greys with placeholder accent
export const MINIMAL_DARK: ThemeTemplate = {
  id: "minimal-dark",
  name: "Minimal Dark",
  description: "Clean dark foundation with neutral greys. Replace YOUR_ACCENT with your accent color.",
  bitwigVersions: ["5", "6"],
  colors: {
    // Core
    "Gradient": "false",
    "Window background": "#1e2228",
    "Grey 0": "#14181e",
    "Grey 1": "#1a1e24",
    "Grey 2": "#202630",
    "Grey 3": "#262c38",
    "Grey 4": "#2e3440",
    "Grey 5": "#363e4a",
    "Grey 6": "#404a56",
    "Default text": "#e0e4ea",
    "Light Text": "#ffffff",
    "Dark Text": "#000000",
    "Lighter Text": "#a0a8b0",
    "White": "#ffffff",
    "Black": "#000000",
    // Accent - customize these
    "Accent": "#e94560",
    "Accent (default)": "#e94560",
    "Accent (hitech)": "#e94560",
    "On": "#e94560",
    "On (subtle)": "#e9456080",
    "Implicit On (subtle)": "#e9456080",
    "Hitech on": "#e94560",
    "Knob Value Color": "#e94560",
    "Led On": "#e94560",
    "Progress bar": "#e94560",
    // Meters - keep semantic colors
    "Meter Normal": "#00cc66",
    "Meter Yellow": "#ffcc00",
    "Meter Red": "#ff4444",
    "Meter Clipping": "#ff0000",
  },
};

// Minimal Light Theme - inverted greys with proper semantic tokens
export const MINIMAL_LIGHT: ThemeTemplate = {
  id: "minimal-light",
  name: "Minimal Light",
  description: "Clean light foundation with inverted semantics. Replace YOUR_ACCENT with your accent color.",
  bitwigVersions: ["5", "6"],
  colors: {
    // Core - light backgrounds
    "Gradient": "false",
    "Window background": "#fafafb",
    "Grey 0": "#ebebed",
    "Grey 1": "#e4e4e7",
    "Grey 2": "#fafbff",
    "Grey 3": "#f7f7f8",
    "Grey 4": "#f7f7f8",
    "Grey 5": "#ffffff",
    "Grey 6": "#dfdfef",
    // Text - inverted semantics
    "Default text": "#000000",
    "White": "#000000", // Inverted!
    "Black": "#ffffff", // Inverted!
    "Light Text": "#000000",
    "Dark Text": "#ffffff",
    "Lighter Text": "#404040",
    // Accent - customize these
    "Accent": "#4060a0",
    "Accent (default)": "#4060a0",
    "Accent (hitech)": "#4060a0",
    "On": "#4060a0",
    "On (subtle)": "#4060a080",
    "Implicit On (subtle)": "#4060a080",
    "Hitech on": "#4060a0",
    "Knob Value Color": "#4060a0",
    "Led On": "#4060a0",
    "Progress bar": "#4060a0",
    // Keep displays dark for waveform contrast
    "Display Background": "#373D40",
    // Meters - keep semantic colors but darker for light theme
    "Meter Normal": "#00aa55",
    "Meter Yellow": "#cc9900",
    "Meter Red": "#dd3333",
    "Meter Clipping": "#cc0000",
  },
};

// Professional Dark - subtle tinted greys
export const PROFESSIONAL_DARK: ThemeTemplate = {
  id: "professional-dark",
  name: "Professional Dark",
  description: "Subtle blue-tinted greys with low-saturation accents for reduced eye strain.",
  bitwigVersions: ["5", "6"],
  colors: {
    "Gradient": "false",
    "Window background": "#1a1d22",
    "Grey 0": "#12151a",
    "Grey 1": "#181b20",
    "Grey 2": "#1e2126",
    "Grey 3": "#24272c",
    "Grey 4": "#2a2d32",
    "Grey 5": "#303338",
    "Grey 6": "#383b40",
    "Default text": "#d8dce2",
    "Light Text": "#f0f2f5",
    "Dark Text": "#1a1d22",
    "Lighter Text": "#9098a0",
    "White": "#f0f2f5",
    "Black": "#0a0c0e",
    // Subtle cyan accent
    "Accent": "#5090a0",
    "Accent (default)": "#5090a0",
    "Accent (hitech)": "#5090a0",
    "On": "#5090a0",
    "On (subtle)": "#5090a080",
    "Implicit On (subtle)": "#5090a080",
    "Hitech on": "#5090a0",
    "Knob Value Color": "#5090a0",
    "Led On": "#5090a0",
    "Progress bar": "#5090a0",
    // Standard meters
    "Meter Normal": "#40a060",
    "Meter Yellow": "#c0a040",
    "Meter Red": "#c04040",
    "Meter Clipping": "#ff3030",
  },
};

// Vibrant Neon - high contrast with neon accents
export const VIBRANT_NEON: ThemeTemplate = {
  id: "vibrant-neon",
  name: "Vibrant Neon",
  description: "Near-black backgrounds with high-saturation neon accents.",
  bitwigVersions: ["5", "6"],
  colors: {
    "Gradient": "false",
    "Window background": "#0c0c0f",
    "Grey 0": "#080809",
    "Grey 1": "#0a0a0c",
    "Grey 2": "#0e0e10",
    "Grey 3": "#121214",
    "Grey 4": "#161618",
    "Grey 5": "#1a1a1c",
    "Grey 6": "#1e1e20",
    "Default text": "#e8e8ea",
    "Light Text": "#ffffff",
    "Dark Text": "#000000",
    "Lighter Text": "#a0a0a4",
    "White": "#ffffff",
    "Black": "#000000",
    // Electric pink accent
    "Accent": "#ff2080",
    "Accent (default)": "#ff2080",
    "Accent (hitech)": "#ff2080",
    "On": "#ff2080",
    "On (subtle)": "#ff208080",
    "Implicit On (subtle)": "#ff208080",
    "Hitech on": "#ff2080",
    "Knob Value Color": "#ff2080",
    "Led On": "#ff2080",
    "Progress bar": "#ff2080",
    // Cyan automation for contrast
    "Automation Color": "#00ffcc",
    "Track Automation Button Color": "#00ffcc",
    // Bright meters
    "Meter Normal": "#00ff80",
    "Meter Yellow": "#ffff00",
    "Meter Red": "#ff4040",
    "Meter Clipping": "#ff0000",
  },
};

// All available templates
export const TEMPLATES: ThemeTemplate[] = [
  MINIMAL_DARK,
  MINIMAL_LIGHT,
  PROFESSIONAL_DARK,
  VIBRANT_NEON,
];

// Get template by ID
export function getTemplateById(id: string): ThemeTemplate | undefined {
  return TEMPLATES.find(t => t.id === id);
}

// Get templates compatible with a version
export function getTemplatesForVersion(version: BitwigVersion): ThemeTemplate[] {
  return TEMPLATES.filter(t => t.bitwigVersions.includes(version));
}
