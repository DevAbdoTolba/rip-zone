# Phase 2: Muscle Map SVG - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can see a 2.5D illustrated muscle map with front and back body views and toggle between them — the visual contract (slug-based path IDs, two-layer SVG architecture, invisible hit-target overlays) is locked in for all downstream phases. Three detail modes (Normal/Advanced/Anatomy) with separate SVGs per mode. Requirements: MAP-01, MAP-02, MAP-05.

</domain>

<decisions>
## Implementation Decisions

### SVG Asset Source
- **D-01:** Use an open-source/CC-licensed anatomical SVG as the base illustration, then heavily rework it — restyle paths, colors, proportions to match the Rip Zone neon/dark aesthetic
- **D-02:** Three detail modes requiring separate SVG files per mode:
  - **Normal** — grouped muscles (e.g., "Biceps" as one region, "Quadriceps" as one region)
  - **Advanced** — individual muscle heads (biceps long head, short head, etc.)
  - **Anatomy** — full anatomical detail with left/right side separation (muscle-biceps-brachii-left, muscle-biceps-brachii-right)
- **D-03:** All 3 modes built in Phase 2 — not deferred. The mode toggle is part of the visual contract
- **D-04:** Separate SVG files per mode (3 front + 3 back = 6 SVG files total). Each optimized for its detail level
- **D-05:** SVG path IDs follow the existing `svgRegion` convention from `data/muscles.json` (e.g., `muscle-pectoralis-major`). Advanced/Anatomy modes extend with suffixes (e.g., `muscle-biceps-brachii-left`)

### Map Visual Style
- **D-06:** Flat minimalist vector style — simple solid-color shapes with clear muscle regions, silhouette-based
- **D-07:** Subtle stroke borders (1-2px) between muscle regions for clear separation — works well with neon accents on dark background
- **D-08:** Muted gray/slate base fill color for muscles in default (rested) state — provides clean canvas for heatmap colors to pop in Phase 5
- **D-09:** Full body silhouette including head, neck, hands, and feet — non-interactive elements shown as part of the outline for a complete human figure
- **D-10:** Color brighten effect on hover/tap for interactive feedback — muscle fill lightens when hovered or touched, signaling interactivity

### Front/Back Toggle UX
- **D-11:** Segmented control ("Front | Back") pill-shaped toggle for view switching — clear, standard pattern
- **D-12:** Instant swap on toggle — no animation between front and back views. Snappy and responsive
- **D-13:** View state persisted via `useMapStore.currentView` (already implemented) — preserved when navigating away and returning

### Disambiguation UI
- **D-14:** Zoom + highlight interaction for overlapping muscle regions — map zooms into the tapped cluster area showing individual muscles at larger scale
- **D-15:** Disambiguation only triggers in Advanced and Anatomy modes — Normal mode has large, non-overlapping regions that don't need it
- **D-16:** Auto-zoom back to full body on muscle selection — user taps a muscle in the zoomed view, selection registers, map smoothly zooms back
- **D-17:** Dim/dark overlay on surrounding muscles during zoom — everything outside the cluster area gets dimmed, focusing attention on the disambiguated region
- **D-18:** Muscle name labels shown in zoomed cluster view — each muscle in the zoom area gets a small text label (e.g., "Long Head", "Short Head") since target audience includes newbies who may not know anatomy terms

### Claude's Discretion
- Segmented control placement relative to the map (above vs below — pick what works best for mobile-first responsive layout)
- Detail mode toggle UI pattern and placement
- Exact stroke widths, gray/slate shade values, and brighten effect intensity
- SVG viewBox dimensions and aspect ratio
- Invisible hit-target overlay implementation details
- How to handle the mode system in useMapStore (new state field for detail mode)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Domain types and data
- `src/types/muscle.ts` — MuscleId, MuscleSlug, MuscleGroup, Muscle interface with svgRegion field
- `data/muscles.json` — 55 muscles with slug and svgRegion mapping that SVG path IDs must match
- `src/stores/useMapStore.ts` — Existing front/back view toggle and muscle selection state

### SVG configuration
- `next.config.ts` — SVGR turbopack loader pre-wired for `.svg` → React component imports

### Project context
- `.planning/REQUIREMENTS.md` — MAP-01, MAP-02, MAP-05 acceptance criteria
- `.planning/ROADMAP.md` — Phase 2 goal and success criteria
- `.planning/PROJECT.md` — Core value, constraints, neon/dark aesthetic

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useMapStore` (src/stores/useMapStore.ts): Already has `currentView: 'front' | 'back'`, `selectedMuscle`, `setView()`, `selectMuscle()` — needs extension for detail mode
- shadcn/ui components: Badge, Button available for segmented control and mode toggle UI
- `data/muscles.json`: 55 muscles with svgRegion field — SVG path IDs must match these exactly

### Established Patterns
- Dark mode only with OKLCH color tokens on `:root` (Phase 1 decision)
- Neon/electric palette: cyan, green, purple accents on dark background
- Branded types for domain IDs (MuscleSlug, MuscleId) — use for type-safe muscle selection
- Dynamic `await import()` for client-only modules to prevent SSR failures in Next.js App Router

### Integration Points
- SVGR turbopack rules in `next.config.ts` — `import MuscleMap from './muscle-map.svg'` returns React component
- `useMapStore` is the state bridge between the map component and downstream features (Phase 5 heatmap, Phase 6 click-to-muscle panel)
- `src/app/page.tsx` — current smoke-test page will be replaced with the muscle map view

</code_context>

<specifics>
## Specific Ideas

- The 3 detail modes (Normal/Advanced/Anatomy) serve different user skill levels — Normal for casual users, Advanced for intermediate lifters, Anatomy for anatomy enthusiasts
- Mode system enables future per-side strain tracking in Anatomy mode (left arm trained harder than right)
- The flat minimalist style with muted gray base is designed as a neutral canvas — Phase 5's heatmap colors (warm/red for strained, cool/blue for rested) will pop against it
- Disambiguation zoom + highlight with name labels is specifically chosen for the target audience (Egyptian gym newbies) who may not know anatomical terms

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-muscle-map-svg*
*Context gathered: 2026-03-23*
