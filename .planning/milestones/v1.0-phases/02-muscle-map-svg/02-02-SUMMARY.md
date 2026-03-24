---
phase: 02-muscle-map-svg
plan: 02
subsystem: ui
tags: [svg, muscle-map, animation, vector-graphics]

# Dependency graph
requires:
  - phase: 02-01
    provides: useMapStore state layer, SVGR config in next.config.ts, muscles.json with svgRegion IDs

provides:
  - Normal mode front SVG (src/assets/svg/muscle-map-normal-front.svg) with 18 muscle regions
  - Normal mode back SVG (src/assets/svg/muscle-map-normal-back.svg) with 18 muscle regions
  - SVG validation script (scripts/validate-svg-ids.ts) that checks IDs against muscles.json
  - validate:svg npm script for CI use

affects:
  - 02-03 (Advanced mode SVGs must follow same path ID convention and layer structure)
  - 02-04 (Anatomy mode SVGs same)
  - 02-05 (MuscleMap component imports these SVGs via SVGR)
  - 05 (heatmap phase applies color to muscle paths by ID)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SVG three-layer architecture: outline-layer (non-interactive silhouette), visual-layer (interactive muscle fills), hit-layer (transparent click targets)"
    - "Muscle path IDs use svgRegion values from muscles.json exactly (e.g. muscle-pectoralis-major)"
    - "Hit-layer path IDs use hit- prefix on matching visual path ID (e.g. hit-muscle-pectoralis-major)"
    - "Non-interactive outline paths use fill=oklch(0.14 0.02 265) and pointer-events=none"
    - "Visual muscle paths use fill=oklch(0.22 0.02 265) and pointer-events=none"
    - "Hit-layer paths use fill=transparent stroke=none"
    - "viewBox 0 0 100 250 (portrait 2:5 ratio) — canonical for all 6 SVG files"

key-files:
  created:
    - src/assets/svg/muscle-map-normal-front.svg
    - src/assets/svg/muscle-map-normal-back.svg
    - scripts/validate-svg-ids.ts
  modified:
    - package.json (added validate:svg script)

key-decisions:
  - "Normal mode uses bilateral paths (left+right muscle pairs as a single path element with compound d attribute) for cleaner SVG — both sides of a symmetric muscle share one id"
  - "Outline layer stacks below visual-layer and hit-layer so muscle paths render above body silhouette elements"
  - "Hit-layer paths are expanded slightly beyond visual paths to ensure minimum 24x24 SVG coordinate units coverage even for small muscle regions"

patterns-established:
  - "SVG layer order: outline-layer < visual-layer < hit-layer (SVG stacking order: last in DOM = on top)"
  - "Validation script pattern: read muscles.json, extract svgRegion values, regex-match SVG ids, report missing/extra"
  - "NORMAL_{FRONT,BACK}_REQUIRED arrays in validate-svg-ids.ts are the canonical required ID lists for Normal mode"

requirements-completed: [MAP-01]

# Metrics
duration: 5min
completed: 2026-03-23
---

# Phase 02 Plan 02: Normal Mode Muscle Map SVGs Summary

**Two flat minimalist SVG muscle maps (front/back) with 18 regions each, three-layer architecture (outline/visual/hit), and a TypeScript validation script that confirms all Normal mode muscle IDs against muscles.json**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-23T11:22:56Z
- **Completed:** 2026-03-23T11:27:02Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Authored `muscle-map-normal-front.svg` with 18 grouped muscle regions covering all major anterior muscle groups — all with correct svgRegion IDs, oklch fill, and hit-layer counterparts
- Authored `muscle-map-normal-back.svg` with 18 grouped muscle regions covering all major posterior muscle groups
- Created `scripts/validate-svg-ids.ts` that reads muscles.json, checks both Normal mode SVG files, and exits 0 when all required IDs with hit-layer counterparts are present
- Added `validate:svg` npm script to package.json for CI use

## Task Commits

1. **Task 1: Author Normal mode front and back SVG files** - `26200a0` (feat)
2. **Task 2: Create SVG path ID validation script** - `bc27fde` (feat)

## Files Created/Modified

- `src/assets/svg/muscle-map-normal-front.svg` — Front view SVG: outline-layer (head/neck/hands/feet), visual-layer (18 muscle paths), hit-layer (18 transparent overlay paths)
- `src/assets/svg/muscle-map-normal-back.svg` — Back view SVG: same three-layer structure with 18 posterior muscle regions
- `scripts/validate-svg-ids.ts` — Validates SVG path IDs against muscles.json svgRegion values; checks visual-to-hit parity; exits 0 on all pass
- `package.json` — Added `"validate:svg": "npx tsx scripts/validate-svg-ids.ts"` script

## Decisions Made

- Bilateral muscles (left + right sides) are represented as compound `d` attribute paths sharing a single `id` — this matches Normal mode's "grouped" philosophy and produces cleaner SVG with fewer elements.
- Outline-layer appears first in DOM (renders below muscle paths), with visual-layer and hit-layer stacking above it — correct SVG painter's model for the desired visual hierarchy.
- Hit-layer paths use slightly expanded bounds vs visual paths to ensure click/tap targets meet the 24x24 SVG unit minimum even for small muscles like serratus anterior and brachialis.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Normal mode SVGs are locked in with canonical viewBox (0 0 100 250), layer IDs (outline-layer, visual-layer, hit-layer), and path ID convention (muscle-{svgRegion})
- Advanced and Anatomy mode SVGs (Plans 03 and 04) must follow the same three-layer architecture and ID prefix conventions
- Validation script (`npx tsx scripts/validate-svg-ids.ts`) should be extended in Plans 03 and 04 to cover ADVANCED and ANATOMY required ID lists
- Plan 05 (MuscleMap component) can import these SVGs via SVGR and rely on path IDs for CSS attribute selector targeting

---
*Phase: 02-muscle-map-svg*
*Completed: 2026-03-23*
