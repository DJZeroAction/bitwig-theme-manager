// Property definitions for Bitwig themes
// Auto-generated from community theme analysis
// BW5: 272 properties, BW6: 318 properties

export type BitwigVersion = "5" | "6";

export interface PropertyDefinition {
  key: string;
  category: string;
  defaultValue: string;
  bitwigVersions: BitwigVersion[];
  description?: string;
}

export const PROPERTY_DEFINITIONS: PropertyDefinition[] = [
  // === GREY SCALE ===
  { key: "Window background", category: "grey-scale", defaultValue: "#0e0f11", bitwigVersions: ["5", "6"] },
  { key: "Grey 0", category: "grey-scale", defaultValue: "#181a1e", bitwigVersions: ["5", "6"] },
  { key: "Grey 1", category: "grey-scale", defaultValue: "#181a1e", bitwigVersions: ["5", "6"] },
  { key: "Grey 2", category: "grey-scale", defaultValue: "#1f2228", bitwigVersions: ["5", "6"] },
  { key: "Grey 3", category: "grey-scale", defaultValue: "#24272E", bitwigVersions: ["5", "6"] },
  { key: "Grey 4", category: "grey-scale", defaultValue: "#24272E", bitwigVersions: ["5", "6"] },
  { key: "Grey 5", category: "grey-scale", defaultValue: "#2f3239", bitwigVersions: ["5", "6"] },
  { key: "Grey 6", category: "grey-scale", defaultValue: "#ddddff33", bitwigVersions: ["5", "6"] },
  { key: "Grey Display Background", category: "grey-scale", defaultValue: "#1d1d1d64", bitwigVersions: ["5", "6"] },
  { key: "Black", category: "grey-scale", defaultValue: "#000000", bitwigVersions: ["6"] },
  { key: "Brighter", category: "grey-scale", defaultValue: "#6a6a6a", bitwigVersions: ["5", "6"] },

  // === TEXT COLORS ===
  { key: "Default text", category: "text-colors", defaultValue: "#000000", bitwigVersions: ["5", "6"] },
  { key: "Text", category: "text-colors", defaultValue: "#000000", bitwigVersions: ["6"] },
  { key: "Light Text", category: "text-colors", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "Dark Text", category: "text-colors", defaultValue: "#000000", bitwigVersions: ["5", "6"] },
  { key: "Lighter Text", category: "text-colors", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "Medium Light Text", category: "text-colors", defaultValue: "#ffffffb4", bitwigVersions: ["5", "6"] },
  { key: "Subtle Light Text", category: "text-colors", defaultValue: "#ffffff78", bitwigVersions: ["5", "6"] },
  { key: "Subtler Light Text", category: "text-colors", defaultValue: "#ffffff3c", bitwigVersions: ["5", "6"] },
  { key: "Subtle Dark Text", category: "text-colors", defaultValue: "#444444", bitwigVersions: ["5", "6"] },
  { key: "Menu text", category: "text-colors", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "Menu description text", category: "text-colors", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "Menu Icon", category: "text-colors", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "Dark tree text", category: "text-colors", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "Dark tree text (selected)", category: "text-colors", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "Hitcount text color", category: "text-colors", defaultValue: "#ffffff7f", bitwigVersions: ["5", "6"] },
  { key: "Timeline Header Tooltip Text", category: "text-colors", defaultValue: "#aaaaaa", bitwigVersions: ["5", "6"] },
  { key: "Timeline Tooltip Text", category: "text-colors", defaultValue: "#2a2a2a", bitwigVersions: ["5", "6"] },
  { key: "Error Text", category: "text-colors", defaultValue: "#ff3232c8", bitwigVersions: ["5", "6"] },
  { key: "User input text", category: "text-colors", defaultValue: "#ff8200", bitwigVersions: ["6"] },
  { key: "Invoke Action Text", category: "text-colors", defaultValue: "#000000", bitwigVersions: ["6"] },
  { key: "Missing file text", category: "text-colors", defaultValue: "#595959", bitwigVersions: ["6"] },
  { key: "Found file text", category: "text-colors", defaultValue: "#d6b200", bitwigVersions: ["6"] },
  { key: "External file text", category: "text-colors", defaultValue: "#d6b200", bitwigVersions: ["6"] },

  // === PRIMARY ACCENT ===
  { key: "Accent", category: "primary-accent", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Accent (default)", category: "primary-accent", defaultValue: "#FFAB7A", bitwigVersions: ["5", "6"] },
  { key: "On", category: "primary-accent", defaultValue: "#ff8713", bitwigVersions: ["5"] },
  { key: "On (subtle)", category: "primary-accent", defaultValue: "#FF004044", bitwigVersions: ["5", "6"] },
  { key: "On (subtler)", category: "primary-accent", defaultValue: "#FF004022", bitwigVersions: ["5", "6"] },
  { key: "Pressed On", category: "primary-accent", defaultValue: "#CC0033", bitwigVersions: ["5", "6"] },
  { key: "Hitech on", category: "primary-accent", defaultValue: "#FF0040", bitwigVersions: ["5", "6"] },
  { key: "Accent (hitech)", category: "primary-accent", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "Knob Value Color", category: "primary-accent", defaultValue: "#ff7d0f", bitwigVersions: ["5", "6"] },
  { key: "Led On", category: "primary-accent", defaultValue: "#ed333b", bitwigVersions: ["5", "6"] },
  { key: "Progress bar", category: "primary-accent", defaultValue: "#5cbcff", bitwigVersions: ["5", "6"] },
  { key: "Link Text", category: "primary-accent", defaultValue: "#FF596E", bitwigVersions: ["5", "6"] },
  { key: "Link Text Rollover", category: "primary-accent", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "White Selection", category: "primary-accent", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "White Selection (standby)", category: "primary-accent", defaultValue: "#e6e6e678", bitwigVersions: ["5", "6"] },
  { key: "Selection", category: "primary-accent", defaultValue: "#FF004066", bitwigVersions: ["5", "6"] },
  { key: "Standby selection", category: "primary-accent", defaultValue: "#FF004033", bitwigVersions: ["5", "6"] },
  { key: "Active Panel stroke", category: "primary-accent", defaultValue: "#FF0040", bitwigVersions: ["5", "6"] },
  { key: "Selected Panel stroke", category: "primary-accent", defaultValue: "#FF0040", bitwigVersions: ["5", "6"] },
  { key: "Rubber highlight button stroke", category: "primary-accent", defaultValue: "#FF0040", bitwigVersions: ["5", "6"] },
  { key: "Current Atom Value Color", category: "primary-accent", defaultValue: "#FF0040", bitwigVersions: ["5", "6"] },
  { key: "Selected matrix slot color", category: "primary-accent", defaultValue: "#FF0040", bitwigVersions: ["5", "6"] },
  { key: "Onset Marker Color", category: "primary-accent", defaultValue: "#FF0040", bitwigVersions: ["5", "6"] },
  { key: "Record text color", category: "primary-accent", defaultValue: "#FF0040", bitwigVersions: ["6"] },
  { key: "Number field bar background", category: "primary-accent", defaultValue: "#e57e0e", bitwigVersions: ["5", "6"] },

  // === SECONDARY ACCENT (AUTOMATION) ===
  { key: "Automation Color", category: "secondary-accent", defaultValue: "#c8c8c8", bitwigVersions: ["5", "6"] },
  { key: "Track Automation Color", category: "secondary-accent", defaultValue: "#FF0040", bitwigVersions: ["5", "6"] },
  { key: "Track Automation Button Color", category: "secondary-accent", defaultValue: "#4f9ddb", bitwigVersions: ["5", "6"] },
  { key: "Clip Automation Color", category: "secondary-accent", defaultValue: "#FF3366", bitwigVersions: ["5", "6"] },
  { key: "Clip Automation Button Color", category: "secondary-accent", defaultValue: "#d93232", bitwigVersions: ["5"] },
  { key: "Arranger Automation Curve Fill Color", category: "secondary-accent", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Automation button glow color", category: "secondary-accent", defaultValue: "#93ff9240", bitwigVersions: ["5", "6"] },
  { key: "Automation Chooser Background", category: "secondary-accent", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "User Automation Override Color", category: "secondary-accent", defaultValue: "#27d927", bitwigVersions: ["5", "6"] },
  { key: "Dark offset for automation/channel bar", category: "secondary-accent", defaultValue: "#00000033", bitwigVersions: ["5", "6"] },
  { key: "Light offset for automation/channel bar", category: "secondary-accent", defaultValue: "#ffffff4c", bitwigVersions: ["5", "6"] },

  // === KNOB STYLING ===
  { key: "Knob Body", category: "knob-styling", defaultValue: "#1f2228", bitwigVersions: ["6"] },
  { key: "Knob Body Lighter", category: "knob-styling", defaultValue: "#1f2228", bitwigVersions: ["5", "6"] },
  { key: "Knob Body Lightest", category: "knob-styling", defaultValue: "#1f2228", bitwigVersions: ["5", "6"] },
  { key: "Knob Body Darkest", category: "knob-styling", defaultValue: "#1f2228", bitwigVersions: ["5", "6"] },
  { key: "Knob Emboss Highlight", category: "knob-styling", defaultValue: "#3D3D3F00", bitwigVersions: ["5", "6"] },
  { key: "Knob Emboss Shadow", category: "knob-styling", defaultValue: "#00000000", bitwigVersions: ["5", "6"] },
  { key: "Knob Stroke", category: "knob-styling", defaultValue: "#3f4248", bitwigVersions: ["5", "6"] },
  { key: "Knob Line", category: "knob-styling", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "Knob Line Dark", category: "knob-styling", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "Knob Value Background", category: "knob-styling", defaultValue: "#1f2228", bitwigVersions: ["6"] },
  { key: "Knob Value Background (dark)", category: "knob-styling", defaultValue: "#1f2228", bitwigVersions: ["6"] },
  { key: "Emboss Highlight", category: "knob-styling", defaultValue: "#E8DDD010", bitwigVersions: ["5", "6"] },
  { key: "Emboss Shadow", category: "knob-styling", defaultValue: "#00000020", bitwigVersions: ["5", "6"] },
  { key: "Slider background", category: "knob-styling", defaultValue: "#00000000", bitwigVersions: ["6"] },

  // === METERS & LEDS ===
  { key: "Meter Normal", category: "meters-leds", defaultValue: "#57e389", bitwigVersions: ["5", "6"] },
  { key: "Meter Yellow", category: "meters-leds", defaultValue: "#f9f06b", bitwigVersions: ["5", "6"] },
  { key: "Meter Red", category: "meters-leds", defaultValue: "#f66151", bitwigVersions: ["5", "6"] },
  { key: "Meter Clipping", category: "meters-leds", defaultValue: "#ed333b", bitwigVersions: ["5", "6"] },
  { key: "Meter Muted", category: "meters-leds", defaultValue: "#979797", bitwigVersions: ["5", "6"] },
  { key: "Meter Gain Reduction", category: "meters-leds", defaultValue: "#5386b6", bitwigVersions: ["5", "6"] },
  { key: "Meter Hitech", category: "meters-leds", defaultValue: "#3ebaff", bitwigVersions: ["5", "6"] },
  { key: "Meter Hitech Background", category: "meters-leds", defaultValue: "#3ebaff14", bitwigVersions: ["5", "6"] },
  { key: "Led Off", category: "meters-leds", defaultValue: "#545454", bitwigVersions: ["5", "6"] },
  { key: "Hitech background", category: "meters-leds", defaultValue: "#0A0608", bitwigVersions: ["5", "6"] },
  { key: "Unselected Filled Automation Type Icon", category: "meters-leds", defaultValue: "#969696", bitwigVersions: ["6"] },
  { key: "Unselected Empty Automation Type Icon", category: "meters-leds", defaultValue: "#969696", bitwigVersions: ["6"] },

  // === SURFACE COLORS ===
  { key: "Button background", category: "surface-colors", defaultValue: "#42464F", bitwigVersions: ["5", "6"] },
  { key: "Button stroke", category: "surface-colors", defaultValue: "#00000022", bitwigVersions: ["5", "6"] },
  { key: "Pressed button background", category: "surface-colors", defaultValue: "#50505080", bitwigVersions: ["5", "6"] },
  { key: "Button in tree background", category: "surface-colors", defaultValue: "#505050", bitwigVersions: ["5", "6"] },
  { key: "OK Button background", category: "surface-colors", defaultValue: "#787878", bitwigVersions: ["5", "6"] },
  { key: "View button background", category: "surface-colors", defaultValue: "#2e2e2e00", bitwigVersions: ["5", "6"] },
  { key: "Pressed view button background", category: "surface-colors", defaultValue: "#353739", bitwigVersions: ["5", "6"] },
  { key: "Abstract Button Unselected Background", category: "surface-colors", defaultValue: "#1e2024", bitwigVersions: ["5", "6"] },
  { key: "Abstract Button Selected Background", category: "surface-colors", defaultValue: "#3d3f45", bitwigVersions: ["5", "6"] },
  { key: "Abstract Button Pressed Background", category: "surface-colors", defaultValue: "#2e3034", bitwigVersions: ["5", "6"] },
  { key: "Abstract Button Stroke", category: "surface-colors", defaultValue: "#5e5e5e00", bitwigVersions: ["5", "6"] },
  { key: "Checkbox background", category: "surface-colors", defaultValue: "#62626280", bitwigVersions: ["5", "6"] },
  { key: "Close button mouse over background", category: "surface-colors", defaultValue: "#0000005a", bitwigVersions: ["5", "6"] },
  { key: "Close button pressed background", category: "surface-colors", defaultValue: "#000000a6", bitwigVersions: ["5", "6"] },
  { key: "Inverted Selected Borderless Button background", category: "surface-colors", defaultValue: "#767676", bitwigVersions: ["5", "6"] },
  { key: "Rubber button stroke", category: "surface-colors", defaultValue: "#4A2830", bitwigVersions: ["5", "6"] },
  { key: "Notification Button Background", category: "surface-colors", defaultValue: "#0000007f", bitwigVersions: ["6"] },
  { key: "Pressed borderless button background", category: "surface-colors", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Selected borderless button background", category: "surface-colors", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Color bar button fill color", category: "surface-colors", defaultValue: "#0000003c", bitwigVersions: ["6"] },
  { key: "Menu background", category: "surface-colors", defaultValue: "#1f2228", bitwigVersions: ["5", "6"] },
  { key: "Menu stroke", category: "surface-colors", defaultValue: "#27272700", bitwigVersions: ["5", "6"] },
  { key: "Menu separator", category: "surface-colors", defaultValue: "#8c8c8c", bitwigVersions: ["5", "6"] },
  { key: "Tooltip Background", category: "surface-colors", defaultValue: "#393b3f", bitwigVersions: ["5", "6"] },
  { key: "Tooltip Stroke", category: "surface-colors", defaultValue: "#a4a4a400", bitwigVersions: ["5", "6"] },
  { key: "Light Tooltip Background", category: "surface-colors", defaultValue: "#d7d7d7", bitwigVersions: ["5", "6"] },
  { key: "Timeline Header Tooltip Background", category: "surface-colors", defaultValue: "#484848c8", bitwigVersions: ["5", "6"] },
  { key: "Timeline Tooltip Background", category: "surface-colors", defaultValue: "#998e8ec8", bitwigVersions: ["5", "6"] },
  { key: "Notification Background", category: "surface-colors", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "Notification Normal", category: "surface-colors", defaultValue: "#000000", bitwigVersions: ["5", "6"] },
  { key: "Notification Error", category: "surface-colors", defaultValue: "#f66151", bitwigVersions: ["5", "6"] },
  { key: "Popup Notification Background", category: "surface-colors", defaultValue: "#000000b4", bitwigVersions: ["5", "6"] },
  { key: "Popup insert", category: "surface-colors", defaultValue: "#747474", bitwigVersions: ["5", "6"] },
  { key: "Popup overlay background color", category: "surface-colors", defaultValue: "#2e2e2edc", bitwigVersions: ["5", "6"] },
  { key: "Invoke Action Background", category: "surface-colors", defaultValue: "#d8d8d8", bitwigVersions: ["6"] },
  { key: "Invoke Action Category", category: "surface-colors", defaultValue: "#000000", bitwigVersions: ["6"] },

  // === PANELS & SEPARATORS ===
  { key: "Panel body", category: "panels-separators", defaultValue: "#1A1215", bitwigVersions: ["5", "6"] },
  { key: "Panel stroke", category: "panels-separators", defaultValue: "#4A283044", bitwigVersions: ["5", "6"] },
  { key: "Panel Stroke (focused)", category: "panels-separators", defaultValue: "#68686800", bitwigVersions: ["5", "6"] },
  { key: "Selected Panel body", category: "panels-separators", defaultValue: "#221820", bitwigVersions: ["5", "6"] },
  { key: "Selected Panel stroke (standby)", category: "panels-separators", defaultValue: "#4A2830", bitwigVersions: ["5", "6"] },
  { key: "Selected Panel stroke standby", category: "panels-separators", defaultValue: "#8E899460", bitwigVersions: ["6"] },
  { key: "Content Background", category: "panels-separators", defaultValue: "#120D0F", bitwigVersions: ["5", "6"] },
  { key: "Field Background", category: "panels-separators", defaultValue: "#acb0be", bitwigVersions: ["5"] },
  { key: "Field background", category: "panels-separators", defaultValue: "#d1d1d1", bitwigVersions: ["5", "6"] },
  { key: "Dark Panel Sub-frame Fill", category: "panels-separators", defaultValue: "#3f4145", bitwigVersions: ["5", "6"] },
  { key: "Dark Panel Sub-frame Stroke", category: "panels-separators", defaultValue: "#38383800", bitwigVersions: ["5", "6"] },
  { key: "Dark Separator Line", category: "panels-separators", defaultValue: "#0A060880", bitwigVersions: ["5", "6"] },
  { key: "Light Separator Line", category: "panels-separators", defaultValue: "#aaaaaa", bitwigVersions: ["5", "6"] },
  { key: "Inspector Section Frame", category: "panels-separators", defaultValue: "#4A283044", bitwigVersions: ["5", "6"] },
  { key: "Icon Frame", category: "panels-separators", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Color of stroke between tabs", category: "panels-separators", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Color of unselected tabs", category: "panels-separators", defaultValue: "#00000000", bitwigVersions: ["6"] },

  // === TIMELINE BACKGROUNDS ===
  { key: "Top Level Timeline Background", category: "timeline-backgrounds", defaultValue: "#0D0809", bitwigVersions: ["5", "6"] },
  { key: "Top Level Timeline Header Background", category: "timeline-backgrounds", defaultValue: "#120D0F", bitwigVersions: ["5", "6"] },
  { key: "Dark Timeline Background", category: "timeline-backgrounds", defaultValue: "#0A0608", bitwigVersions: ["5", "6"] },
  { key: "Dark Timeline Header Background", category: "timeline-backgrounds", defaultValue: "#0D0809", bitwigVersions: ["5", "6"] },
  { key: "Light Timeline Background", category: "timeline-backgrounds", defaultValue: "#120D0F", bitwigVersions: ["5", "6"] },
  { key: "Light Timeline Header Background", category: "timeline-backgrounds", defaultValue: "#1A1215", bitwigVersions: ["5", "6"] },
  { key: "Irrelevant Timeline Background", category: "timeline-backgrounds", defaultValue: "#060405", bitwigVersions: ["5", "6"] },
  { key: "Irrelevant Timeline Header Background", category: "timeline-backgrounds", defaultValue: "#0A0608", bitwigVersions: ["5", "6"] },
  { key: "Irrelevant Timeline Overlay", category: "timeline-backgrounds", defaultValue: "#00000040", bitwigVersions: ["5", "6"] },
  { key: "Irrelevant Timeline Header Overlay", category: "timeline-backgrounds", defaultValue: "#00000040", bitwigVersions: ["5", "6"] },
  { key: "Timeline Background Pattern", category: "timeline-backgrounds", defaultValue: "#120D0F", bitwigVersions: ["5", "6"] },
  { key: "Timeline Header Background Pattern", category: "timeline-backgrounds", defaultValue: "#ffffff0a", bitwigVersions: ["5", "6"] },
  { key: "Timeline Primary Grid", category: "timeline-backgrounds", defaultValue: "#4A283033", bitwigVersions: ["5", "6"] },
  { key: "Timeline Secondary Grid", category: "timeline-backgrounds", defaultValue: "#4A28301A", bitwigVersions: ["5", "6"] },
  { key: "Timeline Header Primary Grid", category: "timeline-backgrounds", defaultValue: "#4A283033", bitwigVersions: ["5", "6"] },
  { key: "Timeline Header Secondary Grid", category: "timeline-backgrounds", defaultValue: "#4A28301A", bitwigVersions: ["5", "6"] },
  { key: "Timeline Playhead", category: "timeline-backgrounds", defaultValue: "#E8DDD0", bitwigVersions: ["5", "6"] },
  { key: "Timeline Cue Marker", category: "timeline-backgrounds", defaultValue: "#535353", bitwigVersions: ["5", "6"] },
  { key: "Timeline Header Cue Marker", category: "timeline-backgrounds", defaultValue: "#545454", bitwigVersions: ["5", "6"] },
  { key: "Timeline edit tool chooser background", category: "timeline-backgrounds", defaultValue: "#2e3034", bitwigVersions: ["5", "6"] },

  // === SELECTION COLORS ===
  { key: "Time Selection Fill", category: "selection-colors", defaultValue: "#7dc3d05d", bitwigVersions: ["5", "6"] },
  { key: "Time Selection Stroke", category: "selection-colors", defaultValue: "#f7f7f7", bitwigVersions: ["5", "6"] },
  { key: "Time Selection Standby Fill", category: "selection-colors", defaultValue: "#ffffff46", bitwigVersions: ["5", "6"] },
  { key: "Time Selection Standby Stroke", category: "selection-colors", defaultValue: "#cecece00", bitwigVersions: ["5", "6"] },
  { key: "Time Selection Cursor Stroke", category: "selection-colors", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "Time Selection Standby Cursor Stroke", category: "selection-colors", defaultValue: "#f7f7f7", bitwigVersions: ["5", "6"] },
  { key: "Time Selection Inactive Fill", category: "selection-colors", defaultValue: "#ffffff10", bitwigVersions: ["5", "6"] },
  { key: "Time Selection Inactive Stroke", category: "selection-colors", defaultValue: "#ffffff20", bitwigVersions: ["5", "6"] },
  { key: "Time Selection Not Selected Fill", category: "selection-colors", defaultValue: "#00000000", bitwigVersions: ["5", "6"] },
  { key: "Time Selection Not Selected Stroke", category: "selection-colors", defaultValue: "#cecece00", bitwigVersions: ["5", "6"] },
  { key: "Time Selection Implicit Fill", category: "selection-colors", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Time Selection Across All Lanes Fill", category: "selection-colors", defaultValue: "#5e9898c8", bitwigVersions: ["5", "6"] },
  { key: "Time Selection Across All Lanes Stroke", category: "selection-colors", defaultValue: "#f7f7f7", bitwigVersions: ["5", "6"] },
  { key: "Header Time Selection Fill", category: "selection-colors", defaultValue: "#a7939dc8", bitwigVersions: ["5", "6"] },
  { key: "Header Time Selection Stroke", category: "selection-colors", defaultValue: "#f7f7f7", bitwigVersions: ["5", "6"] },
  { key: "Header Time Selection Standby Fill", category: "selection-colors", defaultValue: "#ffffff06", bitwigVersions: ["5", "6"] },
  { key: "Header Time Selection Standby Stroke", category: "selection-colors", defaultValue: "#a7a7a7", bitwigVersions: ["5", "6"] },
  { key: "Header Time Selection Cursor Stroke", category: "selection-colors", defaultValue: "#dedede", bitwigVersions: ["5", "6"] },
  { key: "Header Time Selection Standby Cursor Stroke", category: "selection-colors", defaultValue: "#b0b0b0", bitwigVersions: ["5", "6"] },
  { key: "Header Time Selection Across All Lanes Fill", category: "selection-colors", defaultValue: "#7e9898c8", bitwigVersions: ["5", "6"] },
  { key: "Header Time Selection Across All Lanes Stroke", category: "selection-colors", defaultValue: "#dedede", bitwigVersions: ["5", "6"] },

  // === RECORD & WARNINGS ===
  { key: "Record button color", category: "record-warnings", defaultValue: "#f66151", bitwigVersions: ["5", "6"] },
  { key: "Record button color implicit", category: "record-warnings", defaultValue: "#f66151", bitwigVersions: ["5", "6"] },
  { key: "Record button glow color", category: "record-warnings", defaultValue: "#f6615140", bitwigVersions: ["5", "6"] },
  { key: "Monitoring buttons color", category: "record-warnings", defaultValue: "#f9f06b", bitwigVersions: ["5", "6"] },
  { key: "Warning", category: "record-warnings", defaultValue: "#ed1b1b", bitwigVersions: ["5", "6"] },
  { key: "Activation Red", category: "record-warnings", defaultValue: "#ff4021", bitwigVersions: ["5", "6"] },
  { key: "Activation Green", category: "record-warnings", defaultValue: "#29e17c", bitwigVersions: ["5", "6"] },
  { key: "Activation Yellow", category: "record-warnings", defaultValue: "#e3d538", bitwigVersions: ["5", "6"] },
  { key: "color implicit", category: "record-warnings", defaultValue: "#f66151", bitwigVersions: ["6"] },

  // === PANEL COLORS (9-palette) ===
  { key: "Panel Red", category: "panel-colors", defaultValue: "#f66151", bitwigVersions: ["5", "6"] },
  { key: "Panel Orange", category: "panel-colors", defaultValue: "#ffa348", bitwigVersions: ["5", "6"] },
  { key: "Panel Yellow", category: "panel-colors", defaultValue: "#f9f06b", bitwigVersions: ["5", "6"] },
  { key: "Panel Lime", category: "panel-colors", defaultValue: "#A6F48A", bitwigVersions: ["5", "6"] },
  { key: "Panel Green", category: "panel-colors", defaultValue: "#8ff0a4", bitwigVersions: ["5", "6"] },
  { key: "Panel Mint", category: "panel-colors", defaultValue: "#02F080", bitwigVersions: ["5", "6"] },
  { key: "Panel Turquoise", category: "panel-colors", defaultValue: "#00ECBE", bitwigVersions: ["5", "6"] },
  { key: "Panel Blue", category: "panel-colors", defaultValue: "#99c1f1", bitwigVersions: ["5", "6"] },
  { key: "Panel Purple", category: "panel-colors", defaultValue: "#dc8add", bitwigVersions: ["5", "6"] },

  // === MAPPING COLORS (8-palette + related) ===
  { key: "Mapping indication 1", category: "mapping-colors", defaultValue: "#f41b3e", bitwigVersions: ["5", "6"] },
  { key: "Mapping indication 2", category: "mapping-colors", defaultValue: "#ff7f17", bitwigVersions: ["5", "6"] },
  { key: "Mapping indication 3", category: "mapping-colors", defaultValue: "#fceb23", bitwigVersions: ["5", "6"] },
  { key: "Mapping indication 4", category: "mapping-colors", defaultValue: "#5bc515", bitwigVersions: ["5", "6"] },
  { key: "Mapping indication 5", category: "mapping-colors", defaultValue: "#65ce92", bitwigVersions: ["5", "6"] },
  { key: "Mapping indication 6", category: "mapping-colors", defaultValue: "#5ca8ee", bitwigVersions: ["5", "6"] },
  { key: "Mapping indication 7", category: "mapping-colors", defaultValue: "#c36eff", bitwigVersions: ["5", "6"] },
  { key: "Mapping indication 8", category: "mapping-colors", defaultValue: "#ff54b0", bitwigVersions: ["5", "6"] },
  { key: "Mapping", category: "mapping-colors", defaultValue: "#3effba", bitwigVersions: ["5", "6"] },
  { key: "Modulation Mapping Color", category: "mapping-colors", defaultValue: "#3dd9ff", bitwigVersions: ["5", "6"] },
  { key: "Modulation Mapping Color (polyphonic)", category: "mapping-colors", defaultValue: "#3aff9e", bitwigVersions: ["5", "6"] },
  { key: "Modulation Mapping Color (subtractive)", category: "mapping-colors", defaultValue: "#5a8291", bitwigVersions: ["5", "6"] },
  { key: "Modulation Mapping Background Color", category: "mapping-colors", defaultValue: "#FFD70030", bitwigVersions: ["5", "6"] },
  { key: "Modulation Mapping Background (monophonic)", category: "mapping-colors", defaultValue: "#3dd9ff32", bitwigVersions: ["5", "6"] },
  { key: "Modulation Mapping Background (polyphonic)", category: "mapping-colors", defaultValue: "#3aff9e32", bitwigVersions: ["5", "6"] },
  { key: "Launcher Mapping Indication", category: "mapping-colors", defaultValue: "#6c6c6c", bitwigVersions: ["5", "6"] },
  { key: "Add Modulation Button Color", category: "mapping-colors", defaultValue: "#bb33b1", bitwigVersions: ["5", "6"] },
  { key: "Multiply Modulation Button Color", category: "mapping-colors", defaultValue: "#bb33b1", bitwigVersions: ["5", "6"] },
  { key: "Clip Modulation Color", category: "mapping-colors", defaultValue: "#00FF66", bitwigVersions: ["5", "6"] },
  { key: "Note Expression Color", category: "mapping-colors", defaultValue: "#055988", bitwigVersions: ["5", "6"] },
  { key: "Send (post) value color", category: "mapping-colors", defaultValue: "#ffe019", bitwigVersions: ["5", "6"] },
  { key: "Send (pre) value color", category: "mapping-colors", defaultValue: "#4df4ff", bitwigVersions: ["5", "6"] },

  // === DISPLAY & WAVEFORMS ===
  { key: "Display Background", category: "display-waveforms", defaultValue: "#1f2228", bitwigVersions: ["5", "6"] },
  { key: "Display Background (error)", category: "display-waveforms", defaultValue: "#1f2228", bitwigVersions: ["5", "6"] },
  { key: "Display Stroke", category: "display-waveforms", defaultValue: "#00000000", bitwigVersions: ["5", "6"] },
  { key: "Display Waveform", category: "display-waveforms", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "Display Loop Markers", category: "display-waveforms", defaultValue: "#00ffbe", bitwigVersions: ["5", "6"] },
  { key: "Display Start/End Markers", category: "display-waveforms", defaultValue: "#d8d900", bitwigVersions: ["5", "6"] },
  { key: "Audio Event Background", category: "display-waveforms", defaultValue: "#2b2d31", bitwigVersions: ["5", "6"] },
  { key: "Audio Event Boundary", category: "display-waveforms", defaultValue: "#0000007b", bitwigVersions: ["5", "6"] },
  { key: "Audio Event Waveform", category: "display-waveforms", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },

  // === LOOP REGIONS ===
  { key: "Loop Region Fill", category: "loop-regions", defaultValue: "#4c4c4c", bitwigVersions: ["6"] },
  { key: "Loop Region Stroke", category: "loop-regions", defaultValue: "#999999", bitwigVersions: ["6"] },
  { key: "Loop Region Selected Fill", category: "loop-regions", defaultValue: "#4c4c4c", bitwigVersions: ["6"] },
  { key: "Loop Region Selected Stroke", category: "loop-regions", defaultValue: "#ffffff", bitwigVersions: ["6"] },
  { key: "Loop Region Background", category: "loop-regions", defaultValue: "#ffffff32", bitwigVersions: ["5", "6"] },
  { key: "Header Loop Region Background", category: "loop-regions", defaultValue: "#00000032", bitwigVersions: ["5", "6"] },
  { key: "Insert preview time", category: "loop-regions", defaultValue: "#ffffffb4", bitwigVersions: ["5", "6"] },

  // === MARKERS & DETECTION ===
  { key: "Beat Marker Color", category: "markers-detection", defaultValue: "#ff8713", bitwigVersions: ["5", "6"] },
  { key: "Analyzed Beat Color", category: "markers-detection", defaultValue: "#3cb2e9", bitwigVersions: ["5", "6"] },
  { key: "Onset Color Min", category: "markers-detection", defaultValue: "#ffba00", bitwigVersions: ["5", "6"] },
  { key: "Onset Color Max", category: "markers-detection", defaultValue: "#ffff80", bitwigVersions: ["5", "6"] },

  // === TOGGLE ICONS ===
  { key: "Toggle Icon", category: "toggle-icons", defaultValue: "#A89888", bitwigVersions: ["6"] },
  { key: "Normal Toggle Icon", category: "toggle-icons", defaultValue: "#9e9e9e", bitwigVersions: ["5", "6"] },
  { key: "Mouse Over Toggle Icon", category: "toggle-icons", defaultValue: "#bababa", bitwigVersions: ["5", "6"] },
  { key: "Pressed Toggle Icon", category: "toggle-icons", defaultValue: "#858585", bitwigVersions: ["5", "6"] },
  { key: "Active Toggle Icon (Playing)", category: "toggle-icons", defaultValue: "#dedede", bitwigVersions: ["5", "6"] },
  { key: "Normal Inverted Toggle Icon", category: "toggle-icons", defaultValue: "#00000050", bitwigVersions: ["5", "6"] },
  { key: "Mouse Over Inverted Toggle Icon", category: "toggle-icons", defaultValue: "#000000a0", bitwigVersions: ["5", "6"] },
  { key: "Pressed Inverted Toggle Icon", category: "toggle-icons", defaultValue: "#000000", bitwigVersions: ["5", "6"] },
  { key: "Active Inverted Toggle Icon (Playing)", category: "toggle-icons", defaultValue: "#dedede", bitwigVersions: ["5", "6"] },

  // === SCROLLBARS ===
  { key: "Scrollbar", category: "scrollbars", defaultValue: "#787878", bitwigVersions: ["5", "6"] },
  { key: "Scrollbar background", category: "scrollbars", defaultValue: "#2e2e2e00", bitwigVersions: ["5", "6"] },
  { key: "Modern Scrollbar Handle (active)", category: "scrollbars", defaultValue: "#787878", bitwigVersions: ["5", "6"] },
  { key: "Modern Scrollbar Handle (inactive)", category: "scrollbars", defaultValue: "#82828264", bitwigVersions: ["5", "6"] },
  { key: "Modern Scrollbar Background (active)", category: "scrollbars", defaultValue: "#78787834", bitwigVersions: ["5", "6"] },
  { key: "Modern Dark Scrollbar Handle (active)", category: "scrollbars", defaultValue: "#000000", bitwigVersions: ["5", "6"] },
  { key: "Modern Dark Scrollbar Handle (inactive)", category: "scrollbars", defaultValue: "#000000aa", bitwigVersions: ["5", "6"] },

  // === TREES & LISTS ===
  { key: "Tree Item Background", category: "trees-lists", defaultValue: "#d1d1d1", bitwigVersions: ["5", "6"] },
  { key: "Tree Separator", category: "trees-lists", defaultValue: "#00000000", bitwigVersions: ["5", "6"] },
  { key: "List Item Background", category: "trees-lists", defaultValue: "#d1d1d1", bitwigVersions: ["5", "6"] },
  { key: "List Separator", category: "trees-lists", defaultValue: "#9c9c9c", bitwigVersions: ["5", "6"] },
  { key: "Selected Tree Item Background", category: "trees-lists", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Selected Tree Item Background (standby)", category: "trees-lists", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Dark tree background (selected)", category: "trees-lists", defaultValue: "#387097", bitwigVersions: ["5", "6"] },
  { key: "Dark tree background (standby selected)", category: "trees-lists", defaultValue: "#2f3239", bitwigVersions: ["5", "6"] },
  { key: "Dark tree hover background change", category: "trees-lists", defaultValue: "#ffffff0a", bitwigVersions: ["5", "6"] },
  { key: "Dark tree separator", category: "trees-lists", defaultValue: "#565656", bitwigVersions: ["5", "6"] },
  { key: "Dark tree selection frame", category: "trees-lists", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Frame color of selection cursor in the tree.", category: "trees-lists", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Frame color of selection cursor in the tree. (standby)", category: "trees-lists", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Selected Dashboard Tree", category: "trees-lists", defaultValue: "#35373b", bitwigVersions: ["5", "6"] },

  // === GRID & MODULAR ===
  { key: "The Grid (background)", category: "grid-modular", defaultValue: "#0c0d0f", bitwigVersions: ["5", "6"] },
  { key: "The Grid (stroke)", category: "grid-modular", defaultValue: "#16181a", bitwigVersions: ["5", "6"] },
  { key: "Background color of the modular environment.", category: "grid-modular", defaultValue: "#1f2228", bitwigVersions: ["5", "6"] },
  { key: "Grid Line (Primary)", category: "grid-modular", defaultValue: "#000000", bitwigVersions: ["5", "6"] },
  { key: "Grid Line (Secondary)", category: "grid-modular", defaultValue: "#00000050", bitwigVersions: ["5", "6"] },
  { key: "Polyphonic Desktop Object", category: "grid-modular", defaultValue: "#3c7399", bitwigVersions: ["5", "6"] },
  { key: "Audio connection in modular environment", category: "grid-modular", defaultValue: "#c14524", bitwigVersions: ["5", "6"] },
  { key: "Audio64 connection in modular environment", category: "grid-modular", defaultValue: "#d281f4", bitwigVersions: ["5", "6"] },
  { key: "Event connection in modular environment", category: "grid-modular", defaultValue: "#3c7399", bitwigVersions: ["5", "6"] },
  { key: "Compressed Audio Port in modular environment", category: "grid-modular", defaultValue: "#ff8000", bitwigVersions: ["5", "6"] },

  // === DEVICE CHAIN ===
  { key: "Device Header", category: "device-chain", defaultValue: "#2f3239", bitwigVersions: ["5", "6"] },
  { key: "Device Header (selected)", category: "device-chain", defaultValue: "#2f3239", bitwigVersions: ["5", "6"] },
  { key: "Device Locked Overlay", category: "device-chain", defaultValue: "#0e5ca180", bitwigVersions: ["5", "6"] },
  { key: "Device Tint Future", category: "device-chain", defaultValue: "#58859564", bitwigVersions: ["5", "6"] },
  { key: "Device Tint Military", category: "device-chain", defaultValue: "#305d0247", bitwigVersions: ["5", "6"] },
  { key: "Device Tint Retro", category: "device-chain", defaultValue: "#c07b4c52", bitwigVersions: ["5", "6"] },
  { key: "Plugin missing", category: "device-chain", defaultValue: "#ec1e08", bitwigVersions: ["6"] },

  // === FILE STATUS ===
  { key: "Missing file icon", category: "file-status", defaultValue: "#ff0000", bitwigVersions: ["6"] },
  { key: "Found file icon", category: "file-status", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "External file icon", category: "file-status", defaultValue: "#d6b200", bitwigVersions: ["6"] },

  // === BRANDING ===
  { key: "Bitwig Red", category: "branding", defaultValue: "#FF596E", bitwigVersions: ["5", "6"] },
  { key: "Bitwig CI", category: "branding", defaultValue: "#ff5a00", bitwigVersions: ["5", "6"] },
  { key: "Bitwig Mint", category: "branding", defaultValue: "#04a1a8", bitwigVersions: ["5", "6"] },
  { key: "Bitwig Producer", category: "branding", defaultValue: "#ffc933", bitwigVersions: ["5", "6"] },
  { key: "Bitwig Essentials", category: "branding", defaultValue: "#2e9ce6", bitwigVersions: ["5", "6"] },
  { key: "Bitwig 8-Track", category: "branding", defaultValue: "#29ccb9", bitwigVersions: ["5", "6"] },
  { key: "Bitwig 16-Track", category: "branding", defaultValue: "#0076c7", bitwigVersions: ["5", "6"] },

  // === MISCELLANEOUS ===
  { key: "Shadow", category: "miscellaneous", defaultValue: "#00000000", bitwigVersions: ["5", "6"] },
  { key: "Hole (dark)", category: "miscellaneous", defaultValue: "#2e2e2e", bitwigVersions: ["5"] },
  { key: "Hole (light)", category: "miscellaneous", defaultValue: "#3c3c3c", bitwigVersions: ["5"] },
  { key: "Hole (medium)", category: "miscellaneous", defaultValue: "#2e2e2e", bitwigVersions: ["5"] },
  { key: "White", category: "miscellaneous", defaultValue: "#ffffff", bitwigVersions: ["6"] },
  { key: "Transparent", category: "miscellaneous", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Same as background", category: "miscellaneous", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Image Source", category: "miscellaneous", defaultValue: "#00000000", bitwigVersions: ["6"] },
  { key: "Gradient", category: "miscellaneous", defaultValue: "false", bitwigVersions: ["6"] },
  { key: "Inherited", category: "miscellaneous", defaultValue: "#a9a9fe", bitwigVersions: ["6"] },
  { key: "Implicit On (subtle)", category: "miscellaneous", defaultValue: "#e47611", bitwigVersions: ["5", "6"] },
  { key: "Drop Indicator", category: "miscellaneous", defaultValue: "#ffffff", bitwigVersions: ["5", "6"] },
  { key: "Hitcount background", category: "miscellaneous", defaultValue: "#8181817f", bitwigVersions: ["5", "6"] },
  { key: "Progress background", category: "miscellaneous", defaultValue: "#39495ebb", bitwigVersions: ["5", "6"] },
  { key: "Comp fill", category: "miscellaneous", defaultValue: "#5178fd78", bitwigVersions: ["5", "6"] },
  { key: "Muted by Audition", category: "miscellaneous", defaultValue: "#202020b2", bitwigVersions: ["6"] },
  { key: "(standby)", category: "miscellaneous", defaultValue: "#77767b", bitwigVersions: ["6"] },
];

// Helper functions
export function getPropertiesForVersion(version: BitwigVersion): PropertyDefinition[] {
  return PROPERTY_DEFINITIONS.filter(p => p.bitwigVersions.includes(version));
}

export function getDefaultValues(version: BitwigVersion): Record<string, string> {
  const properties = getPropertiesForVersion(version);
  const result: Record<string, string> = {};
  for (const prop of properties) {
    result[prop.key] = prop.defaultValue;
  }
  return result;
}

// Get property definition by key
export function getPropertyDefinition(key: string): PropertyDefinition | undefined {
  return PROPERTY_DEFINITIONS.find(p => p.key === key);
}

// Get all properties in a bundle for a specific version
export function getPropertiesForBundle(bundleId: string, version: BitwigVersion): PropertyDefinition[] {
  return PROPERTY_DEFINITIONS.filter(p =>
    p.category === bundleId && p.bitwigVersions.includes(version)
  );
}
