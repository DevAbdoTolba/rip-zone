---
phase: 05-strain-engine-heatmap
plan: 02
subsystem: ui
tags: [react, dexie, indexeddb, hooks, svg, heatmap, strain-engine, vitest]

# Dependency graph
requires:
  - phase: 05-strain-engine-heatmap/05-01
    provides: computeStrainMap function and STRAIN_COLORS constant in src/lib/strain-engine.ts
  - phase: 04-workout-logger
    provides: WorkoutsDatabase with sessions/exercisesInSession/sets tables in Dexie
  - phase: 02-muscle-map-svg
    provides: MuscleMapCanvas with svgContainerRef, path IDs as muscle-{slug}, bilateral anatomy paths

provides:
  - useStrainMap hook reading Dexie workout history and returning Map<MuscleSlug, StrainLevel>
  - Heatmap color fills on SVG muscle paths via direct style.fill mutation
  - Bilateral anatomy mode support via applyStrainToSlug (checks -left/-right variants)
  - Disclaimer text 'Strain data based on placeholder estimates' below muscle map
  - Selection color wins over strain color — selectedMuscle skipped in strain fill loop

affects:
  - 06-exercise-references (MuscleMapCanvas now accepts strainMap prop)
  - Any future consumer of useStrainMap hook

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useStrainMap hook: dynamic await import() for Dexie (D-18 SSR safety)"
    - "Subscribe to primitive ID not object reference: activeSession?.id ?? null avoids re-fires"
    - "Strain fill via direct path style.fill mutation (MiniMuscleMap precedent, Pitfall 5 prevention)"
    - "applyStrainToSlug: apply to base slug AND bilateral -left/-right (no else — both can exist)"
    - "Strain useEffect before data-selected useEffect: selection always wins via CSS attribute rule"
    - "Strain reset: querySelectorAll path[id^='muscle-'] forEach el.style.fill='' before applying colors"

key-files:
  created:
    - src/hooks/useStrainMap.ts
    - tests/hooks/useStrainMap.test.ts
  modified:
    - src/components/muscle-map/MuscleMap.tsx
    - src/components/muscle-map/MuscleMapCanvas.tsx

key-decisions:
  - "activeSession?.id ?? null (primitive) as useEffect dependency — stable string avoids re-fires on unrelated store updates (Pitfall 3)"
  - "applyStrainToSlug checks base slug AND bilateral variants without else — both can coexist in anatomy mode"
  - "Strain useEffect deps include currentView and detailMode — SVG component swap creates fresh DOM nodes that lose inline fills (Pitfall 1)"
  - "selectedMuscle in strain useEffect deps — ensures deselected muscle gets strain color back immediately"
  - "Strain reset clears ALL path inline fills including selected muscle's — selected muscle color comes from CSS data-selected rule, not inline style"

patterns-established:
  - "useStrainMap hook: 'use client', dynamic imports, cancelled flag for cleanup, activeSessionId primitive dep"
  - "Bilateral anatomy fill: applyStrainToSlug tries base + -left + -right without else branching"

requirements-completed: [MAP-03, STRAIN-01, STRAIN-03]

# Metrics
duration: 3min
completed: 2026-03-24
---

# Phase 05 Plan 02: Heatmap Overlay Summary

**useStrainMap hook wiring Dexie workout history to SVG heatmap fills via direct path style mutation, with bilateral anatomy support and 'Strain data based on placeholder estimates' disclaimer**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-24T00:16:00Z
- **Completed:** 2026-03-24T00:18:19Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint approved)
- **Files modified:** 4

## Accomplishments

- `useStrainMap` hook reads all completed Dexie sessions, builds `WorkoutMuscleDose[]`, calls `computeStrainMap`, returns stable `Map<MuscleSlug, StrainLevel>`
- `MuscleMapCanvas` applies heatmap fills via direct `style.fill` mutation with full bilateral anatomy mode support
- Selected muscle color always wins — strain fill loop skips `selectedMuscle`, CSS `data-selected` rule applies accent color
- Disclaimer paragraph visible below muscle map in `text-muted-foreground` styling
- 12 tests passing across strain-engine + useStrainMap integration test files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useStrainMap hook and integration test** - `6f17fde` (feat)
2. **Task 2: Wire heatmap fills to MuscleMapCanvas and add disclaimer** - `ed80c1e` (feat)
3. **Task 3: Verify heatmap visual rendering on muscle map** - APPROVED by user (checkpoint — no code commit)

## Files Created/Modified

- `/home/appuser/workspace/rip-zone/src/hooks/useStrainMap.ts` - React hook: dynamic Dexie import, builds dose array, calls computeStrainMap, returns Map
- `/home/appuser/workspace/rip-zone/tests/hooks/useStrainMap.test.ts` - 2 integration tests: empty state and seeded workout data
- `/home/appuser/workspace/rip-zone/src/components/muscle-map/MuscleMap.tsx` - Calls useStrainMap, passes strainMap prop to canvas, adds disclaimer
- `/home/appuser/workspace/rip-zone/src/components/muscle-map/MuscleMapCanvas.tsx` - MuscleMapCanvasProps interface, applyStrainToSlug helper, strain fill useEffect

## Decisions Made

- `activeSession?.id ?? null` as primitive dependency prevents re-fires on unrelated Zustand state updates (Pitfall 3 from RESEARCH.md)
- `applyStrainToSlug` applies to base slug AND `-left`/`-right` variants without else branching — anatomy mode can have both (Pitfall 5)
- Strain useEffect includes `currentView`, `detailMode`, `selectedMuscle` in deps — covers SVG DOM swap and deselection cases
- Strain reset clears ALL path inline fills first — selected muscle color from CSS `data-selected` rule is not inline, so it's unaffected

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Minor: `DatabaseClosedError` in test stderr from `afterEach(() => testDb.delete())` closing the DB before the hook's async `recalculate` notices the `cancelled = true` flag. Error is caught and logged; tests pass correctly. This is a benign test isolation artifact.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Full strain heatmap pipeline complete — human visual verification confirmed all 12 items (Task 3 approved)
- `useStrainMap` hook ready for reuse by Phase 6 exercise reference panel
- Bilateral anatomy fill pattern established and visually verified
- Phase 05 complete — all plans finished

## Self-Check: PASSED

- FOUND: src/hooks/useStrainMap.ts
- FOUND: tests/hooks/useStrainMap.test.ts
- FOUND: src/components/muscle-map/MuscleMap.tsx
- FOUND: src/components/muscle-map/MuscleMapCanvas.tsx
- FOUND: 05-02-SUMMARY.md
- FOUND commit: 6f17fde (feat: useStrainMap hook)
- FOUND commit: ed80c1e (feat: heatmap fills and disclaimer)

---
*Phase: 05-strain-engine-heatmap*
*Completed: 2026-03-24*
