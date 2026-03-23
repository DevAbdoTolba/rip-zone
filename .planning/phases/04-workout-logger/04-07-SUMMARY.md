---
phase: 04-workout-logger
plan: 07
subsystem: ui
tags: [react, dexie, zustand, vitest, pr-detection, workout-logger]

# Dependency graph
requires:
  - phase: 04-workout-logger
    provides: WorkoutLogger component with pr-detection integration (computePRs, isNewPR)

provides:
  - Snapshot-based PR baseline in WorkoutLogger that freezes historical PRs before session modifies Dexie
  - loadHistoricalSets with excludeSessionId filter preventing current-session data from polluting baseline
  - sessionPRBaseline useRef replacing reactive historicPRs useState
  - Regression test suite (6 tests) proving snapshot contract prevents stale-read race condition

affects:
  - 04-workout-logger (WORK-04 unblocked — PR badge now correctly fires)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Snapshot ref pattern: freeze historical data before session writes, never re-query on confirmSet"
    - "per-slug tracking ref (loadedSlugs) prevents redundant Dexie queries on each activeExercises state update"
    - "excludeSessionId filter in Dexie query ensures crash-recovery path also uses clean baseline"

key-files:
  created:
    - tests/components/WorkoutLogger-pr.test.ts
  modified:
    - src/components/workout/WorkoutLogger.tsx

key-decisions:
  - "useRef instead of useState for baseline: refs don't trigger re-renders, preventing cascading re-queries after each confirmSet"
  - "excludeSessionId approach chosen over timestamp-based filter: session ID is the authoritative boundary between historical and current-session data"
  - "loadedSlugs tracking ref prevents the baseline useEffect from re-loading Dexie on every activeExercises update — only loads once per slug"

patterns-established:
  - "Snapshot isolation: load historical data once at exercise-add time, freeze it in useRef, never reload on session writes"
  - "Session-scoped exclusion: pass sessionId to Dexie queries to exclude current-session records from historical baselines"

requirements-completed: [WORK-01, WORK-02, WORK-03, WORK-04, WORK-05, WORK-06]

# Metrics
duration: 2min
completed: 2026-03-23
---

# Phase 04 Plan 07: PR Badge Snapshot Fix Summary

**Snapshot-based PR baseline in WorkoutLogger: freezes historical PRs before session writes to Dexie, fixing the never-fires bug where 90 > 90 returned false after confirmSet polluted the baseline**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-23T23:15:04Z
- **Completed:** 2026-03-23T23:17:39Z
- **Tasks:** 1 (TDD: 2 commits — test + feat)
- **Files modified:** 2

## Accomplishments

- Fixed the PR badge never-fires bug: `isNewPR` was comparing 90kg against a baseline of 90kg (just-confirmed set included) — now compares against frozen pre-session baseline of 80kg (90 > 80 = true, PR badge fires)
- Replaced `historicPRs` useState + reactive useEffect with `sessionPRBaseline` useRef + `loadedSlugs` tracking ref — baseline loaded once per exercise slug, never re-queried after confirmSet
- Added `excludeSessionId` parameter to `loadHistoricalSets` — Dexie query now filters out current-session exercise records, ensuring crash-recovery path also starts with clean baseline
- Added 6 regression tests in `tests/components/WorkoutLogger-pr.test.ts` proving the snapshot contract: baseline isolation, strict > preserved, first-ever set is PR, multiple PRs per session

## Task Commits

Each task was committed atomically (TDD pattern — test then implementation):

1. **Task 1 RED: Snapshot PR regression tests** - `ace0393` (test)
2. **Task 1 GREEN: Fix WorkoutLogger snapshot approach** - `d0ea4d5` (feat)

**Plan metadata:** (docs commit to follow)

_Note: TDD task split into test commit (RED) and implementation commit (GREEN)_

## Files Created/Modified

- `tests/components/WorkoutLogger-pr.test.ts` — 6 regression tests validating computePRs/isNewPR snapshot contract
- `src/components/workout/WorkoutLogger.tsx` — Replaced reactive historicPRs state with sessionPRBaseline useRef; rewrote loadHistoricalSets with excludeSessionId filter; added loadedSlugs tracking ref; added session-end cleanup effect

## Decisions Made

- `useRef` for the baseline (not `useState`) so baseline changes don't trigger re-renders — avoids cascading state updates on every confirmSet
- `excludeSessionId` Dexie filter approach chosen over timestamp-based filter: session ID is the authoritative boundary; timestamp approach would be fragile (system clock drift, same-second sets)
- Tests validate `computePRs`/`isNewPR` contract directly (not rendering WorkoutLogger) — fewer dependencies, faster to run, directly proves the snapshot logic

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PR badge now correctly fires when a confirmed set beats pre-session historical best (WORK-04 unblocked)
- All 48 tests pass: 6 new snapshot regression tests + 9 pr-detection tests + 33 store tests
- TypeScript compiles cleanly
- Phase 04 workout-logger feature set is now complete

---
*Phase: 04-workout-logger*
*Completed: 2026-03-23*
