# Phase 1: Foundation - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Next.js project skeleton with the irreversible architectural decisions made correctly — TypeScript domain types, data storage split (MongoDB for reference data, Dexie for user data), seed data for all content, and Mongoose HMR protection — so every subsequent phase builds on a stable base.

</domain>

<decisions>
## Implementation Decisions

### Styling & UI Toolkit
- **D-01:** Use shadcn/ui as the component library (Tailwind CSS + Radix primitives)
- **D-02:** Responsive layout — bottom navigation on mobile, tab navigation on desktop
- **D-03:** Dark mode only — no light mode or theme toggle
- **D-04:** Neon/electric color palette — bright neon accents (cyan, green, purple) on dark background. Tech-meets-gym aesthetic
- **D-05:** Inter font family

### Seed Data Format
- **D-06:** Exercise seed data structure — Claude's discretion on file organization (flat vs split)
- **D-07:** Comprehensive muscle list (~50-60 muscles) including smaller/obscure ones (brachialis, serratus, teres minor, etc.). Each with slug, display name, group, and SVG region mapping
- **D-08:** Goal-based pre-built workout plans: Beginner Strength, Muscle Building, Fat Loss, Athletic Performance (3-5 programs)
- **D-09:** Full exercise content in seed data — each exercise includes name, slug, primary/secondary muscles, equipment, difficulty, brief description, and key form cues

### Dexie Schema Design
- **D-10:** Separate Dexie tables for sessions, exercises-in-session, and individual sets (relational model, not nested)
- **D-11:** Compute all derived data on the fly — strain, PRs, rankings, radar scores all computed from raw logs at read time. Never persist computed values
- **D-12:** Versioned bio metric entries — each update creates a timestamped record, enabling body composition tracking over time
- **D-13:** Full migration scripts for Dexie schema changes — preserve user data through all updates
- **D-14:** Split Dexie databases — separate databases for workouts vs profile/bio. Independent versioning

### TypeScript Type System
- **D-15:** Branded types for domain IDs (MuscleSlug, MuscleId, etc.) — compile-time safety preventing accidental string interchange
- **D-16:** TypeScript only for validation — no Zod. Trust data shape at runtime, rely on TS for compile-time safety
- **D-17:** TypeScript enums for TierRank, StrainLevel, and similar domain enumerations

### State Management
- **D-18:** Domain-based Zustand stores — separate stores per domain (useWorkoutStore, useMapStore, useRankStore, useProfileStore)
- **D-19:** Manual sync between Zustand and Dexie — explicit read/write functions, no auto-persist middleware

### MongoDB Collections
- **D-20:** One collection per domain — muscles, exercises, workoutPlans, faqEntries. Each with its own Mongoose model
- **D-21:** CLI seed script (`npm run seed`) for loading reference data. Run once on setup, re-run to refresh. No on-demand seeding at startup

### Claude's Discretion
- Exercise seed data file organization (flat JSON vs split by muscle group)
- Exact spacing, border radius, and component sizing for shadcn theme customization
- Zustand store internal structure and action naming
- MongoDB index strategy per collection
- Project folder structure (app/ vs src/ conventions)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and in:
- `.planning/REQUIREMENTS.md` — All v1 requirements with traceability to phases
- `.planning/PROJECT.md` — Core value, constraints, key decisions, out of scope
- `.planning/ROADMAP.md` — Phase 1 goal and success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No application code exists yet — this is a greenfield project

### Established Patterns
- No patterns established — Phase 1 defines them

### Integration Points
- @svgr/webpack configured for Phase 2 muscle map SVG import (pre-phase decision)
- MongoDB connection singleton with HMR protection needed for all server-side data access
- Dexie databases initialize client-side for all user data persistence

</code_context>

<specifics>
## Specific Ideas

- shadcn/ui chosen for "modern, fast, and looks cool" aesthetic
- Neon/electric palette to give the app a gaming-meets-fitness energy
- Bio metric versioning enables future progress charts (weight loss journey tracking)
- Separate Dexie tables for sets enables cross-session per-exercise queries (useful for PR detection and strain engine)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-22*
