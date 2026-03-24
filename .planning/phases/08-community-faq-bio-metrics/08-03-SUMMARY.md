---
phase: 08-community-faq-bio-metrics
plan: "03"
subsystem: bio-metrics-integration
tags: [strain-engine, bio-metrics, accuracy, ranking, muscle-map, tdd]
dependency_graph:
  requires: [08-02]
  provides: [BIO-02, BIO-03-verified]
  affects: [strain-engine, muscle-map, ranking-dashboard]
tech_stack:
  added: []
  patterns:
    - bodyweight-normalized strain divisor (bodyweightKg * 50)
    - useProfileStore subscription in hooks and components
    - passive accuracy indicators (no prompts)
key_files:
  created: []
  modified:
    - src/lib/strain-engine.ts
    - src/hooks/useStrainMap.ts
    - src/components/muscle-map/MuscleMap.tsx
    - src/components/ranking/RankingDashboard.tsx
    - tests/lib/strain-engine.test.ts
decisions:
  - bodyweight divisor formula is bodyweightKg * 50 (100kg = 5000 = NORMALIZE_DIVISOR, exactly matching default behavior)
  - AccuracyRing shows 0% when no bio data — passive, never gates features (BIO-03)
  - TierBadge enhanced badge only shown when accuracyPct > 0 (not totalVolume > 0) — accuracy is the signal
  - Accuracy ring added to main data view in RankingDashboard only, not empty or loading states
metrics:
  duration: "3 minutes"
  completed: "2026-03-24"
  tasks_completed: 2
  tasks_total: 3
  files_modified: 5
---

# Phase 08 Plan 03: Bio Metrics Integration Summary

Bio-enhanced strain computation and accuracy indicators wired into muscle map and ranking pages.

## What Was Built

**Task 1: Strain engine bodyweight parameter (TDD)**

The `computeStrainMap` function in `src/lib/strain-engine.ts` now accepts an optional `bodyweightKg?: number | null` parameter. When provided, the normalization divisor scales as `bodyweightKg * 50` (so a 100 kg person matches the original `NORMALIZE_DIVISOR = 5000` exactly). A lighter person gets proportionally higher strain at the same volume.

`useStrainMap` now subscribes to `useProfileStore(s => s.latestBio?.weightKg ?? null)`, loads bio on mount, and passes `bodyweightKg` both to `computeStrainMap` and into its effect dependency array.

Three new unit tests cover: backward compatibility (null/undefined = no change), lighter person gets higher strain than heavier person at same volume, 100 kg person matches NORMALIZE_DIVISOR exactly.

**Task 2: Accuracy indicators on map and ranking pages**

`MuscleMap` now shows an `AccuracyRing` next to the strain disclaimer. It subscribes to `useProfileStore` latestBio, computes accuracy via `computeAccuracyPct`, and renders 0% when no bio data is present (passive, no prompts).

`RankingDashboard` now shows:
- An "enhanced" badge next to TierBadge when `accuracyPct > 0`
- An `AccuracyRing` + "Accuracy" label below the ProgressBar
- A "Relative strength: X.X kg/kg enhanced" line when `latestBio?.weightKg && totalVolume > 0`

All accuracy indicators are passive per BIO-03: no links to /profile, no "complete your profile" text.

## Deviations from Plan

None - plan executed exactly as written.

## Task Commits

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Strain engine bodyweightKg + useStrainMap profile subscription | aae9078 |
| 2 | Accuracy ring on map page + ranking enhancements | aaf7d97 |

## Verification Status

- Unit tests: 13/13 passing (`npx vitest run tests/lib/strain-engine.test.ts`)
- Build: clean (`npx next build`)
- Human verification: PENDING (Task 3 checkpoint)

## Known Stubs

None. All features wire real data from `useProfileStore` and `computeAccuracyPct`.

## Self-Check: PASSED
