---
phase: 03-exercise-library
plan: 02
subsystem: ui
tags: [exercise-library, exercise-card, exercise-filters, search, filter, ssg, use-client, useMemo, useSearchParams, tw-animate-css]

# Dependency graph
requires:
  - phase: 03-exercise-library
    plan: 01
    provides: filterExercises function, route group (main) layout, BottomNav, warmups.json, E2E spec scaffold

provides:
  - src/app/(main)/exercises/page.tsx — SSG page with Suspense boundary, passes JSON data as props to ExerciseLibrary
  - src/components/exercise-library/ExerciseLibrary.tsx — Root client component with all filter/expand/warmup state
  - src/components/exercise-library/ExerciseFilters.tsx — Search bar + Equipment + Difficulty filter chips
  - src/components/exercise-library/ExerciseCard.tsx — Three-level card (Level 0 collapsed / Level 1 essentials / Level 2 form cues)

affects:
  - 03-03 (warm-up sheet — ExerciseLibrary already has warmup inline stub, Plan 03 replaces with WarmupSheet)
  - 03-04 (integration — all UI components built)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SSG page with Server Component passes static JSON to client root component via props
    - useSearchParams in client component inside Suspense boundary for URL param initialization
    - useMemo filter pipeline: filterExercises (name/equipment/muscle) + inline difficulty filter
    - Two-level inline expand pattern: Set<slug> for Level 1, single string|null for Level 2
    - tw-animate-css animate-accordion-down for expand animation

key-files:
  created:
    - src/app/(main)/exercises/page.tsx
    - src/components/exercise-library/ExerciseLibrary.tsx
    - src/components/exercise-library/ExerciseFilters.tsx
    - src/components/exercise-library/ExerciseCard.tsx
  modified:
    - e2e/exercise-library.spec.ts (updated EXER-02/EXER-03 test flow to match actual UX — expand card before checking Level 1 elements)

key-decisions:
  - "ExerciseFilters uses native <button> elements instead of Badge spans for filter chips — getByRole('button') works in Playwright E2E tests without additional ARIA roles"
  - "filterExercises return type cast to Exercise[] in ExerciseLibrary — filterExercises interface only declares {name,equipment,primaryMuscles} but input is full Exercise[]; cast is safe since output is always a subset of input"
  - "Warmup sheet implemented as inline modal in ExerciseLibrary rather than separate WarmupSheet component — Plan 03 will extract to proper WarmupSheet component"
  - "E2E tests updated to first expand card before checking Level 1 UI — cards start collapsed per spec; test flow must reflect actual user interaction"

requirements-completed: [EXER-01, EXER-02]

# Metrics
duration: 7min
completed: 2026-03-23
---

# Phase 3 Plan 02: Exercise Library UI Summary

**110 exercises browsable at /exercises in 9 muscle group sections with instant search, equipment/difficulty filter chips, two-level inline card expand (form cues + secondary muscles), and URL param initialization**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-23T14:02:49Z
- **Completed:** 2026-03-23T14:09:49Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- SSG `/exercises` page with Suspense boundary — prerenders at build time (static, no dynamic runtime)
- `ExerciseLibrary` root client component: all search/filter/expand state, URL param initialization via `useSearchParams`, useMemo filtering pipeline with AND logic across name/equipment/muscle/difficulty
- `ExerciseFilters` with full-width search bar (Search icon + X clear button), horizontally scrollable Equipment chips (8 types) and Difficulty chips (3 levels), single-select with active/inactive visual states
- `ExerciseCard` with three states: Level 0 (name + chevron), Level 1 (description, primary muscles, equipment/difficulty badges, View warm-up + More CTAs), Level 2 (form cues, secondary muscles, MiniMuscleMap placeholder)
- Empty state with "No exercises found, habibi" copy and "Clear filters" button
- EXER-01, EXER-02, EXER-03 E2E tests all passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Exercises SSG page, ExerciseLibrary client component, and ExerciseFilters** - `10a17fd` (feat)
2. **Task 2: ExerciseCard component with two-level inline expand** - `236ebe7` (feat)
3. **[Rule 1] Fix placeholder ellipsis and E2E test UX flow** - `886a970` (fix)

## Files Created/Modified

- `src/app/(main)/exercises/page.tsx` — SSG server component importing exercises/muscles/warmups JSON, renders ExerciseLibrary in Suspense
- `src/components/exercise-library/ExerciseLibrary.tsx` — 'use client', useSearchParams for URL init, useMemo filter pipeline, 9 muscle group sections with collapsible state, warmup inline sheet, empty state with habibi copy
- `src/components/exercise-library/ExerciseFilters.tsx` — Search input with Search/X icons, button chips for Equipment (8) and Difficulty (3) with active/inactive styling, horizontal scroll on mobile
- `src/components/exercise-library/ExerciseCard.tsx` — Three-level expand: Level 0 (name+ChevronRight), Level 1 (animate-accordion-down, badges, CTAs), Level 2 (form cues, secondary muscles, MiniMuscleMap placeholder div)
- `e2e/exercise-library.spec.ts` — Updated EXER-02 and EXER-03 to expand card first before checking Level 1 elements

## Decisions Made

- `ExerciseFilters` uses native `<button>` elements for filter chips instead of `Badge` spans — required for Playwright's `getByRole('button')` to work without extra ARIA
- `filterExercises` return type cast to `Exercise[]` in `ExerciseLibrary` — the input is full `Exercise[]` and output is always a subset; the filter function's type signature is narrower by design
- Warmup sheet is an inline modal in `ExerciseLibrary` for Plan 02 — Plan 03 extracts this into a proper `WarmupSheet` component using @base-ui Dialog
- E2E tests updated to match actual UX: Level 0 cards must be expanded before Level 1 UI (equipment badges, warm-up badge) is accessible

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed search placeholder text mismatch**
- **Found during:** E2E test run
- **Issue:** Placeholder used ASCII ellipsis `...` but E2E test expected Unicode `…` (U+2026)
- **Fix:** Changed `placeholder="Search exercises..."` to `placeholder="Search exercises…"`
- **Files modified:** `src/components/exercise-library/ExerciseFilters.tsx`
- **Commit:** `886a970`

**2. [Rule 1 - Bug] Fixed filter chip element type for Playwright accessibility**
- **Found during:** E2E test run
- **Issue:** Filter chips were `Badge` (renders as `span`) but E2E test used `getByRole('button', { name: 'Barbell' })`
- **Fix:** Changed chip elements from `Badge` to native `<button>` elements with equivalent styling
- **Files modified:** `src/components/exercise-library/ExerciseFilters.tsx`
- **Commit:** `886a970`

**3. [Rule 1 - Bug] Fixed E2E test UX flow for EXER-02 equipment filter and EXER-03 warm-up**
- **Found during:** E2E test run
- **Issue:** Tests expected Level 1 UI (equipment badges, view-warmup badge) without first expanding cards, but cards start collapsed per spec
- **Fix:** Updated E2E tests to click card first to expand to Level 1 before checking Level 1 elements
- **Files modified:** `e2e/exercise-library.spec.ts`
- **Commit:** `886a970`

## Known Stubs

- `src/components/exercise-library/ExerciseLibrary.tsx` line ~235: Inline warmup modal (`data-testid="warmup-sheet"`) is a temporary implementation. Plan 03 replaces this with the proper `WarmupSheet` component using @base-ui Dialog with slide-up animation. The stub is intentional and functional — it allows EXER-03 test to pass now.
- `src/components/exercise-library/ExerciseCard.tsx` line ~185: `<div id="mini-map-{slug}">` is a placeholder div for the `MiniMuscleMap` component. Plan 03 inserts MiniMuscleMap here. The stub does not prevent Plan 02's goal (EXER-01, EXER-02 are complete).

## Self-Check: PASSED

All files exist, all commits verified:
- FOUND: src/app/(main)/exercises/page.tsx
- FOUND: src/components/exercise-library/ExerciseLibrary.tsx
- FOUND: src/components/exercise-library/ExerciseFilters.tsx
- FOUND: src/components/exercise-library/ExerciseCard.tsx
- FOUND: e2e/exercise-library.spec.ts (modified)
- FOUND: commit 10a17fd
- FOUND: commit 236ebe7
- FOUND: commit 886a970
- BUILD: /exercises page prerenders as static (SSG confirmed)
- TESTS: 4/4 E2E tests passing, 40/40 unit tests passing
