---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [next.js, typescript, shadcn, tailwind, oklch, inter, mongoose, dexie, zustand, branded-types]

# Dependency graph
requires: []
provides:
  - Next.js 16 project with Turbopack, src/ structure, TypeScript, ESLint, Tailwind v4
  - shadcn/ui initialized with button and badge components
  - Dark neon OKLCH color token system (no .dark class variant)
  - Inter font loaded via next/font/google with --font-inter variable
  - Minimal placeholder page at /
  - mongoose, dexie, zustand runtime dependencies
  - vitest, tsx dev dependencies with seed/test scripts
  - .env.local.example with MONGODB_URI template
  - src/types/branded.ts — Brand<T,B> phantom type helper
  - src/types/muscle.ts — MuscleId, MuscleSlug, MuscleGroup, Muscle
  - src/types/workout.ts — WorkoutSession, ExerciseLog, SetLog, Exercise, WorkoutPlan + all branded IDs
  - src/types/ranking.ts — TierRank enum (Iron→Elite), RankState
  - src/types/strain.ts — StrainLevel enum (Rested→Strained)
  - src/types/bio.ts — BioMetricEntryId, BioMetricEntry
  - src/types/index.ts — barrel export with type/value separation
affects: [02-foundation, 03-foundation, 04-foundation, 05-foundation, all-phases]

# Tech tracking
tech-stack:
  added:
    - next@16.2.1 (Turbopack default, App Router)
    - react@19.2.4 / react-dom@19.2.4
    - typescript@5.x
    - tailwindcss@4.x (CSS-first config via @theme inline)
    - shadcn@4.1.0 (button, badge components)
    - tw-animate-css@1.4.0
    - mongoose@9.3.1
    - dexie@4.3.0
    - zustand@5.0.12
    - vitest@4.x
    - tsx@4.x
  patterns:
    - Branded phantom types for domain ID compile-time safety (Brand<T,B>)
    - TypeScript enums for domain enumerations (TierRank, StrainLevel)
    - OKLCH color tokens on :root — dark mode only, all values in :root (no .dark selector)
    - Inter font via next/font/google with CSS variable --font-inter
    - Barrel export at src/types/index.ts with type/value separation

key-files:
  created:
    - src/types/branded.ts
    - src/types/muscle.ts
    - src/types/workout.ts
    - src/types/ranking.ts
    - src/types/strain.ts
    - src/types/bio.ts
    - src/types/index.ts
    - .env.local.example
    - src/components/ui/badge.tsx
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx
    - next.config.ts
    - package.json
    - .gitignore
    - components.json

key-decisions:
  - "Dark mode only: all OKLCH color tokens on :root, no .dark class selector"
  - "Inter font loaded with 400/600 weights and --font-inter CSS variable"
  - "TierRank enum values are capitalized strings (Iron not iron) per plan spec"
  - "StrainLevel enum values are capitalized strings (Rested, Strained) per plan spec"
  - "next.config.ts left minimal — Turbopack is default in Next.js 16, no opt-in needed"

patterns-established:
  - "Brand<T,B extends string>: phantom brand on unique symbol, zero runtime cost"
  - "Enum exports use value export (export { TierRank }), interfaces use type export"
  - "All design tokens via OKLCH in :root, @theme inline maps to Tailwind utilities"

requirements-completed: []

# Metrics
duration: 6min
completed: 2026-03-22
---

# Phase 01 Plan 01: Foundation Bootstrap Summary

**Next.js 16 bootstrapped with dark neon OKLCH shadcn/ui theme, Inter font, and complete TypeScript domain type contracts (branded IDs, enums, interfaces) compiling cleanly**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-22T22:59:45Z
- **Completed:** 2026-03-22T23:05:59Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments

- Next.js 16 project bootstrapped with create-next-app (Turbopack default, TypeScript, Tailwind v4, App Router, src/ directory)
- Dark neon OKLCH theme configured in globals.css with all design tokens on :root (dark-only, no .dark selector)
- Inter font loaded via next/font/google at weights 400 and 600 with --font-inter CSS variable
- shadcn/ui initialized with button and badge components; tw-animate-css installed
- All 7 TypeScript domain type files created and compiling cleanly (npx tsc --noEmit exits 0)
- Branded types enforce compile-time safety for MuscleId, MuscleSlug, WorkoutSessionId, and 7 other domain IDs

## Task Commits

Each task was committed atomically:

1. **Task 1: Bootstrap Next.js 16 project** - `cca2e18` (feat)
2. **Task 2: Create TypeScript domain type contracts** - `c191f29` (feat)

## Files Created/Modified

- `src/app/globals.css` - Dark neon OKLCH theme tokens, all on :root, no .dark selector
- `src/app/layout.tsx` - Inter font (400/600), --font-inter variable, Rip Zone metadata
- `src/app/page.tsx` - Minimal placeholder with text-primary heading
- `next.config.ts` - Minimal config (Turbopack default in Next.js 16)
- `package.json` - Added mongoose, dexie, zustand deps; vitest, tsx devDeps; seed/test scripts
- `components.json` - shadcn configuration
- `.gitignore` - Updated to allow .env.local.example tracking
- `.env.local.example` - MONGODB_URI template
- `src/components/ui/button.tsx` - shadcn button (from initial commit)
- `src/components/ui/badge.tsx` - shadcn badge component
- `src/types/branded.ts` - Brand<T,B> phantom type helper
- `src/types/muscle.ts` - MuscleId, MuscleSlug, MuscleGroup, Muscle interface
- `src/types/workout.ts` - WorkoutSession, ExerciseLog, SetLog, Exercise, WorkoutPlan + IDs
- `src/types/ranking.ts` - TierRank enum (Iron/Bronze/Silver/Gold/Platinum/Diamond/Elite), RankState
- `src/types/strain.ts` - StrainLevel enum (Rested/Light/Moderate/Heavy/Strained)
- `src/types/bio.ts` - BioMetricEntryId, BioMetricEntry interface
- `src/types/index.ts` - Barrel re-export (type exports for interfaces, value exports for enums)

## Decisions Made

- Dark mode only: all OKLCH color tokens on `:root`, no `.dark` class selector, aligned with D-03 (dark mode only, no toggle)
- TierRank and StrainLevel enum values use capitalized strings (Iron, Rested) not lowercase (iron, rested) — plan specifies this explicitly and the research doc notes both patterns; plan spec takes precedence
- `next.config.ts` left minimal — RESEARCH.md confirms Turbopack is the default in Next.js 16, no `turbopack.rules` needed yet (SVGR pre-wiring is Plan 05)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `create-next-app` flagged `README.md` as conflicting file — moved temporarily to `/tmp` before running
- shadcn init selected `@base-ui/react` instead of `@radix-ui/react-slot` (newer shadcn v4 default) — this is expected behavior for shadcn 4.1.0 and does not affect functionality
- `.gitignore` pattern `.env*` blocked `.env.local.example` — added negation `!.env.local.example` (Rule 2: missing critical config template)

## User Setup Required

None for this plan. MongoDB is needed for Phase 1 Plan 3 (seed data). Set `MONGODB_URI` in `.env.local` before running `npm run seed`.

## Next Phase Readiness

- Next.js 16 project ready for Phase 1 Plans 2-5
- All domain types compile — Plans 2, 3 can import from src/types/index.ts immediately
- Design token foundation locked — Plans 4+ inherit dark neon theme automatically
- Placeholder page at / can be replaced by Plan 4 smoke-test page

---
*Phase: 01-foundation*
*Completed: 2026-03-22*
