---
phase: 05-strain-engine-heatmap
plan: 01
subsystem: testing
tags: [vitest, strain-engine, exponential-decay, pure-function, typescript]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: StrainLevel enum and MuscleSlug type in src/types/

provides:
  - Pure strain computation function computeStrainMap(doses, now) -> Map<MuscleSlug, StrainLevel>
  - WorkoutMuscleDose interface for intake of workout dose history
  - STRAIN_COLORS constant mapping all 5 StrainLevel values to hex/oklch colors
  - 10 unit tests confirming decay math, thresholds, cap, accumulation, and color mapping
affects:
  - 05-02-heatmap-overlay (consumes computeStrainMap and STRAIN_COLORS)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Exponential decay formula: volume * multiplier * Math.pow(0.5, (now - completedAt) / HALF_LIFE_MS)"
    - "Strain normalization: Math.min(100, (rawSum / NORMALIZE_DIVISOR) * 100)"
    - "Pure function pattern: injectable 'now' timestamp for deterministic testing"
    - "Rested-as-absence: muscles below Light threshold are not included in result Map"

key-files:
  created:
    - src/lib/strain-engine.ts
    - tests/lib/strain-engine.test.ts
  modified: []

key-decisions:
  - "NORMALIZE_DIVISOR=5000 tuning constant: 5 sets x 10 reps x 100kg = full strain at moment of completion"
  - "Rested muscles excluded from result Map — Rested is the absence of a key, not a Map entry"
  - "Injectable 'now' timestamp parameter in computeStrainMap for deterministic unit testing without mocks"
  - "HALF_LIFE_MS=72hr and thresholds (Light=20, Moderate=40, Heavy=60, Strained=80) per plan spec"

patterns-established:
  - "Strain engine is a zero-dependency pure function — no I/O, no side effects, deterministic"
  - "TDD RED-GREEN-REFACTOR: test file created first (import fails), then implementation makes all pass"

requirements-completed: [STRAIN-01, STRAIN-02]

# Metrics
duration: 2min
completed: 2026-03-24
---

# Phase 05 Plan 01: Strain Engine Summary

**Pure exponential-decay strain computation engine with 72hr half-life, 5-level thresholds, primary/secondary multipliers, and 10 passing unit tests**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-24T00:11:13Z
- **Completed:** 2026-03-24T00:12:53Z
- **Tasks:** 1 (TDD: RED + GREEN phases)
- **Files modified:** 2

## Accomplishments

- `computeStrainMap(doses, now)` pure function converts workout dose history to `Map<MuscleSlug, StrainLevel>` with exponential decay
- `STRAIN_COLORS` constant with hex/oklch colors for all 5 StrainLevel values, ready for heatmap overlay
- 10 unit tests covering: empty input, fresh dose (Strained), 72hr decay (Moderate), 144hr decay (Light), secondary multiplier, volume cap, accumulation, Rested exclusion, multi-muscle independence, color mapping

## Task Commits

Each TDD phase was committed atomically:

1. **Task 1 RED: Failing tests** - `ffc0585` (test)
2. **Task 1 GREEN: Strain engine implementation** - `75ee7e6` (feat)

_Note: TDD tasks produced two commits (test → feat). No REFACTOR needed — implementation was clean._

## Files Created/Modified

- `/home/appuser/workspace/rip-zone/src/lib/strain-engine.ts` - Pure strain computation engine: WorkoutMuscleDose interface, computeStrainMap function, STRAIN_COLORS constant, internal decayedStrain and strainToLevel helpers
- `/home/appuser/workspace/rip-zone/tests/lib/strain-engine.test.ts` - 10 unit tests covering all behavioral requirements

## Decisions Made

- `NORMALIZE_DIVISOR=5000`: 5 sets x 10 reps x 100kg = "full strain at moment of completion" — provides intuitive tuning constant for calibrating the heatmap
- Rested muscles excluded from result Map: Rested is the absence of a key, matching plan spec and keeping Map lean for heatmap iteration
- Injectable `now` timestamp as second parameter: enables deterministic unit testing without Date.now() mocking
- HALF_LIFE_MS, thresholds, and STRAIN_COLORS values all taken directly from plan spec for consistency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `computeStrainMap` and `STRAIN_COLORS` are ready for consumption by the heatmap overlay (Plan 02)
- Plan 02 will wire `computeStrainMap` to IndexedDB workout history and apply STRAIN_COLORS to SVG muscle paths

---
*Phase: 05-strain-engine-heatmap*
*Completed: 2026-03-24*
