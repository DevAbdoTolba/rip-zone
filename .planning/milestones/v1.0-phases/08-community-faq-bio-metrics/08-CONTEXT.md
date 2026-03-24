# Phase 8: Community FAQ + Bio Metrics - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver two standalone features: (1) a browseable FAQ page with culturally grounded Egyptian gym community content organized by category, and (2) an optional bio metrics profile that improves strain and ranking accuracy when provided. A confirmed smoke test must show all features work completely without any bio data entered.

</domain>

<decisions>
## Implementation Decisions

### FAQ Page Layout & Navigation
- New /faq tab in bottom nav with BookOpen icon — FAQ is a standalone feature per requirements
- Accordion card layout — category header with expandable Q&A items; compact, scannable, matches dark card aesthetic
- Horizontal scrollable filter chips at top — mirrors exercise library filter pattern (Phase 3); "All" default chip
- Tap question to expand answer inline below — no navigation away from the FAQ list

### Bio Metrics Form & UX
- Dedicated /profile page — accessible from settings/user icon; bio data is personal, separate from workout flow
- Single scrollable form with all 6 fields visible — no wizard overhead for ~6 optional fields (height, weight, age, gender, body fat %, measurements)
- Completion meter — circular progress ring showing "Accuracy: X%" that fills as more fields are completed; visible on ranking and strain pages
- Never auto-prompt — user discovers /profile naturally; BIO-03 demands zero gates, no nudges or banners

### Bio-Enhanced Strain & Ranking Integration
- Weight-based volume normalization for strain — divide raw volume by bodyweight so same exercise means different strain for different body sizes; falls back to raw volume when no weight provided
- Relative strength scoring for ranking — volume/bodyweight ratio as secondary signal shown alongside absolute tier; tier thresholds stay absolute (no disruption to existing ranking)
- Accuracy percentage based on filled fields — 6 fields, each adds ~15-17% accuracy; "Accuracy: X%" shown as small label near strain disclaimer and on ranking page
- Subtle "enhanced" badge — small pill next to strain/ranking values when bio data is present; no dramatic before/after comparison

### Claude's Discretion
None — all questions answered by user.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `data/faq-entries.json` — 20 FAQ entries across 6 categories (muscle-pain, progress, misconceptions, nutrition-basics, recovery, training-form) with Egyptian cultural tone already written
- `src/types/bio.ts` — `BioMetricEntry` interface with id, recordedAt, heightCm, weightKg, ageYears, gender, bodyFatPct
- `src/lib/db/profile.ts` — `ProfileDatabase` Dexie DB with bioMetrics and rankState tables
- `src/stores/useProfileStore.ts` — Zustand store with loadLatestBio/saveBio actions
- `src/lib/strain-engine.ts` — `computeStrainMap()` with NORMALIZE_DIVISOR constant to modify for bio-enhanced normalization
- `src/lib/ranking.ts` — `computeTierRank()`, `computeRadarAxes()` to extend with relative scoring
- `src/components/bottom-nav/BottomNav.tsx` — tabs array to add /faq and /profile entries
- Exercise library filter chips pattern in `src/components/exercise-library/` — reusable for FAQ category chips

### Established Patterns
- Zustand stores with dynamic Dexie imports for SSR safety
- Server Component pages passing JSON data to client components as props
- `'use client'` for interactive components
- Dark mode OKLCH color tokens in globals.css
- Bottom nav with mobile (fixed bottom) + desktop (horizontal top) variants
- Accordion/expand patterns from exercise card Level 0→1→2 disclosure

### Integration Points
- BottomNav needs /faq tab (and /profile access via icon or tab)
- strain-engine.ts needs optional bodyweight parameter for normalization
- ranking.ts needs optional bodyweight for relative strength display
- Ranking page needs accuracy meter and "enhanced" badge
- Map page strain disclaimer area needs accuracy indicator
- faq-entries.json read at build time as Server Component data source

</code_context>

<specifics>
## Specific Ideas

No specific requirements — user accepted all recommended approaches across all 3 grey areas.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
