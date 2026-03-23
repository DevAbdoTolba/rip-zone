---
phase: 04-workout-logger
plan: 05
subsystem: ui
tags: [workout-plans, plan-browser, plan-runner, dexie, zustand, react]

# Dependency graph
requires:
  - phase: 04-02
    provides: Dexie schema with planProgress table
  - phase: 04-03
    provides: WorkoutLogger and useWorkoutStore with startSession/addExercise
provides:
  - Plan browser UI with difficulty badges and recommendation callout
  - Day picker that pre-loads exercises into the workout logger
  - PlanProgressTracker showing completed day checkmarks
  - Plan recommendation logic (inferUserLevel, isPlanAboveLevel)
  - Workout page Freestyle/Plans toggle
  - finishSession saves PlanProgressRecord to Dexie on plan session complete
affects: [04-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Plan browser expand/collapse with selectedPlanId state
    - User level inferred at read time from completed session count and date range
    - Plan progress aggregated per plan at render time from flat PlanProgressRecord array

key-files:
  created:
    - src/lib/plan-recommendation.ts
    - src/components/plans/PlanBrowser.tsx
    - src/components/plans/PlanDayPicker.tsx
    - src/components/plans/PlanProgressTracker.tsx
  modified:
    - src/app/(main)/workout/page.tsx
    - src/stores/useWorkoutStore.ts
    - data/workout-plans.json

key-decisions:
  - "workout-plans.json: added id field to each plan (equals slug) to satisfy WorkoutPlanId type requirement"
  - "PlanDayPicker sorts days by Day N prefix number extracted via regex for consistent ordering"
  - "PlanBrowser passes planProgress filtered by plan.id to PlanDayPicker — avoids repeated full-array scans inside child"
  - "finishSession resets currentPlanId/currentDayLabel after saving progress so subsequent freestyle sessions do not re-trigger planProgress.put"

patterns-established:
  - "Plan day pre-loading: startSession(planId, dayLabel) then loop addExercise per sorted exercise"
  - "Workout page tab mode: tab state only visible when no activeSession; activeSession always shows WorkoutLogger"

requirements-completed: [WORK-05]

# Metrics
duration: 4min
completed: 2026-03-23
---

# Phase 04 Plan 05: Plan Runner Summary

**Plan browser with difficulty-based recommendation, day picker that pre-loads exercises into the logger, and Dexie-persisted progress tracking across sessions**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-23T21:44:38Z
- **Completed:** 2026-03-23T21:48:56Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Plan recommendation logic (inferUserLevel from session count + weeks active, isPlanAboveLevel for difficulty comparison)
- PlanBrowser with color-coded difficulty badges, "Recommended" badge on matched difficulty, warning text for plans above user level, expand/collapse per plan
- PlanDayPicker showing day breakdown with exercise counts and completed checkmarks
- Workout page Freestyle/Plans tab toggle; plan day start pre-loads all exercises sorted by orderIndex
- finishSession in useWorkoutStore now saves PlanProgressRecord to Dexie when session has planId/dayLabel set

## Task Commits

Each task was committed atomically:

1. **Task 1: Plan recommendation logic and plan browser/day picker components** - `484a082` (feat)
2. **Task 2: Integrate plan runner into workout page with pre-loaded exercises** - `74bdaf5` (feat)

## Files Created/Modified
- `src/lib/plan-recommendation.ts` - inferUserLevel and isPlanAboveLevel functions
- `src/components/plans/PlanBrowser.tsx` - Plan card list with recommendation callout and expand/collapse
- `src/components/plans/PlanDayPicker.tsx` - Day breakdown within a plan with checkmarks
- `src/components/plans/PlanProgressTracker.tsx` - Inline "N/M days done" display with checkmark icon
- `src/app/(main)/workout/page.tsx` - Freestyle/Plans toggle, plan data loading, day start handler
- `src/stores/useWorkoutStore.ts` - finishSession extended to save PlanProgressRecord
- `data/workout-plans.json` - Added id field to all 7 plan entries

## Decisions Made
- Added `id` field to `data/workout-plans.json` (set equal to slug) — WorkoutPlanId branded type requires this; type assertion alone is insufficient for runtime usage since Dexie queries use the actual id value
- PlanDayPicker sorts day labels by extracting the "Day N" prefix number via regex — handles plans with non-sequential or renamed day labels safely
- finishSession clears currentPlanId/currentDayLabel after saving so that subsequent freestyle sessions (which don't set a planId) won't write duplicate planProgress records

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed PlanDayPicker day index lookup**
- **Found during:** Task 1 (PlanDayPicker implementation)
- **Issue:** Initial draft used `days.indexOf({ dayLabel, exercises })` which always returns -1 (object reference comparison). Day numbers would display as 0 for all rows.
- **Fix:** Switched to `days.map((..., idx) => ...)` to capture the index from the map callback directly.
- **Files modified:** src/components/plans/PlanDayPicker.tsx
- **Verification:** TypeScript passed; index correctly bound via map callback parameter.
- **Committed in:** 484a082 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor correctness fix to day numbering display. No scope creep.

## Issues Encountered
None beyond the auto-fixed bug above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan runner is fully wired: browse plans, pick a day, start a session with pre-loaded exercises, finish and persist progress
- Plan 06 (E2E / verification) can now validate the full plan runner flow end-to-end

---
*Phase: 04-workout-logger*
*Completed: 2026-03-23*
