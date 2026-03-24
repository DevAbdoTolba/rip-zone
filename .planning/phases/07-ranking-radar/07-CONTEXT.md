# Phase 7: Ranking + Radar - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the ranking system and radar chart body rating. Users visit a new /ranking tab to see their current tier (Iron → Elite), a 5-axis radar chart of their training balance, a sub-tier progress bar, and a celebration moment when they advance tiers. All data derived from workout history in Dexie — no new data entry required.

</domain>

<decisions>
## Implementation Decisions

### Ranking Screen Layout
- Radar chart is the hero element at top of page — visual first, tier badge below. Success criteria: "leads with recent activity, not the raw rank label"
- New /ranking tab in bottom nav — standalone feature with its own data density
- Last 7 days workout summary (sessions count + total volume) shown alongside rank for quick context
- Zero-workout empty state: radar outline with all axes at 0 + "Log your first workout to start ranking" CTA linking to /workout

### Ranking Algorithm
- Total volume (sum of reps × weight across all sessions) drives tier ranking — simple, universal, always increases
- Exponential tier thresholds: Iron: 0, Bronze: 5K, Silver: 25K, Gold: 100K, Platinum: 300K, Diamond: 750K, Elite: 1.5M kg total volume
- 5 radar axes calculated by summing volume per muscle group category, normalized 0-100 relative to tier's max
- Exercise-to-category mapping via primaryMuscles: chest+shoulders+triceps→Push, back+biceps→Pull, quads+hamstrings+glutes+calves→Legs, abs+obliques→Core, cardio+compound full-body→Conditioning

### Radar Chart Rendering
- Inline SVG with no chart library — 5 axes is simple geometry, avoids bundle bloat, matches existing SVG patterns
- Dark theme gradient fill: semi-transparent primary color fill, thin primary-color stroke, axis lines in muted-foreground, labels in foreground
- Static display only — no drill-down, keeps scope minimal
- 280px diameter on mobile, 320px on desktop

### Celebration UX
- Celebration triggers on first visit to /ranking after a workout crosses a tier threshold
- Full-screen overlay: tier badge, new tier name, CSS-only confetti animation, "Continue" button, 2-3 second auto-dismiss
- lastSeenTier stored in Dexie — compare with computed tier on /ranking mount; clear after celebration shown
- Shown once per tier-up, no replay

### Claude's Discretion
None — all questions answered by user.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TierRank` enum in `src/types/ranking.ts` — Iron through Elite, already defined
- `RankState` interface — tier, subTierProgress, lastUpdatedAt
- `WorkoutsDatabase` in `src/lib/db/workouts.ts` — sessions, exercisesInSession, sets tables
- Bottom nav component in `src/components/nav/BottomNav.tsx` — add /ranking tab
- Dark mode OKLCH color tokens already in globals.css
- Existing Drawer/bottom sheet patterns from @base-ui/react

### Established Patterns
- Zustand stores with dynamic Dexie imports for SSR safety
- Server Component pages passing data to client components as props
- `'use client'` for interactive components
- Inline SVG rendering (muscle map precedent)
- Dexie computed data at read time (D-11 decision) — no stored rankings

### Integration Points
- BottomNav needs new /ranking tab
- Dexie workouts DB provides all source data (sessions → exercises → sets)
- Exercise slugs map to muscles via exercises.json primaryMuscles field
- Muscle slugs map to categories via the push/pull/legs/core/conditioning mapping

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User accepted all recommended answers.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
