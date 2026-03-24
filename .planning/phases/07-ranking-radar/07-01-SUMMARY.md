---
phase: 07-ranking-radar
plan: 01
subsystem: database
tags: [dexie, vitest, tdd, ranking, radar-chart, hooks]

# Dependency graph
requires:
  - phase: 04-workout-logger
    provides: Dexie WorkoutsDatabase with sessions, exercisesInSession, and sets tables
  - phase: 01-foundation
    provides: TierRank enum and RankState interface in src/types/ranking.ts
provides:
  - Pure ranking computation functions (computeTierRank, computeSubTierProgress, computeRadarAxes)
  - TIER_THRESHOLDS and CATEGORY_MAP constants
  - Dexie v3 schema with lastSeenTier table for celebration tracking
  - useRankingData hook aggregating workout history into tier/radar data
affects: [07-ranking-radar-plan-02, 07-ranking-radar-plan-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD cycle: RED (failing tests) -> GREEN (minimal impl) -> REFACTOR
    - CATEGORY_MAP: muscle slug -> push/pull/legs/core/conditioning for radar axes
    - Dexie additive schema: version(3) adds lastSeenTier without touching v1/v2

key-files:
  created:
    - src/lib/ranking.ts
    - tests/lib/ranking.test.ts
    - src/hooks/useRankingData.ts
  modified:
    - src/lib/db/workouts.ts

key-decisions:
  - "CATEGORY_MAP uses actual exercise.json muscle slugs (pectoralis-major, latissimus-dorsi) not generic names — prevents missing mappings defaulting to conditioning"
  - "computeRadarAxes returns 0 for all axes when tierMaxVolume=0 — avoids false normalization without valid reference point"
  - "useRankingData imports TierRank as value (not type-only) — needed for useState initial value"
  - "Pre-existing TS errors in tests/hooks/useStrainMap.test.ts are out-of-scope, not introduced by this plan"

patterns-established:
  - "Ranking computation is pure and stateless — all functions take values, return values, no side effects"
  - "tierMaxVolume = next tier threshold; Elite case uses current tier min as max (returns 1 progress)"

requirements-completed: [RANK-01, RANK-02, RANK-03]

# Metrics
duration: 4min
completed: 2026-03-24
---

# Phase 7 Plan 01: Ranking Computation Engine Summary

**Pure ranking functions (tier/progress/radar) TDD'd with 30 passing tests, Dexie v3 schema with lastSeenTier table, and useRankingData hook aggregating all workout history into UI-ready ranking state**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-24T10:11:17Z
- **Completed:** 2026-03-24T10:15:50Z
- **Tasks:** 2 completed
- **Files modified:** 4

## Accomplishments

- 30 unit tests covering all tier thresholds, sub-tier progress fractions, and radar axis normalization — all pass
- `computeTierRank` walks TIER_THRESHOLDS in reverse for O(n) correct tier lookup; caps at Elite
- `computeSubTierProgress` returns 0-1 fraction within tier; Elite always returns 1 (no next tier)
- `computeRadarAxes` normalizes 5 category volumes (push/pull/legs/core/conditioning) to 0-100 relative to tier max
- Dexie v3 schema adds `lastSeenTier: 'id'` table without modifying v1 or v2 blocks
- `useRankingData` hook queries all sets, maps to categories via CATEGORY_MAP, computes week summary (last 7 days), manages lastSeenTier CRUD

## Task Commits

Each task was committed atomically:

1. **Task 1: TDD ranking computation functions** - `397a7df` (feat)
2. **Task 2: Dexie v3 schema + useRankingData hook** - `946a05f` (feat)

_Note: Task 1 used TDD RED->GREEN cycle with a fix between attempts (tierMaxVolume=0 edge case)_

## Files Created/Modified

- `src/lib/ranking.ts` - Pure ranking functions + TIER_THRESHOLDS + CATEGORY_MAP constants
- `tests/lib/ranking.test.ts` - 30 unit tests covering all computation functions
- `src/lib/db/workouts.ts` - Added LastSeenTierRecord interface, lastSeenTier table, version(3) schema
- `src/hooks/useRankingData.ts` - Client hook returning tier, subTierProgress, radarAxes, totalVolume, weekSummary, lastSeenTier, setLastSeenTier, isLoading

## Decisions Made

- CATEGORY_MAP includes both generic names (chest, back, quads) and actual exercises.json muscle slugs (pectoralis-major, latissimus-dorsi) to handle both call sites correctly
- `computeRadarAxes` returns 0 for all axes when `tierMaxVolume <= 0` rather than using `Math.max(1, max)` — avoids false 100% scores with no valid reference
- `useRankingData` uses `TierRank.Iron` (value import) as initial state, not a lazy initializer with require()

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed computeRadarAxes edge case for zero tierMaxVolume**
- **Found during:** Task 1 (GREEN phase tests)
- **Issue:** Initial implementation used `Math.max(1, tierMaxVolume)` as safeMax, causing 100% scores when tierMaxVolume=0 but category volume > 0
- **Fix:** Return 0 for all axes when `tierMaxVolume <= 0` — no valid reference point means no normalization
- **Files modified:** `src/lib/ranking.ts`
- **Verification:** Test `returns zeros when tierMaxVolume is 0` now passes (was failing)
- **Committed in:** `397a7df` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Essential edge case fix for correct radar normalization. No scope creep.

## Issues Encountered

- Pre-existing TypeScript errors in `tests/hooks/useStrainMap.test.ts` (3 branded type errors from Phase 05) appear in tsc output but are out-of-scope. All new files compile cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All computation functions tested and exported — ready for Plan 02 (radar chart UI)
- `useRankingData` hook provides all data the UI needs: tier, progress, axes, week summary
- `lastSeenTier` + `setLastSeenTier` ready for Plan 03 (celebration overlay)
- No blockers

---
*Phase: 07-ranking-radar*
*Completed: 2026-03-24*

## Self-Check: PASSED

- FOUND: src/lib/ranking.ts
- FOUND: tests/lib/ranking.test.ts
- FOUND: src/lib/db/workouts.ts
- FOUND: src/hooks/useRankingData.ts
- FOUND: commit 397a7df (Task 1)
- FOUND: commit 946a05f (Task 2)
