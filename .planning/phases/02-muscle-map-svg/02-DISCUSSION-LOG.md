# Phase 2: Muscle Map SVG - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-23
**Phase:** 02-muscle-map-svg
**Areas discussed:** SVG asset source, Map visual style, Front/back toggle UX, Disambiguation UI

---

## SVG Asset Source

| Option | Description | Selected |
|--------|-------------|----------|
| AI-generate the SVG | Use AI image tool, clean up and add path IDs | |
| Open-source anatomy SVG | Find CC-licensed anatomical SVG, adapt it | ✓ |
| Hand-draw from scratch | Commission or create custom SVG | |
| Code-generate paths | Programmatically define muscle regions as SVG paths | |

**User's choice:** Open-source anatomy SVG
**Notes:** User comfortable with heavy rework of the open-source base to match Rip Zone aesthetic.

### Left/Right Path Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Separate left/right | Each side gets own path ID | |
| Single bilateral paths | One path per muscle regardless of side | |
| You decide | Claude picks | |

**User's choice:** Other — "depends on user if he wants normal/advanced/anatomy mode for training!"
**Notes:** User introduced a 3-mode detail system: Normal (grouped), Advanced (individual heads), Anatomy (left/right separation). This became a core architectural decision.

### Mode Scope

| Option | Description | Selected |
|--------|-------------|----------|
| All 3 modes in Phase 2 | Build normal/advanced/anatomy toggle now | ✓ |
| Advanced mode only, toggle later | Ship with middle ground | |
| You decide | | |

**User's choice:** All 3 modes in Phase 2

### SVG Layer Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Single SVG, CSS layers | One SVG with grouped layers, toggle visibility | |
| Separate SVGs per mode | 3 front + 3 back = 6 SVG files | ✓ |

**User's choice:** Separate SVGs per mode

### SVG Rework Level

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal rework | Add path IDs and minor tweaks | |
| Heavy rework OK | Restyle paths, colors, proportions for neon/dark aesthetic | ✓ |
| You decide | | |

**User's choice:** Heavy rework OK

---

## Map Visual Style

| Option | Description | Selected |
|--------|-------------|----------|
| Stylized anatomical | Clean vector, medical textbook meets modern app | |
| Game-like / stylized | Bold outlines, exaggerated proportions | |
| Flat minimalist vector | Simple solid-color shapes, silhouette-based | ✓ |

**User's choice:** Flat minimalist vector

### Muscle Boundaries

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle stroke borders | Thin 1-2px lines between regions | ✓ |
| No borders, color only | Muscles distinguished by fill color/shade only | |
| You decide | | |

**User's choice:** Subtle stroke borders

### Base Color

| Option | Description | Selected |
|--------|-------------|----------|
| Muted gray/slate | Neutral dark gray fills, clean canvas for heatmap | ✓ |
| Subtle neon tint | Faint cyan/teal tint even at rest | |
| You decide | | |

**User's choice:** Muted gray/slate

### Body Silhouette

| Option | Description | Selected |
|--------|-------------|----------|
| Full body silhouette | Head, hands, feet shown as non-interactive outline | ✓ |
| Cropped to muscles | Only show regions where clickable muscles exist | |
| You decide | | |

**User's choice:** Full body silhouette

### Hover/Tap Feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Neon glow on hover | Subtle neon glow effect | |
| Color brighten | Muscle fill lightens on hover | ✓ |
| No hover effect | Only react on click/tap | |
| You decide | | |

**User's choice:** Color brighten

---

## Front/Back Toggle UX

| Option | Description | Selected |
|--------|-------------|----------|
| Segmented control | Pill-shaped "Front \| Back" toggle | ✓ |
| Swipe gesture | Swipe left/right to flip views | |
| Tap the body | Tap body outline to rotate | |
| You decide | | |

**User's choice:** Segmented control

### Transition Animation

| Option | Description | Selected |
|--------|-------------|----------|
| Crossfade | Smooth opacity transition | |
| Instant swap | No animation, just swap | ✓ |
| Flip animation | 3D-style card flip | |
| You decide | | |

**User's choice:** Instant swap

### Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Above the map | Standard, toggle at top | |
| Below the map | Map priority, thumb-friendly | |
| You decide | Claude picks best for mobile-first | ✓ |

**User's choice:** You decide

---

## Disambiguation UI

| Option | Description | Selected |
|--------|-------------|----------|
| Popover list | Small dropdown near tap point | |
| Zoom + highlight | Map zooms into cluster, user taps specific muscle | ✓ |
| Bottom sheet list | Bottom sheet slides up with muscle names | |
| You decide | | |

**User's choice:** Zoom + highlight

### Zoom Back Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-zoom back on select | Selection registers, map zooms back to full body | ✓ |
| Manual close button | Zoomed view stays until close button tapped | |
| You decide | | |

**User's choice:** Auto-zoom back on select

### Mode + Disambiguation

| Option | Description | Selected |
|--------|-------------|----------|
| Disambig only in Advanced/Anatomy | Normal mode has no overlaps, no need | ✓ |
| Disambig in all modes | Keep zoom+highlight everywhere for consistency | |
| You decide | | |

**User's choice:** Disambig only in Advanced/Anatomy

### Zoom Focus Treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Dim surroundings | Dark overlay on everything outside cluster | ✓ |
| No dimming | Just zoom, full map visible at zoomed scale | |
| You decide | | |

**User's choice:** Dim surroundings

### Zoom Labels

| Option | Description | Selected |
|--------|-------------|----------|
| Show name labels | Each muscle gets a text label in zoom view | ✓ |
| Hover/tap to reveal name | No labels by default, hover shows name | |
| You decide | | |

**User's choice:** Show name labels

---

## Claude's Discretion

- Segmented control placement (above vs below map)
- Detail mode toggle UI pattern and placement
- Exact stroke widths, gray/slate shade values, brighten effect intensity
- SVG viewBox dimensions and aspect ratio
- Invisible hit-target overlay implementation
- useMapStore extension for detail mode state

## Deferred Ideas

None — discussion stayed within phase scope.
