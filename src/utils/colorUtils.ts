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
