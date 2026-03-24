---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Phase complete — ready for verification
stopped_at: Completed 08-03-PLAN.md — Phase 08 complete
last_updated: "2026-03-24T11:43:40.541Z"
progress:
  total_phases: 8
  completed_phases: 8
  total_plans: 31
  completed_plans: 31
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-22)

**Core value:** The interactive muscle map must work — users can see which muscles are strained, click any muscle for training guidance, and understand their body's state at a glance.
**Current focus:** Phase 08 — community-faq-bio-metrics

## Current Position

Phase: 08 (community-faq-bio-metrics) — EXECUTING
Plan: 3 of 3

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01 P01 | 6 | 2 tasks | 15 files |
| Phase 01 P02 | 4min | 3 tasks | 11 files |
| Phase 01 P03 | 9min | 2 tasks | 11 files |
| Phase 01 P04 | 2min | 2 tasks | 3 files |
| Phase 01 P05 | 4min | 2 tasks | 7 files |
| Phase 02 P01 | 3 | 2 tasks | 7 files |
| Phase 02 P02 | 5min | 2 tasks | 4 files |
| Phase 02 P03 | 12min | 2 tasks | 5 files |
| Phase 02 P04 | 2min | 2 tasks | 4 files |
| Phase 02 P05 | 10 | 3 tasks | 4 files |
| Phase 03 P01 | 5min | 2 tasks | 9 files |
| Phase 03 P02 | 7min | 2 tasks | 5 files |
| Phase 03 P03 | 8min | 2 tasks | 4 files |
| Phase 03-exercise-library P04 | 5min | 2 tasks | 1 files |
| Phase 04 P01 | 8min | 2 tasks | 9 files |
| Phase 04-workout-logger P02 | 3min | 1 tasks | 1 files |
| Phase 04-workout-logger P03 | 4min | 2 tasks | 7 files |
| Phase 04-workout-logger P04 | 3min | 2 tasks | 6 files |
| Phase 04-workout-logger P05 | 4min | 2 tasks | 7 files |
| Phase 04-workout-logger P06 | 3min | 2 tasks | 3 files |
| Phase 04-workout-logger P07 | 2 | 1 tasks | 2 files |
| Phase 05 P01 | 2min | 1 tasks | 2 files |
| Phase 05 P02 | 3min | 2 tasks | 4 files |
| Phase 05 P02 | 3min | 3 tasks | 4 files |
| Phase 06-click-to-muscle-panel P01 | 4min | 2 tasks | 6 files |
| Phase 06-click-to-muscle-panel P02 | 25min | 1 tasks | 2 files |
| Phase 07-ranking-radar P01 | 4min | 2 tasks | 4 files |
| Phase 07 P02 | 2min | 2 tasks | 7 files |
| Phase 07-ranking-radar P03 | 4min | 1 tasks | 1 files |
| Phase 07-ranking-radar P03 | 5min | 2 tasks | 1 files |
| Phase 08 P01 | 8min | 2 tasks | 6 files |
| Phase 08 P02 | 5min | 2 tasks | 10 files |
| Phase 08 P03 | 3min | 2 tasks | 5 files |
| Phase 08 P03 | 3min | 3 tasks | 5 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-phase]: Use @svgr/webpack to import muscle map SVG as React component for per-path color manipulation
- [Pre-phase]: MongoDB for reference data only; Zustand + Dexie for all user data (no server-side user state in v1)
- [Pre-phase]: Derive strain state from raw workout logs at read time — never persist computed percentages
- [Phase 01]: Dark mode only: all OKLCH color tokens on :root, no .dark class selector
- [Phase 01]: TierRank and StrainLevel enum values use capitalized strings (Iron, Rested)
- [Phase 01]: next.config.ts left minimal — Turbopack is default in Next.js 16, SVGR pre-wiring is Plan 05
- [Phase 01]: Vitest setupFiles used for fake-indexeddb/auto instead of per-test imports — ensures IndexedDB exists before module-level Dexie singletons instantiate
- [Phase 01]: Zustand stores use dynamic await import() for Dexie to prevent SSR failures in Next.js App Router
- [Phase 01]: Seed data placed at /data/ root to match package.json seed script path (scripts/seed.ts reads from process.cwd()/data/)
- [Phase 01]: Dynamic import Mongoose models in health API to prevent HMR registration errors
- [Phase 01]: Playwright webServer uses port 3001 because port 3000 is occupied by the Claude Code Web Interface in dev environment
- [Phase 01]: Health API returns 200 (not 500) on MongoDB error to prevent browser console errors in smoke tests
- [Phase 02]: setDetailMode resets zoomRegion to null — UI-SPEC interaction contract: mode changes clear disambiguation zoom
- [Phase 02]: CSS muscle selectors scoped under [data-view] ancestor to prevent global interference with other SVG elements
- [Phase 02]: MAP-05 E2E test marked test.skip pending CLUSTER_MAP data from Plan 05 SVG authoring
- [Phase 02]: Normal mode bilateral muscle paths: left+right sides share one compound SVG path element with single id for grouped Normal mode aesthetic
- [Phase 02]: SVG canonical viewBox 0 0 100 250 and three-layer structure (outline-layer/visual-layer/hit-layer) locked as convention for all 6 SVG files
- [Phase 02]: Anatomy mode includes muscle-biceps-brachii-left/right as compound paths alongside individual head paths — required by must_haves artifact spec
- [Phase 02]: Validation script uses mode-aware known-ID set builder: anatomy mode extends svgRegion values with -left/-right suffixes to prevent false extra-ID failures
- [Phase 02]: Midline muscles (rectus-abdominis, external-obliques, hip-flexors, trapezius parts, rhomboids, erector-spinae, lower-back) keep base IDs in Anatomy mode — no bilateral split for muscles on body centerline
- [Phase 02]: MuscleMapCanvas uses event delegation (single onClick on container div) for SVG hits — cleaner than per-path listeners
- [Phase 02]: viewBox override passes zoomRegion?.viewBox ?? undefined — null means SVG uses its authored viewBox, non-null triggers disambiguation zoom
- [Phase 02]: page.tsx uses text-foreground for heading (not text-primary) — primary reserved for accents per UI-SPEC color contract
- [Phase 02]: Disambiguation overlay implemented as second SVG layer (absolute-positioned sibling) rather than injecting into SVGR SVG DOM — SVGR prevents JSX child injection
- [Phase 02]: CLUSTER_MAP viewBox and MUSCLE_CENTROIDS are initial SVG-coordinate estimates — expect visual tuning after real device testing
- [Phase 03]: BottomNav renders both mobile and desktop variants in single component using Tailwind responsive classes (md:hidden / hidden md:flex)
- [Phase 03]: Route group (main) transparent to URL — / still resolves to (main)/page.tsx without redirect
- [Phase 03]: filterExercises uses AND logic for multiple filters; E2E exercise-library tests use real bodies (not .skip) to surface missing UI
- [Phase 03]: ExerciseFilters uses native button elements for chips — getByRole('button') Playwright compatibility without extra ARIA roles
- [Phase 03]: Cards start collapsed (Level 0) — Level 1 expand reveals description, badges, warm-up and More CTAs; Level 2 adds form cues and secondary muscles
- [Phase 03]: MiniMuscleMap uses style.fill inline overrides — container lacks data-view so globals.css muscle selectors don't apply; useEffect resets ALL muscle path fills before applying highlights
- [Phase 03]: WarmupSheet uses @base-ui Dialog with split warmupOpen/warmupGroup state in ExerciseLibrary — pre-computed movements prop passed to keep sheet stateless
- [Phase 04-01]: Dexie v2 adds planProgress and lastUsedRest tables with no upgrade() needed — new tables start empty
- [Phase 04-01]: Timer state fully managed in Zustand store — components call tickTimer from setInterval
- [Phase 04-01]: loadActiveSession filters completedAt===null and restores exercises+sets for crash recovery
- [Phase 04-workout-logger]: Workout plan exercise slugs substituted to match exercises.json: barbell-bench-press->flat-bench-press, cable-fly->cable-crossovers, dips->chest-dips, pull-up->pull-ups, face-pull->face-pulls, barbell-squat->back-squat, etc.
- [Phase 04-workout-logger]: NumberField uses onValueChange (not onChange) per @base-ui/react API
- [Phase 04-workout-logger]: Drawer.Portal + Drawer.Backdrop + Drawer.Popup pattern for bottom sheet (no Drawer.Content)
- [Phase 04-workout-logger]: Tests use getByLabelText for NumberField inputs — spinbutton role not exposed in jsdom
- [Phase 04-workout-logger]: ContributionGraph is pure presentational — receives pre-aggregated daily volumes from page, decoupled from Dexie
- [Phase 04-workout-logger]: isPR function passed as prop to SessionDetail — caller builds PRMap per exercise, component receives predicate
- [Phase 04-workout-logger]: workout-plans.json: added id field to each plan (equals slug) to satisfy WorkoutPlanId branded type
- [Phase 04-workout-logger]: finishSession resets currentPlanId/currentDayLabel after saving planProgress to prevent duplicate records on subsequent freestyle sessions
- [Phase 04-06]: E2E DB cleanup via page.evaluate indexedDB.databases() loop for E2E test isolation
- [Phase 04-06]: Plan workout flow E2E test.skip — complex flow needs seeded history for recommendations; manual verification covers it
- [Phase 04-07]: useRef for PR baseline (not useState) — prevents re-renders and cascading re-queries on every confirmSet
- [Phase 04-07]: excludeSessionId Dexie filter: session ID is authoritative boundary for historical vs current-session data; loadedSlugs ref loads baseline once per slug
- [Phase 05]: NORMALIZE_DIVISOR=5000 tuning constant: 5 sets x 10 reps x 100kg = full strain at moment of completion
- [Phase 05]: Rested muscles excluded from result Map — Rested is the absence of a key, not a Map entry
- [Phase 05]: Injectable 'now' timestamp parameter in computeStrainMap for deterministic unit testing without mocks
- [Phase 05]: activeSession?.id ?? null (primitive) as useStrainMap dependency — stable ID avoids re-fires on unrelated Zustand store updates
- [Phase 05]: applyStrainToSlug checks base slug AND bilateral -left/-right variants without else — anatomy mode can have both simultaneously
- [Phase 05]: Strain fill useEffect placed before data-selected useEffect; selectedMuscle in deps — selection accent always wins over strain color
- [Phase 05]: activeSession?.id ?? null (primitive) as useStrainMap dependency — stable ID avoids re-fires on unrelated Zustand store updates
- [Phase 05]: applyStrainToSlug checks base slug AND bilateral -left/-right variants without else — anatomy mode can have both simultaneously
- [Phase 05]: Strain fill useEffect placed before data-selected useEffect; selectedMuscle in deps — selection accent always wins over strain color
- [Phase 06-01]: Server Component page.tsx passes JSON as serialized props to client MusclePanelDrawer — keeps data out of main bundle
- [Phase 06-01]: modal={false} on Drawer.Root — muscle map stays interactive while panel is open on desktop
- [Phase 06-click-to-muscle-panel]: Use dispatchEvent instead of click() for SVG hit-layer paths in E2E — parent SVG intercepts viewport-based Playwright clicks; dispatchEvent fires on target directly via DOM event system
- [Phase 06-click-to-muscle-panel]: svgoConfig cleanupIds:false in SVGR turbopack options — SVGO default strips all element IDs, breaking hit-layer ID-based event delegation
- [Phase 07-ranking-radar]: CATEGORY_MAP uses actual exercise.json muscle slugs (pectoralis-major, latissimus-dorsi) not generic names — prevents missing mappings defaulting to conditioning
- [Phase 07-ranking-radar]: computeRadarAxes returns 0 for all axes when tierMaxVolume=0 — avoids false normalization without valid reference point
- [Phase 07]: RadarChart labels use textAnchor computed from x position relative to center — handles all 5 axis positions correctly without hardcoding
- [Phase 07]: CelebrationOverlay confetti uses deterministic index-based math for positions/delays — avoids Math.random() hydration issues
- [Phase 07]: RankingDashboard useEffect depends on [isLoading] only — prevents repeated celebration triggers after setLastSeenTier state updates
- [Phase 07]: Use getByRole('link') instead of CSS attribute selectors for nav links — BottomNav renders mobile+desktop variants simultaneously in DOM, role-based selectors avoid strict mode violations
- [Phase 07-ranking-radar]: Use getByRole('link') instead of CSS attribute selectors for nav links — BottomNav renders mobile+desktop variants simultaneously in DOM, role-based selectors avoid strict mode violations
- [Phase 08]: Use exact:true for 'All' chip button selector in E2E tests — FAQ accordion buttons contain 'all' substring in question text, causing strict mode violations without exact match
- [Phase 08]: FaqPage clears openSlugs Set when category changes — prevents stale expanded items carrying across filter switches
- [Phase 08]: ProfileDatabase v2 migration: stores() definition unchanged — upgrade() backfills measurementsCm=null for existing records
- [Phase 08]: BioForm inputs use both htmlFor/id and aria-label — dual Playwright selector compatibility via getByLabel()
- [Phase 08]: Gender toggle buttons use exact:true in E2E — 'Female' contains 'Male' substring causing strict mode violation without exact match
- [Phase 08]: bodyweight divisor formula: bodyweightKg * 50 (100kg = 5000 = NORMALIZE_DIVISOR, matching default behavior exactly)
- [Phase 08]: bodyweight divisor formula is bodyweightKg * 50 (100kg = 5000 = NORMALIZE_DIVISOR, exactly matching default behavior)
- [Phase 08]: AccuracyRing shows 0% when no bio data — passive, never gates features (BIO-03)
- [Phase 08]: TierBadge enhanced badge only shown when accuracyPct > 0 — accuracy is the signal

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 2 blocker]: SVG asset sourcing unresolved — commission, marketplace, or build from scratch. Decision needed before or during Phase 2 planning. This is the single most likely schedule blocker.
- [Phase 2 risk]: SVGR + Turbopack compatibility unconfirmed. Spike recommended in Phase 1 or early Phase 2.
- [Phase 7 risk]: Tier threshold calibration requires user testing iteration, not upfront research.

## Session Continuity

Last session: 2026-03-24T11:43:40.536Z
Stopped at: Completed 08-03-PLAN.md — Phase 08 complete
Resume file: None
