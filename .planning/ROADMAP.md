# Roadmap: Rip Zone

## Overview

Rip Zone ships in 8 phases. Phase 1 lays the irreversible foundation — types, storage architecture, and seed data — that every subsequent phase depends on. Phase 2 establishes the hero feature's visual skeleton (the 2.5D muscle map SVG). Phases 3 and 4 build the exercise library and workout logger, which are the source of truth for all downstream computation. Phase 5 wires workout data into the strain engine and paints the heatmap overlay. Phase 6 delivers the "aha moment": click any muscle and see exercises, warm-up guidance, and current strain state. Phase 7 adds the gamified ranking system with radar chart. Phase 8 completes the app with the Egyptian community FAQ and optional bio metrics layer that refines accuracy without gating anything.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Next.js project, TypeScript domain types, MongoDB connection, Dexie schema, and seeded reference data (completed 2026-03-22)
- [x] **Phase 2: Muscle Map SVG** - 2.5D illustrated muscle map with front/back views, slug-based path IDs, and layered SVG architecture (completed 2026-03-23)
- [x] **Phase 3: Exercise Library** - Browseable, searchable exercise library with 100+ exercises and muscle group warm-up guidance (completed 2026-03-23)
- [x] **Phase 4: Workout Logger** - Freestyle workout logging with rest timer, workout history, PR detection, and pre-built plan runner (completed 2026-03-23)
- [x] **Phase 5: Strain Engine + Heatmap** - Per-muscle fatigue computation from workout logs wired to heatmap color overlay on the muscle map (completed 2026-03-24)
- [x] **Phase 6: Click-to-Muscle Panel** - Tap any muscle to see exercises targeting it, warm-up guidance, and current strain state in a slide-out panel (completed 2026-03-24)
- [ ] **Phase 7: Ranking + Radar** - Iron → Elite tier ranking system with sub-tier progress bar, tier-advance celebration, and radar chart body rating
- [ ] **Phase 8: Community FAQ + Bio Metrics** - Egyptian gym community FAQ browser and optional bio info collection with accuracy reward

## Phase Details

### Phase 1: Foundation
**Goal**: The project skeleton exists with the irreversible architectural decisions made correctly — TypeScript domain types, data storage split (MongoDB for reference data, Dexie for user data), seed data for all content, and Mongoose HMR protection — so every subsequent phase builds on a stable base
**Depends on**: Nothing (first phase)
**Requirements**: None (infrastructure phase — enables all user-facing requirements)
**Success Criteria** (what must be TRUE):
  1. Next.js 16 app runs locally with Turbopack and passes a smoke-test page load with no console errors
  2. MongoDB connection singleton handles Hot Module Replacement without accumulating duplicate connections
  3. Dexie database initializes with correct schema for workout sessions, bio metrics, and ranking state
  4. Seed data JSON for muscles, exercises (100+), workout plans (3-5), and FAQ entries loads into MongoDB without errors
  5. All TypeScript domain types compile: MuscleId, MuscleSlug, WorkoutSession, SetLog, TierRank, StrainLevel, BioMetrics
**Plans:** 5/5 plans complete
Plans:
- [x] 01-01-PLAN.md — Bootstrap Next.js 16, shadcn/ui design system, TypeScript domain types
- [x] 01-02-PLAN.md — Dexie split databases and Zustand domain store shells
- [x] 01-03-PLAN.md — MongoDB connection, Mongoose models, seed data, and CLI seed script
- [x] 01-04-PLAN.md — Smoke-test page, health API, Vitest setup, and human verification
- [x] 01-05-PLAN.md — SVGR turbopack pre-wiring and Playwright E2E smoke test

### Phase 2: Muscle Map SVG
**Goal**: Users can see a 2.5D illustrated muscle map with front and back body views and toggle between them — the visual contract (slug-based path IDs, two-layer SVG architecture, invisible hit-target overlays) is locked in for all downstream phases
**Depends on**: Phase 1
**Requirements**: MAP-01, MAP-02, MAP-05
**Success Criteria** (what must be TRUE):
  1. User can see a 2.5D illustrated muscle map showing all major muscle groups on front and back body views
  2. User can toggle between front and back views and the selected view is preserved when navigating away and returning
  3. User can tap small or clustered muscles (e.g., brachialis, rotator cuff) and a disambiguation popover appears letting them select the intended muscle
  4. Each muscle path has a slug-based ID (e.g., muscle-biceps-left) that matches the data model, confirmed by inspecting the DOM
**Plans:** 5/5 plans complete
Plans:
- [x] 02-01-PLAN.md — Infrastructure: @svgr/webpack, SVG type declaration, useMapStore extension, CSS selectors, test scaffolds
- [x] 02-02-PLAN.md — Normal mode SVG authoring (front + back) and path ID validation script
- [x] 02-03-PLAN.md — Advanced + Anatomy mode SVG authoring (4 files) and validation update
- [x] 02-04-PLAN.md — React components (MuscleMap, Canvas, Controls) and home page integration
- [x] 02-05-PLAN.md — Disambiguation zoom, E2E tests, and human verification
**UI hint**: yes

### Phase 3: Exercise Library
**Goal**: Users can browse and search a library of 100+ exercises with muscle tags and warm-up guidance, giving them a standalone reference and establishing the exercise data foundation that the workout logger and exercise panel depend on
**Depends on**: Phase 1
**Requirements**: EXER-01, EXER-02, EXER-03
**Success Criteria** (what must be TRUE):
  1. User can browse a library of 100+ exercises, each showing its primary and secondary muscle targets
  2. User can search exercises by name and results update as they type
  3. User can navigate to any muscle group and view its warm-up guidance before training
**Plans:** 4/4 plans complete
Plans:
- [x] 03-01-PLAN.md — Infrastructure: warm-up data, Mongoose model, route group migration, bottom nav, filter function TDD, test scaffolds
- [x] 03-02-PLAN.md — Exercise library page with search, filter chips, muscle group sections, and two-level card expand
- [x] 03-03-PLAN.md — Mini muscle map highlights in exercise detail and warm-up bottom sheet
- [x] 03-04-PLAN.md — E2E test finalization and human verification checkpoint
**UI hint**: yes

### Phase 4: Workout Logger
**Goal**: Users can log freestyle workouts and follow pre-built plans entirely within the app, with all data persisted locally in IndexedDB so it survives page refreshes and works fully offline
**Depends on**: Phase 3
**Requirements**: WORK-01, WORK-02, WORK-03, WORK-04, WORK-05, WORK-06
**Success Criteria** (what must be TRUE):
  1. User can log a freestyle workout session by picking exercises, entering sets with reps and weight, and saving the session — completing all steps in under 3 taps per set
  2. User can start a configurable rest timer between sets and the timer runs correctly while the app is in the foreground
  3. User can view past workout sessions in reverse chronological order with exercise and set details visible
  4. User sees a visual callout highlighting a new personal record at the moment it is set during a session
  5. User can select a pre-built workout plan and step through it exercise by exercise with the app tracking their position in the plan
  6. User can close and reopen the app with all workout history intact and no data loss (offline-first confirmed)
**Plans:** 7/7 plans complete
Plans:
- [x] 04-01-PLAN.md — Foundation: Dexie v2 schema, extended Zustand store, PR detection, 4-tab nav, route stubs
- [x] 04-02-PLAN.md — Seed data: PPL, Arnold Split, and Upper/Lower Superset Egyptian gym splits
- [x] 04-03-PLAN.md — Workout logger UI: exercise picker sheet, set rows, rest timer widget, PR badges
- [x] 04-04-PLAN.md — History page: contribution graph heatmap, git-log timeline, expandable session detail
- [x] 04-05-PLAN.md — Plan runner: plan browser with recommendations, day picker, progress tracking
- [x] 04-06-PLAN.md — E2E tests, store tests, and human verification
- [x] 04-07-PLAN.md — Gap closure: fix PR badge snapshot logic so badge fires during active session
**UI hint**: yes

### Phase 5: Strain Engine + Heatmap
**Goal**: The muscle map heatmap is live — users can see each muscle's current strain/recovery state as a color gradient derived from their workout history, with a visible disclaimer that data is based on placeholder estimates
**Depends on**: Phase 4, Phase 2
**Requirements**: MAP-03, STRAIN-01, STRAIN-02, STRAIN-03
**Success Criteria** (what must be TRUE):
  1. User can see the muscle map heatmap with color overlay showing each muscle's strain level — muscles that were trained recently appear warmer/redder, rested muscles appear cooler/bluer
  2. User who logs a workout sees the heatmap update to reflect the newly trained muscles within the same session
  3. User who returns the next day sees strain levels partially recovered compared to the day before, reflecting the time-decay model
  4. User sees a non-intrusive disclaimer on the muscle map indicating strain data is based on placeholder estimates, not verified scientific data
**Plans:** 2/2 plans complete
Plans:
- [x] 05-01-PLAN.md — TDD strain engine: pure computeStrainMap function with exponential decay, volume normalization, and threshold bucketing
- [x] 05-02-PLAN.md — useStrainMap hook, heatmap SVG fill rendering, disclaimer text, and human verification
**UI hint**: yes

### Phase 6: Click-to-Muscle Panel
**Goal**: Users can tap any muscle on the map and immediately see exercises targeting it, warm-up guidance, and that muscle's current strain state in a slide-out panel — the core "aha moment" of the app
**Depends on**: Phase 5, Phase 3
**Requirements**: MAP-04, EXER-04, EXER-05
**Success Criteria** (what must be TRUE):
  1. User can tap any muscle on the front or back map view and a slide-out panel opens showing exercises that target that muscle
  2. User can see the current strain/recovery state for the tapped muscle displayed inside the reference panel
  3. User can see warm-up guidance specific to the tapped muscle group inside the panel
**Plans:** 2/2 plans complete
Plans:
- [x] 06-01-PLAN.md — Muscle panel components (MusclePanelDrawer, StrainStatusCard, PanelExerciseList, PanelWarmupSection) and home page integration
- [x] 06-02-PLAN.md — E2E tests for MAP-04/EXER-04/EXER-05 and human verification
**UI hint**: yes

### Phase 7: Ranking + Radar
**Goal**: Users can view their tier rank and radar chart body rating derived from their workout history, with a progress bar showing movement within their current tier and a celebration moment when they advance
**Depends on**: Phase 4
**Requirements**: RANK-01, RANK-02, RANK-03, RANK-04
**Success Criteria** (what must be TRUE):
  1. User can view their current tier rank (Iron through Elite) on a ranking screen that leads with recent activity, not the raw rank label
  2. User can see a radar chart showing their body rating across push, pull, legs, core, and conditioning axes derived from their workout history
  3. User can see a sub-tier progress bar showing how far they have progressed within their current tier toward the next one
  4. User experiences a celebration UI (animation or visual callout) at the moment they advance to a new tier
**Plans:** 1/3 plans executed
Plans:
- [x] 07-01-PLAN.md — TDD ranking engine: tier computation, sub-tier progress, radar axes, Dexie v3 schema, useRankingData hook
- [ ] 07-02-PLAN.md — Ranking page UI: radar chart SVG, tier badge, progress bar, celebration overlay, BottomNav integration
- [ ] 07-03-PLAN.md — E2E tests for RANK-01/RANK-02/RANK-03/RANK-04 and human verification
**UI hint**: yes

### Phase 8: Community FAQ + Bio Metrics
**Goal**: Users can browse culturally grounded Egyptian gym community FAQ content and optionally provide bio info that improves strain and ranking accuracy — with a confirmed smoke test showing all features work completely without any bio data entered
**Depends on**: Phase 7
**Requirements**: FAQ-01, FAQ-02, BIO-01, BIO-02, BIO-03
**Success Criteria** (what must be TRUE):
  1. User can browse FAQ content organized by Egyptian gym community topics (muscle pain, progress loss, common misconceptions, and similar)
  2. User can read individual FAQ articles written in a tone that reflects Egyptian fitness culture, not generic clinical language
  3. User can optionally fill in bio info (height, weight, age, gender, body fat percentage, measurements) and sees a visible accuracy improvement indicator in strain and ranking
  4. User who provides zero bio info can access every feature — workout logging, heatmap, exercise panel, ranking, radar chart, and FAQ — without any prompt or gate
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 5/5 | Complete   | 2026-03-22 |
| 2. Muscle Map SVG | 5/5 | Complete   | 2026-03-23 |
| 3. Exercise Library | 4/4 | Complete   | 2026-03-23 |
| 4. Workout Logger | 7/7 | Complete   | 2026-03-23 |
| 5. Strain Engine + Heatmap | 2/2 | Complete   | 2026-03-24 |
| 6. Click-to-Muscle Panel | 2/2 | Complete   | 2026-03-24 |
| 7. Ranking + Radar | 1/3 | In Progress|  |
| 8. Community FAQ + Bio Metrics | 0/TBD | Not started | - |
