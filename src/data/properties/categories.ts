// Semantic bundle definitions for the unified theme editor
// Bundles properties by PURPOSE rather than UI element type
// Based on THEMING_GUIDE.md's "Core Techniques from Community Themes"

import type { BitwigVersion } from './index';

export type DerivationMode =
  | "graduated-lightness"  // Grey scale - creates steps from dark to light
  | "accent-variants"      // Primary accent with pressed/subtle/standby variants
  | "secondary-accent"     // Automation colors - single color with alpha variants
  | "knob-3d"             // 3D embossed knob styling
  | "knob-flat"           // Flat modern knob styling
  | "meters-traditional"  // Green/yellow/red meter colors
  | "meters-themed"       // Use accent for meter normal
  | "text-colors"         // Text colors derived from white/black
  | "surface-colors"      // Surfaces derived from grey scale
  | "timeline-colors"     // Timeline backgrounds from grey scale
  | "selection-colors"    // Selections based on accent with alpha
  | "palette-9"           // 9-color panel palette
  | "palette-8"           // 8-color mapping palette
  | "static"              // No derivation - keep as-is (warnings, branding)
  | "advanced";           // Everything else - derived from greys/accent

export interface SemanticBundle {
  id: string;
  name: string;
  description: string;
  baseProperty: string;       // Key property that defines the bundle's base color
  properties: string[];       // All properties in this bundle
  derivationMode: DerivationMode;
  modeToggle?: {
    modes: { id: string; name: string; description: string }[];
    defaultMode: string;
  };
}

// Semantic bundles based on THEMING_GUIDE.md best practices
// ORDERED BY VISUAL PROMINENCE: most area-covering first
export const SEMANTIC_BUNDLES: SemanticBundle[] = [
  // === 1. Text Colors (appears everywhere) ===
  {
    id: "text-colors",
    name: "Text Colors",
    description: "All text readability - light on dark, dark on light",
    baseProperty: "Light Text",
    derivationMode: "text-colors",
    properties: [
      "Default text",
      "Text",
      "Light Text",
      "Dark Text",
      "Lighter Text",
      "Medium Light Text",
      "Subtle Light Text",
      "Subtler Light Text",
      "Subtle Dark Text",
      "Menu text",
      "Menu description text",
      "Menu Icon",
      "Dark tree text",
      "Dark tree text (selected)",
      "Hitcount text color",
      "Timeline Header Tooltip Text",
      "Timeline Tooltip Text",
      "Error Text",
      "User input text",
      "Invoke Action Text",
      "Missing file text",
      "Found file text",
      "External file text",
    ],
  },

  // === 2. Grey Scale Foundation (background of everything) ===
  {
    id: "grey-scale",
    name: "Grey Scale",
    description: "Background tones - the foundation of your entire theme",
    baseProperty: "Window background",
    derivationMode: "graduated-lightness",
    properties: [
      "Window background",
      "Grey 0",
      "Grey 1",
      "Grey 2",
      "Grey 3",
      "Grey 4",
      "Grey 5",
      "Grey 6",
      "Grey Display Background",
      "Black",
      "Brighter",
    ],
  },

  // === 3. Surface Colors (buttons, panels, menus - very common) ===
  {
    id: "surface-colors",
    name: "Surface Colors",
    description: "UI surfaces - buttons, panels, menus (derived from grey scale)",
    baseProperty: "Button background",
    derivationMode: "surface-colors",
    properties: [
      // Buttons
      "Button background",
      "Button stroke",
      "Pressed button background",
      "Button in tree background",
      "OK Button background",
      "View button background",
      "Pressed view button background",
      "Abstract Button Unselected Background",
      "Abstract Button Selected Background",
      "Abstract Button Pressed Background",
      "Abstract Button Stroke",
      "Checkbox background",
      "Close button mouse over background",
      "Close button pressed background",
      "Inverted Selected Borderless Button background",
      "Rubber button stroke",
      "Notification Button Background",
      "Pressed borderless button background",
      "Selected borderless button background",
      "Color bar button fill color",
      // Menus
      "Menu background",
      "Menu stroke",
      "Menu separator",
      // Tooltips
      "Tooltip Background",
      "Tooltip Stroke",
      "Light Tooltip Background",
      "Timeline Header Tooltip Background",
      "Timeline Tooltip Background",
      // Notifications
      "Notification Background",
      "Notification Normal",
      "Notification Error",
      "Popup Notification Background",
      "Popup insert",
      "Popup overlay background color",
      // Invoke/Command palette
      "Invoke Action Background",
      "Invoke Action Category",
    ],
  },

  // === 4. Primary Accent ===
  {
    id: "primary-accent",
    name: "Primary Accent",
    description: "THE accent color - toggles, knobs, selection. Apply consistently!",
    baseProperty: "Accent (default)",
    derivationMode: "accent-variants",
    properties: [
      // Main accent colors
      "Accent",
      "Accent (default)",
      "On",
      "On (subtle)",
      "On (subtler)",
      "Pressed On",
      "Hitech on",
      "Accent (hitech)",
      // Cross-category properties that use accent
      "Knob Value Color",
      "Led On",
      "Progress bar",
      "Link Text",
      "Link Text Rollover",
      // Selection colors
      "White Selection",
      "White Selection (standby)",
      "Selection",
      "Standby selection",
      // Panel strokes that highlight selection
      "Active Panel stroke",
      "Selected Panel stroke",
      "Rubber highlight button stroke",
      // Other accent uses
      "Current Atom Value Color",
      "Selected matrix slot color",
      "Onset Marker Color",
      "Record text color",
      "Number field bar background",
    ],
  },

  // === 4. Secondary Accent (Automation) ===
  {
    id: "secondary-accent",
    name: "Secondary Accent (Automation)",
    description: "Automation/modulation colors - can be complementary to primary",
    baseProperty: "Automation Color",
    derivationMode: "secondary-accent",
    properties: [
      "Automation Color",
      "Track Automation Color",
      "Track Automation Button Color",
      "Clip Automation Color",
      "Clip Automation Button Color",
      "Arranger Automation Curve Fill Color",
      "Automation button glow color",
      "Automation Chooser Background",
      "User Automation Override Color",
      "Dark offset for automation/channel bar",
      "Light offset for automation/channel bar",
    ],
  },

  // === 5. Knob Styling ===
  {
    id: "knob-styling",
    name: "Knob Styling",
    description: "Knob appearance - 3D embossed or flat modern look",
    baseProperty: "Knob Body",
    derivationMode: "knob-3d",
    modeToggle: {
      modes: [
        { id: "3d", name: "3D Embossed", description: "Classic embossed look with highlights and shadows" },
        { id: "flat", name: "Flat Modern", description: "Clean flat look, all body colors the same" },
      ],
      defaultMode: "3d",
    },
    properties: [
      "Knob Body",
      "Knob Body Lighter",
      "Knob Body Lightest",
      "Knob Body Darkest",
      "Knob Emboss Highlight",
      "Knob Emboss Shadow",
      "Knob Stroke",
      "Knob Line",
      "Knob Line Dark",
      "Knob Value Background",
      "Knob Value Background (dark)",
      "Emboss Highlight",
      "Emboss Shadow",
      "Slider background",
    ],
  },

  // === 6. Meters & LEDs ===
  {
    id: "meters-leds",
    name: "Meters & LEDs",
    description: "Level indicators - traditional (green/yellow/red) or themed",
    baseProperty: "Meter Normal",
    derivationMode: "meters-traditional",
    modeToggle: {
      modes: [
        { id: "traditional", name: "Traditional", description: "Classic green/yellow/red level meters" },
        { id: "themed", name: "Themed", description: "Use your accent color for normal level" },
      ],
      defaultMode: "traditional",
    },
    properties: [
      "Meter Normal",
      "Meter Yellow",
      "Meter Red",
      "Meter Clipping",
      "Meter Muted",
      "Meter Gain Reduction",
      "Meter Hitech",
      "Meter Hitech Background",
      "Led Off",
      "Hitech background",
      "Unselected Filled Automation Type Icon",
      "Unselected Empty Automation Type Icon",
    ],
  },

  // === 5. Panels & Separators ===
  {
    id: "panels-separators",
    name: "Panels & Separators",
    description: "Panel bodies, borders, and dividers",
    baseProperty: "Panel body",
    derivationMode: "surface-colors",
    properties: [
      "Panel body",
      "Panel stroke",
      "Panel Stroke (focused)",
      "Selected Panel body",
      "Selected Panel stroke (standby)",
      "Selected Panel stroke standby",
      "Content Background",
      "Field Background",
      "Field background",
      "Dark Panel Sub-frame Fill",
      "Dark Panel Sub-frame Stroke",
      "Dark Separator Line",
      "Light Separator Line",
      "Inspector Section Frame",
      "Icon Frame",
      "Color of stroke between tabs",
      "Color of unselected tabs",
    ],
  },

  // === 9. Timeline Backgrounds ===
  {
    id: "timeline-backgrounds",
    name: "Timeline Backgrounds",
    description: "Arranger/clip lane backgrounds",
    baseProperty: "Top Level Timeline Background",
    derivationMode: "timeline-colors",
    properties: [
      "Top Level Timeline Background",
      "Top Level Timeline Header Background",
      "Dark Timeline Background",
      "Dark Timeline Header Background",
      "Light Timeline Background",
      "Light Timeline Header Background",
      "Irrelevant Timeline Background",
      "Irrelevant Timeline Header Background",
      "Irrelevant Timeline Overlay",
      "Irrelevant Timeline Header Overlay",
      "Timeline Background Pattern",
      "Timeline Header Background Pattern",
      "Timeline Primary Grid",
      "Timeline Secondary Grid",
      "Timeline Header Primary Grid",
      "Timeline Header Secondary Grid",
      "Timeline Playhead",
      "Timeline Cue Marker",
      "Timeline Header Cue Marker",
      "Timeline edit tool chooser background",
    ],
  },

  // === 10. Selection Colors ===
  {
    id: "selection-colors",
    name: "Selection Colors",
    description: "Time/object selection fills and strokes",
    baseProperty: "Time Selection Fill",
    derivationMode: "selection-colors",
    properties: [
      "Time Selection Fill",
      "Time Selection Stroke",
      "Time Selection Standby Fill",
      "Time Selection Standby Stroke",
      "Time Selection Cursor Stroke",
      "Time Selection Standby Cursor Stroke",
      "Time Selection Inactive Fill",
      "Time Selection Inactive Stroke",
      "Time Selection Not Selected Fill",
      "Time Selection Not Selected Stroke",
      "Time Selection Implicit Fill",
      "Time Selection Across All Lanes Fill",
      "Time Selection Across All Lanes Stroke",
      "Header Time Selection Fill",
      "Header Time Selection Stroke",
      "Header Time Selection Standby Fill",
      "Header Time Selection Standby Stroke",
      "Header Time Selection Cursor Stroke",
      "Header Time Selection Standby Cursor Stroke",
      "Header Time Selection Across All Lanes Fill",
      "Header Time Selection Across All Lanes Stroke",
    ],
  },

  // === 11. Record & Warnings ===
  {
    id: "record-warnings",
    name: "Record & Warnings",
    description: "Semantic reds/warnings - usually kept standard",
    baseProperty: "Record button color",
    derivationMode: "static",
    properties: [
      "Record button color",
      "Record button color implicit",
      "Record button glow color",
      "Monitoring buttons color",
      "Warning",
      "Activation Red",
      "Activation Green",
      "Activation Yellow",
      "color implicit",
    ],
  },

  // === 12. Panel Colors (9-color palette) ===
  {
    id: "panel-colors",
    name: "Panel Colors",
    description: "9-color track and clip palette",
    baseProperty: "Panel Blue",
    derivationMode: "palette-9",
    properties: [
      "Panel Red",
      "Panel Orange",
      "Panel Yellow",
      "Panel Lime",
      "Panel Green",
      "Panel Mint",
      "Panel Turquoise",
      "Panel Blue",
      "Panel Purple",
    ],
  },

  // === 13. Mapping Colors (8-color palette) ===
  {
    id: "mapping-colors",
    name: "Mapping Colors",
    description: "8-color modulation mapping slot indicators",
    baseProperty: "Mapping indication 1",
    derivationMode: "palette-8",
    properties: [
      "Mapping indication 1",
      "Mapping indication 2",
      "Mapping indication 3",
      "Mapping indication 4",
      "Mapping indication 5",
      "Mapping indication 6",
      "Mapping indication 7",
      "Mapping indication 8",
      "Mapping",
      "Modulation Mapping Color",
      "Modulation Mapping Color (polyphonic)",
      "Modulation Mapping Color (subtractive)",
      "Modulation Mapping Background Color",
      "Modulation Mapping Background (monophonic)",
      "Modulation Mapping Background (polyphonic)",
      "Launcher Mapping Indication",
      "Add Modulation Button Color",
      "Multiply Modulation Button Color",
      "Clip Modulation Color",
      "Note Expression Color",
      "Send (post) value color",
      "Send (pre) value color",
    ],
  },

  // === 14. Display & Waveforms ===
  {
    id: "display-waveforms",
    name: "Display & Waveforms",
    description: "Display backgrounds and waveform colors",
    baseProperty: "Display Background",
    derivationMode: "surface-colors",
    properties: [
      "Display Background",
      "Display Background (error)",
      "Display Stroke",
      "Display Waveform",
      "Display Loop Markers",
      "Display Start/End Markers",
      "Audio Event Background",
      "Audio Event Boundary",
      "Audio Event Waveform",
    ],
  },

  // === 15. Loop Regions ===
  {
    id: "loop-regions",
    name: "Loop Regions",
    description: "Loop region styling",
    baseProperty: "Loop Region Fill",
    derivationMode: "surface-colors",
    properties: [
      "Loop Region Fill",
      "Loop Region Stroke",
      "Loop Region Selected Fill",
      "Loop Region Selected Stroke",
      "Loop Region Background",
      "Header Loop Region Background",
      "Insert preview time",
    ],
  },

  // === 16. Markers & Detection ===
  {
    id: "markers-detection",
    name: "Markers & Detection",
    description: "Beat and onset markers",
    baseProperty: "Beat Marker Color",
    derivationMode: "static",
    properties: [
      "Beat Marker Color",
      "Analyzed Beat Color",
      "Onset Color Min",
      "Onset Color Max",
    ],
  },

  // === 17. Toggle Icons ===
  {
    id: "toggle-icons",
    name: "Toggle Icons",
    description: "Toggle button icon states",
    baseProperty: "Normal Toggle Icon",
    derivationMode: "surface-colors",
    properties: [
      "Toggle Icon",
      "Normal Toggle Icon",
      "Mouse Over Toggle Icon",
      "Pressed Toggle Icon",
      "Active Toggle Icon (Playing)",
      "Normal Inverted Toggle Icon",
      "Mouse Over Inverted Toggle Icon",
      "Pressed Inverted Toggle Icon",
      "Active Inverted Toggle Icon (Playing)",
    ],
  },

  // === 18. Scrollbars ===
  {
    id: "scrollbars",
    name: "Scrollbars",
    description: "Classic and modern scrollbar styles",
    baseProperty: "Scrollbar",
    derivationMode: "surface-colors",
    properties: [
      "Scrollbar",
      "Scrollbar background",
      "Modern Scrollbar Handle (active)",
      "Modern Scrollbar Handle (inactive)",
      "Modern Scrollbar Background (active)",
      "Modern Dark Scrollbar Handle (active)",
      "Modern Dark Scrollbar Handle (inactive)",
    ],
  },

  // === 19. Trees & Lists ===
  {
    id: "trees-lists",
    name: "Trees & Lists",
    description: "Tree views and list item styling",
    baseProperty: "Tree Item Background",
    derivationMode: "surface-colors",
    properties: [
      "Tree Item Background",
      "Tree Separator",
      "List Item Background",
      "List Separator",
      "Selected Tree Item Background",
      "Selected Tree Item Background (standby)",
      "Dark tree background (selected)",
      "Dark tree background (standby selected)",
      "Dark tree hover background change",
      "Dark tree separator",
      "Dark tree selection frame",
      "Frame color of selection cursor in the tree.",
      "Frame color of selection cursor in the tree. (standby)",
      "Selected Dashboard Tree",
    ],
  },

  // === 20. Grid & Modular ===
  {
    id: "grid-modular",
    name: "Grid & Modular",
    description: "The Grid device and modular environment",
    baseProperty: "The Grid (background)",
    derivationMode: "surface-colors",
    properties: [
      "The Grid (background)",
      "The Grid (stroke)",
      "Background color of the modular environment.",
      "Grid Line (Primary)",
      "Grid Line (Secondary)",
      "Polyphonic Desktop Object",
      "Audio connection in modular environment",
      "Audio64 connection in modular environment",
      "Event connection in modular environment",
      "Compressed Audio Port in modular environment",
    ],
  },

  // === 21. Device Chain ===
  {
    id: "device-chain",
    name: "Device Chain",
    description: "Device headers and style tints",
    baseProperty: "Device Header",
    derivationMode: "surface-colors",
    properties: [
      "Device Header",
      "Device Header (selected)",
      "Device Locked Overlay",
      "Device Tint Future",
      "Device Tint Military",
      "Device Tint Retro",
      "Plugin missing",
    ],
  },

  // === 22. File Status ===
  {
    id: "file-status",
    name: "File Status",
    description: "Missing, found, and external file indicators",
    baseProperty: "Missing file icon",
    derivationMode: "static",
    properties: [
      "Missing file icon",
      "Found file icon",
      "External file icon",
    ],
  },

  // === 23. Branding ===
  {
    id: "branding",
    name: "Branding",
    description: "Bitwig brand colors - usually left as defaults",
    baseProperty: "Bitwig Red",
    derivationMode: "static",
    properties: [
      "Bitwig Red",
      "Bitwig CI",
      "Bitwig Mint",
      "Bitwig Producer",
      "Bitwig Essentials",
      "Bitwig 8-Track",
      "Bitwig 16-Track",
    ],
  },

  // === 24. Miscellaneous ===
  {
    id: "miscellaneous",
    name: "Miscellaneous",
    description: "Everything else - holes, shadows, special colors",
    baseProperty: "Shadow",
    derivationMode: "advanced",
    properties: [
      "Shadow",
      "Hole (dark)",
      "Hole (light)",
      "Hole (medium)",
      "White",
      "Transparent",
      "Same as background",
      "Image Source",
      "Gradient",
      "Inherited",
      "Implicit On (subtle)",
      "Drop Indicator",
      "Hitcount background",
      "Progress background",
      "Comp fill",
      "Muted by Audition",
      "(standby)",
    ],
  },
];

// Get bundle by ID
export function getBundleById(id: string): SemanticBundle | undefined {
  return SEMANTIC_BUNDLES.find(b => b.id === id);
}

// Get base property key for a bundle, handling version differences
export function getBundleBaseProperty(bundleId: string, version: BitwigVersion): string {
  const bundle = getBundleById(bundleId);
  if (!bundle) return "";

  // Handle version-specific base properties
  if (bundleId === "primary-accent") {
    return version === "5" ? "On" : "Accent (default)";
  }

  return bundle.baseProperty;
}

// Bundle display order (most important first)
export const BUNDLE_ORDER = SEMANTIC_BUNDLES.map(b => b.id);

// High-impact bundles that should be shown first/prominently
export const HIGH_IMPACT_BUNDLES = [
  "grey-scale",
  "primary-accent",
  "text-colors",
  "knob-styling",
  "meters-leds",
  "surface-colors",
];

// Find which bundle a property belongs to
export function findBundleForProperty(propertyKey: string): SemanticBundle | undefined {
  return SEMANTIC_BUNDLES.find(bundle =>
    bundle.properties.includes(propertyKey)
  );
}

// Legacy exports for backwards compatibility during migration
export const CATEGORIES = SEMANTIC_BUNDLES.map(bundle => ({
  id: bundle.id,
  name: bundle.name,
  description: bundle.description,
  baseProperty: bundle.baseProperty,
}));

export type PropertyCategory = {
  id: string;
  name: string;
  description: string;
  baseProperty: string;
};

export function getCategoryById(id: string): PropertyCategory | undefined {
  const bundle = getBundleById(id);
  if (!bundle) return undefined;
  return {
    id: bundle.id,
    name: bundle.name,
    description: bundle.description,
    baseProperty: bundle.baseProperty,
  };
}

export function getCategoryBaseProperty(categoryId: string, version: BitwigVersion): string {
  return getBundleBaseProperty(categoryId, version);
}

export const CATEGORY_ORDER = BUNDLE_ORDER;
export const HIGH_IMPACT_CATEGORIES = HIGH_IMPACT_BUNDLES;
