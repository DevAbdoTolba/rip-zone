---
phase: 01-foundation
plan: 02
subsystem: database
tags: [dexie, indexeddb, zustand, vitest, fake-indexeddb, jsdom]

# Dependency graph
requires:
  - phase: 01-foundation plan 01
    provides: Branded type definitions (WorkoutSessionId, ExerciseLogId, SetLogId, BioMetricEntryId, TierRank, MuscleSlug)

provides:
  - Vitest configured with jsdom environment, @/ path alias, and fake-indexeddb setup file
  - WorkoutsDatabase (Dexie): sessions, exercisesInSession, sets tables with branded ID types
  - ProfileDatabase (Dexie): bioMetrics, rankState tables with branded ID types
  - D-13 migration pattern documented in both Dexie files (version(2).upgrade() example)
  - useWorkoutStore: activeSession state with loadActiveSession/saveActiveSession
  - useMapStore: currentView/selectedMuscle state with setView/selectMuscle
  - useRankStore: currentRank state with loadRank/saveRank
  - useProfileStore: latestBio state with loadLatestBio/saveBio
  - 13 passing Dexie schema tests

affects: [02-muscle-map-svg, all feature phases using workout/profile data, ranking phases]

# Tech tracking
tech-stack:
  added:
    - fake-indexeddb ^6.2.5 (devDependency, IndexedDB emulation for Vitest)
    - vitest.config.ts (Vitest configuration with jsdom + @/ alias)
    - tests/setup.ts (global IndexedDB setup via fake-indexeddb/auto)
  patterns:
    - Two separate Dexie databases (rip-zone-workouts, rip-zone-profile) with independent versioning (D-14)
    - No computed values in any Dexie table — strain/PRs/rankings computed at read time (D-11)
    - Versioned bio metrics — each update creates a new timestamped record (D-12)
    - D-13 migration pattern: version(N+1).stores().upgrade() commented in each Dexie file
    - Zustand stores use dynamic await import() for Dexie — SSR safe (no Dexie on server)
    - No persist() middleware in any store — all Dexie ops are explicit async functions (D-19)

key-files:
  created:
    - vitest.config.ts
    - tests/setup.ts
    - tests/lib/db/workouts.test.ts
    - tests/lib/db/profile.test.ts
    - src/lib/db/workouts.ts
    - src/lib/db/profile.ts
    - src/stores/useWorkoutStore.ts
    - src/stores/useMapStore.ts
    - src/stores/useRankStore.ts
    - src/stores/useProfileStore.ts
  modified:
    - package.json (added fake-indexeddb devDependency)

key-decisions:
  - "Vitest setupFiles used instead of per-test fake-indexeddb/auto import — ensures IndexedDB exists before module-level Dexie singletons instantiate"
  - "Zustand stores use dynamic await import() for Dexie to prevent SSR failures in Next.js App Router"
  - "No persist() middleware in any store — explicit loadX/saveX functions enforce intentional sync (D-19)"

patterns-established:
  - "Pattern: Dexie singleton per database file (workoutsDb, profileDb) — import as needed in stores via dynamic import"
  - "Pattern: Zustand store shape = {state fields} + {setters} + {async Dexie sync functions}"
  - "Pattern: fake-indexeddb/auto in tests/setup.ts, not in individual test files"

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-03-22
---

# Phase 01 Plan 02: Client Data Layer Summary

**Vitest + fake-indexeddb test infrastructure, two Dexie split databases with D-13 migration pattern, and four Zustand domain store shells with manual Dexie sync**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-22T23:09:02Z
- **Completed:** 2026-03-22T23:13:00Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- Vitest configured with jsdom environment, @/ path alias, and fake-indexeddb global setup
- WorkoutsDatabase (sessions, exercisesInSession, sets) and ProfileDatabase (bioMetrics, rankState) created with branded ID types, D-10/D-11/D-12/D-13/D-14 compliance
- Four Zustand domain stores (workout, map, rank, profile) created as shells with explicit async Dexie sync methods — no persist middleware
- All 13 Dexie schema tests pass; TypeScript exits clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Set up Vitest and create Dexie schema test stubs** - `f7beb09` (feat)
2. **Task 2: Create Dexie split databases with migration pattern** - `2c402b1` (feat)
3. **Task 3: Create Zustand domain store shells** - `af29375` (feat)

## Files Created/Modified

- `vitest.config.ts` - Vitest with jsdom environment, @/ alias, setupFiles
- `tests/setup.ts` - Global fake-indexeddb/auto import for all tests
- `tests/lib/db/workouts.test.ts` - 7 WorkoutsDatabase schema tests
- `tests/lib/db/profile.test.ts` - 6 ProfileDatabase schema tests
- `src/lib/db/workouts.ts` - WorkoutsDatabase class: sessions, exercisesInSession, sets tables
- `src/lib/db/profile.ts` - ProfileDatabase class: bioMetrics, rankState tables
- `src/stores/useWorkoutStore.ts` - Workout domain store shell
- `src/stores/useMapStore.ts` - Map domain store shell
- `src/stores/useRankStore.ts` - Rank domain store shell
- `src/stores/useProfileStore.ts` - Profile domain store shell
- `package.json` - Added fake-indexeddb devDependency

## Decisions Made

- Used Vitest `setupFiles` (tests/setup.ts) instead of importing `fake-indexeddb/auto` in each test file. The module-level `workoutsDb`/`profileDb` singletons instantiate when the module is first imported — if IndexedDB isn't in globals yet, Dexie throws. `setupFiles` runs before any module import in the test environment.
- Zustand stores use `await import('@/lib/db/workouts')` (dynamic imports) so store modules can be safely imported on the server during Next.js SSR without triggering Dexie initialization.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added tests/setup.ts and vitest setupFiles to fix fake-indexeddb timing**
- **Found during:** Task 2 (running Dexie schema tests)
- **Issue:** Tests failed with "IndexedDB API missing" because module-level `workoutsDb = new WorkoutsDatabase()` instantiates before `fake-indexeddb/auto` import in test files runs. Dexie checks for `indexedDB` at construction time.
- **Fix:** Created `tests/setup.ts` that imports `fake-indexeddb/auto`, added `setupFiles: ['./tests/setup.ts']` to vitest.config.ts so IndexedDB globals are set before any test module is imported.
- **Files modified:** vitest.config.ts, tests/setup.ts (new)
- **Verification:** All 13 Dexie schema tests pass after fix
- **Committed in:** 2c402b1 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Required for tests to pass. The plan spec included the `fake-indexeddb/auto` import in each test file but did not account for module-level Dexie singletons. Setup file approach is the correct pattern for this use case. No scope creep.

## Issues Encountered

- `fake-indexeddb/auto` in individual test file imports does not run early enough when Dexie singletons exist at module scope. Fixed via vitest setupFiles.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All client data layer infrastructure ready for feature phases
- WorkoutsDatabase and ProfileDatabase schemas can be extended with version(2) blocks when new fields are needed
- Zustand stores ready to have additional actions added in workout tracking, ranking, and profile phases
- Vitest configured and running — new test files in `tests/` picked up automatically

---
*Phase: 01-foundation*
*Completed: 2026-03-22*

## Self-Check: PASSED

- FOUND: vitest.config.ts
- FOUND: tests/setup.ts
- FOUND: tests/lib/db/workouts.test.ts
- FOUND: tests/lib/db/profile.test.ts
- FOUND: src/lib/db/workouts.ts
- FOUND: src/lib/db/profile.ts
- FOUND: src/stores/useWorkoutStore.ts
- FOUND: src/stores/useMapStore.ts
- FOUND: src/stores/useRankStore.ts
- FOUND: src/stores/useProfileStore.ts
- Commit f7beb09: FOUND
- Commit 2c402b1: FOUND
- Commit af29375: FOUND
