# Phase 6: Click-to-Muscle Panel - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a slide-out muscle detail panel that opens when a user taps any muscle on the map. The panel shows exercises targeting that muscle, warm-up guidance, and the muscle's current strain/recovery state — the core "aha moment" connecting the muscle map, exercise library, and strain engine into a single interactive experience. Requirements: MAP-04, EXER-04, EXER-05.

</domain>

<decisions>
## Implementation Decisions

### Panel Layout & Appearance
- Right-side drawer on desktop (~380px wide), bottom sheet on mobile (~85vh height) — standard detail panel pattern, keeps map visible
- Map stays visible while panel is open — map shifts/shrinks to accommodate drawer on desktop, visible behind bottom sheet on mobile
- Semi-transparent backdrop on mobile only — mobile bottom sheet gets dimmed backdrop for focus; desktop drawer pushes content with no overlay

### Panel Content & Information Architecture
- Content order: Header (muscle name + strain badge) → Strain status card → Exercises list → Warm-up section — strain first gives instant "body status" answer, exercises below for action
- Exercises displayed as compact card list (name + equipment + difficulty badge), tap to expand details — reuses Phase 3 card pattern
- All primary exercises shown for the muscle, with secondary exercises in a collapsible "Also targets" section — primary exercises are the main value, secondary available but not cluttering
- Warm-up presented as inline collapsible section at bottom of panel — always accessible, reuses warmup data from Phase 3

### Interaction & Navigation
- Panel opens automatically on muscle tap — subscribes to `selectedMuscle` in useMapStore, opens when non-null
- Multiple close paths: X button, swipe down (mobile), click backdrop (mobile), tap same muscle again (deselect), or tap a different muscle (switches panel content)
- "View all exercises" link at bottom of exercises section, pre-filtered to `?muscle=slug` — leverages Phase 3 D-07 deep-linking
- Panel closes and muscle deselects on view toggle (front↔back) — switching views changes available muscles; keeping a stale panel is confusing

### Strain Display & Visual Feedback
- Strain level shown as colored badge with level text (e.g., "Heavy" in orange) + a mini strain bar (0-100% fill) — immediate visual read with precise info
- Reuse STRAIN_COLORS from strain-engine.ts — consistency with heatmap colors (blue→yellow→orange→red) so panel and map match
- Show "Rested" state explicitly with a muted "Rested" badge in slate color — clicking a rested muscle should still communicate its state
- Keep existing `data-selected` brighten effect (Phase 2 D-10) for selected muscle highlight on map while panel is open

### Claude's Discretion
- Exact drawer/sheet animation and transition timing
- Panel header design details (icon, typography sizing)
- Strain bar visual style (rounded vs angular, height)
- Exercise card expand/collapse animation approach
- Warm-up section collapsible trigger design
- Mobile swipe-to-close gesture threshold
- Responsive breakpoint for drawer vs bottom sheet switch

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useMapStore` (src/stores/useMapStore.ts) — `selectedMuscle` state already tracks which muscle is tapped; panel subscribes to this
- `useStrainMap()` hook (src/hooks/useStrainMap.ts) — returns `Map<MuscleSlug, StrainLevel>` for current strain state
- `STRAIN_COLORS` from `src/lib/strain-engine.ts` — color palette for strain levels
- `data/exercises.json` — 110 exercises with `primaryMuscles`/`secondaryMuscles` arrays for filtering
- `data/warmups.json` — warm-up movements per muscle group
- `data/muscles.json` — 55 muscles with `slug`, `displayName`, `group`, `svgRegion`
- Phase 3 exercise card pattern — compact cards with expand/collapse levels
- `src/lib/exercise-filter.ts` — existing filter logic for exercises

### Established Patterns
- Phase 2 D-10: Color brighten effect on hover/tap via `data-selected` attribute
- Phase 3 D-07: URL query param deep-linking (`?muscle=slug`, `?equipment=barbell`)
- Phase 3 D-08: Two-level inline expand on tap for exercise detail
- Phase 3 D-11: Warm-up accessed via bottom sheet per muscle group
- Phase 4: Drawer.Portal + Drawer.Backdrop + Drawer.Popup pattern for bottom sheets
- Dark mode only with OKLCH color tokens on `:root`
- Domain-based Zustand stores (useMapStore, useWorkoutStore)

### Integration Points
- `MuscleMapCanvas` dispatches `selectMuscle(slug)` on click — panel listens to this
- `src/app/(main)/page.tsx` — home page hosts the muscle map, panel attaches here
- Exercise library route `/exercises?muscle=slug` — "View all" link target
- `useStrainMap()` provides strain data for the currently selected muscle

</code_context>

<specifics>
## Specific Ideas

- This is the "aha moment" feature — the panel ties together the three major features (muscle map, exercise library, strain engine) into one seamless interaction
- Panel reuses existing exercise card patterns from Phase 3 to maintain visual consistency
- Strain badge + bar gives users immediate actionable info: "this muscle is Heavy, maybe train something else"
- Deep-link to exercise library (`?muscle=slug`) creates a natural bridge to the full exercise browsing experience

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
