// Category metadata for the unified theme editor
// Defines how properties are grouped and how colors derive from base values

import type { BitwigVersion } from './index';

export interface PropertyCategory {
  id: string;
  name: string;
  description: string;
  baseProperty: string; // Key property that defines the group's base color
  icon?: string; // Optional icon identifier
}

// All categories from THEMING_GUIDE.md
export const CATEGORIES: PropertyCategory[] = [
  {
    id: "core-interface",
    name: "Core Interface",
    description: "Window backgrounds, grey scale, and text colors",
    baseProperty: "Window background",
  },
  {
    id: "accents-status",
    name: "Accents & Status",
    description: "Primary accent colors and status indicators",
    baseProperty: "Accent (default)", // Will fall back to "On" for BW5
  },
  {
    id: "buttons",
    name: "Buttons",
    description: "Button backgrounds, borders, and states",
    baseProperty: "Button background",
  },
  {
    id: "knobs-sliders",
    name: "Knobs & Sliders",
    description: "Knob bodies, embossing, and value indicators",
    baseProperty: "Knob Body",
  },
  {
    id: "toggle-icons",
    name: "Toggle Icons",
    description: "Toggle button icon states",
    baseProperty: "Normal Toggle Icon",
  },
  {
    id: "menus-popups",
    name: "Menus & Popups",
    description: "Menu backgrounds, tooltips, and notifications",
    baseProperty: "Menu background",
  },
  {
    id: "leds-meters",
    name: "LEDs & Meters",
    description: "LED states and level meters",
    baseProperty: "Meter Normal",
  },
  {
    id: "scrollbars",
    name: "Scrollbars",
    description: "Classic and modern scrollbar styles",
    baseProperty: "Scrollbar",
  },
  {
    id: "trees-lists",
    name: "Trees & Lists",
    description: "Tree views and list item styling",
    baseProperty: "Tree Item Background",
  },
  {
    id: "panels-separators",
    name: "Panels & Separators",
    description: "Panel bodies, borders, and dividers",
    baseProperty: "Panel body",
  },
  {
    id: "device-chain",
    name: "Device Chain",
    description: "Device headers and style tints",
    baseProperty: "Device Header",
  },
  {
    id: "display-waveforms",
    name: "Display & Waveforms",
    description: "Display backgrounds and waveform colors",
    baseProperty: "Display Background",
  },
  {
    id: "grid-modular",
    name: "Grid & Modular",
    description: "The Grid device and modular environment",
    baseProperty: "The Grid (background)",
  },
  {
    id: "timeline-arranger",
    name: "Timeline & Arranger",
    description: "Timeline backgrounds and grid lines",
    baseProperty: "Top Level Timeline Background",
  },
  {
    id: "time-selection",
    name: "Time Selection",
    description: "Selection fills and strokes",
    baseProperty: "Time Selection Fill",
  },
  {
    id: "loop-regions",
    name: "Loop Regions",
    description: "Loop region styling",
    baseProperty: "Loop Region Fill",
  },
  {
    id: "automation-modulation",
    name: "Automation & Modulation",
    description: "Automation curves and modulation colors",
    baseProperty: "Automation Color",
  },
  {
    id: "modulation-mapping",
    name: "Modulation Mapping",
    description: "Modulation mapping indicators",
    baseProperty: "Modulation Mapping Color",
  },
  {
    id: "record-transport",
    name: "Record & Transport",
    description: "Record and monitoring buttons",
    baseProperty: "Record button color",
  },
  {
    id: "markers-detection",
    name: "Markers & Detection",
    description: "Beat and onset markers",
    baseProperty: "Beat Marker Color",
  },
  {
    id: "file-status",
    name: "File Status",
    description: "Missing, found, and external file indicators",
    baseProperty: "Missing file icon",
  },
  {
    id: "command-palette",
    name: "Command Palette",
    description: "Invoke action styling",
    baseProperty: "Invoke Action Background",
  },
  {
    id: "panel-colors",
    name: "Panel Colors",
    description: "Track and clip color palette",
    baseProperty: "Panel Blue",
  },
  {
    id: "branding",
    name: "Branding",
    description: "Bitwig brand colors",
    baseProperty: "Bitwig Red",
  },
  {
    id: "misc",
    name: "Miscellaneous",
    description: "Progress bars, links, and other elements",
    baseProperty: "Progress bar",
  },
];

// Get category by ID
export function getCategoryById(id: string): PropertyCategory | undefined {
  return CATEGORIES.find(c => c.id === id);
}

// Get base property key for a category, handling version differences
export function getCategoryBaseProperty(categoryId: string, version: BitwigVersion): string {
  const category = getCategoryById(categoryId);
  if (!category) return "";

  // Handle version-specific base properties
  if (categoryId === "accents-status") {
    return version === "5" ? "On" : "Accent (default)";
  }

  return category.baseProperty;
}

// Category display order (matches THEMING_GUIDE.md structure)
export const CATEGORY_ORDER = CATEGORIES.map(c => c.id);

// High-impact categories that should be shown first/prominently
export const HIGH_IMPACT_CATEGORIES = [
  "core-interface",
  "accents-status",
  "buttons",
  "knobs-sliders",
  "leds-meters",
  "timeline-arranger",
];
