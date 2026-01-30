# Bitwig Studio Theming Guide

A comprehensive guide for creating Bitwig themes, based on analysis of 70+ community themes.

---

## File Formats

### Bitwig 6.x: BTE Format
Flat text format — one property per line:
```
Property Name: #RRGGBB
Property Name: #RRGGBBAA    // with alpha (00=transparent, FF=opaque)
// This is a comment
Gradient: false             // special boolean property
```

### Bitwig 5.x: JSON Format
Three-section structure:
```json
{
  "advanced": { "Timeline Playhead": "#ffffff" },
  "window": { "Window background": "#1a1a2e", ... },
  "arranger": { "Dark Timeline Background": "#222222", ... }
}
```

The Theme Manager auto-converts between formats.

---

## Design Philosophies

Community themes follow diverse approaches. Understanding these helps you choose your direction.

### 1. Professional/Subtle Themes
**Examples:** DSNVS, Lo-Ki, Sage Minimal, Overcast

- Neutral or subtly tinted greys
- Low-saturation accents to reduce eye strain
- Focus on usability over visual impact
- Often inspired by other DAWs or design systems

### 2. Fully Themed/Immersive Themes
**Examples:** Oxide, Retronia, Sytruswig, Infosphere

- Tinted grey scale (not neutral greys)
- Tinted text colors (not pure white/black)
- Cohesive color temperature throughout
- Instantly recognizable aesthetic

### 3. Design System Themes
**Examples:** Nord, Dracula, Catppuccin, Gruvbox, Rose Pine

- Strict adherence to an established color palette
- All UI colors drawn from the palette specification
- Semantic color preservation (red=errors, green=success)
- Popular with developers/designers who use these palettes elsewhere

### 4. DAW/Software-Inspired Themes
**Examples:** Cubase, Logic, Ableton Live, Serum, UAD

- Color-picked from the source software
- Adapt another interface's aesthetic to Bitwig's structure
- Often match the source's background luminosity
- May simplify knobs/controls to match source style

### 5. Retro/Era-Specific Themes
**Examples:** Workbench (Amiga), Platinum (Mac OS 8), CGA DOS, GameBoy

- Limited color palettes matching the era
- Period-accurate color choices
- Modern UI elements adapted to retro aesthetic
- Often use flat knobs (no emboss)

### 6. Brand/Pop Culture Themes
**Examples:** Barbie, Taco Bell, Pokemon, Stranger Things

- Extract 2-4 signature colors from the brand
- Apply colors to create recognition
- Balance authenticity with usability

---

## Core Techniques from Community Themes

### Grey Scale Strategies

The grey scale (`Grey 0` through `Grey 6`) is the foundation. Community authors use three approaches:

**Neutral Greys** (xbitz's Blackwig, Darkfault)
```
Grey 0: #14181e
Grey 1: #1a1e24
Grey 2: #202630
...
```
Professional, lets accents stand out. Most versatile but least distinctive.

**Tinted Greys** (Ocean Blue, Sage Minimal, Oxide)
```
// Blue-tinted (Ocean Blue)
Grey 0: #0E1116
Grey 1: #161A20
Grey 2: #1E2530
...

// Green-tinted (Sage Minimal)
Grey 0: #12161C
Grey 1: #1A1F26
Grey 2: #242B34
...

// Warm brown-tinted (Oxide)
Grey 0: #171414
Grey 1: #1e1a1a
Grey 2: #262220
...
```
Creates cohesive, immersive feel. The tint should match your accent family.

**Inverted Greys** (Light themes)
```
Grey 0: #ebebed    // lightest
Grey 1: #e4e4e7
Grey 2: #fafbff
...
Grey 6: #dfdfef    // still light
```
For light themes, the scale is light-to-light with subtle variation.

### Accent Color Consistency

Prolific theme authors (xbitz, chimi, dsnvs) apply their accent color consistently across these properties:

| Element | Properties |
|---------|------------|
| Active states | `Accent (default)`, `On (subtle)`, `Implicit On` |
| Knobs | `Knob Value Color` |
| Meters | `Meter Normal` (or keep green for safety) |
| Progress | `Progress bar` |
| LEDs | `Led On` |
| Automation | `Automation Color`, `Track Automation Button Color` |
| Selection | `White Selection`, `Time Selection Fill` |
| Links | `Link Text` |

### Complementary Accent Pairing

Many themes use complementary colors for visual separation:

| Primary Accent | Secondary Accent | Examples |
|---------------|------------------|----------|
| Orange/Coral | Teal/Cyan | Blackwig, xbitz2 |
| Cyan/Mint | Magenta/Pink | Greenwig, chimi themes |
| Purple | Lime/Mint | Sizzurp |
| Blue | Orange | Cubase themes |
| Gold/Amber | Deep Blue | UAD themes |

Apply primary to "On" states, secondary to automation/modulation.

### Automation vs Active State Separation

chimi's themes demonstrate deliberate contrast:
```
// Greenon Blue - Maximum separation
On: #91ff2f         (electric lime)
Automation: #064568 (dark navy)

// Sizzurp - Monochromatic approach
On: #d58eff         (orchid purple)
Automation: #535fda (blue-violet)
```

Both approaches work. Choose based on whether you want automation to pop or blend.

### Knob Styling Approaches

**3D Embossed** (Classic look)
```
Knob Emboss Highlight: #ffffff40
Knob Emboss Shadow: #00000080
Knob Body Lighter: #4a4a4a
Knob Body Darkest: #1a1a1a
```

**Flat/Modern** (Serum, DSNVS, many light themes)
```
Knob Emboss Highlight: #00000000  // transparent
Knob Emboss Shadow: #00000000     // transparent
Knob Body: #2a2a2a
Knob Body Lighter: #2a2a2a        // same value
Knob Body Lightest: #2a2a2a       // same value
Knob Body Darkest: #2a2a2a        // same value
```

**Transparent** (Light themes)
```
Knob Body: #ccccce00              // fully transparent
```
Note: Transparent knobs show Bitwig's default color. Use solid colors.

### Alpha Transparency Patterns

Community themes consistently use these alpha values:
```
40 (25%) - Glows, subtle backgrounds, selection fills
64 (40%) - Inactive scrollbars, hover states
80 (50%) - Semi-transparent overlays, button backgrounds
B4 (70%) - Popup backgrounds
F0 (94%) - Near-solid elements
```

### Theme Variant Strategies

chimi creates theme families efficiently:

**Darkness Variants** - Same accents, different backgrounds:
```
Greenwig Plus:    Grey 0: #0e1012, Timeline: #252525
Dark Greenwig:    Grey 0: #0c0e10, Timeline: #141414
Darkest Greenwig: Grey 0: #080a0c, Timeline: #0d0d0f
```

**Accent Variants** - Same structure, swap one color:
```
Greenon Blue:   Automation: #064568 (navy)
Greenon Pink:   Automation: #680663 (magenta)
Orangeon:       On: #ffa82f (orange), Auto: #c2631e (burnt orange)
```

---

## Light Theme Techniques

Light themes require specific adaptations:

### Semantic Token Inversion
```
White: #000000              // inverted!
Black: #ffffff              // inverted!
Light Text: #000000         // dark text for light backgrounds
Dark Text: #ffffff          // light text for dark contexts
```

### Background Hierarchy
```
Window background: #fafafb  // near-white
Button background: #EDEDF1  // subtle grey
Device Header: #ffffff      // pure white
Display Background: #373D40 // keep dark for waveform contrast
```

### Accent Color Adaptation
Bright colors that work on dark backgrounds often fail on light:
- Bright yellow, cyan, lime → poor contrast
- Use darker/more saturated variants for text-related properties
- Keep bright colors for decorative elements (meters, knob values)

---

## Design System Integration (Nord, Dracula, etc.)

When adapting a design palette:

### Map Palette to UI Elements
| Palette Role | Bitwig Properties |
|--------------|-------------------|
| Background shades | Grey 0-6, Window background |
| Foreground/text | Light Text, Default text, Menu text |
| Primary accent | Accent (default), Knob Value Color |
| Secondary accents | Automation, Modulation colors |
| Semantic red | Errors, Record, Meter Red, Clipping |
| Semantic green | Activation Green, Mapping, Meter Normal |
| Semantic yellow | Warnings, Activation Yellow |

### Preserve Critical Semantics
Even highly stylized themes preserve:
- Red for record/errors/clipping
- Green for activation/mapping (or a clearly "success" color)
- Yellow for warnings

### Use All Palette Colors
Good palette themes use the full spectrum:
- 8 Mapping indication colors from palette
- 9 Panel colors from palette
- Meter states from palette

---

## Common Patterns by Theme Type

### Professional Dark Theme
```
Window background: #1e2228    // dark, may have slight tint
Grey 0-6: smooth gradient dark→medium
Accent: single color, moderate saturation
Text: #e0e4ea or similar near-white
Knobs: 3D embossed or flat, neutral
Meters: traditional green/yellow/red
```

### Vibrant/Neon Theme
```
Window background: #121212 or darker
Grey 0-6: near-black throughout
Accent: high saturation neon colors
Text: near-white or tinted
Knobs: dark/flat to not compete
Meters: may use accent color
```

### Retro OS Theme
```
Window background: era-appropriate
Grey 0-6: limited palette (4-16 colors)
Accent: period-accurate highlights
Text: often pure white or cream
Knobs: flat (no emboss)
All elements: constrained palette
```

### Software-Inspired Theme
```
Window background: match source luminosity
Grey 0-6: color-picked or approximated
Accent: signature color of source
Knobs: simplified to match source
Timeline: may need special attention
```

---

## Property Reference (265 Properties)

### High-Impact Properties (Start Here)

These 20-30 properties define your theme's character:

**Foundation:**
- `Window background`
- `Grey 0` through `Grey 6`
- `Default text`, `Light Text`, `Dark Text`

**Primary Accent:**
- `Accent (default)`
- `Knob Value Color`
- `Led On`
- `Progress bar`

**Meters:**
- `Meter Normal`, `Meter Yellow`, `Meter Red`, `Meter Clipping`

**Buttons:**
- `Button background`, `Button stroke`
- `Menu background`, `Menu text`

**Selection:**
- `White Selection`
- `Time Selection Fill`, `Time Selection Stroke`

### Full Property List by Category

<details>
<summary>Core Interface (~20 properties)</summary>

| Property | Controls |
|----------|----------|
| `Window background` | Main app background |
| `Grey 0` | Darkest - device panels |
| `Grey 1` | Empty timeline |
| `Grey 2` | Active timeline |
| `Grey 3` | Device backgrounds |
| `Grey 4` | Device nodes |
| `Grey 5` | Panel borders |
| `Grey 6` | Selected highlights |
| `Default text` | Primary text |
| `Dark Text` | Text on light backgrounds |
| `Light Text` | Text on dark backgrounds |
| `Lighter Text` | Secondary text |
| `Medium Light Text` | Mid-brightness text |
| `Subtle Light Text` | Dimmed text |
| `Subtler Light Text` | Very dimmed text |
| `Subtle Dark Text` | Dimmed dark text |
| `White` | White reference |
| `Black` | Black reference |
| `Shadow` | Drop shadows |
| `Brighter` | Bright highlights |

</details>

<details>
<summary>Accents & Status (~15 properties)</summary>

| Property | Controls |
|----------|----------|
| `Accent` | Base accent |
| `Accent (default)` | Primary accent - toggles, active states |
| `Accent (hitech)` | Hi-tech/transport displays |
| `Implicit On (subtle)` | Subtle on indicator |
| `On (subtle)` | Subtle on state |
| `On (subtler)` | Subtler on state |
| `Pressed On` | Pressed on state |
| `Mapping` | Mapping mode highlight |
| `Selection` | Selection color |
| `Standby selection` | Standby selection |
| `Warning` | Warning state |
| `Error Text` | Error messages |
| `Activation Green` | Green activation |
| `Activation Yellow` | Yellow activation |
| `Activation Red` | Red activation |

</details>

<details>
<summary>Buttons (~20 properties)</summary>

| Property | Controls |
|----------|----------|
| `Button background` | Standard button fill |
| `Button stroke` | Button border |
| `Pressed button background` | Clicked button |
| `OK Button background` | Confirm button |
| `Checkbox background` | Checkbox fill |
| `Button in tree background` | Tree panel buttons |
| `View button background` | View toggle buttons |
| `Pressed view button background` | Pressed view toggle |
| `Selected borderless button background` | Selected flat button |
| `Pressed borderless button background` | Pressed flat button |
| `Inverted Selected Borderless Button background` | Inverted selection |
| `Close button mouse over background` | Close hover |
| `Close button pressed background` | Close pressed |
| `Abstract Button Stroke` | Generic border |
| `Abstract Button Pressed Background` | Generic pressed |
| `Abstract Button Selected Background` | Generic selected |
| `Abstract Button Unselected Background` | Generic default |
| `Rubber button stroke` | Rubber button border |
| `Rubber highlight button stroke` | Rubber highlight |
| `Color bar button fill color` | Color bar fill |

</details>

<details>
<summary>Knobs & Sliders (~13 properties)</summary>

| Property | Controls |
|----------|----------|
| `Knob Body` | Knob base color |
| `Knob Body Lighter` | Lighter shade |
| `Knob Body Lightest` | Lightest shade |
| `Knob Body Darkest` | Darkest shade |
| `Knob Line` | Position indicator (light) |
| `Knob Line Dark` | Position indicator (dark) |
| `Knob Stroke` | Knob border |
| `Knob Emboss Highlight` | 3D highlight |
| `Knob Emboss Shadow` | 3D shadow |
| `Knob Value Background` | Value arc background |
| `Knob Value Background (dark)` | Dark value arc bg |
| `Knob Value Color` | Value arc color |
| `Slider background` | Slider track |
| `Emboss Highlight` | General emboss highlight |
| `Emboss Shadow` | General emboss shadow |

</details>

<details>
<summary>Toggle Icons (~9 properties)</summary>

| Property | Controls |
|----------|----------|
| `Toggle Icon` | Base toggle icon |
| `Normal Toggle Icon` | Default state |
| `Mouse Over Toggle Icon` | Hover state |
| `Active Toggle Icon (Playing)` | Active/playing |
| `Pressed Toggle Icon` | Pressed state |
| `Normal Inverted Toggle Icon` | Inverted default |
| `Mouse Over Inverted Toggle Icon` | Inverted hover |
| `Active Inverted Toggle Icon (Playing)` | Inverted active |
| `Pressed Inverted Toggle Icon` | Inverted pressed |

</details>

<details>
<summary>Menus & Popups (~17 properties)</summary>

| Property | Controls |
|----------|----------|
| `Menu background` | Menu fill |
| `Menu stroke` | Menu border |
| `Menu text` | Menu item text |
| `Menu Icon` | Menu icons |
| `Menu description text` | Menu subtitles |
| `Menu separator` | Menu dividers |
| `Popup insert` | Insert indicator |
| `Popup overlay background color` | Modal backdrop |
| `Popup Notification Background` | Popup notification |
| `Notification Background` | Notification panel |
| `Notification Normal` | Normal notification |
| `Notification Error` | Error notification |
| `Notification Button Background` | Notification buttons |
| `Tooltip Background` | Tooltip fill |
| `Light Tooltip Background` | Light tooltip |
| `Tooltip Stroke` | Tooltip border |

</details>

<details>
<summary>LEDs & Meters (~11 properties)</summary>

| Property | Controls |
|----------|----------|
| `Led On` | LED lit |
| `Led Off` | LED unlit |
| `Meter Normal` | Normal level |
| `Meter Yellow` | Caution level |
| `Meter Red` | Danger level |
| `Meter Clipping` | Clipping indicator |
| `Meter Gain Reduction` | Compression meter |
| `Meter Hitech` | Hi-tech meter |
| `Meter Hitech Background` | Hi-tech meter bg |
| `Meter Muted` | Muted channel |
| `Hitech background` | Hi-tech background |
| `Hitech on` | Hi-tech on state |

</details>

<details>
<summary>Scrollbars (~7 properties)</summary>

| Property | Controls |
|----------|----------|
| `Scrollbar` | Classic thumb |
| `Scrollbar background` | Classic track |
| `Modern Scrollbar Handle (active)` | Modern thumb active |
| `Modern Scrollbar Handle (inactive)` | Modern thumb idle |
| `Modern Scrollbar Background (active)` | Modern track |
| `Modern Dark Scrollbar Handle (active)` | Dark modern thumb |
| `Modern Dark Scrollbar Handle (inactive)` | Dark modern idle |

</details>

<details>
<summary>Trees & Lists (~17 properties)</summary>

| Property | Controls |
|----------|----------|
| `Tree Item Background` | Tree item fill |
| `Selected Tree Item Background` | Selected item |
| `Selected Tree Item Background (standby)` | Standby selected |
| `Tree Separator` | Tree divider |
| `List Item Background` | List row fill |
| `List Separator` | List divider |
| `Selected Dashboard Tree` | Dashboard selection |
| `Dark tree background (selected)` | Dark tree selection |
| `Dark tree background (standby selected)` | Dark standby |
| `Dark tree text` | Dark tree text |
| `Dark tree text (selected)` | Dark selected text |
| `Dark tree separator` | Dark divider |
| `Dark tree hover background change` | Dark hover |
| `Dark tree selection frame` | Dark selection border |
| `Frame color of selection cursor in the tree.` | Cursor frame |
| `Frame color of selection cursor in the tree. (standby)` | Standby cursor |
| `Launcher Mapping Indication` | Launcher mapping |

</details>

<details>
<summary>Panels & Separators (~15 properties)</summary>

| Property | Controls |
|----------|----------|
| `Panel body` | Panel fill |
| `Selected Panel body` | Selected panel |
| `Panel stroke` | Panel border |
| `Selected Panel stroke` | Selected border |
| `Selected Panel stroke (standby)` | Standby border |
| `Active Panel stroke` | Active border |
| `Panel Stroke (focused)` | Focused border |
| `Inspector Section Frame` | Inspector frame |
| `Content Background` | Content area bg |
| `Light Separator Line` | Light divider |
| `Dark Separator Line` | Dark divider |
| `Dark Panel Sub-frame Stroke` | Sub-panel border |
| `Dark Panel Sub-frame Fill` | Sub-panel fill |
| `Field background` | Input field bg |
| `Number field bar background` | Number field bar |
| `Icon Frame` | Icon border |
| `Color of unselected tabs` | Inactive tabs |
| `Color of stroke between tabs` | Tab dividers |

</details>

<details>
<summary>Device Chain (~7 properties)</summary>

| Property | Controls |
|----------|----------|
| `Device Header` | Device header bg |
| `Device Header (selected)` | Selected device |
| `Device Locked Overlay` | Locked overlay |
| `Device Tint Future` | Future style tint |
| `Device Tint Retro` | Retro style tint |
| `Device Tint Military` | Military style tint |
| `Plugin missing` | Missing plugin |

</details>

<details>
<summary>Display & Waveforms (~10 properties)</summary>

| Property | Controls |
|----------|----------|
| `Display Background` | Display bg |
| `Display Background (error)` | Error display bg |
| `Display Waveform` | Waveform color |
| `Display Stroke` | Display border |
| `Display Start/End Markers` | Start/end markers |
| `Display Loop Markers` | Loop markers |
| `Grey Display Background` | Grey display bg |
| `Audio Event Background` | Clip fill |
| `Audio Event Boundary` | Clip border |
| `Audio Event Waveform` | Clip waveform |

</details>

<details>
<summary>Grid & Modular (~11 properties)</summary>

| Property | Controls |
|----------|----------|
| `The Grid (background)` | Grid device bg |
| `The Grid (stroke)` | Grid device border |
| `Grid Line (Primary)` | Primary grid lines |
| `Grid Line (Secondary)` | Secondary grid lines |
| `Background color of the modular environment.` | Modular bg |
| `Compressed Audio Port in modular environment` | Compressed audio |
| `Audio connection in modular environment` | Audio cables |
| `Audio64 connection in modular environment` | 64-bit audio cables |
| `Event connection in modular environment` | Event cables |
| `Polyphonic Desktop Object` | Polyphonic indicator |
| `Current Atom Value Color` | Current atom value |

</details>

<details>
<summary>Timeline & Arranger (~15 properties)</summary>

| Property | Controls |
|----------|----------|
| `Dark Timeline Background` | Dark timeline bg |
| `Dark Timeline Header Background` | Dark header bg |
| `Light Timeline Background` | Light timeline bg |
| `Light Timeline Header Background` | Light header bg |
| `Top Level Timeline Background` | Top level bg |
| `Top Level Timeline Header Background` | Top level header |
| `Irrelevant Timeline Background` | Irrelevant bg |
| `Irrelevant Timeline Header Background` | Irrelevant header |
| `Irrelevant Timeline Overlay` | Irrelevant overlay |
| `Irrelevant Timeline Header Overlay` | Header overlay |
| `Timeline Background Pattern` | Background pattern |
| `Timeline Header Background Pattern` | Header pattern |
| `Timeline Primary Grid` | Primary grid |
| `Timeline Secondary Grid` | Secondary grid |
| `Timeline Header Primary Grid` | Header primary grid |
| `Timeline Header Secondary Grid` | Header secondary grid |
| `Timeline Playhead` | Playhead |
| `Timeline edit tool chooser background` | Tool chooser bg |

</details>

<details>
<summary>Time Selection (~25 properties)</summary>

| Property | Controls |
|----------|----------|
| `Time Selection Fill` | Selection fill |
| `Time Selection Stroke` | Selection border |
| `Time Selection Implicit Fill` | Implicit fill |
| `Time Selection Cursor Stroke` | Cursor line |
| `Time Selection Standby Fill` | Standby fill |
| `Time Selection Standby Stroke` | Standby border |
| `Time Selection Standby Cursor Stroke` | Standby cursor |
| `Time Selection Inactive Fill` | Inactive fill |
| `Time Selection Inactive Stroke` | Inactive border |
| `Time Selection Not Selected Fill` | Unselected fill |
| `Time Selection Not Selected Stroke` | Unselected border |
| `Time Selection Across All Lanes Fill` | Cross-lane fill |
| `Time Selection Across All Lanes Stroke` | Cross-lane border |
| `Header Time Selection Fill` | Header fill |
| `Header Time Selection Stroke` | Header border |
| `Header Time Selection Cursor Stroke` | Header cursor |
| `Header Time Selection Standby Fill` | Header standby |
| `Header Time Selection Standby Stroke` | Header standby border |
| `Header Time Selection Standby Cursor Stroke` | Header standby cursor |
| `Header Time Selection Across All Lanes Fill` | Header cross-lane |
| `Header Time Selection Across All Lanes Stroke` | Header cross-lane border |
| `White Selection` | White selection |
| `White Selection (standby)` | Standby white |

</details>

<details>
<summary>Loop Regions (~8 properties)</summary>

| Property | Controls |
|----------|----------|
| `Loop Region Background` | Loop overlay |
| `Loop Region Fill` | Loop fill |
| `Loop Region Stroke` | Loop border |
| `Loop Region Selected Fill` | Selected fill |
| `Loop Region Selected Stroke` | Selected border |
| `Header Loop Region Background` | Header loop |
| `Insert preview time` | Insert preview |

</details>

<details>
<summary>Automation & Modulation (~20 properties)</summary>

| Property | Controls |
|----------|----------|
| `Automation Color` | Automation curve |
| `Automation Chooser Background` | Chooser bg |
| `Automation button glow color` | Button glow |
| `Arranger Automation Curve Fill Color` | Curve fill |
| `Track Automation Button Color` | Track button |
| `Track Automation Color` | Track automation |
| `Clip Automation Color` | Clip automation |
| `Clip Modulation Color` | Clip modulation |
| `Add Modulation Button Color` | Add mod button |
| `Multiply Modulation Button Color` | Multiply button |
| `User Automation Override Color` | User override |
| `Note Expression Color` | Note expression |
| `Send (post) value color` | Post-fader send |
| `Send (pre) value color` | Pre-fader send |
| `Dark offset for automation/channel bar` | Dark offset |
| `Light offset for automation/channel bar` | Light offset |
| `Unselected Filled Automation Type Icon` | Filled icon |
| `Unselected Empty Automation Type Icon` | Empty icon |
| `Selected matrix slot color` | Matrix slot |

</details>

<details>
<summary>Modulation Mapping (~13 properties)</summary>

| Property | Controls |
|----------|----------|
| `Modulation Mapping Color` | Mapping color |
| `Modulation Mapping Color (subtractive)` | Subtractive |
| `Modulation Mapping Color (polyphonic)` | Polyphonic |
| `Modulation Mapping Background (monophonic)` | Mono bg |
| `Modulation Mapping Background (polyphonic)` | Poly bg |
| `Modulation Mapping Background Color` | Mapping bg |
| `Mapping indication 1` | Slot 1 color |
| `Mapping indication 2` | Slot 2 color |
| `Mapping indication 3` | Slot 3 color |
| `Mapping indication 4` | Slot 4 color |
| `Mapping indication 5` | Slot 5 color |
| `Mapping indication 6` | Slot 6 color |
| `Mapping indication 7` | Slot 7 color |
| `Mapping indication 8` | Slot 8 color |

</details>

<details>
<summary>Record & Transport (~5 properties)</summary>

| Property | Controls |
|----------|----------|
| `Record button color` | Record button |
| `Record button color implicit` | Implicit record |
| `Record button glow color` | Record glow |
| `Record text color` | Record text |
| `Monitoring buttons color` | Monitor buttons |

</details>

<details>
<summary>Markers & Detection (~5 properties)</summary>

| Property | Controls |
|----------|----------|
| `Onset Color Min` | Onset min |
| `Onset Color Max` | Onset max |
| `Onset Marker Color` | Onset marker |
| `Beat Marker Color` | Beat marker |
| `Analyzed Beat Color` | Analyzed beat |
| `Timeline Cue Marker` | Cue marker |
| `Timeline Header Cue Marker` | Header cue |

</details>

<details>
<summary>File Status (~6 properties)</summary>

| Property | Controls |
|----------|----------|
| `Missing file icon` | Missing icon |
| `Missing file text` | Missing text |
| `Found file icon` | Found icon |
| `Found file text` | Found text |
| `External file icon` | External icon |
| `External file text` | External text |

</details>

<details>
<summary>Command Palette (~4 properties)</summary>

| Property | Controls |
|----------|----------|
| `Invoke Action Background` | Palette bg |
| `Invoke Action Category` | Category text |
| `Invoke Action Text` | Command text |
| `User input text` | Input text |

</details>

<details>
<summary>Panel Colors (~9 properties)</summary>

| Property | Controls |
|----------|----------|
| `Panel Red` | Red track/clip |
| `Panel Orange` | Orange |
| `Panel Yellow` | Yellow |
| `Panel Lime` | Lime |
| `Panel Green` | Green |
| `Panel Mint` | Mint |
| `Panel Turquoise` | Turquoise |
| `Panel Blue` | Blue |
| `Panel Purple` | Purple |

</details>

<details>
<summary>Branding (~7 properties)</summary>

| Property | Controls |
|----------|----------|
| `Bitwig Red` | Brand red |
| `Bitwig Mint` | Brand mint |
| `Bitwig CI` | Corporate identity |
| `Bitwig Producer` | Producer edition |
| `Bitwig Essentials` | Essentials edition |
| `Bitwig 8-Track` | 8-Track edition |
| `Bitwig 16-Track` | 16-Track edition |

</details>

<details>
<summary>Misc (~6 properties)</summary>

| Property | Controls |
|----------|----------|
| `Comp fill` | Comping overlay |
| `Drop Indicator` | Drag indicator |
| `Progress bar` | Progress fill |
| `Progress background` | Progress track |
| `Hitcount background` | Hit counter bg |
| `Hitcount text color` | Hit counter text |
| `Link Text` | Hyperlinks |
| `Link Text Rollover` | Link hover |

</details>

---

## Known Issues

### Device Knobs Are Hardcoded
Knob Body properties only affect mixer/inspector knobs. Device panel knobs (Polymer, etc.) use hardcoded Bitwig colors and cannot be themed.

### Buggy Properties (Bitwig 6.x)
These properties may cause issues — comment out or omit:
```
// Clip Automation Button Color: #...
// Clip Content Automation Stroke Color: #...
// Clip Content Automation Fill Color: #...
// Clip Expression Background Color: #...
```

### Bitwig 5.x → 6.x Property Changes
| Bitwig 5.x | Bitwig 6.x |
|------------|------------|
| `On` | `Accent (default)` |
| `On (subtle)` | `Implicit On (subtle)` |
| `Hitech on` | `Accent (hitech)` |
| `Hole (dark)` | `Grey 0` |
| `Dark Timeline Background` | `Grey 1` |
| `Light Timeline Background` | `Grey 2` |
| `Hole (medium/light)` | `Grey 3` |

---

## Quick Start Templates

### Minimal Dark Theme
```
Gradient: false
Window background: #1e2228
Grey 0: #14181e
Grey 1: #1a1e24
Grey 2: #202630
Grey 3: #262c38
Grey 4: #2e3440
Grey 5: #363e4a
Grey 6: #404a56
Default text: #e0e4ea
Accent (default): #YOUR_ACCENT
Knob Value Color: #YOUR_ACCENT
```

### Minimal Light Theme
```
Gradient: false
Window background: #fafafb
Grey 0: #ebebed
Grey 1: #e4e4e7
Grey 2: #fafbff
Grey 3: #f7f7f8
Grey 4: #f7f7f8
Grey 5: #ffffff
Grey 6: #dfdfef
Default text: #000000
White: #000000
Black: #ffffff
Light Text: #000000
Dark Text: #ffffff
Accent (default): #YOUR_ACCENT
Knob Value Color: #YOUR_ACCENT
```

---

*Guide based on analysis of 70+ community themes including work by xbitz, chimi, dsnvs, hotpxl, Verdant, Sternenherz, myst, woodmoth, lenninst, and many others.*
