---
phase: 01-foundation
plan: 03
subsystem: data-layer
tags: [mongodb, mongoose, seed-data, hmr-guard, models]
dependency_graph:
  requires: [01-01]
  provides: [mongodb-connection, mongoose-models, seed-data, seed-script]
  affects: [all-server-side-data-access, phase-02-muscle-map, phase-03-exercises]
tech_stack:
  added: [dotenv@dev]
  patterns: [mongoose-hmr-guard, connection-singleton, insertMany-seed]
key_files:
  created:
    - src/lib/mongodb.ts
    - src/models/Muscle.ts
    - src/models/Exercise.ts
    - src/models/WorkoutPlan.ts
    - src/models/FaqEntry.ts
    - data/muscles.json
    - data/exercises.json
    - data/workout-plans.json
    - data/faq-entries.json
    - scripts/seed.ts
  modified:
    - package.json (added dotenv dev dependency)
decisions:
  - "Seed data placed at /data/ root (not src/lib/seed/data/) per plan spec — matches package.json seed script path"
  - "110 exercises created (plan minimum was 100+) to fully cover all major movement patterns"
  - "20 FAQ entries created (plan minimum was 15+) to cover all specified topic categories"
  - "scripts/seed.ts uses readFileSync+JSON.parse (not JSON imports) to avoid resolveJsonModule complications with tsx"
metrics:
  duration: 9 minutes
  completed: 2026-03-22
  tasks_completed: 2
  files_created: 10
  files_modified: 1
---

# Phase 01 Plan 03: MongoDB Data Layer Summary

MongoDB connection singleton with HMR guard, 4 Mongoose models with schema validation, and complete seed data (54 muscles, 110 exercises, 4 workout plans, 20 FAQ entries) with cross-validated slugs and a dotenv-powered CLI seed script.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | MongoDB connection singleton and Mongoose models | 33aca55 | src/lib/mongodb.ts, src/models/*.ts (4 files) |
| 2 | Seed data JSON files and CLI seed script | 3c27742 | data/*.json (4 files), scripts/seed.ts |

## What Was Built

### Task 1: MongoDB Connection Singleton and Mongoose Models

Created `src/lib/mongodb.ts` as an HMR-safe connection singleton that:
- Uses `global._mongooseCache` to survive Next.js hot module replacement
- Throws early if `MONGODB_URI` is not set
- Caches both the promise and the resolved connection to prevent duplicate connect calls

Created 4 Mongoose models, each using the HMR guard pattern (`mongoose.models.X ?? mongoose.model('X', Schema)`):
- `Muscle.ts`: slug/displayName/group/svgRegion with group enum matching `MuscleGroup` TypeScript union
- `Exercise.ts`: all exercise fields with equipment and difficulty enums matching TypeScript types
- `WorkoutPlan.ts`: plan fields with embedded `WorkoutPlanExercise` subdocuments (`_id: false`)
- `FaqEntry.ts`: FAQ fields with category enum for 6 community topic categories

All models use `InferSchemaType` for external type consumption, avoiding manual interface duplication.

### Task 2: Seed Data and CLI Script

**data/muscles.json** — 54 muscles across 9 groups:
- chest (3), back (9), shoulders (5), arms (8), forearms (4), core (6), legs (12), glutes (4), calves (3)
- Includes obscure muscles: brachialis, teres-minor, piriformis, coracobrachialis, popliteus, sartorius, etc.
- svgRegion = "muscle-" + slug, ready for Phase 2 SVG muscle map path IDs

**data/exercises.json** — 110 exercises covering all major movement patterns:
- Full coverage: chest (11), back (13), shoulders (9), arms (14), legs (18), core (10), glutes (6), calves (4), compound/full-body (6), additional back/legs/arms variations (19)
- All muscle slugs in primaryMuscles/secondaryMuscles cross-validated against muscles.json
- Equipment values: barbell, dumbbell, cable, machine, bodyweight, kettlebell, band, other
- Difficulty values: beginner, intermediate, advanced

**data/workout-plans.json** — 4 goal-based plans:
- Beginner Strength: 3 days/week, 17 exercise-day entries, compound focus
- Muscle Building: 4 days/week, 28 exercise-day entries, push/pull/legs/upper split
- Fat Loss: 4 days/week, 26 exercise-day entries, circuit style (30-60s rest)
- Athletic Performance: 4 days/week, 23 exercise-day entries, power + conditioning focus
- All exerciseSlug values cross-validated against exercises.json

**data/faq-entries.json** — 20 Egyptian gym community FAQ entries:
- Categories: muscle-pain (4), progress (3), misconceptions (4), nutrition-basics (3), training-form (3), recovery (3)
- Covers Ramadan fasting, Egyptian summer heat, local gym culture
- Direct, evidence-based tone with Egyptian cultural context

**scripts/seed.ts**:
- Loads `MONGODB_URI` via dotenv from `.env.local`
- Dynamic imports for Mongoose models (triggers side-effect registration)
- `deleteMany({})` + `insertMany()` for clean re-seeding
- Clean `process.exit(0)` on success

## Decisions Made

1. **Data directory at root** — Plan specified `data/muscles.json` (root-level), matching the `package.json` seed script path `npx tsx scripts/seed.ts`. The RESEARCH.md showed `src/lib/seed/data/` as one possibility but the plan frontmatter and task spec clearly say `data/` at root.

2. **110 exercises** — Created 10 more than the 100 minimum to ensure comprehensive movement pattern coverage without gaps.

3. **20 FAQ entries** — Created 20 (minimum 15) to cover all categories with adequate depth including Ramadan and Egyptian summer topics from the plan spec.

4. **dotenv installed as devDependency** — The seed script is a CLI tool that runs outside Next.js, so dotenv is needed to load `.env.local`. Installed as devDependency since it's only needed for the seed script, not the app runtime.

## Deviations from Plan

None — plan executed exactly as written. All acceptance criteria met. TypeScript compiles clean. Data cross-references validated.

## Known Stubs

None — all data is complete. The seed data files contain real exercise data, not placeholder values. The MongoDB connection singleton and models are fully functional. The seed script requires a `MONGODB_URI` in `.env.local` (MongoDB Atlas credentials) to actually run — this is a configuration dependency, not a code stub.

## Self-Check: PASSED

All 10 created files verified present on disk. Both task commits verified in git log:
- 33aca55: feat(01-03): create MongoDB connection singleton and Mongoose models
- 3c27742: feat(01-03): create seed data files and CLI seed script

TypeScript compiles clean. Data cross-references validated. All acceptance criteria met.
