# Phase 4: Workout Logger - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can log freestyle workouts and follow pre-built plans entirely within the app, with all data persisted locally in IndexedDB so it survives page refreshes and works fully offline. Includes rest timer, workout history with contribution graph, PR detection, and plan runner with progress tracking. Requirements: WORK-01, WORK-02, WORK-03, WORK-04, WORK-05, WORK-06.

</domain>

<decisions>
## Implementation Decisions

### Logging Flow
- **D-01:** Single-page logger — one scrollable page. "+Exercise" opens a picker, each exercise expands inline with set rows underneath. Running workout timer at the top. "Finish Workout" button at bottom
- **D-02:** Exercise picker is a bottom sheet with search bar + recent/frequent exercises at top, PLUS muscle group browse tabs within the same sheet. Combines fast search with discovery browsing
- **D-03:** Inline number inputs for reps and weight directly in the set row. Pre-fills from previous set values. Tap checkmark to confirm set. Achieves "under 3 taps per set" — if weight/reps unchanged, just tap confirm
- **D-04:** kg only for weight entry — no imperial units. Consistent with Egyptian gym community (metric) and existing `weightKg` field in Dexie schema

### Rest Timer UX
- **D-05:** Floating mini-widget — small floating timer bubble at bottom of screen. Visible while scrolling through exercises. Tap to expand for controls (pause, +15s, -15s, dismiss)
- **D-06:** Timer auto-fills from the exercise's `restSeconds` in seed data (or plan data). User can adjust with +/- 15s buttons. App remembers last-used duration per exercise for future sessions
- **D-07:** Sound + vibration alert when timer reaches zero. Short beep plus phone vibration. Uses Navigator.vibrate API + Audio API

### History & PR Display
- **D-08:** Git-log style timeline for workout history — compact one-liner per session showing date, workout label, exercise count, total sets, total volume. Tap to expand full session details with per-exercise breakdown
- **D-09:** GitHub-style contribution graph heatmap at top of history page — last 3 months of data. Color intensity driven by a metric (Claude's discretion to pick best one — volume, set count, or session count)
- **D-10:** Exercises in expanded history sessions can further expand to show exercise library card detail (description, primary/secondary muscles, form cues) — reuses Phase 3's two-level card expand pattern
- **D-11:** History lives as its own tab in bottom nav — 4 tabs total: Map, Exercises, History, Workout
- **D-12:** Inline PR badge with neon glow on the set row at the moment a PR is achieved during logging. Badge persists in the session view and in history
- **D-13:** PR defined as max weight at each rep count — track best weight at 1 rep, 3 reps, 5 reps, 8 reps, 10 reps, etc. "Best 5-rep bench" is distinct from "best 10-rep bench". Computed at read time per Phase 1 D-11

### Plan Runner
- **D-14:** Plan browser with day picker — dedicated plans section where user browses available plans, selects one, sees the day breakdown (Day 1: Push, Day 2: Pull...). Tap a day to start that workout with exercises pre-loaded into the single-page logger
- **D-15:** Full flexibility during plan workouts — plan pre-loads exercises and suggested sets/reps/rest, but user can add/remove exercises, change weights, add extra sets. Plan is a starting template, not a constraint
- **D-16:** Visual progress tracking across sessions — each day shows a checkmark when completed. User sees "3/4 days done this week". Progress persisted in Dexie
- **D-17:** Seed data should include popular Egyptian gym splits: Arnold split, PPL (Push/Pull/Legs), and superset-based programs alongside existing plans. Research and confirm the most popular splits in the Egyptian gym community
- **D-18:** Plan recommendation UI — when browsing plans, show "Recommended for you" highlight based on user's apparent level. Show a brief warning/explanation for plans above their likely level (e.g., "Arnold split requires 6 days/week — better suited for intermediate+ lifters"). Match on plan `difficulty` + `daysPerWeek`

### Claude's Discretion
- Contribution graph color intensity metric (volume, set count, or sessions)
- Floating timer widget exact design, positioning, and expand behavior
- Sound choice for timer completion alert
- Plan recommendation logic — how to determine user level without bio data (could use workout history volume/frequency)
- Which specific Egyptian gym splits to include in seed data (research popular programs)
- Exercise picker layout within the bottom sheet (tabs vs scrollable sections for muscle groups)
- Exact bottom nav icon choices for the 4 tabs
- Animation/transition for set confirmation and PR badge appearance

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Domain types and data schema
- `src/types/workout.ts` — WorkoutSession, ExerciseLog, SetLog, WorkoutPlan, WorkoutPlanExercise interfaces with branded IDs
- `src/lib/db/workouts.ts` — Dexie database with sessions, exercisesInSession, sets tables (the persistence layer)
- `src/stores/useWorkoutStore.ts` — Shell store with loadActiveSession/saveActiveSession (needs significant extension)
- `src/models/WorkoutPlan.ts` — Mongoose model for pre-built plans (reference data from MongoDB)

### Seed data
- `data/workout-plans.json` — 4 existing plans with exercises, sets, reps, restSeconds, dayLabel structure
- `data/exercises.json` — 110 exercises with slugs matching exerciseSlug references in plans

### Existing UI patterns
- `src/components/exercise-library/` — Exercise card two-level expand pattern (reuse in history detail)
- `src/components/bottom-nav/BottomNav.tsx` — Current 2-tab bottom nav (needs extension to 4 tabs)
- `src/app/(main)/layout.tsx` — Route group layout with bottom nav wrapper
- `src/lib/exercise-filter.ts` — Filter function for exercise search (reuse in exercise picker)

### Project context
- `.planning/REQUIREMENTS.md` — WORK-01 through WORK-06 acceptance criteria
- `.planning/ROADMAP.md` — Phase 4 goal and success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useWorkoutStore` (src/stores/useWorkoutStore.ts): Shell with `activeSession`, `loadActiveSession`, `saveActiveSession` — needs extension for full logging state (current exercise, timer, sets)
- `WorkoutsDatabase` (src/lib/db/workouts.ts): Dexie tables ready with sessions, exercisesInSession, sets — schema matches the types perfectly
- `exercise-filter.ts` (src/lib/exercise-filter.ts): Search + filter logic from exercise library — reuse in exercise picker sheet
- Exercise card components (src/components/exercise-library/): Two-level expand pattern — reuse for exercise detail in history view
- BottomNav (src/components/bottom-nav/BottomNav.tsx): Responsive bottom/tab nav — add 2 more tabs (History, Workout)
- Normal mode SVG files: Available for any mini muscle map needs in workout context

### Established Patterns
- Dark mode only with OKLCH neon/electric palette (Phase 1)
- Zustand stores with dynamic `await import()` for Dexie to prevent SSR failures (Phase 1 D-18/19)
- Manual sync between Zustand and Dexie — explicit read/write (Phase 1 D-19)
- Route group (main) for pages sharing bottom nav layout (Phase 3)
- @base-ui Dialog for bottom sheets (Phase 3 WarmupSheet pattern)
- SSG for reference data, client-side for user data (Phase 3 D-13/14)

### Integration Points
- `src/app/(main)/layout.tsx` — new workout and history routes must live in route group
- BottomNav needs 2 new tabs: History (/history) and Workout (/workout)
- Plan data comes from MongoDB via SSG (same pattern as exercises); user workout data goes to Dexie
- useWorkoutStore is the bridge for active workout state — downstream phases (5, 6) read from it
- Exercise picker needs read access to exercises (SSG-loaded or from exercise data already on client)

</code_context>

<specifics>
## Specific Ideas

- Git-log style history is the signature visual for this phase — compact one-liner timeline with expandable detail, inspired by `git log --oneline`
- GitHub contribution graph heatmap at the top of history — last 3 months, neon color intensity on dark background. Major motivational feature
- Exercises in history expand to show the same card detail from the exercise library — reinforces the exercise library as a reference throughout the app
- PR tracking per rep count (not just max weight) gives intermediate lifters meaningful progress signals across different rep ranges
- Plan content should reflect Egyptian gym culture — Arnold split, PPL, and superset-based programs are commonly followed. Include recommendation/warning based on training level
- Floating rest timer widget allows users to scroll through their workout and add exercises while the timer runs — no interruption to the logging flow

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-workout-logger*
*Context gathered: 2026-03-23*
