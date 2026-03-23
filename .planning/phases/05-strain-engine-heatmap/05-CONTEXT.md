# Phase 5: Strain Engine + Heatmap - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a live muscle map heatmap that shows per-muscle strain/recovery state as a color gradient, computed from the user's workout history in IndexedDB. Includes a visible disclaimer that strain data uses placeholder estimates. This phase connects Phase 2 (SVG muscle map) with Phase 4 (workout logs) into a single visual experience.

</domain>

<decisions>
## Implementation Decisions

### Strain Calculation Model
- Volume-weighted strain accumulation: sets x reps x weight determines how much strain a muscle receives from a workout
- Exponential decay with ~72hr half-life: muscle recovers ~50% in 3 days, ~75% in 6 days
- Primary muscles receive 100% strain from an exercise, secondary muscles receive 40%
- Strain caps at 100% with diminishing returns above threshold — prevents unrealistic values from marathon sessions, maps cleanly to 5 StrainLevel enum buckets

### Heatmap Color Palette & Rendering
- Cool blue (#3b82f6) → warm red (#ef4444) gradient for rested → strained. Classic heat map convention, pops on dark background
- Discrete 5-level buckets matching existing StrainLevel enum: Rested=slate/gray (default), Light=blue, Moderate=yellow, Heavy=orange, Strained=red
- CSS custom properties on SVG container — muscle paths use `var(--strain-{slug})` style fills, leveraging existing SVGR + globals.css pattern from Phase 2
- Rested muscles stay default gray/slate fill (Phase 2 D-08) — only muscles with recent activity get color overlay

### Disclaimer & Data Flow
- Small muted text below muscle map: "Strain data based on placeholder estimates" — always visible, non-intrusive, no dismiss needed
- Strain engine lives as pure utility lib `src/lib/strain-engine.ts` — takes workout history + current time, returns Map<MuscleSlug, StrainLevel>. Per Phase 1 D-11, never persisted
- `useStrainMap()` hook reads Dexie workout data and calls strain engine. Recalculates on page mount + after workout session ends (useMemo with session count dependency). No polling
- Heatmap applies to all 3 detail modes (normal, advanced, anatomy) — color fills work the same regardless of SVG path granularity

### Claude's Discretion
- Exact diminishing returns curve shape for strain cap
- StrainLevel threshold boundaries (e.g., Light=20%, Moderate=40%, Heavy=60%, Strained=80%)
- How CSS custom properties are set (useEffect on container div vs style tag injection)
- Exercise volume normalization approach (absolute weight vs relative to exercise type)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types/strain.ts` — StrainLevel enum (Rested, Light, Moderate, Heavy, Strained) already defined
- `src/components/muscle-map/MuscleMapCanvas.tsx` — SVGR-based muscle map with 6 SVG files, event delegation, detail mode switching
- `src/lib/db/workouts.ts` — Dexie database with sessions, exercisesInSession, sets tables
- `src/stores/useWorkoutStore.ts` — Zustand store with workout state, session management
- `src/stores/useMapStore.ts` — Map state (currentView, detailMode, selectedMuscle, zoomRegion)
- `data/muscles.json` — ~50 muscles with slug, displayName, group, svgRegion mapping
- `data/exercises.json` — 110 exercises with primaryMuscles/secondaryMuscles arrays

### Established Patterns
- Phase 2 D-08: Muted gray/slate base fill for muscles in default state — CSS scoped under `[data-view]`
- Phase 1 D-11: All derived data computed on the fly from raw logs — never persisted
- Phase 1 D-18: Domain-based Zustand stores (useWorkoutStore, useMapStore, etc.)
- Phase 2: CSS muscle selectors scoped under `[data-view]` ancestor in globals.css
- Phase 3 MiniMuscleMap: Uses style.fill inline overrides for highlighting

### Integration Points
- MuscleMapCanvas needs strain colors applied to SVG path fills
- Workout session completion should trigger strain recalculation
- Map page (`src/app/(main)/page.tsx`) hosts the muscle map — disclaimer goes here
- Exercise data `primaryMuscles`/`secondaryMuscles` arrays link exercises to muscle slugs

</code_context>

<specifics>
## Specific Ideas

No specific requirements — user accepted all recommended approaches. Standard heat map convention with existing codebase patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
