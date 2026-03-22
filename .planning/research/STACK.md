# Stack Research

**Domain:** Fitness web app — interactive muscle map, workout tracking, gamification
**Researched:** 2026-03-22
**Confidence:** MEDIUM-HIGH (core stack HIGH; muscle visualization MEDIUM due to library maturity gaps)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2 | App framework | Non-negotiable per constraints. v16 is current stable (Oct 2025), Turbopack default, React 19.2, stable React Compiler. App Router is the only sane choice for new projects. |
| React | 19.2 | UI runtime | Bundled with Next.js 16. View Transitions API directly useful for muscle map transitions between front/back views. |
| TypeScript | 5.x | Type safety | Next.js 16 requires TypeScript 5+. The muscle data model (muscles, exercises, strain levels) is complex enough that untyped JS will cause bugs at scale. |
| MongoDB | 8.x | Database | Non-negotiable per constraints. Appropriate for this domain: exercises are document-shaped, FAQ entries are semi-structured, no relational joins needed. |
| Mongoose | 9.3.x | ODM | Standard pairing with MongoDB in Next.js. Use `mongoose.models.X || mongoose.model('X', schema)` pattern to prevent hot-reload model recompilation. Configure `serverExternalPackages: ["mongoose"]` in next.config. |
| Tailwind CSS | 4.2 | Styling | Current standard for Next.js projects. v4 introduces CSS-native configuration (no tailwind.config.js needed), 5x faster full builds. Token-driven theming maps well to the ranking tier color system (Iron → Elite). |
| shadcn/ui | latest (CLI v4) | Component system | Copy-paste components built on Radix primitives. Not a dependency — components live in your repo. Provides accessible Dialog, Sheet, Progress, Badge, Tabs, Tooltip out of box — all needed for this app. Now supports RTL natively (relevant for potential Arabic expansion). |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-muscle-highlighter | latest | Muscle map SVG visualization | Starting point for muscle region click handling and intensity color display. 23 body parts, front/back views, intensity prop, zero external dependencies. **Treat as a reference/starting point — fork it or build custom if 2.5D illustrated style is required** (see note below). |
| Recharts | 3.8.x | Data visualization | Radar chart for body rating display (strength/endurance/flexibility axes). Tier progress bars. Better React integration than Chart.js; composable API means you control every element. shadcn/ui's chart components wrap Recharts — use those for consistent styling. |
| Zustand | 5.0.x | Client state | Workout session state (active exercise, rest timer, current sets), UI state (selected muscle, active view), ranking data. Lightweight (<1KB), no Provider wrapper, SSR-friendly, React 18+ native sync. No boilerplate — correct for this app's complexity level. |
| Dexie.js | 4.x | Local storage | IndexedDB wrapper for persisting workout history, user bio data, and ranking state locally (no auth in v1). Dexie provides a clean async API over raw IndexedDB, TypeScript support, and reactive queries. Better than localStorage for structured relational-ish data (workout → sets → exercises). |
| @svgr/webpack | 8.x | SVG tooling | Load SVG files as React components in Next.js. Critical for the custom muscle map: enables inline SVG manipulation (per-muscle color, hover states, click handlers) while keeping SVG source as editable assets. |
| lucide-react | latest | Icons | Included by default with shadcn/ui. Covers all needed icons: rest timer, weight, reps, chevrons for muscle navigation. Consistent with shadcn design language. |
| date-fns | 4.x | Date utilities | Workout log timestamps, recovery time calculations (muscle strain decay over days). Lightweight, tree-shakeable, no Moment.js baggage. |
| zod | 3.x | Schema validation | Validate bio-info form inputs, workout log entries before MongoDB write. Works with shadcn/ui form components via react-hook-form integration. |
| react-hook-form | 7.x | Form handling | Bio-info collection form, workout logging form. Minimal re-renders, Zod integration. Needed because bio-info form has conditional fields. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| TypeScript | Static typing | Strict mode. Define `MuscleId`, `WorkoutSession`, `TierRank`, `StrainLevel` types early — these are the domain's core vocabulary. |
| ESLint + Next.js config | Linting | Next.js 16 removed `next lint` from build — run ESLint directly via `npx eslint`. Use flat config format (default in Next.js 16). |
| Prettier | Formatting | Standard, no config debate needed. |
| Turbopack | Bundler | Default in Next.js 16. No opt-in needed. 2-5x faster builds vs Webpack. |

---

## Installation

```bash
# Bootstrap
npx create-next-app@latest rip-zone --typescript --tailwind --eslint --app

# Core data layer
npm install mongoose

# State + persistence
npm install zustand dexie

# Visualization
npm install recharts react-muscle-highlighter

# Forms + validation
npm install react-hook-form zod @hookform/resolvers

# Utilities
npm install date-fns lucide-react

# SVG tooling
npm install -D @svgr/webpack

# shadcn/ui (interactive — run after project setup)
npx shadcn@latest init
npx shadcn@latest add button card dialog progress badge tabs tooltip sheet
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Zustand | Redux Toolkit | Only if the app grows to enterprise-scale with 5+ developers — RTK's boilerplate overhead is unwarranted for this project's state complexity |
| Dexie.js | localStorage | Never for this app — workout history is relational (session → exercises → sets) and will exceed localStorage's 5MB limit once history accumulates |
| Dexie.js | RxDB | If you later need real-time sync to MongoDB (Phase 2+). RxDB builds on IndexedDB but adds replication — overkill for v1 local-only |
| Recharts | Victory / Nivo | Recharts is the shadcn/ui default. Use Nivo only if you need more exotic chart types beyond radar/bar/line |
| react-muscle-highlighter | react-body-highlighter | react-body-highlighter (giavinh79) is older (last published 4 years ago, v2.0.5 from 2021), fewer muscles, no active maintenance. react-muscle-highlighter is more recent |
| Custom SVG (forked/built) | Any existing lib as-is | The 2.5D illustrated style requirement means existing libraries (which use flat schematic SVGs) will likely not match the visual direction. Plan to build a custom SVG component using SVGR |
| Tailwind CSS v4 | CSS Modules | CSS Modules remain valid but require manual design token management. Tailwind v4's CSS-native variables map directly to the tier color system |
| Mongoose | MongoDB native driver | Mongoose adds schema validation and model structure that matters at development speed. For a team, Mongoose wins. The native driver is better only at very high throughput production scale |
| date-fns | Luxon | date-fns is tree-shakeable. Only switch to Luxon if timezone handling becomes complex |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Three.js / WebGL | The project explicitly chose 2.5D illustrated over WebGL 3D for valid reasons (simpler, faster to render). Adding Three.js reintroduces exactly the complexity that decision eliminated | Custom SVG with SVGR |
| Prisma | Prisma targets SQL databases. It doesn't support MongoDB in the same way as Mongoose and adds an unnecessary abstraction layer | Mongoose 9.x |
| react-body-highlighter (giavinh79) | Last published 4 years ago (v2.0.5, July 2021), only ~20 muscle groups, minimal active maintenance | react-muscle-highlighter as starting reference |
| Chart.js / react-chartjs-2 | More imperative API than Recharts, heavier bundle, weaker React integration. shadcn/ui uses Recharts natively — mixing them creates visual inconsistency | Recharts 3.x |
| NextAuth.js | Auth is explicitly out of scope for v1. Adding NextAuth creates session management infrastructure that conflicts with the local-storage-first architecture | Nothing — implement auth in v2 milestone |
| MUI / Chakra UI | Heavy component libraries that fight with Tailwind CSS. MUI in particular brings its own styling system. Adding a full library on top of shadcn/ui bloats the bundle and causes visual conflicts | shadcn/ui + Tailwind CSS only |
| Framer Motion | Adds ~50KB to the bundle for animations. React 19.2's View Transitions API (available in Next.js 16) handles muscle map transitions natively. Add Framer Motion only if View Transitions prove insufficient | CSS transitions + React 19.2 View Transitions |
| MongoDB Atlas Search / full-text search | Out of scope for v1. FAQ content is pre-generated, not user-searched | Standard MongoDB queries |

---

## Stack Patterns by Variant

**For the muscle map visualization:**
- Build the illustrated SVG as a standalone asset (`.svg` file)
- Load it as a React component via `@svgr/webpack`
- Each muscle group gets a unique `id` attribute in the SVG (e.g., `id="biceps-left"`)
- A Zustand store holds `Map<MuscleId, StrainLevel>` (0-100)
- On render, map strain levels to HSL colors and apply via inline `style` or SVG `fill` props
- This approach gives full visual control without being locked into any library's SVG shape set

**For workout session state:**
- Use Zustand for ephemeral session state (active exercise, rest timer countdown, current set count)
- Flush to Dexie on session complete — never write to Dexie mid-set
- Derive ranking tier from Dexie data via a pure calculation function (no state needed)

**For the FAQ:**
- Store FAQ items in MongoDB as documents with `{ question, answer, tags, category }`
- Pre-generate pages with Next.js static generation (`generateStaticParams`)
- FAQ is read-only in v1, so no client-side mutations needed

**For ranking calculation:**
- Pure TypeScript function: `calculateTier(workoutHistory: WorkoutLog[], bioData?: BioData): TierRank`
- No library needed — ranking formula is domain-specific
- Store tier in Dexie, recalculate on each session completion

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 16.x | React 19.2, Node.js 20.9+ | Node.js 18 dropped in Next.js 16. Verify environment. |
| Mongoose 9.x | MongoDB 6.x, 7.x, 8.x | Mongoose 9 dropped support for Node.js < 18.x |
| Zustand 5.x | React 18+, React 19 | Zustand 5 dropped React <18 — no polyfills needed |
| Recharts 3.x | React 18, React 19 | Recharts 3 migration dropped deprecated props from 2.x |
| shadcn/ui CLI v4 | Tailwind CSS v4, Next.js 15+ | CLI v4 can target either Radix or Base UI primitives |
| Dexie 4.x | Modern browsers (Chrome 111+, Firefox 111+, Safari 16.4+) | Aligns with Next.js 16 browser targets — no polyfill needed |
| @svgr/webpack 8.x | Webpack 5, Next.js Webpack mode | Turbopack has its own SVG handling — test SVG import in Turbopack dev mode; fall back to `next build --webpack` if issues arise |

---

## Critical Architecture Note: Muscle Map Visualization

The `react-muscle-highlighter` library (23 muscles, intensity support, front/back) is a valid starting point, but the 2.5D illustrated style requirement almost certainly means building a custom SVG component. Existing libraries use schematic/medical-diagram SVGs that clash with illustrated aesthetics.

**Recommended approach:**
1. Commission or procure a 2.5D illustrated body SVG (front + back, all major muscle groups labeled with IDs)
2. Configure SVGR to import it as a React component
3. Build a thin `MuscleMap` React component that accepts `strainMap: Record<MuscleId, number>` and applies color fills
4. Use `react-muscle-highlighter` only as a reference for which muscle IDs to use and how to structure the intensity color calculation

This is a MEDIUM confidence recommendation — the exact SVG sourcing strategy (commission vs. procure vs. build) is a Phase 1 design decision that needs resolution early.

---

## Sources

- Next.js 16 release blog — https://nextjs.org/blog/next-16 (HIGH confidence — official)
- Mongoose docs — https://mongoosejs.com/docs/nextjs.html (HIGH confidence — official)
- Zustand v5 announcement — https://pmnd.rs/blog/announcing-zustand-v5 (HIGH confidence — official)
- react-muscle-highlighter GitHub — https://github.com/soroojshehryar/react-muscle-highlighter (MEDIUM — library has 1 commit, activity unclear)
- react-body-highlighter GitHub — https://github.com/giavinh79/react-body-highlighter (HIGH — confirmed v2.0.5, 4 years stale)
- Recharts npm — version 3.8.0, 15 days old as of research date (HIGH confidence)
- Tailwind CSS v4 — https://tailwindcss.com/blog/tailwindcss-v4 (HIGH confidence — official, v4.2 current)
- shadcn/ui changelog — https://ui.shadcn.com/docs/changelog (HIGH confidence — official, CLI v4 March 2026)
- Zustand npm — version 5.0.12 (HIGH confidence)
- Mongoose npm — version 9.3.1 (HIGH confidence)
- WebSearch: state management comparison 2025 (MEDIUM — multiple sources agree on Zustand for small-medium apps)
- WebSearch: Dexie vs localStorage for fitness apps (MEDIUM — IndexedDB superiority for structured data is well-established)

---

*Stack research for: Rip Zone — fitness app with interactive muscle map, workout tracking, gamification*
*Researched: 2026-03-22*
