---
phase: 06-click-to-muscle-panel
plan: 01
subsystem: ui
tags: [react, base-ui, drawer, zustand, strain-engine, muscle-panel]

# Dependency graph
requires:
  - phase: 05-strain-engine-heatmap
    provides: useStrainMap hook, STRAIN_COLORS palette, StrainLevel enum
  - phase: 02-muscle-map-svg
    provides: useMapStore with selectedMuscle and currentView state
  - phase: 03-exercise-library
    provides: exercises.json, muscles.json, warmups.json data files

provides:
  - MusclePanelDrawer component controlled by selectedMuscle from useMapStore
  - StrainStatusCard: colored badge + progress bar using STRAIN_COLORS
  - PanelExerciseList: primary/secondary exercise split with collapsible secondary
  - PanelWarmupSection: collapsible warm-up movements section
  - MusclePanelContent: composing all panel sections with correct content order
  - Home page wired to mount MusclePanelDrawer with exercises/muscles/warmups JSON props

affects: [07-bio-info, any-future-panel-modifications]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Drawer.Root controlled by Zustand selectedMuscle state (not local boolean)
    - Server Component passing static JSON as props to Client Component
    - Responsive panel: mobile bottom sheet + desktop right-side drawer via Tailwind md: breakpoint
    - useEffect watching currentView to auto-close stale panel on view toggle

key-files:
  created:
    - src/components/muscle-panel/MusclePanelDrawer.tsx
    - src/components/muscle-panel/MusclePanelContent.tsx
    - src/components/muscle-panel/StrainStatusCard.tsx
    - src/components/muscle-panel/PanelExerciseList.tsx
    - src/components/muscle-panel/PanelWarmupSection.tsx
  modified:
    - src/app/(main)/page.tsx

key-decisions:
  - "Server Component page.tsx passes JSON as serialized props to client MusclePanelDrawer — keeps data out of main bundle as separate chunk"
  - "modal={false} on Drawer.Root — muscle map stays interactive while panel is open on desktop"
  - "Rested badge uses muted/muted-foreground CSS tokens instead of STRAIN_COLORS (oklch near-black would not render visibly as tinted badge)"
  - "Exercise items use inline span badges instead of Badge component — keeps panel cards lightweight"

patterns-established:
  - "Panel Exercise Item: name + equipment/difficulty spans + ChevronRight/Down toggle (no MiniMuscleMap, no Level 2)"
  - "Collapsible section pattern: useState(false) + useEffect reset on key prop change + aria-expanded + animate-accordion-down"

requirements-completed: [MAP-04, EXER-04, EXER-05]

# Metrics
duration: 4min
completed: 2026-03-24
---

# Phase 06 Plan 01: Click-to-Muscle Panel Summary

**Slide-out muscle detail panel wiring useMapStore selectedMuscle to Drawer.Root, showing STRAIN_COLORS badge + bar, primary/secondary exercise split, and collapsible warm-up guide**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-24T08:46:11Z
- **Completed:** 2026-03-24T08:50:23Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Built all 5 muscle-panel components — the convergence feature connecting the map, exercises, and strain engine into one panel
- MusclePanelDrawer is controlled by `useMapStore.selectedMuscle` with responsive layout (mobile bottom sheet / desktop right-side drawer at 380px)
- StrainStatusCard renders strain level badge with 15% opacity background tint + progress bar using STRAIN_COLORS
- PanelExerciseList splits exercises into primary (always visible) and secondary ("Also targets" collapsible)
- PanelWarmupSection shows collapsible numbered warm-up movements from warmups.json
- Home page passes exercises/muscles/warmups as Server Component props — production build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Create all muscle panel components** - `56bca95` (feat)
2. **Task 2: Mount MusclePanelDrawer on home page with data props** - `058638c` (feat)

## Files Created/Modified
- `src/components/muscle-panel/MusclePanelDrawer.tsx` - Root drawer controlled by useMapStore.selectedMuscle, responsive mobile/desktop layout, view toggle close effect
- `src/components/muscle-panel/MusclePanelContent.tsx` - Scrollable inner content: header (Drawer.Title + Drawer.Close) + strain card + exercises + warmup
- `src/components/muscle-panel/StrainStatusCard.tsx` - Colored badge + progressbar using STRAIN_COLORS, Rested uses muted tokens
- `src/components/muscle-panel/PanelExerciseList.tsx` - Primary/secondary exercise split, collapsible secondary section, View all exercises link
- `src/components/muscle-panel/PanelWarmupSection.tsx` - Collapsible warm-up movements with numbered circles
- `src/app/(main)/page.tsx` - Added JSON data imports and MusclePanelDrawer mount

## Decisions Made
- Server Component page.tsx imports JSON and passes as props to client MusclePanelDrawer — aligns with Next.js Server/Client boundary best practice
- `modal={false}` on Drawer.Root so the muscle map remains interactive when panel is open on desktop
- Rested state badge uses `bg-muted text-muted-foreground` instead of the oklch STRAIN_COLORS value — prevents near-black tinted badge in dark mode

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Click-to-muscle panel is complete — the core "aha moment" convergence feature is live
- Phase 06 Plan 02 (if it exists) or Phase 07 can proceed
- No blockers

---
*Phase: 06-click-to-muscle-panel*
*Completed: 2026-03-24*

## Self-Check: PASSED

- FOUND: src/components/muscle-panel/MusclePanelDrawer.tsx
- FOUND: src/components/muscle-panel/MusclePanelContent.tsx
- FOUND: src/components/muscle-panel/StrainStatusCard.tsx
- FOUND: src/components/muscle-panel/PanelExerciseList.tsx
- FOUND: src/components/muscle-panel/PanelWarmupSection.tsx
- FOUND: src/app/(main)/page.tsx
- FOUND: .planning/phases/06-click-to-muscle-panel/06-01-SUMMARY.md
- Commit 56bca95 verified
- Commit 058638c verified
