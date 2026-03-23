---
phase: 02-muscle-map-svg
plan: 01
subsystem: ui
tags: [svgr, webpack, zustand, css, vitest, playwright]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: TypeScript domain types (MuscleSlug, Muscle), Zustand store infrastructure, Vitest/Playwright test setup

provides:
  - "@svgr/webpack installed — Turbopack SVG loader for *.svg -> React component imports"
  - "src/types/svg.d.ts — TypeScript module declaration for *.svg imports as FC<SVGProps<SVGSVGElement>>"
  - "useMapStore extended with detailMode (normal/advanced/anatomy) and zoomRegion fields and setters"
  - "globals.css muscle path CSS selectors — default fill, hover, selected, outline, hit target, disambiguation"
  - "tests/stores/useMapStore.test.ts — 12 passing unit tests for store"
  - "e2e/muscle-map.spec.ts — E2E scaffold for MAP-01, MAP-02, MAP-05"

affects:
  - 02-muscle-map-svg
  - future plans importing *.svg files
  - components consuming useMapStore detailMode or zoomRegion

# Tech tracking
tech-stack:
  added: ["@svgr/webpack@^8.1.0"]
  patterns:
    - "CSS attribute selectors with [data-view] ancestor scoping for muscle path states"
    - "Zustand store state reset in beforeEach for isolated unit tests"
    - "Export all store-related types (MapView, DetailMode, ZoomRegion) for downstream component use"

key-files:
  created:
    - src/types/svg.d.ts
    - tests/stores/useMapStore.test.ts
    - e2e/muscle-map.spec.ts
  modified:
    - package.json
    - package-lock.json
    - src/stores/useMapStore.ts
    - src/app/globals.css

key-decisions:
  - "setDetailMode also resets zoomRegion to null — enforces UI-SPEC interaction contract that mode changes clear disambiguation zoom"
  - "CSS selectors scoped under [data-view] ancestor to prevent global interference with other SVG elements"
  - "MAP-05 E2E test marked test.skip — requires CLUSTER_MAP data from Plan 05 SVG authoring step"
  - "svg.d.ts not added to barrel export — TypeScript declaration files are auto-included via tsconfig includes"

patterns-established:
  - "Muscle path IDs use id^='muscle-' prefix convention — all CSS and E2E tests rely on this"
  - "Body outline paths use id^='outline-' prefix, hit targets use id^='hit-' prefix"
  - "Disambiguation cluster uses .disambiguation-cluster class with .disambiguation-overlay sibling"

requirements-completed: [MAP-02, MAP-05]

# Metrics
duration: 3min
completed: 2026-03-23
---

# Phase 02 Plan 01: Infrastructure Setup Summary

**@svgr/webpack installed + SVG type declaration + useMapStore extended with detailMode/zoomRegion + CSS muscle path selectors + 12 passing unit tests + E2E scaffold**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-23T11:17:48Z
- **Completed:** 2026-03-23T11:20:05Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Installed @svgr/webpack as devDependency, enabling Turbopack to resolve *.svg imports as React components
- Created src/types/svg.d.ts making TypeScript recognize *.svg imports as FC<SVGProps<SVGSVGElement>>
- Extended useMapStore with detailMode (normal/advanced/anatomy) and zoomRegion state; setDetailMode resets zoomRegion per UI-SPEC contract
- Added complete CSS attribute selector suite for muscle paths: default fill, hover, selected, anatomy mode stroke, outline paths, hit targets, disambiguation overlay
- All 12 unit tests pass; E2E scaffold covers MAP-01, MAP-02, MAP-05 (MAP-05 skipped pending SVG data)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @svgr/webpack and create SVG TypeScript declaration** - `d4d7ce2` (chore)
2. **Task 2: Extend useMapStore, add CSS selectors, create test scaffolds** - `1cdfa26` (feat)

## Files Created/Modified

- `src/types/svg.d.ts` - TypeScript module declaration for *.svg -> FC<SVGProps<SVGSVGElement>>
- `src/stores/useMapStore.ts` - Extended with detailMode, zoomRegion, exported types
- `src/app/globals.css` - Appended Phase 2 muscle path CSS attribute selectors
- `tests/stores/useMapStore.test.ts` - 12 unit tests for useMapStore (all passing)
- `e2e/muscle-map.spec.ts` - E2E scaffold for MAP-01 Rendering, MAP-02 Toggle, MAP-05 Disambiguation
- `package.json` - @svgr/webpack@^8.1.0 added to devDependencies
- `package-lock.json` - Lockfile updated with @svgr/webpack and its 126 transitive packages

## Decisions Made

- setDetailMode resets zoomRegion to null — UI-SPEC.md interaction contract: switching modes clears any active disambiguation zoom
- CSS selectors scoped under [data-view] ancestor so they only apply inside the muscle map container, not to other SVGs on the page
- MAP-05 E2E test uses test.skip with explanation — CLUSTER_MAP coordinates are authored in Plan 05; test exists as a slot to enable

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All Phase 2 infrastructure is in place: @svgr/webpack installed, SVG type resolution working, store has all required state, CSS selectors ready
- Plans 02-05 are unblocked: SVG import will typecheck, store fields are available, CSS styling will apply as soon as SVG paths are authored
- MAP-05 E2E test has a placeholder ready; Plan 05 only needs to remove test.skip and add cluster coordinates

## Self-Check: PASSED

All files confirmed present:
- FOUND: src/types/svg.d.ts
- FOUND: src/stores/useMapStore.ts
- FOUND: src/app/globals.css
- FOUND: tests/stores/useMapStore.test.ts
- FOUND: e2e/muscle-map.spec.ts
- FOUND: .planning/phases/02-muscle-map-svg/02-01-SUMMARY.md

All commits confirmed present:
- FOUND: d4d7ce2 — chore(02-01): install @svgr/webpack and create SVG TypeScript declaration
- FOUND: 1cdfa26 — feat(02-01): extend useMapStore, add CSS muscle selectors, create test scaffolds

---
*Phase: 02-muscle-map-svg*
*Completed: 2026-03-23*
