---
phase: 05-strain-engine-heatmap
verified: 2026-03-24T00:30:00Z
status: human_needed
score: 11/11 must-haves verified
re_verification: false
human_verification:
  - test: "Verify heatmap color overlay renders on the muscle map"
    expected: "Muscles with recent workout history show blue/yellow/orange/red fill. Rested muscles remain default gray."
    why_human: "SVG style.fill mutations via DOM imperatives cannot be asserted programmatically without a running browser"
  - test: "Verify disclaimer text is visible below the muscle map"
    expected: "Text 'Strain data based on placeholder estimates' appears below map in muted gray at 14px"
    why_human: "Visual presentation and styling require visual inspection"
  - test: "Verify heatmap updates after workout session ends without page refresh"
    expected: "After finishing a session on /workout, returning to / shows fresh strain colors without manual reload"
    why_human: "Reactive behavior depends on Zustand store state transitions at runtime"
  - test: "Verify selection color wins over strain color"
    expected: "Clicking a strained muscle shows teal/primary accent, not strain color. Deselecting restores strain color."
    why_human: "CSS data-selected rule vs. inline style.fill interaction requires browser DOM inspection"
  - test: "Verify bilateral anatomy paths receive strain fill"
    expected: "In Anatomy detail mode, left and right variants of paired muscles (e.g. biceps-brachii-left/right) both show strain color"
    why_human: "Requires visual verification of SVG bilateral paths in the browser"
---

# Phase 05: Strain Engine + Heatmap Verification Report

**Phase Goal:** The muscle map heatmap is live — users can see each muscle's current strain/recovery state as a color gradient derived from their workout history, with a visible disclaimer that data is based on placeholder estimates
**Verified:** 2026-03-24T00:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | computeStrainMap returns a Map<MuscleSlug, StrainLevel> from workout dose history | VERIFIED | Function exported at src/lib/strain-engine.ts:71; all 10 unit tests pass |
| 2 | Strain decays exponentially with 72hr half-life — a muscle worked 72hrs ago shows ~50% of fresh strain | VERIFIED | HALF_LIFE_MS constant at line 17; Math.pow(0.5, ...) at line 41; test "returns Moderate after 72hr decay" passes |
| 3 | Primary muscles receive 100% of exercise volume, secondary muscles receive 40% | VERIFIED | WorkoutMuscleDose.multiplier (1.0/0.4); useStrainMap.ts lines 70-87; test "secondary multiplier produces lower strain" passes |
| 4 | Strain caps at 100% — no StrainLevel beyond Strained regardless of volume | VERIFIED | Math.min(100, ...) normalization at line 85; test "caps at Strained for extreme volume" passes |
| 5 | Muscles with no recent workouts are not in output map (Rested is the absence of a key) | VERIFIED | Filter at strain-engine.ts:87; test "excludes Rested muscles from result map" passes |
| 6 | User can see heatmap color overlay — trained muscles appear blue/yellow/orange/red | VERIFIED (automated) / ? HUMAN | STRAIN_COLORS wired to SVG fill via applyStrainToSlug in MuscleMapCanvas.tsx:99; requires visual confirmation |
| 7 | Heatmap colors update after workout session ends without page refresh | VERIFIED (automated) / ? HUMAN | activeSessionId dependency in useEffect triggers recompute on session state change; requires runtime confirmation |
| 8 | Strain colors re-apply after view/mode toggle | VERIFIED (automated) / ? HUMAN | currentView + detailMode in useEffect deps (line 104); requires browser confirmation |
| 9 | Selected muscle shows primary accent, not strain color — selection wins | VERIFIED (automated) / ? HUMAN | `if (slug === selectedMuscle) continue` at MuscleMapCanvas.tsx:97; requires visual confirmation |
| 10 | Bilateral anatomy muscles both receive strain color | VERIFIED (automated) / ? HUMAN | applyStrainToSlug tries base + -left + -right paths (lines 43-46); requires visual confirmation |
| 11 | User sees "Strain data based on placeholder estimates" disclaimer below muscle map | VERIFIED | MuscleMap.tsx:15 contains exact text; styled text-[14px] text-muted-foreground text-center |

**Score:** 11/11 truths verified (5 require additional human visual confirmation)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/strain-engine.ts` | Pure strain computation function and WorkoutMuscleDose interface | VERIFIED | 106 lines; exports computeStrainMap, WorkoutMuscleDose, STRAIN_COLORS |
| `tests/lib/strain-engine.test.ts` | Unit tests covering decay, thresholds, cap, primary/secondary multiplier | VERIFIED | 172 lines; 10 test cases, all pass |
| `src/hooks/useStrainMap.ts` | React hook reading Dexie workout history and returning strain Map | VERIFIED | 108 lines; starts with 'use client'; exports useStrainMap |
| `src/components/muscle-map/MuscleMap.tsx` | Wrapper with disclaimer text and strainMap prop threading | VERIFIED | 19 lines; contains disclaimer; calls useStrainMap; passes strainMap prop |
| `src/components/muscle-map/MuscleMapCanvas.tsx` | Strain fill useEffect on SVG path elements | VERIFIED | 159 lines; MuscleMapCanvasProps interface; applyStrainToSlug helper; strain useEffect |
| `tests/hooks/useStrainMap.test.ts` | Integration test for hook reading Dexie and returning strain levels | VERIFIED | 139 lines; 2 integration tests; both pass at runtime |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| src/lib/strain-engine.ts | src/types/strain.ts | StrainLevel enum import | WIRED | Line 1: `import { StrainLevel } from '@/types'` |
| src/lib/strain-engine.ts | src/types/muscle.ts | MuscleSlug type import | WIRED | Line 2: `import type { MuscleSlug } from '@/types'` |
| src/hooks/useStrainMap.ts | src/lib/strain-engine.ts | computeStrainMap import | WIRED | Line 5: `import { computeStrainMap } from '@/lib/strain-engine'` |
| src/hooks/useStrainMap.ts | src/lib/db/workouts.ts | dynamic import for Dexie access | WIRED | Line 29: `const { workoutsDb } = await import('@/lib/db/workouts')` |
| src/components/muscle-map/MuscleMap.tsx | src/hooks/useStrainMap.ts | useStrainMap hook call | WIRED | Line 5: import; Line 8: `const strainMap = useStrainMap()` |
| src/components/muscle-map/MuscleMapCanvas.tsx | src/lib/strain-engine.ts | STRAIN_COLORS import for fill values | WIRED | Line 7: `import { STRAIN_COLORS } from '@/lib/strain-engine'`; used at line 99 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| src/hooks/useStrainMap.ts | strainMap (Map<MuscleSlug, StrainLevel>) | workoutsDb.sessions.filter(completedAt !== null).toArray() | Yes — real Dexie queries on sessions, exercisesInSession, sets tables | FLOWING |
| src/components/muscle-map/MuscleMap.tsx | strainMap | useStrainMap() hook return value | Yes — hook produces real Map from Dexie data | FLOWING |
| src/components/muscle-map/MuscleMapCanvas.tsx | strainMap prop | MuscleMapCanvasProps.strainMap passed from MuscleMap | Yes — not hardcoded; passed from live hook | FLOWING |

The data pipeline is complete: Dexie IndexedDB -> workoutsDb queries -> WorkoutMuscleDose[] array -> computeStrainMap() -> Map<MuscleSlug, StrainLevel> -> STRAIN_COLORS lookup -> SVG path style.fill mutation.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| strain-engine.ts exports computeStrainMap, WorkoutMuscleDose, STRAIN_COLORS | node -e file content check | All 7 patterns PASS | PASS |
| useStrainMap.ts satisfies all acceptance criteria | node -e file content check | All 7 patterns PASS | PASS |
| MuscleMap.tsx satisfies all acceptance criteria | node -e file content check | All 5 patterns PASS | PASS |
| MuscleMapCanvas.tsx satisfies all acceptance criteria | node -e file content check | All 9 patterns PASS | PASS |
| 10 unit tests pass for strain-engine | npx vitest run tests/lib/strain-engine.test.ts | 10/10 tests pass | PASS |
| 2 integration tests pass for useStrainMap | npx vitest run tests/hooks/useStrainMap.test.ts | 2/2 tests pass | PASS |
| Full suite regression | npx vitest run (runtime only) | 114/114 pass (12 test files) | PASS |
| Heatmap fills on SVG paths | Browser visual inspection required | Cannot run without browser | SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| STRAIN-01 | 05-01-PLAN, 05-02-PLAN | User can see per-muscle strain/recovery state derived from logged workouts | SATISFIED | computeStrainMap derives strain from WorkoutMuscleDose history; useStrainMap reads Dexie workout logs; MuscleMapCanvas applies fills to SVG paths |
| STRAIN-02 | 05-01-PLAN | Strain calculations use placeholder dataset with time-decay model | SATISFIED | Exponential decay with 72hr half-life (HALF_LIFE_MS); NORMALIZE_DIVISOR=5000 tuning constant; data/exercises.json muscle mappings |
| STRAIN-03 | 05-02-PLAN | User sees a disclaimer indicating strain data is based on placeholder estimates | SATISFIED | MuscleMap.tsx line 15: exact text "Strain data based on placeholder estimates" |
| MAP-03 | 05-02-PLAN | User can see heatmap color overlay showing strain level per muscle (rested to strained gradient) | SATISFIED (automated) / ? HUMAN | STRAIN_COLORS (5 levels), applyStrainToSlug wired to useStrainMap output; visual rendering requires human confirmation |

All 4 requirement IDs from plan frontmatter accounted for. No orphaned requirements from REQUIREMENTS.md for phase 5.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| tests/hooks/useStrainMap.test.ts | 118-119, 135 | Uncast string literals passed to branded Map<MuscleSlug, StrainLevel> methods — produces 3 TypeCheckErrors in vitest tsc integration | Warning | Runtime tests still pass; typecheck fails silently for these 3 assertions; fix requires `'pectoralis-major' as MuscleSlug` casts matching pattern in strain-engine.test.ts |
| tests/hooks/useStrainMap.test.ts | all | DatabaseClosedError in stderr during afterEach cleanup | Info | Benign race condition — cancelled flag prevents real errors; acknowledged in SUMMARY |

Note on the "Strain data based on placeholder estimates" match in the TODO anti-pattern scan: this is the required disclaimer text string, not a TODO comment. It was correctly excluded as a false positive.

### Human Verification Required

#### 1. Heatmap Color Overlay Renders Correctly

**Test:** Open http://localhost:3001. With no workout history, verify all muscles are default gray. Log a workout (e.g. /workout -> freestyle -> Flat Bench Press -> 3 sets 10 reps 80kg -> finish). Return to /. Verify pectoralis-major area shows warm color (orange/red for Heavy/Strained), secondary muscles (triceps, front deltoid) show cooler color (blue/yellow).
**Expected:** Primary chest muscle shows Heavy or Strained color. Secondary muscles show Light or Moderate. Rested muscles remain gray.
**Why human:** SVG style.fill DOM mutations from a useEffect cannot be asserted programmatically without a running browser; JSDOM test environment does not render SVG paths.

#### 2. Disclaimer Text Visual Presentation

**Test:** On the muscle map page (/), verify the "Strain data based on placeholder estimates" text is visible below the muscle map SVG.
**Expected:** Gray muted text at 14px, centered, spaced below the muscle map within the same flex column.
**Why human:** CSS rendering and visual layout require visual inspection.

#### 3. Reactive Heatmap Update After Workout

**Test:** With the muscle map page open at /, navigate to /workout, start a session, log exercises, and finish the session. Navigate back to /. Verify muscle colors updated without manual page refresh.
**Expected:** Muscles trained in the just-completed session show strain colors on the map page within a few seconds.
**Why human:** Zustand activeSessionId -> null transition triggering the useEffect recomputation requires runtime state observation.

#### 4. Selection Color Wins Over Strain Color

**Test:** After logging a workout, on the muscle map page, click a muscle that is showing a strain color (e.g. orange pectoralis-major). Verify it switches to the primary accent color (teal). Click away or on another area to deselect. Verify the strain color returns.
**Expected:** Click on strained muscle -> teal/primary accent. Deselect -> strain color restored.
**Why human:** CSS data-selected attribute rule vs. inline style.fill layering requires browser CSS cascade inspection.

#### 5. Bilateral Anatomy Mode Fill

**Test:** Switch detail mode to Anatomy. Log a workout if no history exists. Verify paired muscles (biceps, triceps, deltoids etc.) show strain color on both the left and right bilateral SVG paths.
**Expected:** Both -left and -right path variants receive the fill color from applyStrainToSlug.
**Why human:** SVG path IDs for bilateral anatomy mode require visual browser inspection.

### Gaps Summary

No automated gaps found. All artifacts exist, are substantive, and are wired. All 12 runtime tests pass. The 3 TypeCheckErrors in tests/hooks/useStrainMap.test.ts are a code quality warning (missing `as MuscleSlug` casts) but do not block goal achievement — all runtime behaviors work correctly. Human visual verification is the only remaining gate.

The human visual verification checkpoint (Plan 02 Task 3) was reported as approved in 05-02-SUMMARY.md ("Task 3: Verify heatmap visual rendering on muscle map — APPROVED by user"). If that approval is trusted, the phase can be considered fully complete. The items above document what was visually confirmed by the human checkpoint.

---

_Verified: 2026-03-24T00:30:00Z_
_Verifier: Claude (gsd-verifier)_
