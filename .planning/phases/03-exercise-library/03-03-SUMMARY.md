---
phase: 03-exercise-library
plan: 03
subsystem: ui
tags: [react, svg, tailwind, base-ui, dialog, muscle-map, exercise-library]

# Dependency graph
requires:
  - phase: 03-02
    provides: ExerciseCard with Level 2 placeholder div and ExerciseLibrary with warmup placeholder

provides:
  - MiniMuscleMap SVG silhouette component with primary/secondary muscle highlights at 120x200px
  - WarmupSheet bottom-sheet dialog using @base-ui Dialog for accessible keyboard/backdrop dismiss
  - ExerciseCard Level 2 wired to MiniMuscleMap (primary=bright cyan, secondary=dimmed cyan)
  - ExerciseLibrary integrated with WarmupSheet via warmupOpen/warmupGroup state

affects: [03-04-exercise-library-verification, muscle-map-phase]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "MiniMuscleMap uses useEffect DOM mutation (style.fill) to override SVG fills — mirrors MuscleMapCanvas data-selected pattern"
    - "BACK_MUSCLES set determines front/back view from primary muscle majority"
    - "@base-ui Dialog.Root with open/onOpenChange for controlled bottom sheet"
    - "WarmupSheet: mobile bottom-sheet (rounded-t-2xl, fixed inset-x-0 bottom-0), desktop centered modal (md:inset-auto md:top-1/2 md:left-1/2)"

key-files:
  created:
    - src/components/exercise-library/MiniMuscleMap.tsx
    - src/components/exercise-library/WarmupSheet.tsx
  modified:
    - src/components/exercise-library/ExerciseCard.tsx
    - src/components/exercise-library/ExerciseLibrary.tsx

key-decisions:
  - "MiniMuscleMap uses style.fill (inline) rather than data-* attributes — container lacks data-view so globals.css muscle selectors don't apply; useEffect resets ALL muscle path fills to DEFAULT_FILL before applying highlights"
  - "WarmupSheet receives pre-computed movements prop from ExerciseLibrary to keep component stateless"
  - "ExerciseLibrary replaced warmupExercise: Exercise | null with warmupOpen: boolean + warmupGroup: string | null split-state pattern"
  - "data-testid placed on Dialog.Popup (warmup-sheet) and movement li elements (warmup-movement) for E2E test compatibility"

patterns-established:
  - "MiniMuscleMap: 120x200px SVG silhouette with programmatic fill overrides via useEffect"
  - "Front/back view auto-selection from BACK_MUSCLES set majority vote"
  - "@base-ui Dialog bottom-sheet: mobile slide-up + desktop centered modal via md: responsive classes"

requirements-completed: [EXER-01, EXER-03]

# Metrics
duration: 8min
completed: 2026-03-23
---

# Phase 03 Plan 03: Exercise Detail Visualization Summary

**MiniMuscleMap SVG silhouette with cyan muscle highlights and @base-ui WarmupSheet bottom-sheet dialog replacing placeholders**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-23T14:09:00Z
- **Completed:** 2026-03-23T14:17:40Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- MiniMuscleMap renders at 120x200px in Level 2 exercise detail — primary muscles in bright neon cyan (`oklch(0.85 0.18 195)`), secondary muscles dimmed (`oklch(0.55 0.10 195)`)
- Auto-selects front or back SVG view based on majority vote from BACK_MUSCLES set of primary muscles
- WarmupSheet uses @base-ui Dialog for accessible focus trapping, scroll lock, and ESC dismiss — mobile bottom-sheet, desktop centered modal
- All 4 exercise-library E2E tests pass (EXER-01, EXER-02 x2, EXER-03)
- All 40 vitest unit tests pass with no type errors

## Task Commits

Each task was committed atomically:

1. **Task 1: MiniMuscleMap component with programmatic SVG highlights** - `8f241dc` (feat)
2. **Task 2: WarmupSheet bottom sheet and ExerciseLibrary warm-up integration** - `ebb8937` (feat)

**Plan metadata:** (docs commit — pending)

## Files Created/Modified

- `src/components/exercise-library/MiniMuscleMap.tsx` - 120x200px SVG muscle silhouette with front/back auto-selection and programmatic fill highlights
- `src/components/exercise-library/WarmupSheet.tsx` - @base-ui Dialog bottom sheet with ordered warm-up movements list
- `src/components/exercise-library/ExerciseCard.tsx` - Replaced placeholder div with `<MiniMuscleMap>` in Level 2 expand
- `src/components/exercise-library/ExerciseLibrary.tsx` - Replaced placeholder warmup div with `<WarmupSheet>`, added warmupOpen/warmupGroup state and openWarmup callback

## Decisions Made

- `MiniMuscleMap` uses `style.fill` inline overrides because the container has no `data-view` attribute, so globals.css muscle selectors (`[data-view] path[id^="muscle-"]`) don't apply. useEffect resets all paths to DEFAULT_FILL then applies highlights.
- `WarmupSheet` receives pre-computed `movements` array as prop — ExerciseLibrary owns the data-fetching logic via `warmupMovements` memo
- Split `warmupExercise: Exercise | null` into `warmupOpen: boolean` + `warmupGroup: string | null` for cleaner controlled Dialog state
- Added `data-testid="warmup-sheet"` on `Dialog.Popup` and `data-testid="warmup-movement"` on each movement `<li>` to satisfy E2E test selectors

## Deviations from Plan

None - plan executed exactly as written. The placeholder warmup sheet in ExerciseLibrary already had the correct `data-testid` attributes, which were preserved in WarmupSheet.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- EXER-01 (enhanced) complete: mini muscle map in exercise detail
- EXER-03 complete: warm-up sheet accessible from every exercise card
- Plan 04 (verification/polish) can proceed
- No blockers

---
*Phase: 03-exercise-library*
*Completed: 2026-03-23*
