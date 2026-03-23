# Phase 2: Muscle Map SVG - Research

**Researched:** 2026-03-23
**Domain:** SVG anatomy illustration, React SVG interactivity, Next.js 16 / Turbopack, Zustand state management, disambiguation UX
**Confidence:** HIGH (most findings verified against Next.js official docs and package registry)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**SVG Asset Source**
- D-01: Use an open-source/CC-licensed anatomical SVG as the base illustration, then heavily rework it — restyle paths, colors, proportions to match the Rip Zone neon/dark aesthetic
- D-02: Three detail modes requiring separate SVG files per mode: Normal (grouped muscles), Advanced (individual heads), Anatomy (full anatomical detail with left/right separation)
- D-03: All 3 modes built in Phase 2 — not deferred
- D-04: Separate SVG files per mode (3 front + 3 back = 6 SVG files total)
- D-05: SVG path IDs follow the existing `svgRegion` convention from `data/muscles.json` (e.g., `muscle-pectoralis-major`). Advanced/Anatomy modes extend with suffixes

**Map Visual Style**
- D-06: Flat minimalist vector style — simple solid-color shapes, silhouette-based
- D-07: Subtle stroke borders (1-2px) between muscle regions
- D-08: Muted gray/slate base fill color for muscles in default state
- D-09: Full body silhouette including head, neck, hands, feet — non-interactive elements as outline
- D-10: Color brighten effect on hover/tap for interactive feedback

**Front/Back Toggle UX**
- D-11: Segmented control ("Front | Back") pill-shaped toggle
- D-12: Instant swap on toggle — no animation
- D-13: View state persisted via `useMapStore.currentView` (already implemented)

**Disambiguation UI**
- D-14: Zoom + highlight interaction for overlapping muscle regions
- D-15: Disambiguation only triggers in Advanced and Anatomy modes
- D-16: Auto-zoom back to full body on muscle selection
- D-17: Dim/dark overlay on surrounding muscles during zoom
- D-18: Muscle name labels shown in zoomed cluster view

### Claude's Discretion

- Segmented control placement relative to the map (above vs below)
- Detail mode toggle UI pattern and placement
- Exact stroke widths, gray/slate shade values, and brighten effect intensity
- SVG viewBox dimensions and aspect ratio
- Invisible hit-target overlay implementation details
- How to handle the mode system in useMapStore (new state field for detail mode)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MAP-01 | User can view a 2.5D illustrated muscle map with front and back body views | SVG-as-React-component architecture via SVGR; 6 SVG files (3 modes × 2 views); per-path fill manipulation |
| MAP-02 | User can toggle between front and back views with state preserved | `useMapStore.currentView` already exists; segmented control triggers `setView()`; Zustand state survives navigation |
| MAP-05 | User can tap small/clustered muscles with disambiguation UI for accurate selection | Invisible hit-target overlays on SVG paths; zoom + highlight pattern in Advanced/Anatomy modes; `@base-ui/react` Popover/Dialog available |
</phase_requirements>

---

## Summary

Phase 2 builds the hero visual feature: an interactive 2.5D muscle map with front/back views, three detail modes, and disambiguation zoom. The technical foundation is SVG-as-React-component imports via `@svgr/webpack` under Turbopack — a pattern explicitly documented in the Next.js 16 official docs and pre-wired in `next.config.ts`. The core loop is: import SVG as component → read `id` attributes from paths → apply dynamic `fill` via React props → wire click handlers to `useMapStore.selectMuscle()`.

The most important architectural decision is the **two-layer SVG approach**: one layer contains the visual illustration paths (filled shapes), and a second layer contains invisible `<path>` overlays with larger hit areas. This is the standard pattern for making small SVG regions tappable on mobile and is the right approach for the brachialis, rotator cuff, and other small muscles named in MAP-05.

The disambiguation zoom (D-14–D-18) is implemented in React state, not CSS transforms on the SVG element. When a cluster tap is detected, `useMapStore` records a `zoomRegion` and the component renders a zoomed subview (enlarged viewBox slice) with labeled paths and a dim overlay. This is pure React state — no third-party zoom library needed.

**Primary recommendation:** Install `@svgr/webpack@8.1.0` immediately (it is listed in `next.config.ts` but not in `package.json`). Build SVG files by hand-authoring or reworking an open-source base (e.g., Wikimedia anatomical SVGs), setting path IDs to match `svgRegion` values from `data/muscles.json` exactly.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@svgr/webpack` | 8.1.0 (latest) | SVG → React component transform | Explicitly listed as supported Turbopack webpack loader in Next.js 16 official docs; pre-wired in next.config.ts |
| `zustand` | ^5.0.12 (installed) | Map state (view, mode, selection, zoomRegion) | Already in project; useMapStore already has front/back state |
| `@base-ui/react` | ^1.3.0 (installed) | Headless Popover for disambiguation labels | Already installed; has Popover component with positioning |
| `tailwindcss` | ^4 (installed) | Styling for controls (segmented control, mode toggle) | Already in project; OKLCH tokens established |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `svgo` | 4.0.1 (latest) | SVG optimization before committing | Run on all 6 SVG files to reduce path complexity before import |
| `lucide-react` | ^0.577.0 (installed) | Icons for mode toggle UI | Already installed; use for mode labels if icon-only toggle chosen |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@svgr/webpack` as Turbopack loader | Inline SVG via `fetch` + `dangerouslySetInnerHTML` | Avoids SVGR install but loses TypeScript SVG component typing and React prop integration; not recommended |
| `@svgr/webpack` as Turbopack loader | Embed SVG as `<img>` tag | Cannot manipulate path fills at runtime; ruled out for heatmap prep |
| React state zoom | `react-zoom-pan-pinch` or `d3-zoom` | Overkill for a fixed-region zoom on a known viewBox slice; adds ~50KB |
| `@base-ui/react` Popover | `@radix-ui/react-popover` | Base UI already installed; equivalent API; no need to add another headless library |

**Installation (missing packages):**
```bash
npm install --save-dev @svgr/webpack
```

**Version verification:** Verified 2026-03-23 against npm registry.
- `@svgr/webpack`: 8.1.0 (published recently, matches Next.js docs reference)
- `svgo`: 4.0.1 (run as one-off CLI, no install needed)

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   └── muscle-map/
│       ├── MuscleMap.tsx          # Orchestrator: picks SVG + wires store
│       ├── MuscleMapControls.tsx  # Segmented control + mode toggle
│       ├── MuscleMapCanvas.tsx    # SVG render + overlay layer + zoom logic
│       └── DisambiguationZoom.tsx # Zoomed cluster view with labels
├── stores/
│   └── useMapStore.ts             # Extend with: detailMode, zoomRegion
public/
│   (SVGs served statically — NOT used; see pattern below)
src/assets/svg/
├── muscle-map-normal-front.svg
├── muscle-map-normal-back.svg
├── muscle-map-advanced-front.svg
├── muscle-map-advanced-back.svg
├── muscle-map-anatomy-front.svg
└── muscle-map-anatomy-back.svg
```

**SVG file location:** Place SVGs under `src/assets/svg/` (not `public/`). Files in `public/` are served as static assets and cannot be imported as React components via SVGR. The Turbopack rule in `next.config.ts` applies to files processed through the module graph — `import MuscleMap from '@/assets/svg/muscle-map-normal-front.svg'` is the correct import path.

### Pattern 1: SVGR Import as React Component

**What:** Import SVG file directly; Turbopack runs `@svgr/webpack` and emits a React component that accepts standard SVG props.
**When to use:** All 6 muscle map SVG files.

```typescript
// Source: Next.js official docs — turbopack.md (verified 2026-03-23)
// next.config.ts already has this rule — just install @svgr/webpack

// Usage in MuscleMapCanvas.tsx
import NormalFront from '@/assets/svg/muscle-map-normal-front.svg'
import NormalBack from '@/assets/svg/muscle-map-normal-back.svg'

// Component accepts SVG props including className
<NormalFront className="w-full h-full" aria-label="Front muscle map" />
```

**TypeScript declaration needed** — add `src/types/svg.d.ts`:
```typescript
// Tells TypeScript that *.svg imports return a React component
declare module '*.svg' {
  import type { FC, SVGProps } from 'react'
  const ReactComponent: FC<SVGProps<SVGSVGElement>>
  export default ReactComponent
}
```

### Pattern 2: Two-Layer SVG Architecture (Hit Targets)

**What:** Visual SVG paths live in one group; transparent/invisible hit-target `<path>` elements live in a second group on top. Hit targets can be larger than the visual paths.
**When to use:** All interactive muscles, especially small ones (brachialis, rotator cuff, supraspinatus) for MAP-05.

```typescript
// In SVG source file — two layers within same SVG:
// Layer 1: Visual paths (filled, stroked)
<g id="visual-layer">
  <path id="muscle-brachialis" fill="oklch(0.25 0.02 265)" stroke="oklch(0.20 0.03 265)" />
</g>

// Layer 2: Hit targets (transparent, larger bounds)
<g id="hit-layer">
  <path id="hit-muscle-brachialis" fill="transparent" stroke="none"
        style={{cursor:'pointer'}} onClick={...} />
</g>

// In React component — wire onClick to hit-layer paths only
// Visual paths respond to CSS selector based on store state
```

**Alternative approach** (simpler, less SVG authoring overhead): Keep single paths but use `pointer-events` and apply a `stroke-width` expansion trick — add invisible stroke with `pointer-events: stroke` set. Recommended for Normal mode. Use separate hit layers for Advanced/Anatomy.

### Pattern 3: Dynamic Fill via React State

**What:** Map `selectedMuscle` and future `strainLevels` from Zustand to SVG `fill` props by querying path IDs.
**When to use:** All interactive state (hover, selection, heatmap prep).

```typescript
// MuscleMapCanvas.tsx — CSS approach (avoids re-render per path)
// Inject a <style> tag or use CSS custom properties per muscle slug

// Simpler approach: use CSS attribute selectors
// When a muscle is selected, add a class to the SVG wrapper
// Then target with CSS: .selected #muscle-biceps-brachii { fill: var(--primary) }

// OR: directly manipulate with inline styles via SVG DOM refs
// This is the approach compatible with SVGR-generated components
```

**Recommended for Phase 2:** Use `data-muscle-state` attributes set on the SVG wrapper, combined with CSS attribute selectors in `globals.css`. This avoids per-path React state but allows CSS transitions. Heatmap colors (Phase 5) then just need to update the attribute values.

```css
/* In globals.css — Phase 2 adds these */
/* Default: muted gray */
[data-view] path[id^="muscle-"] {
  fill: oklch(0.22 0.02 265);
  stroke: oklch(0.18 0.03 265);
  stroke-width: 1px;
}
/* Hover / brighten */
[data-view] path[id^="muscle-"]:hover {
  fill: oklch(0.30 0.04 265);
  cursor: pointer;
}
/* Selected state */
[data-selected-muscle] path[id^="muscle-"] {
  /* Non-selected muscles dimmed when something is selected */
}
```

### Pattern 4: useMapStore Extension for Detail Mode

**What:** Add `detailMode` and `zoomRegion` to the existing Zustand store.
**When to use:** New state required for D-02 (three modes) and D-14 (disambiguation zoom).

```typescript
// Extend useMapStore.ts
type DetailMode = 'normal' | 'advanced' | 'anatomy'

interface ZoomRegion {
  muscles: MuscleSlug[]  // muscles in cluster
  viewBox: string        // SVG viewBox string to zoom into, e.g. "120 80 60 40"
  label: string          // e.g. "Rotator Cuff"
}

interface MapState {
  currentView: MapView
  selectedMuscle: MuscleSlug | null
  detailMode: DetailMode            // NEW
  zoomRegion: ZoomRegion | null     // NEW — non-null = disambiguation active
  setView: (view: MapView) => void
  selectMuscle: (slug: MuscleSlug | null) => void
  setDetailMode: (mode: DetailMode) => void   // NEW
  setZoomRegion: (region: ZoomRegion | null) => void  // NEW
}
```

### Pattern 5: Disambiguation Zoom (D-14–D-18)

**What:** When user taps a clustered region in Advanced/Anatomy mode, show a zoomed subview of the cluster. Muscles are labeled. User taps a specific muscle to select it.
**When to use:** Small/overlapping muscles in Advanced and Anatomy modes only (D-15).

```typescript
// MuscleMapCanvas.tsx — zoom is a CSS transform on a cloned SVG viewBox
// NOT a separate DOM element — same SVG, just a controlled viewBox attribute

// Step 1: Detect cluster tap
// Each SVG hit target knows its cluster membership (defined in a static map)
const CLUSTER_MAP: Record<string, ZoomRegion> = {
  'hit-muscle-supraspinatus': {
    muscles: ['rotator-cuff', 'supraspinatus', 'infraspinatus', 'teres-minor'],
    viewBox: '120 60 80 60',
    label: 'Rotator Cuff'
  },
  // ...
}

// Step 2: On cluster tap, call setZoomRegion(CLUSTER_MAP[hitId])
// Step 3: MuscleMapCanvas reads zoomRegion and renders:
//   - SVG with viewBox set to zoomRegion.viewBox
//   - Dim overlay on non-cluster muscles via CSS
//   - Text labels positioned relative to each muscle centroid
// Step 4: On muscle tap in zoomed view, call selectMuscle() then setZoomRegion(null)
```

### Pattern 6: SVG Text Labels in Zoomed View (D-18)

**What:** Show muscle name labels inside the zoomed cluster view.
**When to use:** During disambiguation zoom only.

```typescript
// Labels rendered as SVG <text> elements overlaid in the same SVG coordinate space
// Each labelable muscle has a known centroid (x, y) in SVG coords

const MUSCLE_CENTROIDS: Record<string, { x: number; y: number }> = {
  'muscle-supraspinatus': { x: 140, y: 85 },
  // ...
}

// In JSX (inside SVG):
{zoomRegion && zoomRegion.muscles.map(slug => (
  <text
    key={slug}
    x={MUSCLE_CENTROIDS[slug].x}
    y={MUSCLE_CENTROIDS[slug].y}
    fill="oklch(0.95 0.01 270)"
    fontSize="6"
    textAnchor="middle"
  >
    {muscleDisplayNames[slug]}
  </text>
))}
```

### Anti-Patterns to Avoid

- **Putting SVG files in `public/`:** Files in `public/` are served as static assets, not processed through the module graph. `@svgr/webpack` only transforms files imported via `import`. Place SVGs under `src/assets/svg/`.
- **Using `<img src="...svg">` or `<Image>`:** Cannot manipulate fills at runtime; heatmap (Phase 5) would require a full rewrite.
- **Animating front/back toggle:** D-12 explicitly says instant swap. Adding `transition` classes will violate the decision.
- **Storing all 6 SVGs as static public files and fetching:** Network latency on toggle. SVGR imports are bundled and synchronous.
- **Re-rendering every muscle path as a React component:** Causes 55+ re-renders on every state change. Use CSS attribute selectors or CSS variables for fill state instead of per-path React state.
- **Running SVGR without optimization:** Raw SVG exports from Inkscape/Illustrator have huge path data. Run `svgo` before committing to keep bundle size reasonable.
- **Using `dangerouslySetInnerHTML` for SVG:** Bypasses React reconciliation; event delegation won't work.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG → React component transform | Custom build script | `@svgr/webpack` via Turbopack | Handles SVG attribute normalization, `className` prop, `ref` forwarding, TypeScript types |
| Headless popover/dialog positioning | Custom absolute-positioned div | `@base-ui/react` Popover | Handles portal, focus trap, anchor positioning, keyboard dismiss — all needed for disambiguation labels |
| Segmented control | Custom toggle buttons | Tailwind + Button components | shadcn Button is already installed; wrap in a flex container with `aria-pressed` states |
| SVG file optimization | Manual path editing | `svgo` CLI | Reduces path precision and metadata; run once before committing SVG assets |

**Key insight:** The disambiguation zoom is the only novel UI in this phase — everything else maps to existing patterns. Don't build a pan/zoom library; the viewBox manipulation approach is 20 lines of React state.

---

## Common Pitfalls

### Pitfall 1: @svgr/webpack Not Installed

**What goes wrong:** `next.config.ts` references `@svgr/webpack` as a Turbopack loader, but the package is not in `package.json` and is not in `node_modules`. The dev server will throw a loader resolution error when any `*.svg` file is imported.

**Why it happens:** Phase 1 pre-wired the Turbopack config rule as infrastructure for Phase 2, but did not add the devDependency.

**How to avoid:** First task of Wave 0 must be `npm install --save-dev @svgr/webpack`. Verify: `ls node_modules/@svgr/webpack` should succeed.

**Warning signs:** Build error like `Cannot find module '@svgr/webpack'` or `Loader not found`.

### Pitfall 2: SVG Files in public/ Instead of src/

**What goes wrong:** `import MuscleMap from '/muscle-map.svg'` (public path) does not go through Turbopack's module graph and is not transformed by `@svgr/webpack`. You get a URL string, not a React component.

**Why it happens:** Public/ is the intuitive place to put assets.

**How to avoid:** Place all 6 SVG files under `src/assets/svg/`. Import with `import NormalFront from '@/assets/svg/muscle-map-normal-front.svg'`.

**Warning signs:** TypeScript error `Type 'string' is not assignable to type 'FC<SVGProps<SVGSVGElement>>'` or the SVG renders as a broken image.

### Pitfall 3: Missing TypeScript SVG Module Declaration

**What goes wrong:** TypeScript doesn't know what `*.svg` imports return. Without a declaration file, every SVG import is typed as `any` or causes a TS error.

**Why it happens:** `@svgr/webpack` doesn't install a global type declaration.

**How to avoid:** Create `src/types/svg.d.ts` declaring `declare module '*.svg'` as a React component.

**Warning signs:** `Cannot find module './muscle-map.svg' or its corresponding type declarations`.

### Pitfall 4: SVG Path IDs Don't Match muscles.json svgRegion Values

**What goes wrong:** The React component reads `svgRegion` from `data/muscles.json` to find DOM paths (e.g., `muscle-pectoralis-major`), but the SVG path has a different `id` attribute. Hover effects and click handlers silently do nothing.

**Why it happens:** Open-source SVG bases use their own ID conventions. Reworking an SVG means manually renaming all paths.

**How to avoid:** Build a validation step: after SVG authoring, run a script that reads every `svgRegion` from `muscles.json` and checks that a `<path id="...">` exists in the SVG. Fail loudly if any are missing.

**Warning signs:** Click handlers fire but `document.getElementById('muscle-pectoralis-major')` returns null.

### Pitfall 5: Cluster Disambiguation Triggers in Normal Mode

**What goes wrong:** D-15 says disambiguation only triggers in Advanced/Anatomy modes. If the cluster detection logic doesn't check `detailMode`, Normal mode will attempt to zoom when tapping near clustered regions.

**Why it happens:** Easy to wire the cluster map lookup to every hit-target click.

**How to avoid:** In the click handler: `if (detailMode === 'normal') { selectMuscle(slug); return; }` — skip cluster check entirely in Normal mode.

### Pitfall 6: SVG Is SSR-Rendered Without 'use client' Guard

**What goes wrong:** SVGR components import and render fine in Next.js App Router, but interactive features (onClick, useState, useMapStore) require client context. Missing `'use client'` on the map component causes hydration errors.

**Why it happens:** Next.js App Router defaults to Server Components.

**How to avoid:** All components under `src/components/muscle-map/` must have `'use client'` at the top. Established pattern from Phase 1 decisions.

---

## Code Examples

Verified patterns from project code and official sources:

### SVGR Import Pattern

```typescript
// Source: Next.js official docs — turbopack.md, "Configuring webpack loaders" section
// next.config.ts is already set up — just install @svgr/webpack

// src/components/muscle-map/MuscleMapCanvas.tsx
'use client'

import NormalFront from '@/assets/svg/muscle-map-normal-front.svg'
import NormalBack from '@/assets/svg/muscle-map-normal-back.svg'
import AdvancedFront from '@/assets/svg/muscle-map-advanced-front.svg'
// ... etc.

const SVG_MAP = {
  normal: { front: NormalFront, back: NormalBack },
  advanced: { front: AdvancedFront, back: AdvancedBack },
  anatomy: { front: AnatomyFront, back: AnatomyBack },
} as const
```

### useMapStore Extension

```typescript
// Source: existing src/stores/useMapStore.ts pattern
// Zustand 5 — same create() pattern, add fields

import { create } from 'zustand'
import type { MuscleSlug } from '@/types'

type MapView = 'front' | 'back'
type DetailMode = 'normal' | 'advanced' | 'anatomy'

interface ZoomRegion {
  muscles: MuscleSlug[]
  viewBox: string
  label: string
}

interface MapState {
  currentView: MapView
  selectedMuscle: MuscleSlug | null
  detailMode: DetailMode
  zoomRegion: ZoomRegion | null
  setView: (view: MapView) => void
  selectMuscle: (slug: MuscleSlug | null) => void
  setDetailMode: (mode: DetailMode) => void
  setZoomRegion: (region: ZoomRegion | null) => void
}

export const useMapStore = create<MapState>((set) => ({
  currentView: 'front',
  selectedMuscle: null,
  detailMode: 'normal',
  zoomRegion: null,
  setView: (view) => set({ currentView: view }),
  selectMuscle: (slug) => set({ selectedMuscle: slug }),
  setDetailMode: (mode) => set({ detailMode: mode }),
  setZoomRegion: (region) => set({ zoomRegion: region }),
}))
```

### Segmented Control (Front / Back)

```typescript
// Source: shadcn Button pattern from Phase 1; no new component needed
// Place above the SVG map in MuscleMapControls.tsx

'use client'

import { Button } from '@/components/ui/button'
import { useMapStore } from '@/stores/useMapStore'

export function MapViewToggle() {
  const { currentView, setView } = useMapStore()
  return (
    <div
      role="group"
      aria-label="Body view"
      className="flex rounded-full border border-border bg-muted p-1 gap-1"
    >
      {(['front', 'back'] as const).map((view) => (
        <Button
          key={view}
          variant={currentView === view ? 'default' : 'ghost'}
          size="sm"
          className="rounded-full capitalize"
          onClick={() => setView(view)}
          aria-pressed={currentView === view}
        >
          {view}
        </Button>
      ))}
    </div>
  )
}
```

### Disambiguation Zoom ViewBox Swap

```typescript
// When zoomRegion is set, pass it as the SVG viewBox attribute
// The SVG component generated by SVGR accepts all SVG props including viewBox

const { zoomRegion } = useMapStore()
const CurrentSvg = SVG_MAP[detailMode][currentView]

// Default viewBox comes from the SVG file (preserved by SVGR)
// Pass override only when zooming
<CurrentSvg
  className="w-full h-auto"
  viewBox={zoomRegion?.viewBox ?? undefined}
  aria-label={`${currentView} muscle map`}
/>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `experimental.turbo` in next.config | `turbopack` (top-level key) | Next.js 15.3–16 | Config key changed; old key removed in Next.js 16 |
| Webpack as default bundler | Turbopack as default bundler | Next.js 16.0.0 | No `--turbo` flag needed; `next dev` uses Turbopack |
| `@svgr/webpack` installed as dependency | `@svgr/webpack` as devDependency | N/A | Build-time transform only; correct as devDependency |
| `experimental.turbo.loaders` | `turbopack.rules` | Next.js 13.4.4 | Named `rules` now; old name `loaders` deprecated |

**Deprecated/outdated:**
- `experimental.turbo`: Removed in Next.js 16. The `turbopack` top-level key is canonical. The `next.config.ts` in this project already uses the correct key.
- `next/image` for SVG: Not applicable — SVGs need to be React components for fill manipulation.

---

## Open Questions

1. **SVG Asset Creation Strategy**
   - What we know: D-01 says rework an open-source CC-licensed anatomical SVG. The most commonly referenced base is Wikimedia Commons anatomical SVGs (CC-BY-SA) or the OpenClipart human anatomy set (CC0). Neither is a perfect fit — they need significant rework for all 55 `svgRegion` IDs.
   - What's unclear: How much rework time is realistic? Building from scratch in Inkscape or Figma for 6 files is substantial work. The `data/muscles.json` has 55 muscles across 3 detail modes — Normal likely needs ~25 paths, Advanced ~40, Anatomy ~55+.
   - Recommendation: Plan SVG authoring as its own plan (Wave 0 or Wave 1). Consider starting with Normal mode SVG and unblocking the React wiring work in parallel. The SVG path IDs are the API contract — all downstream phases depend on them.

2. **Muscle Centroid Coordinates for Labels**
   - What we know: D-18 requires text labels in the zoomed cluster view. Labels need x/y positions in SVG coordinate space.
   - What's unclear: Centroid coordinates can't be known until the SVG files exist. They'll need to be hardcoded after SVG authoring.
   - Recommendation: The CLUSTER_MAP and centroid lookup tables should be authored alongside the SVG files, not before. Plan the label task after SVG authoring is complete.

3. **Which Muscles Require Disambiguation in Advanced/Anatomy**
   - What we know: D-15 says disambiguation triggers for small/clustered muscles. Examples: brachialis, rotator cuff.
   - What's unclear: The full cluster mapping (which muscles cluster with which) can only be determined by looking at the actual SVG layout. It depends on viewBox dimensions and path positions.
   - Recommendation: Define the CLUSTER_MAP after SVG authoring. Leave it as an empty map initially (all taps go directly to selectMuscle) and fill it in during implementation.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build toolchain | Yes | v20.20.1 | — |
| `@svgr/webpack` | Turbopack SVG loader | NO | Not installed | None — must install |
| `@base-ui/react` Popover | Disambiguation labels | Yes | 1.3.0 | — |
| `zustand` | State management | Yes | ^5.0.12 | — |
| `svgo` CLI | SVG optimization | Via npx | 4.0.1 | Skip optimization (not blocking) |
| Inkscape/Figma/SVG editor | SVG authoring | Unknown | — | Text editor for hand-authoring SVG XML |

**Missing dependencies with no fallback:**
- `@svgr/webpack` — MUST be installed before any SVG import works. Wave 0 blocker.

**Missing dependencies with fallback:**
- SVG editor: Can hand-author SVG XML in a text editor for simple flat shapes. Not ideal but unblocking for geometry-simple Normal mode.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + Testing Library + Playwright 1.58.2 |
| Config file | `vitest.config.ts` (jsdom environment, setupFiles: `tests/setup.ts`) |
| Quick run command | `npx vitest run tests/` |
| Full suite command | `npx vitest run && npx playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MAP-01 | Muscle map renders with SVG paths present in DOM | E2E (Playwright) | `npx playwright test e2e/muscle-map.spec.ts` | No — Wave 0 |
| MAP-01 | SVG paths have correct slug-based IDs (e.g., `muscle-biceps-brachii`) | E2E | `npx playwright test e2e/muscle-map.spec.ts` | No — Wave 0 |
| MAP-02 | Toggle between front/back view updates visible SVG | E2E | `npx playwright test e2e/muscle-map.spec.ts` | No — Wave 0 |
| MAP-02 | View state survives navigation away and back | E2E | `npx playwright test e2e/muscle-map.spec.ts` | No — Wave 0 |
| MAP-05 | Tapping a clustered muscle in Advanced mode triggers disambiguation UI | E2E | `npx playwright test e2e/muscle-map.spec.ts` | No — Wave 0 |
| MAP-05 | Selecting from disambiguation sets selectedMuscle in store | unit | `npx vitest run tests/stores/useMapStore.test.ts` | No — Wave 0 |
| MAP-02 | useMapStore.setDetailMode updates detailMode | unit | `npx vitest run tests/stores/useMapStore.test.ts` | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/stores/`
- **Per wave merge:** `npx vitest run && npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `e2e/muscle-map.spec.ts` — covers MAP-01, MAP-02, MAP-05 E2E scenarios
- [ ] `tests/stores/useMapStore.test.ts` — covers store unit tests for new fields

*(Existing test infrastructure: `vitest.config.ts`, `tests/setup.ts`, Playwright config — all in place from Phase 1. No framework install needed.)*

---

## Project Constraints (from CLAUDE.md)

CLAUDE.md delegates to `AGENTS.md`. AGENTS.md states:

> "This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices."

**Verified against `node_modules/next/dist/docs/` (2026-03-23):**

1. **Turbopack is the default bundler** in Next.js 16 — `next dev` uses Turbopack without flags. The `next.config.ts` `turbopack.rules` key is the correct location (not `experimental.turbo` which is removed in v16).
2. **`@svgr/webpack` is explicitly listed as a supported Turbopack webpack loader** in `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/turbopack.md`.
3. **The `turbopack.rules` configuration in `next.config.ts` is correct** — the pre-wired SVGR rule matches the official example exactly.
4. **No `--turbo` flag needed** — `next dev` and `next build` already use Turbopack.
5. **Webpack plugins not supported** by Turbopack — only webpack loaders. `@svgr/webpack` is a loader (correct), not a plugin.

---

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/turbopack.md` — SVGR loader config, `rules` key, official example identical to project's next.config.ts
- `node_modules/next/dist/docs/01-app/03-api-reference/08-turbopack.md` — Turbopack feature list, supported loaders, version history (v16 = default bundler)
- npm registry (2026-03-23): `npm view @svgr/webpack version` → 8.1.0; `npm view @base-ui/react version` → 1.3.0 (installed matches)
- Existing project files: `next.config.ts`, `src/stores/useMapStore.ts`, `src/types/muscle.ts`, `data/muscles.json`, `vitest.config.ts`

### Secondary (MEDIUM confidence)
- `node_modules/@base-ui/react/popover/index.parts.js` — inspected exports; Popover, Backdrop, Close, Handle, Arrow confirmed as available parts
- `package.json` and `node_modules/@base-ui/react/` directory listing — confirms 1.3.0 installed with popover, dialog, menu sub-packages

### Tertiary (LOW confidence)
- SVG authoring strategy (CC-licensed bases, Wikimedia) — from training data; not verified against specific SVG asset sources. The exact asset source must be resolved during planning as the noted blocker.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — @svgr/webpack documented in official Next.js 16 docs; all other packages verified installed
- Architecture: HIGH — Two-layer SVG, SVGR import, CSS fill pattern are established SVG-in-React conventions verified against official docs
- Pitfalls: HIGH — @svgr/webpack missing from node_modules is a direct observation; SVG-in-public pitfall verified by Turbopack docs behavior
- SVG asset strategy: LOW — depends on external asset availability not verified here

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (stable stack; Next.js 16 released recently, unlikely to change)
