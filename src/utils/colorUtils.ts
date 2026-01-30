// Color manipulation utilities for theme derivation

/**
 * Parse a hex color string to RGB components
 * Supports #RGB, #RGBA, #RRGGBB, #RRGGBBAA formats
 */
export function parseHex(hex: string): { r: number; g: number; b: number; a: number } | null {
  const clean = hex.replace('#', '');

  let r: number, g: number, b: number, a = 255;

  if (clean.length === 3) {
    // #RGB
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 4) {
    // #RGBA
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
    a = parseInt(clean[3] + clean[3], 16);
  } else if (clean.length === 6) {
    // #RRGGBB
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  } else if (clean.length === 8) {
    // #RRGGBBAA
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
    a = parseInt(clean.substring(6, 8), 16);
  } else {
    return null;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
    return null;
  }

  return { r, g, b, a };
}

/**
 * Convert RGB(A) to hex string
 */
export function toHex(r: number, g: number, b: number, a?: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const hex = (n: number) => clamp(n).toString(16).padStart(2, '0');

  if (a !== undefined && a < 255) {
    return `#${hex(r)}${hex(g)}${hex(b)}${hex(a)}`.toUpperCase();
  }
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Lighten a color by a percentage (0-100)
 */
export function lighten(hex: string, amount: number): string {
  const color = parseHex(hex);
  if (!color) return hex;

  const { h, s, l } = rgbToHsl(color.r, color.g, color.b);
  const newL = Math.min(100, l + amount);
  const { r, g, b } = hslToRgb(h, s, newL);

  return toHex(r, g, b, color.a < 255 ? color.a : undefined);
}

/**
 * Darken a color by a percentage (0-100)
 */
export function darken(hex: string, amount: number): string {
  const color = parseHex(hex);
  if (!color) return hex;

  const { h, s, l } = rgbToHsl(color.r, color.g, color.b);
  const newL = Math.max(0, l - amount);
  const { r, g, b } = hslToRgb(h, s, newL);

  return toHex(r, g, b, color.a < 255 ? color.a : undefined);
}

/**
 * Set alpha value of a color (0-100 percentage or 0-255 raw)
 */
export function setAlpha(hex: string, alpha: number, isPercentage = true): string {
  const color = parseHex(hex);
  if (!color) return hex;

  const newAlpha = isPercentage ? Math.round((alpha / 100) * 255) : alpha;
  return toHex(color.r, color.g, color.b, newAlpha);
}

/**
 * Saturate a color by a percentage (0-100)
 */
export function saturate(hex: string, amount: number): string {
  const color = parseHex(hex);
  if (!color) return hex;

  const { h, s, l } = rgbToHsl(color.r, color.g, color.b);
  const newS = Math.min(100, s + amount);
  const { r, g, b } = hslToRgb(h, newS, l);

  return toHex(r, g, b, color.a < 255 ? color.a : undefined);
}

/**
 * Desaturate a color by a percentage (0-100)
 */
export function desaturate(hex: string, amount: number): string {
  const color = parseHex(hex);
  if (!color) return hex;

  const { h, s, l } = rgbToHsl(color.r, color.g, color.b);
  const newS = Math.max(0, s - amount);
  const { r, g, b } = hslToRgb(h, newS, l);

  return toHex(r, g, b, color.a < 255 ? color.a : undefined);
}

/**
 * Mix two colors together
 */
export function mix(hex1: string, hex2: string, weight = 50): string {
  const c1 = parseHex(hex1);
  const c2 = parseHex(hex2);
  if (!c1 || !c2) return hex1;

  const w = weight / 100;
  const r = Math.round(c1.r * (1 - w) + c2.r * w);
  const g = Math.round(c1.g * (1 - w) + c2.g * w);
  const b = Math.round(c1.b * (1 - w) + c2.b * w);
  const a = Math.round(c1.a * (1 - w) + c2.a * w);

  return toHex(r, g, b, a < 255 ? a : undefined);
}

/**
 * Get the perceived luminance of a color (0-1)
 * Uses the relative luminance formula from WCAG
 */
export function getLuminance(hex: string): number {
  const color = parseHex(hex);
  if (!color) return 0;

  const srgb = [color.r, color.g, color.b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Check if a color is considered "dark" (luminance < 0.5)
 */
export function isDark(hex: string): boolean {
  return getLuminance(hex) < 0.5;
}

/**
 * Get a contrasting text color (black or white) for a background
 */
export function getContrastText(bgHex: string): string {
  return isDark(bgHex) ? '#FFFFFF' : '#000000';
}

/**
 * Adjust a color to create a step in a grey scale
 * Used for Grey 0-6 generation
 */
export function createGreyStep(baseHex: string, step: number, totalSteps = 7): string {
  const color = parseHex(baseHex);
  if (!color) return baseHex;

  const { h, s, l } = rgbToHsl(color.r, color.g, color.b);
  // Create evenly spaced lightness steps
  const stepSize = (50 - l) / totalSteps; // Go from base to ~50% lightness
  const newL = l + (step * stepSize);
  const { r, g, b } = hslToRgb(h, s, newL);

  return toHex(r, g, b);
}

/**
 * Validate a hex color string
 */
export function isValidHex(hex: string): boolean {
  return parseHex(hex) !== null;
}

/**
 * Normalize a hex color to uppercase #RRGGBB or #RRGGBBAA format
 */
export function normalizeHex(hex: string): string {
  const color = parseHex(hex);
  if (!color) return hex;
  return toHex(color.r, color.g, color.b, color.a < 255 ? color.a : undefined);
}

/**
 * Intelligently derive a color for a property based on its name patterns
 * This creates variations (pressed, hover, subtle, etc.) from a base color
 */
export function deriveColorForProperty(baseColor: string, propertyKey: string): string {
  const key = propertyKey.toLowerCase();

  // Pressed states - darken
  if (key.includes('pressed')) {
    return darken(baseColor, 15);
  }

  // Hover/Mouse over states - lighten slightly
  if (key.includes('mouse over') || key.includes('hover')) {
    return lighten(baseColor, 10);
  }

  // Standby/Inactive states - reduce alpha and desaturate
  if (key.includes('standby') || key.includes('inactive')) {
    return setAlpha(desaturate(baseColor, 20), 50);
  }

  // Subtle/Subtler variations - reduce alpha
  if (key.includes('subtler')) {
    return setAlpha(baseColor, 15);
  }
  if (key.includes('subtle')) {
    return setAlpha(baseColor, 30);
  }

  // Shadow - darken significantly with alpha
  if (key.includes('shadow')) {
    return setAlpha(darken(baseColor, 40), 50);
  }

  // Highlight/Emboss highlight - lighten with some transparency
  if (key.includes('highlight') || key.includes('emboss')) {
    return setAlpha(lighten(baseColor, 30), 60);
  }

  // Glow - add transparency
  if (key.includes('glow')) {
    return setAlpha(baseColor, 40);
  }

  // Background properties - slightly darker or with alpha
  if (key.endsWith('background')) {
    // Check if it's a fill/overlay type
    if (key.includes('overlay') || key.includes('fill')) {
      return setAlpha(baseColor, 40);
    }
    return darken(baseColor, 5);
  }

  // Fill properties - add some transparency
  if (key.includes('fill') && !key.includes('unfill')) {
    return setAlpha(baseColor, 60);
  }

  // Stroke/Border/Frame - slightly darker
  if (key.includes('stroke') || key.includes('border') || key.includes('frame')) {
    return darken(baseColor, 10);
  }

  // Separator/Divider - darker with some transparency
  if (key.includes('separator') || key.includes('divider')) {
    return setAlpha(darken(baseColor, 20), 70);
  }

  // Selected states - keep similar but might slightly adjust
  if (key.includes('selected') && !key.includes('unselected')) {
    return lighten(baseColor, 5);
  }

  // Active/Playing states - keep vibrant
  if (key.includes('active') || key.includes('playing')) {
    return saturate(baseColor, 10);
  }

  // Off/Disabled states - desaturate
  if (key.includes(' off') || key.includes('disabled') || key.includes('muted')) {
    return desaturate(baseColor, 40);
  }

  // Normal/Default - return as-is
  if (key.includes('normal') || key.includes('default')) {
    return baseColor;
  }

  // Inverted - this is tricky, just return as-is (user should set manually)
  if (key.includes('inverted')) {
    return baseColor;
  }

  // Grey scale steps (Grey 0-6) - create graduated steps
  const greyMatch = key.match(/grey\s*(\d)/);
  if (greyMatch) {
    const step = parseInt(greyMatch[1]);
    return createGreyStep(baseColor, step);
  }

  // Dark/Light prefixes
  if (key.startsWith('dark ') || key.startsWith('dark_')) {
    return darken(baseColor, 15);
  }
  if (key.startsWith('light ') || key.startsWith('light_')) {
    return lighten(baseColor, 15);
  }

  // Darker/Lighter/Lightest/Darkest suffixes
  if (key.includes('darkest')) {
    return darken(baseColor, 25);
  }
  if (key.includes('darker')) {
    return darken(baseColor, 15);
  }
  if (key.includes('lightest')) {
    return lighten(baseColor, 25);
  }
  if (key.includes('lighter')) {
    return lighten(baseColor, 15);
  }
  if (key.includes('brighter')) {
    return lighten(baseColor, 20);
  }

  // Default: return base color as-is
  return baseColor;
}

// ============================================================================
// Bundle-Specific Derivation Functions
// ============================================================================

import type { DerivationMode } from '../data/properties/categories';

/**
 * Derive all colors for a grey scale bundle from a base color
 * Creates graduated lightness steps from dark (0) to light (6)
 */
export function deriveGreyScale(baseColor: string): Record<string, string> {
  const color = parseHex(baseColor);
  if (!color) return {};

  const { h, s, l } = rgbToHsl(color.r, color.g, color.b);

  // Calculate step size - go from base lightness to about 50% lighter
  // But cap the maximum lightness at ~40% for dark themes
  const targetL = Math.min(l + 35, 45);
  const stepSize = (targetL - l) / 7;

  const result: Record<string, string> = {
    "Window background": baseColor,
    "Black": "#000000",
  };

  // Generate Grey 0-6
  for (let i = 0; i <= 6; i++) {
    const newL = l + (i * stepSize);
    const { r, g, b } = hslToRgb(h, s, newL);

    if (i === 6) {
      // Grey 6 typically has alpha for overlay effect
      result[`Grey ${i}`] = toHex(r, g, b, Math.round(255 * 0.2));
    } else {
      result[`Grey ${i}`] = toHex(r, g, b);
    }
  }

  // Brighter is typically around step 4-5
  const brighterL = l + (5 * stepSize);
  const { r: br, g: bg, b: bb } = hslToRgb(h, s, brighterL);
  result["Brighter"] = toHex(br, bg, bb);

  // Grey Display Background - similar to Grey 2 with alpha
  const greyDispL = l + (2 * stepSize);
  const { r: gdr, g: gdg, b: gdb } = hslToRgb(h, s, greyDispL);
  result["Grey Display Background"] = toHex(gdr, gdg, gdb, Math.round(255 * 0.4));

  return result;
}

/**
 * Derive all colors for the primary accent bundle
 * Creates variants: subtle, subtler, pressed, standby, etc.
 */
export function derivePrimaryAccent(baseColor: string): Record<string, string> {
  return {
    "Accent": setAlpha(baseColor, 0), // Often transparent in BW6
    "Accent (default)": baseColor,
    "On": baseColor,
    "On (subtle)": setAlpha(baseColor, 27),
    "On (subtler)": setAlpha(baseColor, 13),
    "Pressed On": darken(baseColor, 20),
    "Hitech on": baseColor,
    "Accent (hitech)": "#FFFFFF",
    // Cross-category properties that use accent
    "Knob Value Color": baseColor,
    "Led On": baseColor,
    "Progress bar": baseColor,
    "Link Text": baseColor,
    "Link Text Rollover": setAlpha(baseColor, 0),
    // Selection colors
    "White Selection": "#FFFFFF",
    "White Selection (standby)": setAlpha("#E6E6E6", 47),
    "Selection": setAlpha(baseColor, 40),
    "Standby selection": setAlpha(baseColor, 20),
    // Panel strokes
    "Active Panel stroke": baseColor,
    "Selected Panel stroke": baseColor,
    "Rubber highlight button stroke": baseColor,
    // Other accent uses
    "Current Atom Value Color": baseColor,
    "Selected matrix slot color": baseColor,
    "Onset Marker Color": baseColor,
    "Record text color": baseColor,
    "Number field bar background": baseColor,
  };
}

/**
 * Derive all colors for the secondary accent (automation) bundle
 */
export function deriveSecondaryAccent(baseColor: string): Record<string, string> {
  return {
    "Automation Color": baseColor,
    "Track Automation Color": baseColor,
    "Track Automation Button Color": baseColor,
    "Clip Automation Color": lighten(baseColor, 10),
    "Clip Automation Button Color": darken(baseColor, 10),
    "Arranger Automation Curve Fill Color": setAlpha(baseColor, 0),
    "Automation button glow color": setAlpha(baseColor, 25),
    "Automation Chooser Background": setAlpha(baseColor, 0),
    "User Automation Override Color": mix(baseColor, "#00FF00", 50),
    "Dark offset for automation/channel bar": setAlpha("#000000", 20),
    "Light offset for automation/channel bar": setAlpha("#FFFFFF", 30),
  };
}

/**
 * Derive knob colors in 3D embossed style
 */
export function deriveKnob3D(baseColor: string): Record<string, string> {
  return {
    "Knob Body": baseColor,
    "Knob Body Lighter": lighten(baseColor, 10),
    "Knob Body Lightest": lighten(baseColor, 20),
    "Knob Body Darkest": darken(baseColor, 15),
    "Knob Emboss Highlight": setAlpha("#FFFFFF", 25),
    "Knob Emboss Shadow": setAlpha("#000000", 50),
    "Knob Stroke": darken(baseColor, 20),
    "Knob Line": "#FFFFFF",
    "Knob Line Dark": "#FFFFFF",
    "Knob Value Background": baseColor,
    "Knob Value Background (dark)": darken(baseColor, 5),
    "Emboss Highlight": setAlpha("#FFFFFF", 6),
    "Emboss Shadow": setAlpha("#000000", 12),
    "Slider background": setAlpha(baseColor, 0),
  };
}

/**
 * Derive knob colors in flat modern style
 */
export function deriveKnobFlat(baseColor: string): Record<string, string> {
  return {
    "Knob Body": baseColor,
    "Knob Body Lighter": baseColor,
    "Knob Body Lightest": baseColor,
    "Knob Body Darkest": baseColor,
    "Knob Emboss Highlight": "#00000000",
    "Knob Emboss Shadow": "#00000000",
    "Knob Stroke": darken(baseColor, 10),
    "Knob Line": "#FFFFFF",
    "Knob Line Dark": "#FFFFFF",
    "Knob Value Background": baseColor,
    "Knob Value Background (dark)": baseColor,
    "Emboss Highlight": "#00000000",
    "Emboss Shadow": "#00000000",
    "Slider background": setAlpha(baseColor, 0),
  };
}

/**
 * Derive meter colors in traditional green/yellow/red style
 */
export function deriveMetersTraditional(_baseColor: string): Record<string, string> {
  // baseColor is ignored for traditional style - we use standard colors
  return {
    "Meter Normal": "#57E389",
    "Meter Yellow": "#F9F06B",
    "Meter Red": "#F66151",
    "Meter Clipping": "#ED333B",
    "Meter Muted": "#979797",
    "Meter Gain Reduction": "#5386B6",
    "Meter Hitech": "#3EBAFF",
    "Meter Hitech Background": setAlpha("#3EBAFF", 8),
    "Led Off": "#545454",
    "Hitech background": "#0A0608",
    "Unselected Filled Automation Type Icon": "#969696",
    "Unselected Empty Automation Type Icon": "#969696",
  };
}

/**
 * Derive meter colors using the accent color
 */
export function deriveMetersThemed(accentColor: string): Record<string, string> {
  return {
    "Meter Normal": accentColor,
    "Meter Yellow": "#F9F06B",
    "Meter Red": "#F66151",
    "Meter Clipping": "#ED333B",
    "Meter Muted": desaturate(accentColor, 60),
    "Meter Gain Reduction": mix(accentColor, "#5386B6", 30),
    "Meter Hitech": accentColor,
    "Meter Hitech Background": setAlpha(accentColor, 8),
    "Led Off": desaturate(darken(accentColor, 30), 50),
    "Hitech background": "#0A0608",
    "Unselected Filled Automation Type Icon": "#969696",
    "Unselected Empty Automation Type Icon": "#969696",
  };
}

/**
 * Derive surface colors (buttons, menus, tooltips)
 */
export function deriveSurfaceColors(baseColor: string): Record<string, string> {
  return {
    "Button background": baseColor,
    "Button stroke": setAlpha(darken(baseColor, 30), 13),
    "Pressed button background": setAlpha(darken(baseColor, 10), 50),
    "Button in tree background": lighten(baseColor, 5),
    "OK Button background": lighten(baseColor, 15),
    "View button background": setAlpha(baseColor, 0),
    "Pressed view button background": darken(baseColor, 5),
    "Abstract Button Unselected Background": darken(baseColor, 15),
    "Abstract Button Selected Background": lighten(baseColor, 5),
    "Abstract Button Pressed Background": darken(baseColor, 5),
    "Abstract Button Stroke": setAlpha(lighten(baseColor, 20), 0),
    "Checkbox background": setAlpha(baseColor, 50),
    "Close button mouse over background": setAlpha("#000000", 35),
    "Close button pressed background": setAlpha("#000000", 65),
    "Inverted Selected Borderless Button background": lighten(baseColor, 20),
    "Rubber button stroke": darken(baseColor, 20),
    "Notification Button Background": setAlpha("#000000", 50),
    "Pressed borderless button background": "#00000000",
    "Selected borderless button background": "#00000000",
    "Color bar button fill color": setAlpha("#000000", 24),
    "Menu background": baseColor,
    "Menu stroke": setAlpha(lighten(baseColor, 10), 0),
    "Menu separator": lighten(baseColor, 30),
    "Tooltip Background": lighten(baseColor, 10),
    "Tooltip Stroke": setAlpha(lighten(baseColor, 30), 0),
    "Light Tooltip Background": "#D7D7D7",
    "Timeline Header Tooltip Background": setAlpha(baseColor, 78),
    "Timeline Tooltip Background": setAlpha(lighten(baseColor, 40), 78),
    "Notification Background": "#FFFFFF",
    "Notification Normal": "#000000",
    "Notification Error": "#F66151",
    "Popup Notification Background": setAlpha("#000000", 71),
    "Popup insert": lighten(baseColor, 25),
    "Popup overlay background color": setAlpha(baseColor, 86),
    "Invoke Action Background": "#D8D8D8",
    "Invoke Action Category": "#000000",
  };
}

/**
 * Derive timeline background colors
 */
export function deriveTimelineColors(baseColor: string): Record<string, string> {
  const color = parseHex(baseColor);
  if (!color) return {};

  const { h, s } = rgbToHsl(color.r, color.g, color.b);

  // Create a set of graduated backgrounds
  const darkestRgb = hslToRgb(h, s, 3);
  const darkRgb = hslToRgb(h, s, 5);
  const mediumRgb = hslToRgb(h, s, 7);
  const lightRgb = hslToRgb(h, s, 10);

  const darkest = toHex(darkestRgb.r, darkestRgb.g, darkestRgb.b);
  const dark = toHex(darkRgb.r, darkRgb.g, darkRgb.b);
  const medium = toHex(mediumRgb.r, mediumRgb.g, mediumRgb.b);
  const light = toHex(lightRgb.r, lightRgb.g, lightRgb.b);

  return {
    "Top Level Timeline Background": dark,
    "Top Level Timeline Header Background": medium,
    "Dark Timeline Background": darkest,
    "Dark Timeline Header Background": dark,
    "Light Timeline Background": medium,
    "Light Timeline Header Background": light,
    "Irrelevant Timeline Background": darken(darkest, 2),
    "Irrelevant Timeline Header Background": darkest,
    "Irrelevant Timeline Overlay": setAlpha("#000000", 25),
    "Irrelevant Timeline Header Overlay": setAlpha("#000000", 25),
    "Timeline Background Pattern": medium,
    "Timeline Header Background Pattern": setAlpha("#FFFFFF", 4),
    "Timeline Primary Grid": setAlpha(lighten(baseColor, 20), 20),
    "Timeline Secondary Grid": setAlpha(lighten(baseColor, 20), 10),
    "Timeline Header Primary Grid": setAlpha(lighten(baseColor, 20), 20),
    "Timeline Header Secondary Grid": setAlpha(lighten(baseColor, 20), 10),
    "Timeline Playhead": "#E8DDD0",
    "Timeline Cue Marker": "#535353",
    "Timeline Header Cue Marker": "#545454",
    "Timeline edit tool chooser background": light,
  };
}

/**
 * Derive selection colors based on accent
 */
export function deriveSelectionColors(accentColor: string): Record<string, string> {
  return {
    "Time Selection Fill": setAlpha(accentColor, 36),
    "Time Selection Stroke": "#F7F7F7",
    "Time Selection Standby Fill": setAlpha("#FFFFFF", 28),
    "Time Selection Standby Stroke": setAlpha("#CECECE", 0),
    "Time Selection Cursor Stroke": "#FFFFFF",
    "Time Selection Standby Cursor Stroke": "#F7F7F7",
    "Time Selection Inactive Fill": setAlpha("#FFFFFF", 6),
    "Time Selection Inactive Stroke": setAlpha("#FFFFFF", 12),
    "Time Selection Not Selected Fill": "#00000000",
    "Time Selection Not Selected Stroke": setAlpha("#CECECE", 0),
    "Time Selection Implicit Fill": "#00000000",
    "Time Selection Across All Lanes Fill": setAlpha(mix(accentColor, "#98C8C8", 50), 78),
    "Time Selection Across All Lanes Stroke": "#F7F7F7",
    "Header Time Selection Fill": setAlpha(accentColor, 78),
    "Header Time Selection Stroke": "#F7F7F7",
    "Header Time Selection Standby Fill": setAlpha("#FFFFFF", 2),
    "Header Time Selection Standby Stroke": "#A7A7A7",
    "Header Time Selection Cursor Stroke": "#DEDEDE",
    "Header Time Selection Standby Cursor Stroke": "#B0B0B0",
    "Header Time Selection Across All Lanes Fill": setAlpha(mix(accentColor, "#98C8C8", 30), 78),
    "Header Time Selection Across All Lanes Stroke": "#DEDEDE",
  };
}

/**
 * Master derivation function that applies the appropriate strategy based on bundle type
 */
export function deriveBundleColors(
  _bundleId: string,
  derivationMode: DerivationMode,
  baseColor: string,
  options?: { knobStyle?: "3d" | "flat"; meterStyle?: "traditional" | "themed"; accentColor?: string }
): Record<string, string> {
  switch (derivationMode) {
    case "graduated-lightness":
      return deriveGreyScale(baseColor);

    case "accent-variants":
      return derivePrimaryAccent(baseColor);

    case "secondary-accent":
      return deriveSecondaryAccent(baseColor);

    case "knob-3d":
      return options?.knobStyle === "flat" ? deriveKnobFlat(baseColor) : deriveKnob3D(baseColor);

    case "knob-flat":
      return deriveKnobFlat(baseColor);

    case "meters-traditional":
      return options?.meterStyle === "themed" && options?.accentColor
        ? deriveMetersThemed(options.accentColor)
        : deriveMetersTraditional(baseColor);

    case "meters-themed":
      return deriveMetersThemed(options?.accentColor || baseColor);

    case "surface-colors":
      return deriveSurfaceColors(baseColor);

    case "timeline-colors":
      return deriveTimelineColors(baseColor);

    case "selection-colors":
      return deriveSelectionColors(options?.accentColor || baseColor);

    case "text-colors":
    case "palette-9":
    case "palette-8":
    case "static":
    case "advanced":
    default:
      // For these modes, use the generic property-based derivation
      return {};
  }
}
