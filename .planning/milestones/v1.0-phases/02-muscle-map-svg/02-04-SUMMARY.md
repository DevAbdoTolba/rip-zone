---
phase: 02-muscle-map-svg
plan: 04
subsystem: ui
tags: [react, svgr, zustand, tailwind, muscle-map, svg]

# Dependency graph
requires:
  - phase: 02-01
    provides: "@svgr/webpack installed, useMapStore with detailMode/zoomRegion, CSS muscle selectors, SVG TypeScript declaration"
  - phase: 02-03
    provides: "All 6 SVG files (normal/advanced/anatomy front/back) with three-layer architecture and correct path IDs"

provides:
  - "MuscleMapControls component: front/back segmented control + detail mode toggle with ARIA, uses useMapStore"
  - "MuscleMapCanvas component: SVG_MAP lookup for all 6 mode/view combos, click delegation on hit-layer, data-selected via useEffect"
  - "MuscleMap orchestrator: composes Controls + Canvas in vertical flex layout"
  - "Updated src/app/page.tsx: replaces Phase 1 smoke-test with interactive muscle map view"

affects:
  - 02-05 (disambiguation zoom adds CLUSTER_MAP integration into MuscleMapCanvas click handler)
  - phase-05 (heatmap applies fill colors via data attributes already wired in MuscleMapCanvas)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Event delegation on container div for SVG click handling — no per-path React listeners"
    - "SVG_MAP lookup: Record<DetailMode, Record<MapView, FC>> for instant SVG swap without animation"
    - "useEffect applies data-selected='true' DOM attribute to visual-layer path — CSS selector handles fill"
    - "data-view and data-detail-mode attributes on wrapper div enable all CSS muscle-path selectors from globals.css"
    - "Server Component page.tsx renders client boundary MuscleMap — no 'use client' on page"

key-files:
  created:
    - src/components/muscle-map/MuscleMapControls.tsx
    - src/components/muscle-map/MuscleMapCanvas.tsx
    - src/components/muscle-map/MuscleMap.tsx
  modified:
    - src/app/page.tsx

key-decisions:
  - "MuscleMapCanvas uses event delegation (single onClick on wrapper div) not individual path listeners — consistent with existing SVG structure where hit-layer paths are children of the container"
  - "viewBox override for zoomRegion passes zoomRegion?.viewBox ?? undefined — when null, SVG uses its native viewBox (no override); when set, SVG zooms to region"
  - "Toggle-deselect: clicking same muscle slug again calls selectMuscle(null) — user-friendly UX"
  - "page.tsx uses text-foreground for heading (not text-primary) — primary is reserved for accents per UI-SPEC color contract"

patterns-established:
  - "MuscleMapControls: variant='default' for active Front/Back, variant='secondary' for active detail mode — matches UI-SPEC color contract"
  - "All toggle buttons carry min-h-[44px] to meet touch target minimum regardless of size='sm' base height"

requirements-completed: [MAP-01, MAP-02]

# Metrics
duration: 2min
completed: 2026-03-23
---

# Phase 02 Plan 04: React Component Layer Summary

**MuscleMap, MuscleMapControls, and MuscleMapCanvas wiring the 6 SVG files and useMapStore into an interactive front/back + detail-mode toggleable muscle map on the home page**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-23T11:43:48Z
- **Completed:** 2026-03-23T11:45:37Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `MuscleMapControls` with ARIA-compliant front/back segmented control (role=group, aria-pressed, 44px touch targets) and detail mode toggle (normal/advanced/anatomy)
- Created `MuscleMapCanvas` importing all 6 SVG files via SVGR, using SVG_MAP lookup for instant mode/view switching, click event delegation extracting MuscleSlug from hit-layer path IDs
- Created `MuscleMap` orchestrator composing controls and canvas in a vertical flex layout
- Replaced Phase 1 smoke-test page with interactive muscle map view — `npx next build` passes cleanly

## Task Commits

1. **Task 1: Create MuscleMapControls and MuscleMapCanvas components** - `a5ee02c` (feat)
2. **Task 2: Create MuscleMap orchestrator and replace home page** - `b8f3718` (feat)

## Files Created/Modified

- `src/components/muscle-map/MuscleMapControls.tsx` — Front/Back segmented control + detail mode toggle with ARIA; reads/writes useMapStore
- `src/components/muscle-map/MuscleMapCanvas.tsx` — SVG_MAP lookup, event delegation click handler, data-selected useEffect, zoom viewBox override
- `src/components/muscle-map/MuscleMap.tsx` — Orchestrator composing Controls + Canvas with flex-col gap-4 layout
- `src/app/page.tsx` — Server Component replacing smoke-test with "Rip Zone" heading + MuscleMap component

## Decisions Made

- event delegation on the container div for SVG clicks — cleaner than adding event listeners per path element, and the SVGR-rendered SVG structure makes the container div a natural event boundary
- `viewBox={zoomRegion?.viewBox ?? undefined}` — when null, SVG uses its authored viewBox; when ZoomRegion is set by Plan 05 disambiguation, the SVG zooms to that region without any React re-mounting
- Toggle deselect (clicking same muscle deselects) makes the click interaction reversible without needing a separate "deselect" mechanism

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Home page shows interactive muscle map with front/back toggle and 3 detail modes
- All CSS selectors from globals.css (`[data-view]`, `[data-detail-mode]`, `[data-selected="true"]`) are now active — hover brightening and selected highlight work as soon as the SVGs render
- Plan 05 (disambiguation zoom) can add CLUSTER_MAP wiring directly into MuscleMapCanvas.handleClick
- `npx next build` exits 0 — project ready for Plan 05

## Self-Check: PASSED

- FOUND: src/components/muscle-map/MuscleMapControls.tsx
- FOUND: src/components/muscle-map/MuscleMapCanvas.tsx
- FOUND: src/components/muscle-map/MuscleMap.tsx
- FOUND: src/app/page.tsx
- FOUND: .planning/phases/02-muscle-map-svg/02-04-SUMMARY.md
- FOUND commit a5ee02c (Task 1)
- FOUND commit b8f3718 (Task 2)
- npx next build: exits 0 (Compiled successfully, TypeScript passes)

---
*Phase: 02-muscle-map-svg*
*Completed: 2026-03-23*
