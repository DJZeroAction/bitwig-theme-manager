# Bitwig Studio 6 Theming Guide

Reference for creating BTE themes for Bitwig Studio 6.x.
Based on analysis of DSNVS Light V2 and community themes.

---

## BTE File Format

Themes use the `.bte` text format — one color per line:

```
Property Name: #RRGGBB
Property Name: #RRGGBBAA    // with alpha transparency
// This is a comment
```

- Colors are hex: `#RRGGBB` (opaque) or `#RRGGBBAA` (with alpha, `00`=transparent, `FF`=opaque)
- Comments start with `//`
- `Gradient: false` disables Bitwig's internal gradient rendering (special non-color property)
- You only need to include properties you want to change — unset ones keep Bitwig's defaults
- Property names are case-sensitive and must match exactly

---

## Complete Property Reference

**265 properties** organized by what they affect in Bitwig's UI.

### Core Interface Colors

These define the overall look. Change these first for maximum impact.

| Property | What It Controls |
|----------|-----------------|
| `Window background` | Main application background behind all panels |
| `Grey 0` | Darkest grey — device panels, right-side panel backgrounds |
| `Grey 1` | Empty timeline area, slightly lighter |
| `Grey 2` | Active timeline area background |
| `Grey 3` | Device background, node backgrounds |
| `Grey 4` | Device node panels |
| `Grey 5` | Main strokes, panel borders |
| `Grey 6` | Selected track highlight, lightest grey |
| `Default text` | Primary text color throughout the UI |
| `Dark Text` | Text on light backgrounds (inverted contexts) |
| `Light Text` | Text on dark backgrounds |
| `Lighter Text` | Secondary text, slightly dimmer |
| `Medium Light Text` | Mid-brightness text |
| `Subtle Light Text` | Dimmed text for secondary info |
| `Subtler Light Text` | Very dimmed text |
| `Subtle Dark Text` | Dimmed dark text |
| `White` | Pure white reference (use black for light themes to invert) |
| `Black` | Pure black reference (use white for light themes) |
| `Brighter` | Bright accent for highlights |
| `Shadow` | Drop shadow color (usually semi-transparent black) |
| `Transparent` | Transparent reference (`#00000000`) |
| `Image Source` | Image overlay tint |
| `Inherited` | Inherited color indicator |
| `Same as background` | Same-as-background indicator |

### Accent & Status Colors

The primary colors that give a theme its character.

| Property | What It Controls |
|----------|-----------------|
| `Accent` | Base accent color |
| `Accent (default)` | **Primary accent** — toggles, active states, on-indicators |
| `Accent (hitech)` | Hi-tech/alternate accent for special elements |
| `Implicit On (subtle)` | Subtle "on" state indicator |
| `Mapping` | Mapping mode highlight color |
| `Warning` | Warning state color |
| `Error Text` | Error message text |
| `Activation Green` | Green activation indicator (record arm, etc.) |
| `Activation Yellow` | Yellow activation indicator |
| `Activation Red` | Red activation indicator |

### Buttons & Controls

| Property | What It Controls |
|----------|-----------------|
| `Button background` | Standard button fill |
| `Button stroke` | Button border/outline |
| `Button in tree background` | Buttons inside tree/list panels |
| `Pressed button background` | Button fill when clicked |
| `View button background` | View-toggle button fill |
| `Pressed view button background` | Pressed view-toggle button |
| `OK Button background` | Confirmation/OK button fill |
| `Checkbox background` | Checkbox fill |
| `Selected borderless button background` | Selected flat button |
| `Pressed borderless button background` | Pressed flat button |
| `Inverted Selected Borderless Button background` | Inverted context selected button |
| `Close button mouse over background` | Window close button hover |
| `Close button pressed background` | Window close button pressed |
| `Abstract Button Stroke` | Generic button border |
| `Abstract Button Pressed Background` | Generic button pressed fill |
| `Abstract Button Selected Background` | Generic button selected fill |
| `Abstract Button Unselected Background` | Generic button default fill |
| `Color bar button fill color` | Color bar button fill |

### Knobs & Sliders

| Property | What It Controls |
|----------|-----------------|
| `Knob Body` | Knob body base color |
| `Knob Body Lighter` | Knob body lighter shade |
| `Knob Body Lightest` | Knob body lightest shade |
| `Knob Body Darkest` | Knob body darkest shade |
| `Knob Line` | Knob position indicator line (light) |
| `Knob Line Dark` | Knob position indicator line (dark) |
| `Knob Stroke` | Knob border |
| `Knob Emboss Highlight` | Knob 3D highlight edge |
| `Knob Emboss Shadow` | Knob 3D shadow edge |
| `Knob Value Background` | Knob value arc background |
| `Knob Value Background (dark)` | Knob value arc background (dark variant) |
| `Knob Value Color` | **Knob value arc** — very visible, matches accent |
| `Slider background` | Slider track background |

### Toggle Icons

| Property | What It Controls |
|----------|-----------------|
| `Normal Toggle Icon` | Default toggle icon |
| `Mouse Over Toggle Icon` | Hover state toggle icon |
| `Active Toggle Icon (Playing)` | Active/playing toggle icon |
| `Pressed Toggle Icon` | Pressed toggle icon |
| `Normal Inverted Toggle Icon` | Inverted context default toggle |
| `Mouse Over Inverted Toggle Icon` | Inverted context hover toggle |
| `Active Inverted Toggle Icon (Playing)` | Inverted context active toggle |
| `Pressed Inverted Toggle Icon` | Inverted context pressed toggle |

### Menus & Popups

| Property | What It Controls |
|----------|-----------------|
| `Menu background` | Dropdown/context menu fill |
| `Menu stroke` | Menu border |
| `Menu text` | Menu item text |
| `Menu Icon` | Menu item icons |
| `Menu description text` | Menu item description/subtitle |
| `Menu separator` | Menu divider line |
| `Popup insert` | Popup insert point indicator |
| `Popup overlay background color` | Modal overlay backdrop |
| `Popup Notification Background` | Popup notification fill |
| `Tooltip Background` | Tooltip fill |
| `Tooltip Stroke` | Tooltip border |
| `Light Tooltip Background` | Light-mode tooltip fill |

### Notifications & Indicators

| Property | What It Controls |
|----------|-----------------|
| `Notification Background` | Notification panel fill |
| `Notification Normal` | Normal notification text/icon |
| `Notification Error` | Error notification text/icon |
| `Notification Button Background` | Notification action button |
| `Drop Indicator` | Drag-and-drop indicator |
| `Progress bar` | Progress bar fill |
| `Progress background` | Progress bar track |
| `Hitcount background` | Hit counter background |
| `Hitcount text color` | Hit counter text |
| `Link Text` | Hyperlink text |
| `Link Text Rollover` | Hyperlink hover text |

### LEDs & Meters

| Property | What It Controls |
|----------|-----------------|
| `Led On` | LED indicator lit state |
| `Led Off` | LED indicator unlit state |
| `Meter Normal` | Volume meter normal range |
| `Meter Yellow` | Volume meter caution range |
| `Meter Red` | Volume meter danger range |
| `Meter Clipping` | Volume meter clipping indicator |
| `Meter Gain Reduction` | Compressor gain reduction meter |
| `Meter Hitech` | Hi-tech meter variant |
| `Meter Hitech Background` | Hi-tech meter background |
| `Meter Muted` | Muted channel meter |

### Scrollbars

| Property | What It Controls |
|----------|-----------------|
| `Scrollbar` | Classic scrollbar thumb |
| `Scrollbar background` | Classic scrollbar track |
| `Modern Scrollbar Handle (active)` | Modern scrollbar thumb (active) |
| `Modern Scrollbar Handle (inactive)` | Modern scrollbar thumb (idle) |
| `Modern Scrollbar Background (active)` | Modern scrollbar track |
| `Modern Dark Scrollbar Handle (active)` | Dark context scrollbar thumb |
| `Modern Dark Scrollbar Handle (inactive)` | Dark context scrollbar thumb (idle) |

### Tree & List Views

| Property | What It Controls |
|----------|-----------------|
| `Tree Item Background` | Tree item fill |
| `Selected Tree Item Background` | Selected tree item fill |
| `Selected Tree Item Background (standby)` | Standby selected tree item |
| `Tree Separator` | Tree item divider |
| `List Item Background` | List row fill |
| `List Separator` | List row divider |
| `Selected Dashboard Tree` | Dashboard tree selected item |
| `Dark tree background (selected)` | Dark-themed tree selection |
| `Dark tree background (standby selected)` | Dark tree standby selection |
| `Dark tree text` | Dark tree text |
| `Dark tree text (selected)` | Dark tree selected text |
| `Dark tree separator` | Dark tree divider |
| `Dark tree hover background change` | Dark tree hover overlay |
| `Dark tree selection frame` | Dark tree selection border |
| `Frame color of selection cursor in the tree.` | Tree cursor frame |
| `Frame color of selection cursor in the tree. (standby)` | Tree cursor frame (standby) |
| `Launcher Mapping Indication` | Launcher mapping highlight |

### Panels & Separators

| Property | What It Controls |
|----------|-----------------|
| `Panel Stroke (focused)` | Focused panel border |
| `Light Separator Line` | Light divider line |
| `Dark Panel Sub-frame Stroke` | Sub-panel border |
| `Dark Panel Sub-frame Fill` | Sub-panel fill |
| `Field background` | Input field fill |
| `Number field bar background` | Number field value bar |
| `Icon Frame` | Icon border frame |
| `Color of unselected tabs` | Inactive tab color |
| `Color of stroke between tabs` | Tab divider stroke |

### Device Chain

| Property | What It Controls |
|----------|-----------------|
| `Device Header` | Device header background |
| `Device Header (selected)` | Selected device header |
| `Device Locked Overlay` | Locked device overlay tint |
| `Device Tint Future` | "Future" style device tint |
| `Device Tint Retro` | "Retro" style device tint |
| `Device Tint Military` | "Military" style device tint |
| `Plugin missing` | Missing plugin indicator |

### Display & Waveforms

| Property | What It Controls |
|----------|-----------------|
| `Display Background` | Display/oscilloscope background |
| `Display Background (error)` | Display error state background |
| `Display Waveform` | Waveform drawing color |
| `Display Stroke` | Display border |
| `Display Start/End Markers` | Sample start/end markers |
| `Display Loop Markers` | Sample loop markers |
| `Grey Display Background` | Grey variant display background |
| `Audio Event Background` | Audio clip fill in arranger |
| `Audio Event Boundary` | Audio clip border |
| `Audio Event Waveform` | Audio clip waveform |

### Grid & Modular Environment

| Property | What It Controls |
|----------|-----------------|
| `The Grid (background)` | The Grid device background |
| `The Grid (stroke)` | The Grid device border |
| `Grid Line (Primary)` | Primary grid lines |
| `Grid Line (Secondary)` | Secondary grid lines |
| `Background color of the modular environment.` | Modular environment background |
| `Compressed Audio Port in modular environment` | Compressed audio port color |
| `Audio connection in modular environment` | Audio cable color |
| `Audio64 connection in modular environment` | 64-bit audio cable color |
| `Event connection in modular environment` | Event/MIDI cable color |
| `Polyphonic Desktop Object` | Polyphonic module indicator |

### Timeline & Arranger

| Property | What It Controls |
|----------|-----------------|
| `Timeline Header Background Pattern` | Arranger header pattern |
| `Timeline edit tool chooser background` | Edit tool picker background |
| `Timeline Tooltip Background` | Arranger tooltip fill |
| `Timeline Tooltip Text` | Arranger tooltip text |
| `Timeline Header Tooltip Background` | Header tooltip fill |
| `Timeline Header Tooltip Text` | Header tooltip text |
| `Timeline Cue Marker` | Cue marker color |
| `Timeline Header Cue Marker` | Header cue marker |

### Time Selection

| Property | What It Controls |
|----------|-----------------|
| `Time Selection Fill` | Time selection highlight fill |
| `Time Selection Stroke` | Time selection border |
| `Time Selection Implicit Fill` | Implicit time selection fill |
| `Time Selection Cursor Stroke` | Time selection cursor line |
| `Time Selection Standby Fill` | Standby time selection fill |
| `Time Selection Standby Stroke` | Standby time selection border |
| `Time Selection Standby Cursor Stroke` | Standby cursor line |
| `Time Selection Inactive Fill` | Inactive time selection |
| `Time Selection Inactive Stroke` | Inactive time selection border |
| `Time Selection Not Selected Fill` | Unselected time range fill |
| `Time Selection Not Selected Stroke` | Unselected time range border |
| `Time Selection Across All Lanes Fill` | Cross-lane selection fill |
| `Time Selection Across All Lanes Stroke` | Cross-lane selection border |
| `Header Time Selection Fill` | Header time selection fill |
| `Header Time Selection Stroke` | Header time selection border |
| `Header Time Selection Cursor Stroke` | Header cursor line |
| `Header Time Selection Standby Fill` | Header standby selection |
| `Header Time Selection Standby Stroke` | Header standby border |
| `Header Time Selection Standby Cursor Stroke` | Header standby cursor |
| `Header Time Selection Across All Lanes Fill` | Header cross-lane fill |
| `Header Time Selection Across All Lanes Stroke` | Header cross-lane border |
| `White Selection` | White selection overlay |
| `White Selection (standby)` | Standby white selection |

### Loop Regions

| Property | What It Controls |
|----------|-----------------|
| `Loop Region Background` | Loop region overlay |
| `Loop Region Fill` | Loop region fill |
| `Loop Region Stroke` | Loop region border |
| `Loop Region Selected Fill` | Selected loop region fill |
| `Loop Region Selected Stroke` | Selected loop region border |
| `Header Loop Region Background` | Header loop region overlay |
| `Insert preview time` | Insert preview indicator |

### Automation & Modulation

| Property | What It Controls |
|----------|-----------------|
| `Automation Color` | Automation curve color |
| `Automation Chooser Background` | Automation picker background |
| `Automation button glow color` | Automation button glow |
| `Arranger Automation Curve Fill Color` | Automation curve fill |
| `Track Automation Button Color` | Track automation button |
| `Add Modulation Button Color` | Add modulation button |
| `Multiply Modulation Button Color` | Multiply modulation button |
| `User Automation Override Color` | User override automation |
| `Note Expression Color` | Note expression indicator |
| `Send (post) value color` | Post-fader send indicator |
| `Send (pre) value color` | Pre-fader send indicator |
| `Dark offset for automation/channel bar` | Dark automation bar offset |
| `Light offset for automation/channel bar` | Light automation bar offset |
| `Unselected Filled Automation Type Icon` | Filled automation icon |
| `Unselected Empty Automation Type Icon` | Empty automation icon |

### Modulation Mapping

| Property | What It Controls |
|----------|-----------------|
| `Modulation Mapping Color` | Modulation mapping indicator |
| `Modulation Mapping Color (subtractive)` | Subtractive mapping |
| `Modulation Mapping Color (polyphonic)` | Polyphonic mapping |
| `Modulation Mapping Background (monophonic)` | Mono mapping background |
| `Modulation Mapping Background (polyphonic)` | Poly mapping background |
| `Mapping indication 1` through `Mapping indication 8` | 8 distinct mapping slot colors |

### Record & Transport

| Property | What It Controls |
|----------|-----------------|
| `Record button color` | Record button |
| `Record button color implicit` | Implicit record state |
| `Record button glow color` | Record button glow |
| `Monitoring buttons color` | Monitor button color |

### Onset & Beat Detection

| Property | What It Controls |
|----------|-----------------|
| `Onset Color Min` | Onset minimum color |
| `Onset Color Max` | Onset maximum color |
| `Beat Marker Color` | Beat marker |
| `Analyzed Beat Color` | Analyzed beat indicator |

### File Status Indicators

| Property | What It Controls |
|----------|-----------------|
| `Missing file icon` | Missing file icon color |
| `Missing file text` | Missing file text |
| `Found file icon` | Found file icon color |
| `Found file text` | Found file text |
| `External file icon` | External file icon |
| `External file text` | External file text |

### Invoke Action (Command Palette)

| Property | What It Controls |
|----------|-----------------|
| `Invoke Action Background` | Command palette background |
| `Invoke Action Category` | Command category text |
| `Invoke Action Text` | Command text |
| `User input text` | User input text in palette |

### Color Palette (Panel Colors)

Used for track/clip colors throughout the UI:

| Property | What It Controls |
|----------|-----------------|
| `Panel Red` | Red palette color |
| `Panel Orange` | Orange palette color |
| `Panel Yellow` | Yellow palette color |
| `Panel Lime` | Lime palette color |
| `Panel Green` | Green palette color |
| `Panel Mint` | Mint palette color |
| `Panel Turquoise` | Turquoise palette color |
| `Panel Blue` | Blue palette color |
| `Panel Purple` | Purple palette color |

### Bitwig Branding Colors

| Property | What It Controls |
|----------|-----------------|
| `Bitwig Red` | Bitwig logo/branding red |
| `Bitwig Mint` | Bitwig branding mint |
| `Bitwig CI` | Bitwig corporate identity |
| `Bitwig Producer` | Producer edition color |
| `Bitwig Essentials` | Essentials edition color |
| `Bitwig 8-Track` | 8-Track edition color |
| `Bitwig 16-Track` | 16-Track edition color |

### Comp Fill

| Property | What It Controls |
|----------|-----------------|
| `Comp fill` | Comping/take lane fill overlay |

---

## Buggy Properties in Bitwig 6.x

These properties cause issues in Bitwig 6.0+ and should be commented out or omitted:

```
// Clip Automation Button Color: #...
// Clip Content Automation Stroke Color: #...
// Clip Content Automation Fill Color: #...
// Clip Expression Background Color: #...
```

---

## Theme Design Guidelines

### High-Impact Properties (Change These First)

For maximum visual impact with minimum effort, focus on these ~25 properties:

1. **Base tones**: `Window background`, `Grey 0` through `Grey 6`
2. **Primary accent**: `Accent (default)`, `Knob Value Color`, `Led On`
3. **Text**: `Default text`, `Light Text`, `Dark Text`
4. **Meters**: `Meter Normal`, `Meter Yellow`, `Meter Red`
5. **Activation**: `Activation Green`, `Activation Yellow`, `Activation Red`
6. **Buttons**: `Button background`, `Button stroke`, `OK Button background`
7. **Menus**: `Menu background`, `Menu text`, `Menu stroke`
8. **Selection**: `White Selection`, `Time Selection Fill`, `Time Selection Stroke`

### Color Relationships

Properties that should typically share the same color:

- **Primary accent group**: `Accent (default)`, `Knob Value Color`, `Meter Normal`, `Progress bar`, `Display Waveform`, `White Selection`
- **Text group**: `Default text`, `Light Text`, `Menu text`, `Dark tree text`
- **Background group**: `Window background`, `Menu background`, `Tooltip Background`
- **Grey scale**: `Grey 0` through `Grey 6` should form a smooth gradient from dark to light (or light to dark for light themes)
- **Selection group**: `Time Selection Fill/Stroke`, `Header Time Selection Fill/Stroke` — same hue, different alpha
- **Panel colors**: `Panel Red` through `Panel Purple` — should all have similar saturation/brightness for visual consistency

### Dark Theme Pattern

```
Window background:    #1a1e24    (dark base)
Grey 0:              #14181e    (darkest)
Grey 1:              #1a1e24    (dark)
Grey 2:              #202630    (medium-dark)
Grey 3:              #262c38    (medium)
Grey 4:              #2e3440    (medium-light)
Grey 5:              #363e4a    (light)
Grey 6:              #404a56    (lightest)
Default text:        #e0e4ea    (light text)
Accent (default):    #xx__xx    (your accent color)
```

### Light Theme Pattern

```
Window background:    #fafafb    (light base)
Grey 0:              #ebebed    (darkest = still light)
Grey 1:              #e4e4e7    (empty timeline)
Grey 2:              #fafbff    (timeline)
Grey 3:              #f7f7f8    (device bg)
Grey 4:              #f7f7f8    (device nodes)
Grey 5:              #ffffff    (strokes)
Grey 6:              #dfdfef    (selected)
Default text:        #000000    (dark text)
White:               #000000    (inverted!)
Black:               #ffffff    (inverted!)
Dark Text:           #ffffff    (inverted — text on dark elements)
```

**Important for light themes**: You must invert `White`/`Black` and `Dark Text`/`Light Text` — Bitwig uses these contextually, so "White" means "the contrasting foreground color."

### Text Contrast for Light Themes

Bright/saturated accent colors that look great on dark backgrounds often have poor contrast on light backgrounds. This affects text readability.

**Problem colors on light backgrounds:**
- Bright yellow (`#FFD700`, `#FFFF00`) — nearly invisible
- Cyan/aqua (`#00FFFF`, `#00CED1`) — hard to read
- Lime green (`#00FF00`, `#7FFF00`) — poor contrast
- Light orange (`#FFA500`) — borderline

**Solution**: Use darker variants for text-related properties while keeping bright colors for decorative elements.

| Use Case | Bright Color | Dark Variant |
|----------|--------------|--------------|
| Yellow accent | `#FFD700` (buttons, knobs) | `#5A3800` (text, selection) |
| Cyan accent | `#00CED1` (indicators) | `#008080` (text, selection) |
| Lime accent | `#7FFF00` (meters) | `#339900` (text, selection) |

**Properties that need good contrast** (use darker variants on light themes):
- `Accent (default)` — **primary accent**, used for toggles and active states
- `Accent (hitech)` — **transport bar displays**, time readouts, value fields
- `White Selection` — selection highlight, often used for text
- `Selected Dashboard Tree` — tree selection text
- `Active Toggle Icon (Playing)` — active toggle icons
- `Mapping indication 1-8` — mapping slot labels
- `Number field bar background` — value bars in number fields
- Any `*Text` or `*Icon` property

**Properties where bright colors work fine** (decorative, not text):
- `Knob Value Color` — value arcs (on dark knob bodies)
- `Progress bar` — progress indicators (on dark track)
- `Meter Normal/Yellow/Red` — level meters (on dark backgrounds)
- `OK Button background` — button fills (text is dark)
- `Drop Indicator` — drag-and-drop indicator (temporary UI)
- `Time Selection Fill/Stroke` — selection overlays (use alpha)

**Testing tip**: After applying your theme, check these areas in Bitwig:
1. Transport bar (tempo, time position) — controlled by `Accent (hitech)`
2. Inspector panel values (Position, Length, etc.) — also `Accent (hitech)`
3. Browser/tree selections — `White Selection`, `Selected Dashboard Tree`
4. Toggle buttons when active — `Active Toggle Icon`

### Alpha Transparency Tips

- Button backgrounds: Use ~`80` alpha (e.g., `#34363A80`) for subtle layered look
- Selection fills: Use ~`30`-`66` alpha for see-through selection
- Overlays: `#000000B4` or `#FFFFFFB4` for modal backdrops
- Hover states: Use `#FFFFFF08` to `#FFFFFF1A` for subtle hover overlays
- Shadows: `#0000004D` is a typical shadow

---

## Minimal Viable Theme (~40 properties)

A theme that covers all major visual areas:

```
// Core
Gradient: false
Window background: #1a1e24
Grey 0: #14181e
Grey 1: #1a1e24
Grey 2: #202630
Grey 3: #262c38
Grey 4: #2e3440
Grey 5: #363e4a
Grey 6: #404a56
Default text: #e0e4ea
Dark Text: #e0e4ea
Light Text: #e0e4ea
White: #ffffff
Black: #000000

// Accent
Accent (default): #5b9bd5
Accent (hitech): #7bb3e8
Knob Value Color: #5b9bd5

// Status
Activation Green: #6abf69
Activation Yellow: #d4a74e
Activation Red: #d45050
Led On: #d45050
Meter Normal: #6abf69
Meter Yellow: #d4a74e
Meter Red: #d45050

// Buttons
Button background: #2e3440
Button stroke: #1a1e24
OK Button background: #3a5070
Menu background: #1e2228
Menu text: #e0e4ea
Menu stroke: #14181e

// Selection
White Selection: #5b9bd5
Time Selection Fill: #5b9bd566
Time Selection Stroke: #5b9bd5

// Timeline
Automation Color: #5b9bd540
Track Automation Button Color: #5b9bd5
Record button color: #d45050

// Panels
Panel Red: #e09090
Panel Orange: #e0a878
Panel Yellow: #e0d890
Panel Green: #90d890
Panel Blue: #9090e0
Panel Purple: #c090e0
```

---

## Legacy: Bitwig 5.x JSON Format

Older themes use JSON with three sections. The Theme Manager auto-converts these to BTE:

```json
{
  "advanced": { "Timeline Playhead": "#ffffff" },
  "window": { "Window background": "#1a1a2e", ... },
  "arranger": { "Dark Timeline Background": "#222222", ... }
}
```

### Bitwig 5.x → 6.x Property Changes

| Bitwig 5.x Name | Bitwig 6.x Name |
|-----------------|-----------------|
| `On` | `Accent (default)` |
| `On (subtle)` | `Implicit On (subtle)` |
| `Hitech on` | `Accent (hitech)` |
| `Hole (dark)` | `Grey 0` |
| `Dark Timeline Background` | `Grey 1` |
| `Light Timeline Background` | `Grey 2` |
| `Hole (medium)` / `Hole (light)` | `Grey 3` |

Some Bitwig 5.x properties were removed in 6.x:
- `On (subtler)`, `Pressed On`, `Selection`, `Standby selection`
- `Dark Separator Line`, `Content Background`, `Hitech background`
- Various Timeline-specific background properties (consolidated into Grey scale)
