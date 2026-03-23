---
phase: 04-workout-logger
plan: 01
subsystem: database
tags: [dexie, zustand, indexeddb, workout-logger, pr-detection, bottom-nav]

# Dependency graph
requires:
  - phase: 03-exercise-library
    provides: BottomNav shell (2 tabs), exercise types, ExerciseSlug
provides:
  - Dexie v2 schema with planProgress and lastUsedRest tables alongside sessions/exercisesInSession/sets
  - Full Zustand workout store with active session lifecycle and timer state
  - Pure PR detection functions (computePRs, isNewPR) with full unit test coverage
  - 4-tab BottomNav (Map, Exercises, History, Workout)
  - Route stubs at /workout and /history
affects:
  - 04-workout-logger (all subsequent plans depend on this store/schema/routing foundation)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Dexie version blocks never modified — new version block appended for each schema change
    - All Dexie access in Zustand stores via dynamic await import() for SSR safety
    - Pure PR detection functions separate from store — computed at read time, never persisted
    - Confirmed set pre-fills next pendingSet with same reps/weightKg (per D-03)

key-files:
  created:
    - src/lib/pr-detection.ts
    - src/app/(main)/workout/page.tsx
    - src/app/(main)/history/page.tsx
    - tests/lib/pr-detection.test.ts
    - tests/stores/useWorkoutStore.test.ts
  modified:
    - src/lib/db/workouts.ts
    - src/stores/useWorkoutStore.ts
    - src/components/bottom-nav/BottomNav.tsx
    - tests/lib/db/workouts.test.ts

key-decisions:
  - "Dexie v2 adds planProgress and lastUsedRest tables with no upgrade() needed — new tables start empty"
  - "useWorkoutStore replaces shell with full session lifecycle: startSession/addExercise/confirmSet/finishSession/loadActiveSession"
  - "Timer state fully managed in store (startTimer/pauseTimer/resumeTimer/adjustTimer/dismissTimer/tickTimer) — components call tickTimer from setInterval"
  - "loadActiveSession filters completedAt===null and restores exercises+sets from Dexie for resume-after-crash"

patterns-established:
  - "PR detection pattern: computePRs returns Map<reps, bestWeightKg>; isNewPR checks against that map"
  - "Workout store pattern: dynamic import for all Dexie access, crypto.randomUUID() for IDs with Brand casts"
  - "Route stubs: 'use client' pages with placeholder h1 + text, replaced by feature implementation in later plans"

requirements-completed: [WORK-01, WORK-02, WORK-04, WORK-06]

# Metrics
duration: 8min
completed: 2026-03-23
---

# Phase 04 Plan 01: Workout Logger Foundation Summary

**Dexie IndexedDB v2 schema with planProgress/lastUsedRest tables, full Zustand session store with timer, pure PR detection functions tested with 21 passing tests, 4-tab bottom nav, and /workout + /history route stubs**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-23T21:18:00Z
- **Completed:** 2026-03-23T21:21:25Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Extended Dexie to v2 with 5 tables: sessions, exercisesInSession, sets, planProgress, lastUsedRest
- Built full workout store replacing the previous shell: active session, exercises, sets, timer, elapsed time
- Created pure PR detection module (computePRs, isNewPR) with 9 unit tests all passing
- Extended BottomNav from 2 to 4 tabs (added History and Workout)
- Created /workout and /history route stubs ready for feature implementation

## Task Commits

Each task was committed atomically:

1. **Task 1: Dexie v2 schema, PR detection module, and test scaffolds** - `1b1865f` (feat)
2. **Task 2: Extended Zustand store, 4-tab bottom nav, and route stubs** - `cae0181` (feat)

## Files Created/Modified
- `src/lib/db/workouts.ts` - Extended to v2: PlanProgressRecord, LastUsedRestRecord, planProgress/lastUsedRest tables
- `src/lib/pr-detection.ts` - Pure PR detection: computePRs (Map<reps,bestWeightKg>) and isNewPR
- `src/stores/useWorkoutStore.ts` - Full active session store with all actions and timer state
- `src/components/bottom-nav/BottomNav.tsx` - 4-tab nav with History and Workout tabs
- `src/app/(main)/workout/page.tsx` - Route stub with 'use client' directive
- `src/app/(main)/history/page.tsx` - Route stub with 'use client' directive
- `tests/lib/pr-detection.test.ts` - 9 unit tests for computePRs and isNewPR
- `tests/lib/db/workouts.test.ts` - Extended with 6 v2 table tests (planProgress, lastUsedRest, compat)
- `tests/stores/useWorkoutStore.test.ts` - 15 .todo() stubs for all store actions

## Decisions Made
- Dexie v2 block does not use upgrade() — new tables (planProgress, lastUsedRest) start empty, no migration needed
- useWorkoutStore replaces old shell fully; old setActiveSession/saveActiveSession replaced by full lifecycle
- Timer state (7 actions) managed in Zustand so components tick from setInterval without local state complexity
- loadActiveSession restores in-progress sessions from Dexie for crash recovery

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Data layer and state foundation complete — subsequent plans (02-06) can build UI on top of this store
- useWorkoutStore.test.ts has 15 .todo() stubs ready to be filled in by future tasks
- /workout and /history route stubs will be replaced by full UI in plans 02+
- Timer tick (tickTimer/tickElapsed) and resume functionality (loadActiveSession) ready for use in workout UI

---
*Phase: 04-workout-logger*
*Completed: 2026-03-23*
