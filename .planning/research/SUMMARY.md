# Project Research Summary

**Project:** Rip Zone
**Domain:** Fitness web app — interactive 2.5D muscle map, workout tracker, gamification, Egyptian community FAQ
**Researched:** 2026-03-22
**Confidence:** MEDIUM-HIGH (stack HIGH, features HIGH, architecture HIGH, muscle visualization MEDIUM)

## Executive Summary

Rip Zone is a local-first fitness tracking web app with a distinctive hero feature: a 2.5D illustrated muscle map that shows real-time strain and recovery state derived from logged workouts. The recommended architecture is a Next.js 16 App Router app using MongoDB exclusively for read-only reference data (exercises, FAQ, workout plans) while all user-generated data — workout logs, bio metrics, ranking state — lives in the browser via IndexedDB (Dexie.js) and Zustand with persist middleware. This split avoids auth infrastructure entirely for v1 while ensuring offline capability and instant data access. The muscle map drives every other feature: workout logging generates the strain data, the strain engine produces the heatmap, and the exercise reference panel (click-any-muscle) delivers the product's "aha moment."

No competitor combines strain tracking, recovery visualization, and exercise reference lookup in a single integrated flow. MuscleWiki has the body map but no tracking tie-in; Fitbod has recovery modeling but hides it inside an AI black box; MuscleSquad shows volume heatmaps but no recovery state. The Egyptian gym community FAQ is an untapped niche with zero direct competition. The Iron → Elite tier system is likewise unique in strength tracking apps — but requires careful UX framing to motivate beginners rather than demoralize them, which is a documented failure mode of ranking systems.

The primary technical risk is the muscle map SVG itself: the 2.5D illustrated style requirement means existing libraries (which use flat schematic SVGs) will not meet the visual bar. The SVG must be commissioned or built as a custom asset, with muscle path IDs matching the data model's slug convention from day one. Architectural decisions made in the muscle map foundation phase — layer separation for performance, hit-target decoupling for touch accessibility, raw-input storage for future dataset migration — cannot be economically retrofitted later. Get them right in Phase 1.

---

## Key Findings

### Recommended Stack

Next.js 16 (App Router, Turbopack, React 19.2) is constrained and current. MongoDB 8 with Mongoose 9.3 handles reference data; Zustand 5 + Dexie.js 4 handle all user data client-side. Tailwind CSS v4 (CSS-native config) and shadcn/ui CLI v4 cover UI. The key non-obvious call: use `@svgr/webpack` to import the custom muscle map SVG as a React component so inline path manipulation works, and guard all Dexie/IndexedDB calls with `typeof window !== 'undefined'` to prevent SSR failures.

**Core technologies:**
- Next.js 16.2: App Router + Turbopack; the only sane framework choice for this stack
- MongoDB 8 + Mongoose 9.3: reference data only (exercises, muscles, FAQ, plans) — never user data
- Zustand 5 + Dexie.js 4: all user data stays local; Zustand for session state, Dexie for persistent history
- Tailwind CSS v4 + shadcn/ui: UI layer; tier color system maps cleanly to CSS custom properties
- Recharts 3.8: radar chart for body rating; shadcn chart wrappers keep visual consistency
- @svgr/webpack 8: SVG-as-React-component; required for per-path color manipulation on the muscle map
- react-muscle-highlighter: reference only — do not ship as-is; use for slug conventions and intensity color logic

**Critical version note:** Next.js 16 requires Node.js 20.9+. Turbopack's SVG handling differs from Webpack — test `@svgr/webpack` in Turbopack dev mode early and fall back to webpack build if needed.

**Do not use:** Three.js/WebGL (ruled out by design decision), Framer Motion (React 19 View Transitions covers it), NextAuth (auth is v2+), MUI/Chakra (conflicts with Tailwind), Chart.js (shadcn uses Recharts), localStorage for workout history (5MB limit).

See `.planning/research/STACK.md` for full alternatives matrix and installation commands.

### Expected Features

The feature landscape is clear. The exercise library and workout logger are foundational dependencies — at least 4 other features cannot be built without them. The muscle heatmap is the hero differentiator and must ship at v1. The Egyptian FAQ is fully independent and can be built in parallel at any phase.

**Must have (table stakes) — v1:**
- Exercise logging (sets/reps/weight) — the atomic unit; must be under 3 taps per set
- Exercise library with muscle tags (100+ exercises) — foundational dependency for everything else
- Rest timer with configurable duration — users switch apps without this
- Workout history + PR detection — proves the app is tracking progress
- Pre-built starter plans (3–5 programs) — reduces beginner bounce
- Offline functionality — gyms have spotty WiFi; local-first covers this automatically
- Clear primary/secondary muscle targeting per exercise — ties into the muscle map

**Should have (differentiators) — v1:**
- 2.5D illustrated muscle map with strain/recovery heatmap — the hero feature; no competitor offers this combination
- Per-muscle strain + recovery state (placeholder dataset) — makes the heatmap meaningful
- Click-any-muscle exercise reference panel — delivers the "aha moment"; removes context switching
- Warm-up guidance per muscle — targets a beginner pain point no competitor addresses
- Iron → Elite tier ranking system — unique in strength tracking; motivates return visits
- Egyptian gym community FAQ — cultural differentiation; zero direct competition

**Should have — v1.x (post-validation):**
- Radar chart body rating (push/pull/legs/core/conditioning)
- Bio-info collection with accuracy reward (never gates features)
- Progress charts per exercise
- Expanded exercise library (200+)

**Defer (v2+):**
- Real scientific strain/recovery dataset — requires dedicated research; unblocks AI recommendations
- AI-adaptive workout recommendations — requires real dataset + user history depth
- User accounts + cross-device sync — validate retention before infrastructure investment
- Social features, wearable integration, nutrition tracking — deliberate out-of-scope decisions

See `.planning/research/FEATURES.md` for the full competitor matrix and feature dependency graph.

### Architecture Approach

The architecture is cleanly split: MongoDB is a read-only content database seeded once from JSON (exercises, muscles, FAQ, workout plans); all user data flows exclusively through Zustand + Dexie on the client. There is no server-side user state in v1. Derived state (muscle strain percentages, ranking tier, radar axes) is never persisted — it is computed on demand from raw workout logs by pure TypeScript engine functions in `lib/`, then cached in non-persisted Zustand slices. This means the strain formula can be improved later without corrupting stored data.

**Major components:**
1. MuscleMapViewer — SVG body viewer; reads strain state from muscleStrainStore, applies heatmap colors to named paths
2. MuscleStrainEngine — pure function: `WorkoutLog[] → Record<MuscleSlug, 0-100>`; called on every log write
3. WorkoutLogger — freestyle session entry: exercise picker, set/rep/weight rows, rest timer; writes to workoutStore
4. RankingEngine — pure function: `(logs, bio?) → { axes: RadarAxes, tier: RankTier }`; uses Epley 1RM formula
5. FAQBrowser — server-rendered static content; fully independent of user data
6. BioCollector — optional form; never gates features; plugs into ranking + strain engines for improved accuracy

**Key patterns:**
- Derived state from raw inputs (never store computed strain snapshots)
- Static reference data via MongoDB + API routes (or direct Server Component JSON import for v1 simplicity)
- localStorage-first via Zustand persist for tiny preferences; Dexie for all structured history
- SVG path IDs as the contract between the illustration asset and the data model

See `.planning/research/ARCHITECTURE.md` for the full data flow diagrams and MongoDB/localStorage schemas.

### Critical Pitfalls

1. **SVG re-renders on every state change** — Wiring heatmap colors as React state on a parent shared with the rest timer causes 500ms+ freezes on mobile. Prevention: two-layer SVG (static illustration + thin interactive overlay), React.memo on muscle paths, isolated component subtrees for timer and map. This is a full rewrite if retrofitted — decide the architecture in Phase 1.

2. **localStorage quota exceeded silently** — `setItem()` throws `QuotaExceededError` when 5MB is hit; if uncaught, workout saves fail with no user feedback. Prevention: use Dexie.js (IndexedDB) from day one for all structured history; reserve localStorage only for preference flags. Migrating mid-build is a full data-access rewrite.

3. **Touch targets too small for small muscle groups** — Brachialis, serratus anterior, and similar small muscles render as <10px paths on mobile. Prevention: invisible overlay paths with expanded hit areas; tap disambiguation popover for muscle clusters (shoulder, rotator cuff, forearm). Must be part of initial SVG architecture, not added later.

4. **Placeholder strain data presented as authoritative** — Users interpret estimates as science. When the real dataset ships, heatmap history changes and users are confused. Prevention: `confidence: "placeholder"` field in schema; non-intrusive disclaimer on the map; store raw inputs (sets/reps/weight), not derived percentages, so history can be retroactively recalculated.

5. **Ranking system demoralizes beginners** — Showing a new user they are at "Iron" with Elite far away causes early abandonment. Prevention: frame tiers as personal milestones not competitive positions; make Iron → Bronze reachable in 2-3 weeks; show progress within Iron tier on a sub-bar; lead with "your recent activity," not your rank. Test with first-time gym users, not experienced lifters.

6. **Mongoose connection multiplication under Next.js HMR** — Dev saves trigger re-imports; each creates a new `mongoose.connect()` call exhausting Atlas free-tier connections. Prevention: globalThis connection caching in `lib/mongodb.ts` on day one, before writing any API routes.

See `.planning/research/PITFALLS.md` for recovery cost estimates and the "Looks Done But Isn't" verification checklist.

---

## Implications for Roadmap

Based on the dependency graph from FEATURES.md and the build-order recommendation from ARCHITECTURE.md, the phases should follow a strict bottom-up dependency order. The exercise library and muscle map foundation must be resolved before the interactive features that depend on them.

### Phase 1: Project Foundation + Data Layer
**Rationale:** Nothing else can work without TypeScript types, MongoDB connection, and seed data. The Mongoose HMR pitfall (Pitfall 6) must be solved here — retrofitting it later requires auditing every API route already written.
**Delivers:** Next.js 16 project scaffolded; TypeScript domain types defined (`MuscleId`, `WorkoutSession`, `TierRank`, `StrainLevel`); MongoDB connection singleton with globalThis caching; seed data JSON for muscles, exercises, workout plans, FAQ; Dexie schema initialized; `lib/mongodb.ts` verified against HMR connection accumulation.
**Addresses:** Exercise library data structure (foundational dependency for all features)
**Avoids:** Mongoose HMR connection accumulation (Pitfall 6); localStorage-for-workout-history mistake (Pitfall 2)
**Research flag:** Standard patterns — skip `/gsd:research-phase`. Well-documented Next.js + Mongoose setup.

### Phase 2: Static Muscle Map + SVG Architecture
**Rationale:** The SVG path ID contract must be established before any interactive feature is built on top of it. Layer separation for performance and invisible hit-target overlays must be part of the initial structure — not retrofitted. This is the highest-risk architectural decision in the project.
**Delivers:** Custom 2.5D illustrated SVG with all major muscle groups (front + back views); each muscle path has a slug-based ID (`muscle-biceps-left`); two-layer architecture (static illustration + interactive overlay); front/back toggle with state preserved; SVGR configuration verified in Turbopack dev mode.
**Addresses:** Muscle map visual foundation; SVG-to-slug mapping contract
**Avoids:** SVG re-render performance (Pitfall 1); touch targets too small (Pitfall 3); SVG-as-img blocking (integration gotcha)
**Research flag:** Needs `/gsd:research-phase` — SVG sourcing strategy (commission vs procure vs build) and SVGR + Turbopack compatibility need confirmation before committing to an approach.

### Phase 3: Workout Logger + Storage Layer
**Rationale:** The workout log is the single source of truth for every downstream feature — heatmap, ranking, radar chart. It must exist before any of those can be built. The storage architecture (Dexie schema, Zustand workout store) must be decided here; it cannot be changed cheaply once the heatmap and ranking phases build on top of it.
**Delivers:** Freestyle workout logging (exercise picker, set/rep/weight input, rest timer); Zustand workoutStore with Dexie persistence; PR detection on log write; workout history view; WorkoutPlanRunner (step-by-step plan execution writing to the same store).
**Addresses:** Exercise logging, rest timer, workout history, PR detection, pre-built plans (all table stakes)
**Avoids:** localStorage quota exhaustion (Pitfall 2); rest timer re-render causing heatmap jank (Pitfall 1 — timer must be isolated from muscle map state from the start)
**Research flag:** Standard patterns — skip `/gsd:research-phase`. Zustand + Dexie integration is well-documented.

### Phase 4: Muscle Strain Engine + Heatmap Overlay
**Rationale:** This is the hero feature. It requires both the SVG map (Phase 2) and the workout log (Phase 3). The strain engine must store raw inputs — not derived percentages — to allow retroactive recalculation when the placeholder dataset is replaced.
**Delivers:** `lib/muscle-strain-engine.ts` pure function (workout logs → per-muscle fatigue 0–100 with time decay); heatmap color overlay applied to SVG paths; rested/warmed/trained/fatigued/overworked color scale (blue to red — not red-only); placeholder data disclaimer visible on map; `confidence: "placeholder"` field in schema.
**Addresses:** 2.5D muscle heatmap with strain/recovery state (hero differentiator)
**Avoids:** Placeholder data presented as authoritative (Pitfall 4); heatmap-only-red color UX pitfall; derived state stored as source of truth (Architecture Anti-Pattern 1)
**Research flag:** Standard patterns for engine logic. Placeholder dataset content may need research-phase review to ensure exercise-to-muscle mappings are reasonably accurate even as estimates.

### Phase 5: Click-to-Muscle Exercise Reference Panel
**Rationale:** Builds directly on the clickable SVG paths (Phase 2) and the exercise data (Phase 1). This is the "aha moment" feature — the integration that no competitor offers. Requires the MuscleDetail panel, API route for `/api/exercises/[muscleSlug]`, and warm-up guidance content.
**Delivers:** MuscleDetail slide-out panel on muscle tap; exercises targeting that muscle with warm-up guidance; current strain state shown in panel; tap disambiguation UI for small/clustered muscles.
**Addresses:** Click-any-muscle exercise reference; warm-up guidance per muscle (both differentiators)
**Avoids:** Touch target failures for small muscles (Pitfall 3 — disambiguation UI built here)
**Research flag:** Standard patterns — skip `/gsd:research-phase`.

### Phase 6: Tier Ranking System + Radar Chart
**Rationale:** Requires an accumulated workout log (Phase 3). The tier formula and the UX framing must be co-designed in the same phase — a correct formula with poor framing demoralizes beginners just as badly as a wrong formula.
**Delivers:** `lib/ranking-engine.ts` pure function using Epley 1RM formula; Iron → Bronze → Silver → Gold → Platinum → Diamond → Elite tiers; TierBadge component with tier-advance celebration; RadarChart showing push/pull/legs/core/conditioning axes; ranking screen leading with recent progress, not absolute rank; sub-tier progress bar showing movement within a tier.
**Addresses:** Tier ranking system; radar chart body rating (both differentiators)
**Avoids:** Ranking demoralizes beginners (Pitfall 5); ranking formula tightly coupled to UI (Architecture Anti-Pattern 5)
**Research flag:** UX framing for beginner motivation warrants a short research-phase review — existing gamification literature on tier systems and motivation is relevant (PITFALLS.md cites specific sources).

### Phase 7: Egyptian Community FAQ
**Rationale:** Fully independent of all other features. Can be built any time after Phase 1 (data layer). Scheduled here as the polish/content phase after the interactive core is complete — FAQ content is static and low-risk.
**Delivers:** FAQ content seeded into MongoDB; categorized FAQ browser (server-rendered for SEO); individual FAQ articles with Egyptian gym community context; Arabic-friendly content flags; no Arabic UI strings (English only, culturally grounded tone).
**Addresses:** Egyptian gym community FAQ (cultural differentiator)
**Avoids:** Generic clinical language missing the target community's voice (UX Pitfall in PITFALLS.md)
**Research flag:** Content quality (not technical) needs validation — Egyptian gym community FAQ topics should be reviewed by someone familiar with the community before final seeding.

### Phase 8: Bio Metrics + Accuracy Reward
**Rationale:** Enhancement layer that improves strain and ranking accuracy but gates nothing. Built last to ensure the zero-bio-info path is thoroughly tested through all prior phases.
**Delivers:** BioCollector optional form (height/weight/age/gender/body fat); bioStore with Dexie persistence; ranking engine reads bio for bodyweight normalization; body composition axis unlocked in radar chart; accuracy reward UI (shows improvement when bio fields are filled); full smoke test: all features work with zero bio-info.
**Addresses:** Bio-info accuracy reward (differentiator)
**Avoids:** Bio-info gating features (Architecture constraint and FEATURES.md design decision); bio form upfront before user sees value (UX Pitfall in PITFALLS.md)
**Research flag:** Standard patterns — skip `/gsd:research-phase`.

### Phase Ordering Rationale

- Phases 1-2 establish the two irreversible contracts (data types + SVG path IDs) that all other phases depend on
- Phase 3 builds the data source (workout log) that drives Phases 4, 5, and 6
- Phases 4 and 5 can overlap if parallel workstreams are available (strain engine and exercise panel share the SVG but write to different systems)
- Phase 6 is isolated enough to run in parallel with Phase 5 once Phase 3 is complete
- Phase 7 is always independent and can be run as a parallel workstream from Phase 3 onward
- Phase 8 is deliberately last: it enhances everything but must not accidentally gate anything — complete the core first, then layer bio on top

### Research Flags

Phases likely needing `/gsd:research-phase` during planning:
- **Phase 2 (SVG Architecture):** SVG sourcing strategy needs a decision (commission vs asset marketplace vs build from scratch) and SVGR + Turbopack compatibility should be verified with a spike before committing
- **Phase 6 (Ranking UX):** Gamification framing for beginner motivation — specific sub-tier progress mechanics and tier-advance celebration patterns — benefits from reviewing existing research

Phases with standard patterns (skip `/gsd:research-phase`):
- **Phase 1:** Standard Next.js + Mongoose + Dexie setup; well-documented
- **Phase 3:** Zustand + Dexie persistence is covered by official docs
- **Phase 5:** API route + slide-out panel pattern; no novel integration
- **Phase 7:** Static content + server-rendered pages; straightforward
- **Phase 8:** Optional form + store enhancement; no novel patterns

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core technologies (Next.js 16, Mongoose 9, Zustand 5, Tailwind v4, shadcn CLI v4, Recharts 3, Dexie 4) all verified against official sources and current npm versions. Version compatibility matrix confirms no conflicts. One medium-confidence item: react-muscle-highlighter has only 1 commit and unclear maintenance status — treat as reference only, not a production dependency. |
| Features | HIGH | Competitor analysis across MuscleWiki, Hevy, Fitbod, MuscleSquad, JEFIT is thorough and current. Feature dependency graph is internally consistent. Table stakes list is validated against 2026 fitness app surveys. Anti-feature decisions (no auth, no social, no nutrition, no 3D WebGL) are well-reasoned. |
| Architecture | HIGH | SVG/React patterns, Zustand persist, Next.js App Router structure, MongoDB schema, and localStorage schema are all based on official documentation and well-established community patterns. Derived-state-from-raw-inputs pattern is the correct architectural call and is well-supported by the research. |
| Pitfalls | HIGH (technical), MEDIUM (gamification) | SVG performance, localStorage limits, Mongoose HMR, and touch target pitfalls are all verified against specific technical sources. Gamification demotivation pitfall is supported by academic and UX research but the optimal tier formula requires user testing to validate. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **SVG asset sourcing:** The 2.5D illustrated muscle map does not exist yet. The project cannot proceed past Phase 2 without resolving: commission a designer, purchase from an asset marketplace, or build from a reference illustration. This is a design + budget decision, not a technical one, but it is the single most likely schedule blocker. Needs an owner and a decision in Phase 1 or at project kickoff.
- **Placeholder strain dataset accuracy:** The exercise-to-muscle mappings and recovery times in the placeholder dataset are estimates. They will be visible to users. Someone with exercise science knowledge should review the seed data before shipping, even for v1.
- **Turbopack + SVGR compatibility:** The STACK.md notes that Turbopack has its own SVG handling and may conflict with `@svgr/webpack`. A 30-minute spike in Phase 1/2 to verify this works (or to confirm the fallback to `--webpack` build is acceptable) prevents a surprise late in Phase 2.
- **Epley 1RM formula calibration:** The ranking engine uses the Epley formula for 1RM estimation. The tier threshold table (what volume/weight score maps to Iron vs Bronze vs Silver etc.) must be calibrated against real-world population data to ensure tiers feel achievable — this is not something research can pre-answer, it requires iteration with user testing.

---

## Sources

### Primary (HIGH confidence)
- Next.js 16 release blog (nextjs.org/blog/next-16) — framework version, Turbopack default, React 19.2 bundled
- Mongoose docs (mongoosejs.com/docs/nextjs.html) — HMR connection pattern, `serverExternalPackages` config
- Zustand v5 announcement (pmnd.rs) — React 18+ requirement, persist middleware behavior
- Tailwind CSS v4 (tailwindcss.com/blog/tailwindcss-v4) — CSS-native config, v4.2 current
- shadcn/ui changelog (ui.shadcn.com/docs/changelog) — CLI v4, Tailwind v4 support
- MongoDB Developer (mongodb.com/developer) — globalThis connection caching pattern for Next.js
- Recharts npm — version 3.8.0 confirmed current
- Dexie.js 4.x — browser compatibility matrix (Chrome 111+, Firefox 111+, Safari 16.4+)
- MDN Storage API — IndexedDB quota limits and eviction criteria

### Secondary (MEDIUM confidence)
- react-muscle-highlighter GitHub — 23 muscles, intensity prop, front/back views (1 commit, unclear maintenance)
- MuscleWiki, Hevy, Fitbod, MuscleSquad — competitor feature analysis
- Best Weightlifting Apps 2026 survey (jefit.com) — table stakes feature baseline
- Yu-kai Chou gamification analysis — tier/ranking motivation patterns
- Fitness app demotivation study (UPI Health, 2025) — ranking system beginner abandonment
- SVG hit testing performance (dschulze.com, pganalyze.com) — layer separation pattern
- Smashing Magazine — accessible touch target sizes (WCAG 44x44px requirement)
- Fitbod muscle recovery algorithm (fitbod.me/blog) — recovery time placeholder calibration reference

### Tertiary (LOW confidence)
- Dexie vs localStorage for fitness apps (multiple community sources agree on IndexedDB superiority — well-established but some sources are old)
- Egyptian gym community FAQ topic coverage — inferred from community descriptions, not direct surveying of Egyptian gym forums

---
*Research completed: 2026-03-22*
*Ready for roadmap: yes*
