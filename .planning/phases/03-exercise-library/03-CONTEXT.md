# Phase 3: Exercise Library - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Browseable, searchable exercise library with 100+ exercises and muscle group warm-up guidance. Users can browse by muscle group, search by name, filter by equipment/difficulty, view exercise details with a mini muscle map, and access warm-up guidance per muscle group. Requirements: EXER-01, EXER-02, EXER-03.

</domain>

<decisions>
## Implementation Decisions

### Library Layout & Browsing
- **D-01:** Exercises grouped by muscle group (Chest, Back, Shoulders, Arms, Forearms, Core, Legs, Glutes, Calves) with collapsible sections — matches how gym-goers think about training
- **D-02:** Card-based list items showing exercise name, equipment, difficulty, primary muscles, and a 1-line description excerpt. Fits ~3-4 cards on screen
- **D-03:** Equipment + difficulty filter chips alongside search — 8 equipment types and 3 difficulty levels from existing seed data
- **D-04:** Sticky search bar pinned at top of page with instant filter-as-you-type — muscle group sections collapse/expand to show matches, no submit button

### Navigation & Routing
- **D-05:** Dedicated `/exercises` page — separate route, not embedded in muscle map page
- **D-06:** Bottom navigation bar introduced in this phase with 2 tabs (Map, Exercises) — sets the pattern for Phase 4+ to add more tabs. Bottom nav on mobile, tab nav on desktop (per Phase 1 D-02)
- **D-07:** URL query param deep-linking supported — `?muscle=slug`, `?equipment=barbell`, `?q=bench`. Phase 6 click-to-muscle panel can link directly to filtered exercises

### Exercise Detail View
- **D-08:** Two-level inline expand on tap:
  - **Level 1 (first tap):** Essentials — name, description, primary muscles
  - **Level 2 ("More" button):** Full details — all form cues, secondary muscles, equipment, difficulty, PLUS a mini muscle map silhouette highlighting targeted muscles
- **D-09:** Mini muscle map reuses Normal mode SVG from Phase 2, rendered small. Primary muscles highlighted in bright neon accent color, secondary muscles in dimmer/muted version of same color — color intensity distinguishes primary vs secondary

### Warm-up Guidance
- **D-10:** Warm-up data structured per muscle group (9 groups) — new seed data file with 3-5 warm-up movements per group, each with name, brief instruction, and suggested duration/reps. Mix of dynamic stretches and light activation exercises
- **D-11:** Warm-up accessed via badge/link on each exercise card — tapping opens a bottom sheet/modal showing the warm-up guide for that exercise's primary muscle group
- **D-12:** New Mongoose model and seed data file needed for warm-up content (data/warmups.json)

### Data Loading
- **D-13:** Static generation (SSG) — exercise data pre-rendered at build time from MongoDB. 110 exercises is small enough for full static generation. Rebuild when seed data changes
- **D-14:** Search and filter handled client-side after initial static load — no network requests for browsing/filtering

### Empty & Loading States
- **D-15:** Easter egg empty state for no search results — funny GIF with a witty, friendly message and interactive "clear filters" button. Should fit the Egyptian gym community vibe and neon/dark aesthetic

### Claude's Discretion
- Exact card styling, spacing, and animation for expand/collapse transitions
- Filter chip visual design and placement relative to search bar
- Bottom navigation icon choices and active state styling
- Mini muscle map rendering size and placement within detail view
- Warm-up bottom sheet design and dismiss behavior
- Easter egg GIF selection and witty copy for empty state
- SSG revalidation strategy (if any)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Domain types and seed data
- `src/types/muscle.ts` — MuscleId, MuscleSlug, MuscleGroup, Muscle interface
- `src/models/Exercise.ts` — Mongoose Exercise model with slug, name, primaryMuscles, secondaryMuscles, equipment, difficulty, description, formCues
- `src/models/Muscle.ts` — Mongoose Muscle model with slug, displayName, group, svgRegion
- `data/exercises.json` — 110 exercises with full seed data (the source for SSG)
- `data/muscles.json` — 55 muscles with slug and svgRegion mapping

### SVG assets (for mini muscle map in detail view)
- `src/components/muscle-map/MuscleMapCanvas.tsx` — Existing SVG rendering with event delegation pattern
- `src/stores/useMapStore.ts` — Map state management (currentView, selectedMuscle, detailMode)

### UI patterns
- `src/components/ui/badge.tsx` — shadcn Badge component for muscle tags and filter chips
- `src/components/ui/button.tsx` — shadcn Button component
- `src/app/page.tsx` — Current home page with muscle map (will need bottom nav wrapper)

### Project context
- `.planning/REQUIREMENTS.md` — EXER-01, EXER-02, EXER-03 acceptance criteria
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Exercise` Mongoose model: Full schema with slug, name, primaryMuscles, secondaryMuscles, equipment (8 types), difficulty (3 levels), description, formCues
- `Muscle` Mongoose model: slug, displayName, group (9 groups), svgRegion
- `data/exercises.json`: 110 exercises ready for SSG consumption
- `data/muscles.json`: 55 muscles — group field provides the grouping key for the library
- shadcn/ui Badge and Button components for filter chips and CTAs
- Normal mode SVG files (front/back) for mini muscle map rendering in exercise detail

### Established Patterns
- Dark mode only with OKLCH color tokens on `:root` (Phase 1)
- Neon/electric palette: cyan, green, purple accents on dark background (Phase 1)
- SVGR turbopack rules for `.svg` → React component imports (Phase 2)
- Event delegation pattern for SVG interactions (Phase 2)
- Dynamic `await import()` for client-only modules to prevent SSR failures

### Integration Points
- `src/app/page.tsx` — needs wrapping with bottom nav layout (shared across all pages)
- `useMapStore` — Phase 6 will use the exercise library's muscle-filtering to link from muscle map clicks
- `data/exercises.json` — SSG reads this at build time; same file used by MongoDB seed script
- Normal mode SVG components — imported for mini muscle map in exercise detail view

</code_context>

<specifics>
## Specific Ideas

- Two-level expand is specifically for reducing cognitive load — newbie gym-goers see essentials first, anatomy enthusiasts can drill deeper with the muscle map visualization
- The mini muscle map in the detail "More" view bridges the exercise library back to the hero feature (muscle map), reinforcing the app's core identity
- Easter egg empty state should be culturally relevant to Egyptian gym community — funny, not clinical
- Deep-linking via query params is forward-looking for Phase 6 click-to-muscle panel integration
- Bottom nav introduced here with 2 tabs establishes the shell for the entire app navigation

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-exercise-library*
*Context gathered: 2026-03-23*
