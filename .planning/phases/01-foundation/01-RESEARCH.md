# Phase 1: Foundation - Research

**Researched:** 2026-03-22
**Domain:** Next.js 16, TypeScript, MongoDB/Mongoose, Dexie.js 4, shadcn/ui, Zustand 5, Tailwind CSS v4
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
None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 1 bootstraps a greenfield Next.js 16 project with the full stack configured and validated. The key architectural decisions — Turbopack as default bundler, MongoDB via Mongoose for server reference data, Dexie.js 4 for client user data, shadcn/ui with Tailwind v4 for the design system, and Zustand 5 for state — are all stable and current as of March 2026. There are no known compatibility blockers between these libraries at their latest versions.

The most critical correctness concerns for this phase are: (1) the Mongoose HMR guard on both the connection singleton and model registrations, (2) the Dexie split-database pattern matching the decisions exactly, and (3) the shadcn/ui initialization using the `dark` base theme before applying the neon CSS variable overrides. These are irreversible in the sense that later phases will depend on the exact token names and table schemas.

**Primary recommendation:** Bootstrap with `npx create-next-app@latest --yes` (Turbopack is the default), then layer in Mongoose, Dexie, shadcn, and Zustand in that order, verifying each integration independently before proceeding.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.1 | Framework — App Router, SSR, Turbopack | Locked decision; latest stable as of 2026-03-20 |
| react | 19.2.4 | UI runtime | Shipped with Next.js 16; React 19.2 stable |
| react-dom | 19.2.4 | DOM renderer | Paired with react |
| typescript | 5.9.3 | Type system | Locked decision; minimum for Next.js 16 is TS 5.1 |
| mongoose | 9.3.1 | MongoDB ODM with schema validation | Locked decision; latest stable as of 2026-03-17 |
| dexie | 4.3.0 | IndexedDB wrapper for client user data | Locked decision; latest stable as of 2025-12-20 |
| dexie-react-hooks | (ships with dexie 4) | useLiveQuery hook for React | Included in dexie package as of v4 |
| zustand | 5.0.12 | Client state management | Locked decision; latest stable as of 2026-03-16 |
| tailwindcss | 4.2.2 | Utility-first CSS | shadcn/ui v4 requirement; latest stable |
| shadcn (CLI) | 4.1.0 | Component scaffolding CLI | Locked decision; latest stable as of 2026-03-19 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.577.0 | Icons (shadcn default) | All icon usage — do not add a second icon library |
| class-variance-authority | 0.7.1 | Component variant management | Generated by shadcn components automatically |
| clsx | 2.1.1 | Conditional class names | Used internally by shadcn's cn() util |
| tailwind-merge | 3.5.0 | Merge Tailwind classes without conflicts | Used internally by shadcn's cn() util |
| tw-animate-css | latest | CSS animations (replaces tailwindcss-animate) | shadcn/ui v4 default — replaces tailwindcss-animate |
| @next/font | (bundled with next) | Font optimization via next/font/google | Loading Inter as per D-05 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dexie | idb, localforage | Dexie has TypeScript-first API, liveQuery, and schema versioning built-in |
| Zustand | Jotai, Redux Toolkit | Zustand is lightest-weight; domain-store pattern fits the decisions exactly |
| Mongoose | mongodb driver directly | Mongoose adds schema validation and the model registry which HMR protection depends on |
| shadcn/ui | Mantine, NextUI | shadcn is copy-owned — no external dependency on component versions; fits Tailwind-first approach |

**Installation:**

```bash
# 1. Bootstrap
npx create-next-app@latest rip-zone --yes
cd rip-zone

# 2. Database and state
npm install mongoose dexie dexie-react-hooks zustand

# 3. shadcn initialization (run interactively — see Architecture Patterns below)
npx shadcn@latest init

# 4. Animation support
npm install tw-animate-css
```

**Version verification (confirmed 2026-03-22 against npm registry):**

```bash
npm view next version        # 16.2.1 (2026-03-20)
npm view mongoose version    # 9.3.1  (2026-03-17)
npm view dexie version       # 4.3.0  (2025-12-20)
npm view zustand version     # 5.0.12 (2026-03-16)
npm view tailwindcss version # 4.2.2  (2026-03-18)
npm view shadcn version      # 4.1.0  (2026-03-19)
```

---

## Architecture Patterns

### Recommended Project Structure

```
rip-zone/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout — Inter font, dark background
│   │   ├── page.tsx              # Smoke-test page (Phase 1 only)
│   │   └── globals.css           # Tailwind base + shadcn CSS variable overrides
│   ├── lib/
│   │   ├── mongodb.ts            # Mongoose connection singleton (HMR-safe)
│   │   └── db/
│   │       ├── workouts.ts       # Dexie workout database (sessions, exercises, sets)
│   │       └── profile.ts        # Dexie profile database (bioMetrics, rankState)
│   ├── models/                   # Mongoose models (server-side only)
│   │   ├── Muscle.ts
│   │   ├── Exercise.ts
│   │   ├── WorkoutPlan.ts
│   │   └── FaqEntry.ts
│   ├── types/                    # TypeScript domain types
│   │   ├── branded.ts            # Brand<T, B> helper type
│   │   ├── muscle.ts             # MuscleId, MuscleSlug, MuscleGroup
│   │   ├── workout.ts            # WorkoutSession, SetLog, ExerciseLog
│   │   ├── ranking.ts            # TierRank enum, RankState
│   │   ├── strain.ts             # StrainLevel enum
│   │   └── bio.ts                # BioMetrics, BioMetricEntry
│   ├── stores/                   # Zustand domain stores
│   │   ├── useWorkoutStore.ts
│   │   ├── useMapStore.ts
│   │   ├── useRankStore.ts
│   │   └── useProfileStore.ts
│   └── components/
│       └── ui/                   # shadcn-generated components live here
├── scripts/
│   └── seed.ts                   # CLI seed script (npm run seed)
├── data/
│   ├── muscles.json
│   ├── exercises.json            # (or split by category — Claude's discretion)
│   ├── workout-plans.json
│   └── faq-entries.json
├── components.json               # shadcn configuration
├── next.config.ts
├── tsconfig.json
└── .env.local                    # MONGODB_URI (not committed)
```

**Note on src/ vs app/ convention:** create-next-app prompts for this. Using `src/` separates application code from config files at the root — recommended for larger projects like this one.

### Pattern 1: Mongoose Connection Singleton (HMR-Safe)

**What:** A global cached promise that prevents new connections on every hot-reload module re-evaluation.

**When to use:** In every server-side file that needs MongoDB access. Import `connectToDatabase` and await it before any Mongoose operation.

**Critical detail:** `mongoose` is on Next.js 16's automatic `serverExternalPackages` allowlist — no manual `next.config.ts` configuration needed for basic usage. (Verified: [serverExternalPackages docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages))

```typescript
// src/lib/mongodb.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined')
}

// Cache on global to survive HMR module re-evaluation in development
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}

const cached = global._mongooseCache ?? (global._mongooseCache = { conn: null, promise: null })

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m)
  }

  cached.conn = await cached.promise
  return cached.conn
}
```

### Pattern 2: Mongoose Model Registration (HMR-Safe)

**What:** Checks `mongoose.models` before calling `mongoose.model()` to prevent the "Cannot overwrite model once compiled" error during hot reloads.

**When to use:** Every Mongoose model file.

```typescript
// src/models/Muscle.ts
import mongoose, { Schema, InferSchemaType } from 'mongoose'

const MuscleSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  group: { type: String, required: true },
  svgRegion: { type: String, required: true },
})

export type MuscleDocument = InferSchemaType<typeof MuscleSchema>

// HMR guard — prevent "Cannot overwrite model" error
const Muscle = mongoose.models.Muscle ?? mongoose.model('Muscle', MuscleSchema)
export default Muscle
```

### Pattern 3: Dexie Split-Database (TypeScript Class API)

**What:** Two separate Dexie databases with typed table definitions using the class-extends pattern. Split databases have independent versioning — a workout schema change does not require a profile migration.

**When to use:** All client-side user data persistence.

**SSR note:** Dexie uses IndexedDB which only exists in the browser. Guard against SSR with `typeof window !== 'undefined'` checks or `'use client'` directive on any component that calls Dexie directly. As of Dexie 4, `useLiveQuery` handles SSR gracefully (returns `undefined` on server, populates on client) — no hacks needed.

```typescript
// src/lib/db/workouts.ts
import Dexie, { type EntityTable } from 'dexie'

export interface WorkoutSession {
  id: string       // UUID, primary key
  startedAt: number
  completedAt: number | null
  planId: string | null
}

export interface ExerciseInSession {
  id: string
  sessionId: string   // FK → WorkoutSession.id
  exerciseSlug: string
  orderIndex: number
}

export interface SetLog {
  id: string
  exerciseInSessionId: string  // FK → ExerciseInSession.id
  setNumber: number
  reps: number
  weightKg: number
  completedAt: number
}

export class WorkoutsDatabase extends Dexie {
  sessions!: EntityTable<WorkoutSession, 'id'>
  exercisesInSession!: EntityTable<ExerciseInSession, 'id'>
  sets!: EntityTable<SetLog, 'id'>

  constructor() {
    super('rip-zone-workouts')
    this.version(1).stores({
      sessions: 'id, startedAt, completedAt, planId',
      exercisesInSession: 'id, sessionId, exerciseSlug, orderIndex',
      sets: 'id, exerciseInSessionId, completedAt',
    })
  }
}

export const workoutsDb = new WorkoutsDatabase()
```

```typescript
// src/lib/db/profile.ts
import Dexie, { type EntityTable } from 'dexie'

export interface BioMetricEntry {
  id: string
  recordedAt: number
  heightCm: number | null
  weightKg: number | null
  ageYears: number | null
  gender: string | null
  bodyFatPct: number | null
}

export interface RankState {
  id: 'singleton'   // single record
  tier: string
  subTierProgress: number
  lastUpdatedAt: number
}

export class ProfileDatabase extends Dexie {
  bioMetrics!: EntityTable<BioMetricEntry, 'id'>
  rankState!: EntityTable<RankState, 'id'>

  constructor() {
    super('rip-zone-profile')
    this.version(1).stores({
      bioMetrics: 'id, recordedAt',
      rankState: 'id',
    })
  }
}

export const profileDb = new ProfileDatabase()
```

### Pattern 4: TypeScript Branded Types

**What:** Zero-runtime-overhead compile-time type safety for domain IDs. Prevents accidentally passing a `MuscleId` where a `WorkoutSessionId` is expected.

**When to use:** All domain identifier types.

```typescript
// src/types/branded.ts
declare const __brand: unique symbol
export type Brand<T, B extends string> = T & { [__brand]: B }

// src/types/muscle.ts
import { Brand } from './branded'

export type MuscleId = Brand<string, 'MuscleId'>
export type MuscleSlug = Brand<string, 'MuscleSlug'>

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'arms'
  | 'core' | 'legs' | 'glutes' | 'calves'

export interface Muscle {
  id: MuscleId
  slug: MuscleSlug
  displayName: string
  group: MuscleGroup
  svgRegion: string
}

// src/types/ranking.ts
export enum TierRank {
  Iron = 'Iron',
  Bronze = 'Bronze',
  Silver = 'Silver',
  Gold = 'Gold',
  Platinum = 'Platinum',
  Diamond = 'Diamond',
  Elite = 'Elite',
}

// src/types/strain.ts
export enum StrainLevel {
  Rested = 'Rested',
  Light = 'Light',
  Moderate = 'Moderate',
  Heavy = 'Heavy',
  Strained = 'Strained',
}
```

### Pattern 5: Zustand Domain Store

**What:** Lightweight domain-scoped store with explicit Dexie sync functions. No persist middleware — all persistence is manual per D-19.

**When to use:** One store file per domain. Phase 1 creates the store shells; later phases fill in actions.

```typescript
// src/stores/useWorkoutStore.ts
import { create } from 'zustand'
import type { WorkoutSession } from '@/lib/db/workouts'

interface WorkoutState {
  activeSession: WorkoutSession | null
  setActiveSession: (session: WorkoutSession | null) => void
  // Sync functions call Dexie directly — no middleware
  loadActiveSession: () => Promise<void>
  saveActiveSession: (session: WorkoutSession) => Promise<void>
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),
  loadActiveSession: async () => {
    // Import Dexie db here to keep this module client-only at runtime
    const { workoutsDb } = await import('@/lib/db/workouts')
    const sessions = await workoutsDb.sessions
      .orderBy('startedAt')
      .last()
    set({ activeSession: sessions ?? null })
  },
  saveActiveSession: async (session) => {
    const { workoutsDb } = await import('@/lib/db/workouts')
    await workoutsDb.sessions.put(session)
    set({ activeSession: session })
  },
}))
```

### Pattern 6: Seed Script

**What:** Standalone Node.js/TypeScript CLI script that runs outside Next.js, connects to MongoDB, clears existing documents, and inserts seed data from JSON files.

**When to use:** `npm run seed` — run once on setup, re-run to refresh data.

```typescript
// scripts/seed.ts
import mongoose from 'mongoose'
import musclesData from '../data/muscles.json'
import exercisesData from '../data/exercises.json'
// ... other imports

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')

  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  // Import models (they register themselves)
  const { default: Muscle } = await import('../src/models/Muscle')
  const { default: Exercise } = await import('../src/models/Exercise')

  // Clear and re-seed
  await Muscle.deleteMany({})
  await Muscle.insertMany(musclesData)
  console.log(`Seeded ${musclesData.length} muscles`)

  await Exercise.deleteMany({})
  await Exercise.insertMany(exercisesData)
  console.log(`Seeded ${exercisesData.length} exercises`)

  await mongoose.disconnect()
  console.log('Seeding complete')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

```json
// package.json (add to scripts)
{
  "scripts": {
    "seed": "npx tsx scripts/seed.ts"
  }
}
```

**Note:** Use `tsx` (not `ts-node`) to run the seed script. `tsx` works out of the box with ESM and the project's tsconfig.

### Anti-Patterns to Avoid

- **Calling `mongoose.model()` unconditionally:** Always guard with `mongoose.models.X ?? mongoose.model('X', Schema)` in every model file.
- **Importing Dexie in server components or Route Handlers:** Dexie uses IndexedDB — browser-only. Any file that imports Dexie must either be a `'use client'` component or a client-side module.
- **Using `serverComponentsExternalPackages` for Mongoose:** This was renamed to `serverExternalPackages` in Next.js 15 and is stable. Mongoose is already on the auto-exempt list — no manual configuration needed in Next.js 16.
- **Using `middleware.ts` for request interception:** Renamed to `proxy.ts` in Next.js 16. `middleware.ts` still works but is deprecated.
- **Persisting computed values (strain %, PR flags) to Dexie:** D-11 requires all derived data to be computed at read time from raw logs. Never store a `strainPercent` field.
- **Using Zustand's persist middleware:** D-19 explicitly requires manual sync. Do not use `persist()` from `zustand/middleware`.
- **Nesting sets inside sessions in Dexie:** D-10 requires separate relational tables. Never use a `sets: SetLog[]` array field inside `WorkoutSession`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB schema versioning | Custom migration runner | Dexie's `.version(N).upgrade()` | Handles partial upgrades, rollback, concurrent open tabs |
| MongoDB connection pooling | Manual connection logic | Mongoose (global cached promise pattern) | Mongoose manages pool sizing, reconnect backoff, and event handling |
| Component primitives (dialogs, dropdowns) | Custom modal/popover | shadcn/ui + Radix UI | Accessibility (focus trap, ARIA), keyboard nav are non-trivial |
| TypeScript enum → string conversion | Switch statements | TypeScript enums (D-17) | Compile-time exhaustiveness checking on switch; zero runtime overhead |
| CSS-in-JS theming | Runtime theme injection | Tailwind CSS v4 CSS variables in globals.css | Static CSS, no runtime overhead, integrates with shadcn token system |
| Font loading | `<link>` tags | `next/font/google` | Automatic font subsetting, zero layout shift (CLS), self-hosted |

**Key insight:** In this phase the "don't hand-roll" concern is mostly about Dexie migrations and Mongoose connection management. Both have well-tested built-in solutions that handle edge cases (interrupted upgrades, concurrent tabs, reconnect) that a hand-rolled solution would miss.

---

## Common Pitfalls

### Pitfall 1: "Cannot overwrite model once compiled" on Hot Reload

**What goes wrong:** Calling `mongoose.model('Muscle', MuscleSchema)` unconditionally causes an error on the second hot-reload because the model is already registered in `mongoose.models`.

**Why it happens:** Next.js Turbopack re-evaluates module files on change. The Mongoose model registry is on the process object, not the module, so it persists across hot reloads.

**How to avoid:** Always use `mongoose.models.Muscle ?? mongoose.model('Muscle', MuscleSchema)` — the `??` operator checks the registry first.

**Warning signs:** `OverwriteModelError` or `MongooseError: Cannot overwrite model once compiled` in the dev server console.

### Pitfall 2: Importing Dexie in Server Components

**What goes wrong:** A Server Component that imports from `@/lib/db/workouts.ts` will fail at build time with `ReferenceError: indexedDB is not defined`.

**Why it happens:** IndexedDB is a browser API. Server Components run in Node.js where it does not exist.

**How to avoid:** Any file that instantiates a Dexie database must be used only in `'use client'` components, or dynamically imported with `ssr: false` using Next.js's `dynamic()`.

**Warning signs:** Build error mentioning `indexedDB` or `IDBDatabase`.

### Pitfall 3: Tailwind v4 — No `tailwind.config.ts` (CSS-First Configuration)

**What goes wrong:** Attempting to add custom colors or theme tokens in `tailwind.config.ts` the way Tailwind v3 worked. In v4, the config file is minimal or absent — theme configuration is done in CSS via `@theme` directive.

**Why it happens:** Tailwind v4 shifted to a CSS-first configuration model. The `tailwind.config.ts` file is still supported for backward compatibility but is no longer where theme tokens live.

**How to avoid:** Define all custom design tokens in `globals.css` under `@layer base` using CSS variables. shadcn's `init` command creates the correct structure — then override the CSS variable values with the neon palette from UI-SPEC.md.

**Warning signs:** Custom colors work in the config file during dev but disappear in production, or shadcn theme variables don't reflect your overrides.

### Pitfall 4: shadcn v4 Uses OKLCH, Not HSL

**What goes wrong:** Manually setting CSS variables using hex values (e.g., `--primary: #00e5ff`) causes shadcn components to lose transparency/opacity variants.

**Why it happens:** shadcn/ui v4 with Tailwind v4 uses OKLCH color format. The color utilities apply opacity via the channel syntax (e.g., `oklch(var(--primary) / 50%)`). Hex values break this opacity composition.

**How to avoid:** Convert all palette colors from the UI-SPEC to OKLCH format before writing them into globals.css. Use an online converter (e.g., oklch.com).

| UI-SPEC Color | Hex | OKLCH equivalent (approximate) |
|--------------|-----|--------------------------------|
| Background | `#0a0a0f` | `oklch(0.07 0.01 265)` |
| Card | `#13131f` | `oklch(0.10 0.02 265)` |
| Primary (cyan) | `#00e5ff` | `oklch(0.85 0.18 195)` |
| Secondary (purple) | `#a855f7` | `oklch(0.60 0.25 290)` |
| Border | `#1e1e2e` | `oklch(0.15 0.03 265)` |
| Muted fg | `#6b7280` | `oklch(0.50 0.02 250)` |
| Foreground | `#f0f0f5` | `oklch(0.95 0.01 270)` |

**Warning signs:** shadcn components render without opacity modifiers; `text-primary/50` applies full opacity instead of 50%.

### Pitfall 5: Turbopack Does Not Support `webpack()` Config

**What goes wrong:** Adding `webpack(config) { config.module.rules.push(...svgr...) }` in `next.config.ts` has no effect with Turbopack.

**Why it happens:** Turbopack is a separate bundler that ignores the `webpack()` function. This is the source of the SVGR + Turbopack concern noted in STATE.md for Phase 2.

**How to avoid for Phase 1:** No SVGR is needed in Phase 1 — this is not a blocker. For Phase 2, use the Turbopack-native loader config under the `turbopack.rules` key:

```typescript
// next.config.ts — Phase 2 preparation note (not needed for Phase 1)
turbopack: {
  rules: {
    '*.svg': {
      loaders: ['@svgr/webpack'],
      as: '*.js',
    },
  },
},
```

**Warning signs:** SVG imports return a URL object instead of a React component, or build fails with "Unknown file extension .svg".

### Pitfall 6: Zustand 5 Removed Custom Equality Function from `create`

**What goes wrong:** Using `useWorkoutStore(selector, shallow)` — the second argument was removed in Zustand v5.

**Why it happens:** Zustand 5 is a breaking release from v4. The equality function parameter was removed from the default `create`.

**How to avoid:** Use `useShallow` from `zustand/react/shallow` for shallow comparisons, or `createWithEqualityFn` if custom equality is needed.

```typescript
import { useShallow } from 'zustand/react/shallow'
const { x, y } = useWorkoutStore(useShallow((s) => ({ x: s.x, y: s.y })))
```

**Warning signs:** TypeScript error "Expected 1 arguments, but got 2" when calling a store with a second argument.

### Pitfall 7: MongoDB Is Not Available Locally — Atlas Required

**What goes wrong:** `npm run dev` or `npm run seed` fails to connect because MongoDB is not installed on this machine.

**Why it happens:** Neither `mongod` nor Docker is available in this development environment (verified 2026-03-22). MongoDB must be accessed via MongoDB Atlas (free tier M0) or another remote instance.

**How to avoid:** Create a free Atlas cluster, add `MONGODB_URI` to `.env.local`, and whitelist the development machine's IP. The seed script and Next.js server will connect to Atlas.

**Warning signs:** `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017` on first run.

---

## Code Examples

### Mongoose Seed Script Runner (tsx)

```typescript
// package.json
{
  "scripts": {
    "seed": "npx tsx scripts/seed.ts"
  }
}
```

### shadcn init Sequence

```bash
# Run from project root after create-next-app
npx shadcn@latest init
# Prompts:
#   Which style would you like to use? → Default
#   Which color would you like to use as the base color? → Slate (then override in globals.css)
#   Would you like to use CSS variables for theming? → Yes

# Add components needed for Phase 1 smoke-test
npx shadcn@latest add button badge
```

### globals.css — Dark Neon Override (after shadcn init)

```css
/* src/app/globals.css */
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-card: var(--card);
  --color-border: var(--border);
  --color-muted-foreground: var(--muted-foreground);
  --color-destructive: var(--destructive);
}

/* Dark mode only — override shadcn defaults with neon palette */
:root {
  --background: oklch(0.07 0.01 265);
  --foreground: oklch(0.95 0.01 270);
  --card: oklch(0.10 0.02 265);
  --card-foreground: oklch(0.95 0.01 270);
  --primary: oklch(0.85 0.18 195);        /* #00e5ff cyan */
  --primary-foreground: oklch(0.07 0.01 265);
  --secondary: oklch(0.60 0.25 290);      /* #a855f7 purple */
  --secondary-foreground: oklch(0.95 0.01 270);
  --border: oklch(0.15 0.03 265);
  --muted: oklch(0.12 0.02 265);
  --muted-foreground: oklch(0.50 0.02 250);
  --destructive: oklch(0.60 0.20 25);     /* #ef4444 red */
  --radius: 0.5rem;
}
```

### next.config.ts — Minimal for Phase 1

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Turbopack is the default in Next.js 16 — no opt-in needed
  // mongoose is auto-exempt from serverExternalPackages — no manual config needed
}

export default nextConfig
```

### Root Layout with Inter Font

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Rip Zone',
  description: 'Track your workouts and visualize muscle strain',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `experimental.turbopack: true` in config | Turbopack is default — no config needed | Next.js 16.0 (Oct 2025) | New projects use Turbopack by default; opt-out with `--webpack` flag |
| `experimental.turbopack` key | Top-level `turbopack` key | Next.js 16.0 | `experimental.turbopack` is removed in v16 |
| `middleware.ts` | `proxy.ts` (deprecated, still works) | Next.js 16.0 | Rename if creating new middleware; old name still functions |
| `serverComponentsExternalPackages` | `serverExternalPackages` (stable) | Next.js 15.0 | Moved out of experimental; mongoose auto-listed |
| Tailwind config-based theming | CSS `@theme` directive in globals.css | Tailwind v4 | No `tailwind.config.ts` needed for color tokens |
| HSL CSS variables in shadcn | OKLCH CSS variables | shadcn/ui + Tailwind v4 | Must use OKLCH or opacity utilities break |
| `tailwindcss-animate` | `tw-animate-css` | shadcn/ui (Tailwind v4 migration) | Old package deprecated; new projects install `tw-animate-css` |
| Zustand `create(selector, equalityFn)` | `useShallow()` hook | Zustand v5 | Second arg to store hook removed; use `useShallow` from `zustand/react/shallow` |
| Zustand v4 `create` import | Same, but `use-sync-external-store` is now peer dep | Zustand v5 | React 18+ required; no action needed for new projects |
| `dexie-react-hooks` separate install | Included in `dexie` package | Dexie v4 | `useLiveQuery` now in core package; no separate install |

**Deprecated/outdated:**
- `tailwindcss-animate`: Replaced by `tw-animate-css` in shadcn/ui v4 projects
- `serverComponentsExternalPackages`: Renamed; do not use this key in Next.js 16
- `experimental.turbopack`: Removed in Next.js 16; no config needed
- `middleware.ts`: Deprecated in Next.js 16; use `proxy.ts` for new middleware

---

## Open Questions

1. **MongoDB Atlas vs local — team setup**
   - What we know: No local MongoDB is available in this environment. Atlas free tier (M0) works.
   - What's unclear: If other contributors join, they each need their own Atlas cluster or shared access to one.
   - Recommendation: Document in README that `MONGODB_URI` must be set in `.env.local` pointing to Atlas. Add `.env.local.example` with a placeholder.

2. **@svgr/webpack + Turbopack for Phase 2**
   - What we know: Turbopack supports webpack loaders via `turbopack.rules`. @svgr/webpack v8 should work under this config. STATE.md flagged this as unconfirmed.
   - What's unclear: Whether @svgr/webpack's transform of SVG → React component is fully compatible with Turbopack's subset of the webpack loader API.
   - Recommendation: Add a SVGR smoke-test as the first task of Phase 2, not Phase 1. Phase 1 requires no SVG imports.

3. **Seed data file organization (Claude's Discretion)**
   - What we know: D-06 leaves this to Claude's discretion. Options: one flat `exercises.json` (100+ entries, ~150KB) vs split by category (e.g., `exercises-chest.json`, `exercises-back.json`).
   - Recommendation: **Single flat file** for Phase 1. Easier to import in the seed script; categories are a query concern, not a file concern. If the file grows beyond 500KB in future milestones, split then.

4. **OKLCH hex conversions are approximate**
   - What we know: The OKLCH values in Pitfall 4 table were approximated. The exact perceptual match may vary slightly.
   - Recommendation: Use an OKLCH converter (oklch.com or oklch-picker in browser devtools) to dial in exact values during implementation. The approximations in this document are close enough to proceed.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All npm scripts | Yes | v20.20.1 | — |
| npm | Package installation | Yes | 10.8.2 | — |
| MongoDB (local) | Seed script, Next.js server | No | — | MongoDB Atlas free tier (M0) |
| Docker | Alternative MongoDB host | No | — | MongoDB Atlas free tier (M0) |
| mongosh | Database inspection | No | — | MongoDB Atlas web UI or Compass |

**Missing dependencies with no fallback:**
- None — Atlas provides a sufficient fallback for all MongoDB operations.

**Missing dependencies with fallback:**
- `mongod` (local MongoDB): Use MongoDB Atlas M0 free tier. Create cluster at cloud.mongodb.com, set `MONGODB_URI` in `.env.local`. The seed script and Next.js both read from this env var.
- `docker`/`docker-compose`: Atlas eliminates this need entirely for this project's use case.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` — does not exist yet (Wave 0 gap) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

**Rationale for Vitest over Jest:** Vitest is the current standard for Next.js + TypeScript projects as of 2026. It uses the same ESM semantics as the project and has first-class `@testing-library/react` support. No babel config needed.

### Phase 1 Requirements → Test Map

Phase 1 has no user-facing requirements (it is an infrastructure phase). Tests cover the 5 success criteria defined in ROADMAP.md:

| ID | Behavior | Test Type | Automated Command | File Exists? |
|----|----------|-----------|-------------------|-------------|
| SC-1 | Next.js dev server starts without console errors | smoke (manual) | manual — `npm run dev`, visual check | N/A |
| SC-2 | MongoDB connection singleton does not accumulate connections on HMR | unit | `npx vitest run tests/lib/mongodb.test.ts` | Wave 0 |
| SC-3 | Dexie databases initialize with correct schema | unit | `npx vitest run tests/lib/db/workouts.test.ts tests/lib/db/profile.test.ts` | Wave 0 |
| SC-4 | Seed script loads data without errors | integration | `npx tsx scripts/seed.ts` (script exit code check) | Wave 0 (script) |
| SC-5 | All TypeScript domain types compile | compile-time | `npx tsc --noEmit` | Wave 0 (types file) |

**Note on SC-2:** Mongoose connection singleton behavior is hard to unit test in isolation. The practical test is: run `npm run dev`, edit a server file to trigger HMR, confirm no new MongoDB connections appear in Atlas monitoring. Document as manual verification step.

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (type compilation check)
- **Per wave merge:** `npx vitest run` (full suite)
- **Phase gate:** TypeScript compiles clean + all unit tests pass before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` — Vitest configuration with jsdom environment for React tests
- [ ] `tests/lib/db/workouts.test.ts` — Dexie WorkoutsDatabase schema initialization test
- [ ] `tests/lib/db/profile.test.ts` — Dexie ProfileDatabase schema initialization test
- [ ] `tests/types/branded.test-d.ts` — TypeScript branded type correctness (tsd or vitest type tests)
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/dom jsdom`

---

## Sources

### Primary (HIGH confidence)

- [Next.js 16 Official Blog Post](https://nextjs.org/blog/next-16) — Turbopack stable, breaking changes, proxy.ts, React 19.2
- [Next.js 16.2 Installation Docs](https://nextjs.org/docs/app/getting-started/installation) — create-next-app flow, project structure, version 16.2.1 verified
- [Next.js Turbopack API Reference](https://nextjs.org/docs/app/api-reference/turbopack) — loader config, webpack compatibility, SVGR pattern
- [Next.js serverExternalPackages docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages) — mongoose auto-listed, stable in v15+
- [Mongoose official Next.js guide](https://mongoosejs.com/docs/nextjs.html) — HMR model guard pattern, Edge Runtime warning
- [shadcn/ui Next.js installation](https://ui.shadcn.com/docs/installation/next) — shadcn@4.1.0 init command
- [shadcn/ui Tailwind v4 guide](https://ui.shadcn.com/docs/tailwind-v4) — OKLCH migration, tw-animate-css
- npm registry: next@16.2.1, mongoose@9.3.1, dexie@4.3.0, zustand@5.0.12, tailwindcss@4.2.2, shadcn@4.1.0, react@19.2.4 — all verified 2026-03-22

### Secondary (MEDIUM confidence)

- [Zustand v5 migration guide](https://zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5) — breaking changes, useShallow replacement
- [Dexie.js TypeScript docs](https://dexie.org/docs/Typescript) — class-extends pattern, EntityTable type
- [Dexie React/Next.js integration](https://dexie.org/docs/Tutorial/React) — useLiveQuery SSR handling
- [GitHub vercel/next.js discussion #43438](https://github.com/vercel/next.js/discussions/43438) — MongoDB singleton connection pattern
- [GitHub vercel/next.js discussion #17252](https://github.com/vercel/next.js/discussions/17252) — Mongoose "Cannot overwrite model" fix

### Tertiary (LOW confidence)

- OKLCH approximate conversions from hex palette — computed from training knowledge; verify with oklch.com during implementation
- Vitest as testing standard for 2026 Next.js projects — based on ecosystem observation, not a single authoritative source

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against live npm registry on 2026-03-22
- Architecture: HIGH — patterns verified against official Next.js, Mongoose, and shadcn docs
- Pitfalls: HIGH — HMR issues verified via official Mongoose docs and Next.js GitHub discussions; Tailwind/shadcn changes verified via official docs
- Environment: HIGH — directly probed with shell commands

**Research date:** 2026-03-22
**Valid until:** 2026-06-22 (90 days) — stable libraries, but Next.js has been releasing frequently; re-verify next version before starting next phase
