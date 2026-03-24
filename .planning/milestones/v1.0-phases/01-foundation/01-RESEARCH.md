# Phase 1: Foundation - Research

**Researched:** 2026-03-22
**Domain:** Next.js 16, TypeScript 5, MongoDB/Mongoose 9, Dexie 4, shadcn/ui + Tailwind v4, Zustand 5
**Confidence:** HIGH (all core stack verified against live npm registry and official docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Styling & UI Toolkit**
- D-01: Use shadcn/ui as the component library (Tailwind CSS + Radix primitives)
- D-02: Responsive layout — bottom navigation on mobile, tab navigation on desktop
- D-03: Dark mode only — no light mode or theme toggle
- D-04: Neon/electric color palette — bright neon accents (cyan, green, purple) on dark background. Tech-meets-gym aesthetic
- D-05: Inter font family

**Seed Data Format**
- D-06: Exercise seed data structure — Claude's discretion on file organization (flat vs split)
- D-07: Comprehensive muscle list (~50-60 muscles) including smaller/obscure ones. Each with slug, display name, group, and SVG region mapping
- D-08: Goal-based pre-built workout plans: Beginner Strength, Muscle Building, Fat Loss, Athletic Performance (3-5 programs)
- D-09: Full exercise content — each exercise includes name, slug, primary/secondary muscles, equipment, difficulty, brief description, and key form cues

**Dexie Schema Design**
- D-10: Separate Dexie tables for sessions, exercises-in-session, and individual sets (relational model, not nested)
- D-11: Compute all derived data on the fly — strain, PRs, rankings, radar scores all computed from raw logs at read time. Never persist computed values
- D-12: Versioned bio metric entries — each update creates a timestamped record
- D-13: Full migration scripts for Dexie schema changes — preserve user data through all updates
- D-14: Split Dexie databases — separate databases for workouts vs profile/bio. Independent versioning

**TypeScript Type System**
- D-15: Branded types for domain IDs (MuscleSlug, MuscleId, etc.) — compile-time safety
- D-16: TypeScript only for validation — no Zod. Trust data shape at runtime
- D-17: TypeScript enums for TierRank, StrainLevel, and similar domain enumerations

**State Management**
- D-18: Domain-based Zustand stores — separate stores per domain (useWorkoutStore, useMapStore, useRankStore, useProfileStore)
- D-19: Manual sync between Zustand and Dexie — explicit read/write functions, no auto-persist middleware

**MongoDB Collections**
- D-20: One collection per domain — muscles, exercises, workoutPlans, faqEntries. Each with its own Mongoose model
- D-21: CLI seed script (`npm run seed`) for loading reference data. Run once on setup, re-run to refresh. No on-demand seeding at startup

### Claude's Discretion
- Exercise seed data file organization (flat JSON vs split by muscle group)
- Exact spacing, border radius, and component sizing for shadcn theme customization
- Zustand store internal structure and action naming
- MongoDB index strategy per collection
- Project folder structure (app/ vs src/ conventions)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 1 establishes the complete technical skeleton for Rip Zone: a Next.js 16 app with Turbopack, dual data storage (MongoDB via Mongoose for reference data, Dexie for user data), all domain TypeScript types, shadcn/ui with Tailwind v4 dark neon theme, domain-scoped Zustand stores, and seed data for all MongoDB collections. Every subsequent phase builds directly on what Phase 1 defines without revisiting these architectural choices.

The stack is current as of March 2026. Next.js 16 (released October 2025, current 16.2.1) makes Turbopack the default bundler. Tailwind CSS v4 ships with CSS-first configuration replacing `tailwind.config.js`. shadcn/ui has full Tailwind v4 + React 19 compatibility. Dexie 4 provides TypeScript `EntityTable` generics for typed IndexedDB tables. Mongoose 9 supports schema-inferred TypeScript types. Zustand 5 uses the curried `create<T>()()` pattern.

The single largest Phase 1 risk is MongoDB availability: `mongod` is not installed on this machine. The seed script and smoke-test page will need a running MongoDB instance, likely via a cloud connection string (MongoDB Atlas free tier) or a locally launched MongoDB installation. This must be resolved before the seed task runs.

**Primary recommendation:** Bootstrap with `npx create-next-app@latest` (Turbopack + TypeScript + Tailwind enabled by default), then add Mongoose, Dexie, Zustand, and run `npx shadcn@latest init` to layer in the component library. All packages have stable current releases.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.1 | App framework, routing, SSR/RSC | Project requirement; Turbopack default since 16.0 |
| react | 19.2.4 | UI runtime | Required by Next.js 16 |
| react-dom | 19.2.4 | DOM renderer | Required by Next.js 16 |
| typescript | 5.9.3 | Type system | Next.js default; required >= 5.1 |
| mongoose | 9.3.1 | MongoDB ODM for reference data | Project requirement; TypeScript schema inference in v9 |
| dexie | 4.3.0 | IndexedDB wrapper for user data | Project requirement; EntityTable typing in v4 |
| zustand | 5.0.12 | Client state management | Project requirement; curried create<T>()() pattern |
| tailwindcss | 4.2.2 | Utility CSS framework | Project requirement; CSS-first config in v4 |
| shadcn (CLI) | 4.1.0 | Component scaffolding tool | Project requirement; full Tailwind v4 + React 19 support |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.577.0 | Icon library | shadcn default icon set — use for all UI icons |
| tw-animate-css | 1.4.0 | CSS animations for shadcn | Replaces deprecated tailwindcss-animate in shadcn v4 init |
| next-themes | 0.4.6 | Dark mode class management | Needed even for dark-only: applies `.dark` class to `<html>` |
| @svgr/webpack | 8.1.0 | SVG as React components | Required for Phase 2 muscle map; configure via `turbopack.rules` |
| class-variance-authority | 0.7.1 | Variant styling helper | Used internally by shadcn components |
| clsx | 2.1.1 | Class string merging | Used with `cn()` utility from shadcn |
| @radix-ui/react-slot | 1.2.4 | Polymorphic component primitive | Used by shadcn Button and other components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dexie | localForage / raw IndexedDB | Dexie is locked decision; provides typed tables, versioned migrations, useLiveQuery hook |
| Zustand | Jotai, Recoil | Zustand is locked decision; lightest API, no Provider required |
| Mongoose | native MongoDB driver | Mongoose provides schema validation, model registration pattern, TypeScript type inference |

**Installation (complete Phase 1 dependencies):**
```bash
# Core framework (via create-next-app — includes next, react, react-dom, typescript, tailwindcss, eslint)
npx create-next-app@latest rip-zone --yes

# Data layer
npm install mongoose dexie

# State
npm install zustand

# UI
npm install next-themes lucide-react
npx shadcn@latest init

# Phase 2 pre-wiring (SVGR)
npm install --save-dev @svgr/webpack
```

**Version verification (confirmed 2026-03-22 against npm registry):**
- `next@16.2.1` — published 2026-03-20
- `mongoose@9.3.1` — published 2026-03-17
- `dexie@4.3.0` — published 2025-12-20
- `zustand@5.0.12` — published 2026-03-16
- `tailwindcss@4.2.2` — published 2026-03-18
- `shadcn@4.1.0` (CLI) — published 2026-03-19
- `react@19.2.4` / `react-dom@19.2.4` — current with Next.js 16

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/                     # Next.js App Router pages and layouts
│   ├── layout.tsx           # Root layout — Inter font, dark class, ThemeProvider
│   ├── page.tsx             # Smoke-test page (Phase 1 deliverable)
│   └── globals.css          # Tailwind v4 theme — all CSS vars, @theme inline
├── components/
│   └── ui/                  # shadcn scaffolded components (button, badge, etc.)
├── lib/
│   ├── mongodb.ts           # Mongoose connection singleton with HMR guard
│   ├── models/              # Mongoose models (Muscle, Exercise, WorkoutPlan, FaqEntry)
│   └── seed/                # Seed script + JSON data files
│       ├── seed.ts          # CLI entry point (run via tsx)
│       ├── data/
│       │   ├── muscles.json
│       │   ├── exercises.json
│       │   ├── workout-plans.json
│       │   └── faq-entries.json
├── db/
│   ├── workout-db.ts        # Dexie WorkoutDatabase class (sessions, exercises, sets)
│   └── profile-db.ts        # Dexie ProfileDatabase class (bio metrics)
├── stores/
│   ├── useWorkoutStore.ts   # Zustand workout domain store
│   ├── useMapStore.ts       # Zustand muscle map store
│   ├── useRankStore.ts      # Zustand ranking store
│   └── useProfileStore.ts   # Zustand profile/bio store
└── types/
    ├── domain.ts            # Branded types: MuscleId, MuscleSlug, etc.
    ├── enums.ts             # TypeScript enums: TierRank, StrainLevel, etc.
    ├── workout.ts           # WorkoutSession, SetLog, BioMetrics interfaces
    └── index.ts             # Barrel export
```

**Note on src/ convention:** `create-next-app` prompts whether to use `src/`. Using `src/` is Claude's discretion (D-06 implies discretion on file organization). Recommend `src/` for cleaner separation from config files at root.

### Pattern 1: Next.js 16 App Bootstrap

**What:** `create-next-app@latest` with defaults gives TypeScript + Tailwind v4 + App Router + Turbopack. No further bundler config needed for basic setup.

**Breaking change in Next.js 16:** `turbopack` config moves from `experimental.turbopack` to top-level `turbopack` in `next.config.ts`. The `next lint` command is removed — lint directly via `eslint`.

```typescript
// next.config.ts — Source: https://nextjs.org/blog/next-16
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose'],  // prevents Mongoose bundling issues
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}

export default nextConfig
```

**Node.js requirement:** Next.js 16 requires Node.js >= 20.9.0. Current environment has v20.20.1 — requirement met.

### Pattern 2: Mongoose Connection Singleton with HMR Guard

**What:** In development, Next.js HMR re-evaluates modules on save. Without a global guard, Mongoose accumulates duplicate connections and throws "You cannot call mongoose.connect() while connected."

**Why it works:** `globalThis` survives HMR module re-evaluation; `mongoose.connect()` is a no-op when already connected, so checking the cached promise prevents re-connection.

```typescript
// src/lib/mongodb.ts — Source: https://mongoosejs.com/docs/nextjs.html
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: MongooseCache | undefined
}

const cached: MongooseCache = globalThis.__mongoose ?? { conn: null, promise: null }

if (!globalThis.__mongoose) {
  globalThis.__mongoose = cached
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!).then((m) => m)
  }

  cached.conn = await cached.promise
  return cached.conn
}
```

**Model registration (prevents HMR recompilation errors):**
```typescript
// Pattern for every Mongoose model file
import mongoose from 'mongoose'

const MuscleSchema = new mongoose.Schema({ /* ... */ })

export const Muscle =
  mongoose.models.Muscle ?? mongoose.model('Muscle', MuscleSchema)
```

### Pattern 3: Dexie 4 TypeScript Typed Database

**What:** Extend the `Dexie` class to define typed tables using `Table<T>` or `EntityTable<T, PrimaryKey>`. Split into two separate databases per D-14.

```typescript
// src/db/workout-db.ts — Source: https://dexie.org/docs/Typescript
import Dexie, { type Table } from 'dexie'
import type { WorkoutSession, SessionExercise, SetLog } from '@/types'

export class WorkoutDatabase extends Dexie {
  sessions!: Table<WorkoutSession>
  sessionExercises!: Table<SessionExercise>
  sets!: Table<SetLog>

  constructor() {
    super('RipZoneWorkouts')
    this.version(1).stores({
      sessions:         '++id, startedAt, completedAt',
      sessionExercises: '++id, sessionId, exerciseSlug',
      sets:             '++id, sessionExerciseId, completedAt',
    })
  }
}

export const workoutDb = new WorkoutDatabase()
```

```typescript
// src/db/profile-db.ts
import Dexie, { type Table } from 'dexie'
import type { BioMetricEntry } from '@/types'

export class ProfileDatabase extends Dexie {
  bioMetrics!: Table<BioMetricEntry>

  constructor() {
    super('RipZoneProfile')
    this.version(1).stores({
      bioMetrics: '++id, recordedAt',
    })
  }
}

export const profileDb = new ProfileDatabase()
```

**SSR guard:** Dexie accesses `window.indexedDB` and must only run client-side. Export the `db` singleton from a module — Dexie does not throw on import, only on first query. Components that use Dexie must have `'use client'` directive. For server components that accidentally import Dexie, use `dynamic(() => import('./component'), { ssr: false })`.

**Schema migration pattern (D-13):**
```typescript
this.version(1).stores({ sessions: '++id, startedAt' })
this.version(2).stores({ sessions: '++id, startedAt, planId' }).upgrade(tx =>
  tx.table('sessions').toCollection().modify(session => {
    session.planId = null
  })
)
```

### Pattern 4: TypeScript Branded Types

**What:** Branded types prevent accidental string interchange between domain IDs at compile time. Zero runtime cost — the brand is only a phantom type property.

```typescript
// src/types/domain.ts — Source: learningtypescript.com/articles/branded-types
declare const __brand: unique symbol
type Brand<Base, Name> = Base & { readonly [__brand]: Name }

export type MuscleId   = Brand<string, 'MuscleId'>
export type MuscleSlug = Brand<string, 'MuscleSlug'>
export type ExerciseSlug = Brand<string, 'ExerciseSlug'>
export type SessionId  = Brand<number, 'SessionId'>

// Constructor functions that "brand" a value
export const muscleId   = (s: string) => s as MuscleId
export const muscleSlug = (s: string) => s as MuscleSlug
export const exerciseSlug = (s: string) => s as ExerciseSlug
```

**TypeScript enums (D-17):**
```typescript
// src/types/enums.ts
export enum TierRank {
  Iron      = 'iron',
  Bronze    = 'bronze',
  Silver    = 'silver',
  Gold      = 'gold',
  Platinum  = 'platinum',
  Diamond   = 'diamond',
  Elite     = 'elite',
}

export enum StrainLevel {
  Rested   = 'rested',
  Light    = 'light',
  Moderate = 'moderate',
  Heavy    = 'heavy',
  Maxed    = 'maxed',
}
```

### Pattern 5: Zustand 5 Domain Store

**What:** Curried `create<T>()()` syntax required for TypeScript inference in Zustand 5. One store file per domain per D-18. No persist middleware per D-19.

```typescript
// src/stores/useWorkoutStore.ts — Source: zustand.docs.pmnd.rs/learn/guides/beginner-typescript
import { create } from 'zustand'
import type { WorkoutSession } from '@/types'

interface WorkoutState {
  activeSession: WorkoutSession | null
  startSession: (session: WorkoutSession) => void
  endSession: () => void
}

export const useWorkoutStore = create<WorkoutState>()((set) => ({
  activeSession: null,
  startSession: (session) => set({ activeSession: session }),
  endSession: () => set({ activeSession: null }),
}))
```

### Pattern 6: Tailwind v4 + shadcn Dark Neon Theme

**What:** Tailwind v4 uses CSS-first configuration — no `tailwind.config.js`. shadcn init generates `globals.css` with `@theme inline` directive. Colors are now OKLCH. Dark-mode-only setup applies `.dark` class to `<html>` permanently via next-themes.

**shadcn init command:**
```bash
npx shadcn@latest init
# Select: "New York" style, dark mode, TypeScript
```

**globals.css pattern for dark-only neon theme:**
```css
/* src/app/globals.css — Source: https://ui.shadcn.com/docs/tailwind-v4 */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  /* Dark neon palette — from UI-SPEC.md */
  --background: oklch(9% 0.02 285);        /* #0a0a0f */
  --foreground: oklch(94% 0.01 285);       /* #f0f0f5 */
  --card: oklch(12% 0.025 285);            /* #13131f */
  --card-foreground: oklch(94% 0.01 285);
  --primary: oklch(85% 0.18 195);          /* #00e5ff cyan */
  --primary-foreground: oklch(9% 0.02 285);
  --secondary: oklch(60% 0.22 305);        /* #a855f7 purple */
  --secondary-foreground: oklch(94% 0.01 285);
  --border: oklch(16% 0.03 285);           /* #1e1e2e */
  --muted: oklch(16% 0.03 285);
  --muted-foreground: oklch(45% 0.02 285); /* #6b7280 */
  --destructive: oklch(58% 0.22 25);       /* #ef4444 */
  --radius: 0.5rem;
}

@theme inline {
  --color-background:         var(--background);
  --color-foreground:         var(--foreground);
  --color-card:               var(--card);
  --color-card-foreground:    var(--card-foreground);
  --color-primary:            var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary:          var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-border:             var(--border);
  --color-muted:              var(--muted);
  --color-muted-foreground:   var(--muted-foreground);
  --color-destructive:        var(--destructive);
  --radius-sm:                calc(var(--radius) - 4px);
  --radius-md:                var(--radius);
  --radius-lg:                calc(var(--radius) + 4px);
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-inter), system-ui, sans-serif;
}
```

**Root layout for dark-only (no toggle):**
```tsx
// src/app/layout.tsx
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Note:** `forcedTheme="dark"` from next-themes prevents any theme switching. `suppressHydrationWarning` is required because ThemeProvider modifies the `class` attribute on `<html>` client-side.

### Pattern 7: Mongoose Schema with TypeScript Type Inference

**What:** Mongoose 9 infers TypeScript types from schema definitions — no separate interface needed (Mongoose docs recommend this over manual interfaces). Use `InferSchemaType` for external type consumption.

```typescript
// src/lib/models/Muscle.ts
import mongoose, { InferSchemaType } from 'mongoose'

const MuscleSchema = new mongoose.Schema({
  slug:        { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  group:       { type: String, required: true },  // e.g. 'chest', 'back'
  svgRegion:   { type: String, required: true },  // SVG path ID for Phase 2
  description: { type: String },
}, { timestamps: true })

// For use in other files
export type MuscleDocument = InferSchemaType<typeof MuscleSchema>

// HMR-safe model registration
export const Muscle =
  mongoose.models.Muscle ?? mongoose.model('Muscle', MuscleSchema)
```

### Pattern 8: Seed Script (D-21)

**What:** CLI script run via `npm run seed`. Uses `tsx` for TypeScript execution without compilation step.

```json
// package.json scripts addition
{
  "scripts": {
    "seed": "tsx src/lib/seed/seed.ts"
  }
}
```

```typescript
// src/lib/seed/seed.ts (simplified)
import { connectToDatabase } from '@/lib/mongodb'
import { Muscle } from '@/lib/models/Muscle'
import muscles from './data/muscles.json'

async function seed() {
  await connectToDatabase()
  await Muscle.deleteMany({})
  await Muscle.insertMany(muscles)
  console.log(`Seeded ${muscles.length} muscles`)
  process.exit(0)
}

seed().catch(console.error)
```

**tsx** is the standard tool for running TypeScript Node scripts without precompiling. Install as dev dep: `npm install --save-dev tsx`.

### Anti-Patterns to Avoid

- **Calling `mongoose.connect()` at module top-level:** Will fire on every import during HMR. Use the singleton with global cache instead.
- **Direct `mongoose.model('Name', schema)` without `mongoose.models.Name ??`:** Throws "Cannot overwrite model once compiled" on HMR.
- **Importing Dexie db in Server Components:** IndexedDB does not exist server-side. Keep all Dexie access in `'use client'` components.
- **Persisting computed values to Dexie:** D-11 mandates deriving strain, PRs, rankings from raw logs at read time. Never write computed percentages.
- **Using `tailwind.config.js` with Tailwind v4:** Tailwind v4 is CSS-first. Configuration goes in `globals.css` via `@theme`. The JS config file still works for complex customizations but is not needed for color/token definitions.
- **Using `experimental.turbopack` config key:** Removed in Next.js 16. Config is now top-level `turbopack`.
- **Using `next lint` script:** Removed in Next.js 16. Run `eslint` directly.
- **Nesting workout sets inside the session document (MongoDB or Dexie):** D-10 requires separate tables for relational queries. The strain engine and PR detection need cross-session set queries.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB access | Custom IndexedDB wrappers | Dexie 4 | Versioning, migration, typed tables, transaction handling are complex edge-case-laden problems |
| MongoDB connection pool | Custom connection tracking | Mongoose singleton pattern | Connection state machine, pooling, reconnect logic is non-trivial |
| CSS animation tokens | Custom keyframe definitions | tw-animate-css | shadcn components depend on these animation tokens; hand-rolling breaks components |
| Component primitives | Custom dialog/select/popover | shadcn + Radix | Accessibility (ARIA), keyboard nav, focus management are correctness-critical |
| Class merging utility | Custom string concat | `cn()` from shadcn (clsx + tailwind-merge) | Tailwind class conflicts (e.g., `p-4 p-6`) are silently wrong without tailwind-merge |
| TypeScript brand enforcement | Runtime checks | TypeScript phantom brands | Brands are purely compile-time; runtime checks add cost with no benefit |

**Key insight:** The entire data layer (Dexie, Mongoose) and component layer (shadcn/Radix) solve correctness-critical problems with extensive edge case handling. The benefit of the standard stack is not convenience but correctness.

---

## Common Pitfalls

### Pitfall 1: MongoDB Not Available in Environment

**What goes wrong:** `mongod` is not installed on this machine. The seed script and smoke-test MongoDB status panel will fail if `MONGODB_URI` points to nothing.

**Why it happens:** Phase 1 assumes a running MongoDB instance. Local install is absent; Docker is absent.

**How to avoid:** Use MongoDB Atlas free tier (M0 — always free, no credit card required). Create cluster at mongodb.com, get connection string, set `MONGODB_URI` in `.env.local`. The smoke-test page should handle connection failures gracefully and show the error state defined in UI-SPEC.md.

**Warning signs:** `MongoNetworkError: connect ECONNREFUSED` in server console on first page load.

### Pitfall 2: Mongoose HMR Duplicate Connections

**What goes wrong:** `MongooseError: You cannot call mongoose.connect() while connected.` in development after a file save triggers hot reload.

**Why it happens:** Next.js HMR re-evaluates modules but does not reset `globalThis`. Without the global cache, `cached.promise` is `null` after re-evaluation, causing a second `mongoose.connect()` call.

**How to avoid:** Always use the `globalThis.__mongoose` singleton pattern. Never call `mongoose.connect()` directly in Server Components or API routes — always go through `connectToDatabase()`.

**Warning signs:** Error appears in terminal after the first file save, not on cold start.

### Pitfall 3: Mongoose Model Recompilation on HMR

**What goes wrong:** `OverwriteModelError: Cannot overwrite Model once compiled` when models are defined at module scope without guard.

**Why it happens:** Each HMR cycle re-runs the model file. `mongoose.model()` throws if a model with that name already exists in `mongoose.models`.

**How to avoid:** Always use `mongoose.models.ModelName ?? mongoose.model('ModelName', Schema)` pattern. This is a one-liner guard on every model file.

**Warning signs:** Error only appears in development after HMR, not in production.

### Pitfall 4: Dexie Initialized on Server

**What goes wrong:** `ReferenceError: indexedDB is not defined` during SSR in Next.js App Router.

**Why it happens:** Dexie accesses `indexedDB` on first database operation. App Router renders Server Components server-side where `window` does not exist. Even Client Components with `'use client'` have their initial HTML rendered server-side.

**How to avoid:** Export Dexie db singletons from `'use client'` modules, and only call Dexie methods inside event handlers, `useEffect`, or `useLiveQuery` — not in the render body of Client Components. The db instance itself can be imported safely; it only accesses IndexedDB on first operation.

**Warning signs:** Error during `next build` or initial page load, not in browser console after hydration.

### Pitfall 5: Tailwind v4 Color Format Change

**What goes wrong:** shadcn init generates OKLCH color values. Neon colors specified in hex (#00e5ff) need to be converted to OKLCH for the `@theme inline` block. Using hex directly in `@theme` works but loses Tailwind v4's opacity modifier support (e.g., `bg-primary/50`).

**Why it happens:** Tailwind v4 uses OKLCH internally; CSS variables defined in non-OKLCH formats don't participate in the opacity modifier system.

**How to avoid:** Convert all UI-SPEC.md hex colors to OKLCH. Use a tool like oklch.com or the CSS Color 4 spec converter. The Code Examples section above shows the OKLCH approximations for the neon palette.

**Warning signs:** `bg-primary/50` produces transparent black instead of semi-transparent cyan.

### Pitfall 6: `next lint` Removed in Next.js 16

**What goes wrong:** Running `npm run lint` fails if `package.json` scripts still contain `"lint": "next lint"`.

**Why it happens:** Next.js 16 removed the `next lint` command. `next build` also no longer runs the linter.

**How to avoid:** Set lint script to `"lint": "eslint"` (or `"lint": "biome check"` if using Biome). This is the default from `create-next-app` in Next.js 16.

**Warning signs:** `Error: 'next' is not a valid command` or `Unknown command lint`.

### Pitfall 7: SVGR + Turbopack Config Location

**What goes wrong:** SVG imports fail silently if SVGR is configured under the old `webpack()` function instead of `turbopack.rules`.

**Why it happens:** Turbopack does not execute the `webpack()` config override. `@svgr/webpack` must be declared under `turbopack.rules` in `next.config.ts`.

**How to avoid:** Use `turbopack: { rules: { '*.svg': { loaders: ['@svgr/webpack'], as: '*.js' } } }`. Phase 1 pre-wires this so Phase 2 muscle map SVG import works immediately.

**Warning signs:** `import MuscleMapSVG from './muscle-map.svg'` returns a URL string instead of a React component.

---

## Code Examples

Verified patterns from official sources:

### Mongoose Connection Singleton (TypeScript)
```typescript
// Source: https://mongoosejs.com/docs/nextjs.html (adapted for TypeScript)
import mongoose from 'mongoose'

declare global { var __mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined }

const cached = globalThis.__mongoose ?? { conn: null, promise: null }
if (!globalThis.__mongoose) globalThis.__mongoose = cached

export async function connectToDatabase() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI!)
  }
  return (cached.conn = await cached.promise)
}
```

### Dexie 4 Typed Table Definition
```typescript
// Source: https://dexie.org/docs/Typescript
import Dexie, { type Table } from 'dexie'

export class WorkoutDatabase extends Dexie {
  sessions!: Table<WorkoutSession>
  sessionExercises!: Table<SessionExercise>
  sets!: Table<SetLog>

  constructor() {
    super('RipZoneWorkouts')
    this.version(1).stores({
      sessions:         '++id, startedAt',
      sessionExercises: '++id, sessionId, exerciseSlug',
      sets:             '++id, sessionExerciseId',
    })
  }
}
export const workoutDb = new WorkoutDatabase()
```

### Zustand 5 Store (TypeScript)
```typescript
// Source: https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript
import { create } from 'zustand'

interface BearState {
  bears: number
  increase: () => void
}

export const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: () => set((s) => ({ bears: s.bears + 1 })),
}))
```

### Turbopack SVGR Configuration
```typescript
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack
// next.config.ts
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}
```

### Branded Type Pattern
```typescript
// Source: https://www.learningtypescript.com/articles/branded-types
declare const __brand: unique symbol
type Brand<B, N> = B & { readonly [__brand]: N }

export type MuscleSlug = Brand<string, 'MuscleSlug'>
export const muscleSlug = (s: string) => s as MuscleSlug
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` for token config | CSS-first `@theme` in `globals.css` | Tailwind v4 (Jan 2025) | No JS config file needed for design tokens |
| `tailwindcss-animate` plugin | `tw-animate-css` package | shadcn v4 init (2025) | Import from package, not plugin |
| `experimental.turbopack` config key | Top-level `turbopack` key | Next.js 16 (Oct 2025) | Config must move or build silently ignores settings |
| `next lint` CLI command | Direct `eslint` invocation | Next.js 16 (Oct 2025) | Package.json scripts must be updated |
| `middleware.ts` | `proxy.ts` (deprecated but not removed) | Next.js 16 (Oct 2025) | Phase 1 has no middleware, so not blocking |
| Mongoose manual `interface User {}` + Schema | `InferSchemaType<typeof Schema>` | Mongoose 8/9 | Less duplicated type definitions |
| HSL colors in shadcn | OKLCH colors in shadcn | shadcn 2025 | Opacity modifiers work correctly with OKLCH |

**Deprecated/outdated in this stack:**
- `tailwindcss-animate`: superseded by `tw-animate-css`
- `mongoose.models.User || mongoose.model(...)` with `||`: use `??` (nullish coalescing) to handle falsy model name edge cases
- `experimental.serverComponentsExternalPackages`: renamed to `serverExternalPackages` (stable)

---

## Open Questions

1. **MongoDB Atlas vs Local Install**
   - What we know: `mongod` is not installed; Docker is not available on this machine
   - What's unclear: Will the developer running Phase 1 have Atlas credentials, or do we need to document an alternative (e.g., `brew install mongodb-community` or Homebrew-equivalent for the OS)?
   - Recommendation: Document Atlas setup in task instructions as the primary path. Note that seed script will fail until a valid `MONGODB_URI` is set in `.env.local`.

2. **OKLCH Equivalents for Neon Palette**
   - What we know: UI-SPEC.md defines colors in hex; Tailwind v4 needs OKLCH for opacity modifier compatibility
   - What's unclear: The OKLCH approximations in Code Examples above are estimates — exact perceptual equivalents require a color picker tool
   - Recommendation: Use oklch.com to verify hex → OKLCH conversion during implementation. The hex values themselves work as fallbacks in CSS variables.

3. **tsx vs ts-node for Seed Script**
   - What we know: `tsx` is the current standard for running TypeScript Node scripts (no compilation step)
   - What's unclear: Whether `tsx` has any conflicts with Next.js 16's TypeScript setup
   - Recommendation: Use `tsx` — it is widely adopted and Next.js docs reference it for scripts. Install as dev dependency.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js 16 (requires >= 20.9) | Yes | v20.20.1 | — |
| npm | Package installation | Yes | 10.8.2 | — |
| MongoDB (local) | Seed script, smoke-test | No | — | MongoDB Atlas free tier |
| Docker | MongoDB container | No | — | MongoDB Atlas free tier |
| mongosh | MongoDB shell | No | — | Atlas web shell / Compass |
| Playwright browsers | E2E smoke test | No | — | Install via `npx playwright install` |

**Missing dependencies with no fallback:**
- None that block implementation — MongoDB Atlas is a complete substitute for local MongoDB.

**Missing dependencies with fallback:**
- MongoDB (local): Use Atlas M0 free cluster. Set `MONGODB_URI=mongodb+srv://...` in `.env.local`.
- Playwright browsers: Run `npx playwright install --with-deps chromium` before E2E tests. @playwright/test@1.58.2 is available on npm.

---

## Validation Architecture

nyquist_validation is enabled (config.json default).

### Test Framework

Phase 1 is a greenfield project — no test infrastructure exists yet. The success criteria include a smoke-test page load with no console errors (SC-1). This is best validated with Playwright E2E rather than unit tests, since the smoke test requires a running server with MongoDB connection and Dexie initialization.

| Property | Value |
|----------|-------|
| Framework | Playwright @1.58.2 (E2E) |
| Config file | `playwright.config.ts` — does not exist yet (Wave 0 gap) |
| Quick run command | `npx playwright test --project=chromium smoke.spec.ts` |
| Full suite command | `npx playwright test` |

For TypeScript type compilation validation (SC-5), use `npx tsc --noEmit` — no test framework needed.

### Phase Requirements → Test Map

Phase 1 has no user-facing requirement IDs (infrastructure phase). Success criteria map directly to validation:

| Success Criterion | Behavior | Test Type | Automated Command | Infrastructure Exists? |
|---|---|---|---|---|
| SC-1 | Next.js app runs locally with Turbopack, smoke page loads, no console errors | E2E smoke | `npx playwright test smoke.spec.ts` | No — Wave 0 gap |
| SC-2 | MongoDB singleton handles HMR without duplicate connections | Manual dev test + server log check | `npm run dev` + save file repeatedly + check terminal | N/A (manual) |
| SC-3 | Dexie initializes with correct schema for sessions, bio metrics, ranking state | E2E (check page renders Dexie status "Ready") | `npx playwright test smoke.spec.ts` | No — Wave 0 gap |
| SC-4 | Seed data loads into MongoDB without errors | CLI exit code check | `npm run seed && echo OK` | N/A (CLI) |
| SC-5 | All TypeScript domain types compile | TypeScript compiler | `npx tsc --noEmit` | No tsconfig yet — Wave 0 |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (catches type errors immediately)
- **Per wave merge:** `npx tsc --noEmit && npx playwright test smoke.spec.ts`
- **Phase gate:** All above green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `playwright.config.ts` — Playwright configuration with local dev server URL
- [ ] `e2e/smoke.spec.ts` — Page load test: status 200, heading "Rip Zone" visible, no console errors
- [ ] `npx playwright install --with-deps chromium` — Install browser binaries

---

## Project Constraints (from CLAUDE.md)

No CLAUDE.md exists in this project. No project-specific directives to enforce.

---

## Sources

### Primary (HIGH confidence)
- npm registry (verified 2026-03-22) — all package versions and publish dates
- [Next.js 16 announcement blog](https://nextjs.org/blog/next-16) — breaking changes, Turbopack status, create-next-app defaults
- [Next.js installation docs](https://nextjs.org/docs/app/getting-started/installation) — v16.2.1, updated 2026-03-03
- [Next.js Turbopack config reference](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack) — SVGR rules, v16.2.1
- [Mongoose TypeScript schemas](https://mongoosejs.com/docs/typescript/schemas.html) — InferSchemaType pattern
- [Mongoose + Next.js guide](https://mongoosejs.com/docs/nextjs.html) — HMR singleton, serverExternalPackages
- [Dexie TypeScript docs](https://dexie.org/docs/Typescript) — Table<T> pattern, schema definition
- [shadcn Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — @theme inline, OKLCH colors, tw-animate-css
- [shadcn Next.js install](https://ui.shadcn.com/docs/installation/next) — init command, forcedTheme
- [Zustand TypeScript guide](https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript) — create<T>()() pattern

### Secondary (MEDIUM confidence)
- [learningtypescript.com branded types](https://www.learningtypescript.com/articles/branded-types) — phantom brand pattern (multiple sources agree)
- WebSearch results for SVGR + Turbopack — confirmed by official Next.js turbopack docs

### Tertiary (LOW confidence)
- OKLCH color approximations for neon hex values — estimated; verify with oklch.com during implementation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry, publish dates confirmed
- Architecture: HIGH — patterns sourced from official Mongoose, Dexie, Next.js, Zustand, shadcn docs
- Pitfalls: HIGH — Mongoose HMR issues are documented in official Mongoose Next.js guide; Tailwind v4 changes are documented in official shadcn changelog; SVGR/Turbopack is confirmed by official Next.js Turbopack docs
- Environment: HIGH — direct shell verification of Node.js, npm, mongod, docker

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (all packages are stable releases; Tailwind v4 + shadcn v4 are not in rapid flux)
