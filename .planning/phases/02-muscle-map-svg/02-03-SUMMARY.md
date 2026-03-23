---
phase: 02-muscle-map-svg
plan: 03
subsystem: ui
tags: [svg, muscle-map, vector-graphics, anatomy]

# Dependency graph
requires:
  - phase: 02-02
    provides: Normal mode SVGs (front/back), validate-svg-ids.ts script, three-layer SVG architecture convention

provides:
  - Advanced mode front SVG (src/assets/svg/muscle-map-advanced-front.svg) — 27 individual muscle head paths
  - Advanced mode back SVG (src/assets/svg/muscle-map-advanced-back.svg) — 27 individual muscle head paths
  - Anatomy mode front SVG (src/assets/svg/muscle-map-anatomy-front.svg) — 53 bilateral left/right paths
  - Anatomy mode back SVG (src/assets/svg/muscle-map-anatomy-back.svg) — 48 bilateral left/right paths
  - Updated validation script validating all 6 SVG files across all 3 modes

affects:
  - 02-04 (MuscleMap component imports these SVGs via SVGR — all 6 files now available)
  - 02-05 (CLUSTER_MAP data structure depends on these path IDs)
  - 05 (heatmap phase applies color to muscle paths by ID — needs the bilateral -left/-right IDs)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Advanced mode: individual muscle head paths per muscle (biceps-long-head, biceps-short-head, triceps-lateral-head, etc.)"
    - "Anatomy mode: bilateral -left/-right suffix appended to every paired muscle's svgRegion ID"
    - "Anatomy mode uses stroke-width=0.75 (vs 1 for Normal/Advanced) — more paths share boundaries"
    - "Validation script uses mode-specific known-ID sets: normal uses raw svgRegion, anatomy extends with -left/-right"

key-files:
  created:
    - src/assets/svg/muscle-map-advanced-front.svg
    - src/assets/svg/muscle-map-advanced-back.svg
    - src/assets/svg/muscle-map-anatomy-front.svg
    - src/assets/svg/muscle-map-anatomy-back.svg
  modified:
    - scripts/validate-svg-ids.ts

key-decisions:
  - "Anatomy mode uses biceps-brachii-left/right (combined path) alongside biceps-long-head-left/right and biceps-short-head-left/right — acceptance criteria required muscle-biceps-brachii-left to exist"
  - "Validation script uses buildKnownIdsForMode() to generate extended known-ID sets per mode, preventing false positives on -left/-right suffixes"
  - "Midline muscles in Anatomy (rectus-abdominis, external-obliques, hip-flexors, trapezius parts, rhomboids, erector-spinae, lower-back) keep base IDs without -left/-right suffix"
  - "Advanced back includes all 3 triceps heads and all 3 hamstring components as individual paths"

patterns-established:
  - "Advanced/Anatomy hit-layer paths for small muscles (supraspinatus, teres-minor, popliteus, piriformis, rotator-cuff) expanded beyond visual bounds to ensure 24x24 SVG coordinate unit minimum"
  - "ADVANCED_{FRONT,BACK}_REQUIRED and ANATOMY_{FRONT,BACK}_REQUIRED arrays in validate-svg-ids.ts are canonical required ID lists for respective modes"

requirements-completed: [MAP-01, MAP-05]

# Metrics
duration: 12min
completed: 2026-03-23
---

# Phase 02 Plan 03: Advanced and Anatomy Mode SVG Files Summary

**4 SVG files completing the 6-file muscle map inventory: Advanced mode with individual muscle heads (biceps/triceps/quad split paths) and Anatomy mode with bilateral left/right separation — validation script confirms all 6 files pass**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-23T11:28:12Z
- **Completed:** 2026-03-23T11:40:14Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Authored `muscle-map-advanced-front.svg` with 27 muscle paths — biceps split into long/short head, quads into 4 individual paths, plus coracobrachialis, pronator-teres, tensor-fasciae-latae, abductors, internal-obliques, transverse-abdominis, pectoralis-minor
- Authored `muscle-map-advanced-back.svg` with 27 muscle paths — triceps split into 3 heads (long/lateral/medial), hamstrings split into 3 (biceps-femoris, semitendinosus, semimembranosus), plus supraspinatus, teres-minor, rotator-cuff, gluteus-minimus, piriformis, popliteus
- Authored `muscle-map-anatomy-front.svg` with 53 muscle paths — all bilateral muscles split into -left/-right, midline muscles (rectus-abdominis, external-obliques, hip-flexors) keep base IDs
- Authored `muscle-map-anatomy-back.svg` with 48 muscle paths — full bilateral split for posterior muscles; trapezius parts, rhomboids, erector-spinae, lower-back remain midline
- Extended `scripts/validate-svg-ids.ts` to validate all 6 SVG files; `npx tsx scripts/validate-svg-ids.ts` exits 0 (6/6 PASS)

## Task Commits

1. **Task 1: Author Advanced mode front and back SVG files** - `a9bb414` (feat)
2. **Task 2: Author Anatomy mode SVGs and update validation script** - `c152043` (feat)

## Files Created/Modified

- `src/assets/svg/muscle-map-advanced-front.svg` — Advanced front: 27 visual paths with individual muscle heads, same viewBox/fills as Normal, all hit-layer counterparts
- `src/assets/svg/muscle-map-advanced-back.svg` — Advanced back: 27 visual paths with split triceps/hamstrings heads, additional rotator cuff area muscles
- `src/assets/svg/muscle-map-anatomy-front.svg` — Anatomy front: 53 paths with -left/-right bilateral split, stroke-width=0.75, midline muscles without suffix
- `src/assets/svg/muscle-map-anatomy-back.svg` — Anatomy back: 48 paths with bilateral split for all paired posterior muscles
- `scripts/validate-svg-ids.ts` — Extended with ADVANCED_* and ANATOMY_* required arrays; mode-aware known-ID set builder handles -left/-right extensions

## Decisions Made

- Anatomy mode includes `muscle-biceps-brachii-left` and `muscle-biceps-brachii-right` as compound paths (encompassing both heads) alongside the individual head paths, because the must_haves artifact explicitly requires this ID to exist.
- Validation script uses a `buildKnownIdsForMode()` helper that generates the full set of valid IDs for each mode — for Anatomy, it extends every base `svgRegion` value with `-left` and `-right` suffixes. This prevents false "extra ID" failures while still catching true typos.
- Midline muscles (sitting on the body's center axis) keep their base svgRegion ID in Anatomy mode — consistent with the plan's guidance that "muscles sit on the body's midline" don't need bilateral split.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 6 SVG files exist with consistent viewBox (0 0 100 250), three-layer architecture, and correct path ID conventions
- Advanced mode path IDs (muscle-biceps-long-head, etc.) are ready for CLUSTER_MAP definition in Plan 05
- Anatomy mode path IDs (-left/-right suffixes) enable per-side strain tracking in Phase 5 heatmap
- MuscleMap component (Plan 04) can now import all 3 mode variants and switch between them based on `useMapStore.detailMode`

## Self-Check: PASSED

- FOUND: src/assets/svg/muscle-map-advanced-front.svg
- FOUND: src/assets/svg/muscle-map-advanced-back.svg
- FOUND: src/assets/svg/muscle-map-anatomy-front.svg
- FOUND: src/assets/svg/muscle-map-anatomy-back.svg
- FOUND: scripts/validate-svg-ids.ts
- FOUND: .planning/phases/02-muscle-map-svg/02-03-SUMMARY.md
- FOUND commit a9bb414 (Task 1)
- FOUND commit c152043 (Task 2)
- npx tsx scripts/validate-svg-ids.ts: 6/6 PASS, exits 0

---
*Phase: 02-muscle-map-svg*
*Completed: 2026-03-23*
