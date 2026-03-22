# Architecture Research

**Domain:** Fitness app with interactive body visualization (muscle map, workout tracker, ranking system)
**Researched:** 2026-03-22
**Confidence:** HIGH (SVG/visualization patterns), MEDIUM (MongoDB schema), HIGH (Next.js App Router patterns)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser (Client Layer)                        │
├──────────────────┬──────────────────┬──────────────────┬────────────┤
│   MuscleMap      │  WorkoutTracker  │    Rankings      │    FAQ     │
│   (SVG/Canvas)   │  (Log + Timer)   │  (Radar+Tiers)   │  (Static) │
│   [Client Comp]  │  [Client Comp]   │  [Client Comp]   │  [Server] │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴─────┬──────┘
         │                  │                   │               │
┌────────▼──────────────────▼───────────────────▼───────────────▼──────┐
│                    State Layer (Zustand + persist)                     │
│  workoutStore  │  muscleStrainStore  │  bioStore  │  rankingStore     │
│  (localStorage)│  (derived+cached)   │ (optional) │  (derived)       │
└────────────────────────────────────────────────────────────────────────┘
         │
┌────────▼──────────────────────────────────────────────────────────────┐
│                       Next.js App Router                               │
│  /app/page.tsx        →  Landing / MuscleMap view                     │
│  /app/workout/        →  Workout tracker routes                        │
│  /app/ranking/        →  Ranking + radar chart                        │
│  /app/faq/            →  Static FAQ pages                             │
│  /app/api/muscles/    →  Route Handler: muscle reference data         │
│  /app/api/exercises/  →  Route Handler: exercise reference data       │
│  /app/api/faq/        →  Route Handler: FAQ content                   │
└────────────────────────────────────────────────────────────────────────┘
         │
┌────────▼──────────────────────────────────────────────────────────────┐
│                       Data Layer                                       │
│  MongoDB (reference data)          │  localStorage (user data)        │
│  ┌─────────────────┐               │  ┌──────────────────────────┐   │
│  │  muscles        │               │  │  workoutLogs             │   │
│  │  exercises      │               │  │  bioMetrics              │   │
│  │  workoutPlans   │               │  │  rankingState            │   │
│  │  faqContent     │               │  └──────────────────────────┘   │
│  └─────────────────┘               │                                  │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| MuscleMapViewer | Renders SVG front/back body views, applies heatmap color overlay based on strain state | muscleStrainStore (reads strain data), exercises API (on click) |
| MuscleStrainEngine | Calculates per-muscle fatigue percentage from workout log; updates on every log entry | workoutStore (reads logs), muscleStrainStore (writes derived state) |
| WorkoutLogger | Freestyle exercise logging — exercise picker, set/rep/weight input, rest timer | workoutStore (writes), exercises API (for exercise lookup) |
| WorkoutPlanRunner | Step-by-step plan execution; shows current exercise, set, rest prompt | workoutPlans API, workoutStore (writes on completion) |
| RankingEngine | Derives tier and radar chart data from accumulated workout logs + optional bio | workoutStore (reads), bioStore (reads optionally), rankingStore (writes) |
| RadarChart | Renders multi-axis performance visualization (uses Recharts) | rankingStore (reads) |
| FAQBrowser | Displays categorized FAQ content with search; server-rendered | faq API / static JSON (reads) |
| BioCollector | Optional form for height/weight/age/gender/body fat; rewards for completion | bioStore (writes) |
| RestTimer | Countdown component used inside WorkoutLogger | Local state only |

## Recommended Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing / muscle map entry
│   ├── layout.tsx                # Root layout, Zustand hydration wrapper
│   ├── workout/
│   │   ├── page.tsx              # Freestyle workout logger
│   │   └── plan/
│   │       └── [planId]/
│   │           └── page.tsx      # Step-by-step plan runner
│   ├── ranking/
│   │   └── page.tsx              # Radar chart + tier display
│   ├── faq/
│   │   ├── page.tsx              # FAQ index
│   │   └── [slug]/
│   │       └── page.tsx          # Individual FAQ article
│   └── api/
│       ├── muscles/
│       │   └── route.ts          # GET all muscles + metadata
│       ├── exercises/
│       │   ├── route.ts          # GET exercise list
│       │   └── [muscleSlug]/
│       │       └── route.ts      # GET exercises targeting a muscle
│       ├── workout-plans/
│       │   └── route.ts          # GET pre-built plans
│       └── faq/
│           └── route.ts          # GET FAQ content
│
├── components/
│   ├── muscle-map/
│   │   ├── MuscleMapViewer.tsx   # Main SVG body viewer component
│   │   ├── MuscleHeatmap.tsx     # Applies strain color overlay
│   │   ├── BodyView.tsx          # Front/back toggle wrapper
│   │   └── MuscleDetail.tsx      # Slide-out panel: exercises for clicked muscle
│   ├── workout/
│   │   ├── WorkoutLogger.tsx     # Freestyle log entry form
│   │   ├── ExercisePicker.tsx    # Searchable exercise selector
│   │   ├── SetRow.tsx            # One set: reps + weight input
│   │   ├── RestTimer.tsx         # Countdown timer
│   │   └── WorkoutPlanRunner.tsx # Step-by-step plan UI
│   ├── ranking/
│   │   ├── RadarChart.tsx        # Recharts radar chart
│   │   ├── TierBadge.tsx         # Iron/Bronze/.../Elite badge
│   │   └── RankingBreakdown.tsx  # Shows score per axis
│   ├── faq/
│   │   ├── FAQList.tsx           # Category + article list
│   │   └── FAQArticle.tsx        # Article content renderer
│   ├── bio/
│   │   └── BioCollector.tsx      # Optional bio form
│   └── ui/                       # Shared primitives (buttons, cards, etc.)
│
├── stores/                        # Zustand stores (all with persist middleware)
│   ├── workout.store.ts           # Workout logs array
│   ├── bio.store.ts               # Optional bio metrics
│   ├── muscle-strain.store.ts     # Derived muscle fatigue state
│   └── ranking.store.ts           # Derived tier + radar data
│
├── lib/
│   ├── muscle-strain-engine.ts    # Fatigue % calculation from workout logs
│   ├── ranking-engine.ts          # Tier + radar score formulas
│   ├── mongodb.ts                 # MongoDB connection singleton
│   └── constants.ts               # Tier thresholds, muscle slugs, etc.
│
├── data/                          # Static seed data / fallback JSON
│   ├── muscles.json               # All muscle definitions + metadata
│   ├── exercises.json             # Exercise library with muscle targeting
│   ├── workout-plans.json         # Pre-built plan definitions
│   └── faq.json                   # FAQ content (bilingual or Arabic sections)
│
└── types/
    ├── muscle.types.ts            # Muscle, StrainState, MuscleSlug
    ├── workout.types.ts           # WorkoutLog, Exercise, Set
    ├── ranking.types.ts           # RankTier, RadarAxes, StrengthScore
    └── bio.types.ts               # BioMetrics (all optional)
```

### Structure Rationale

- **stores/:** Zustand stores are colocated, not scattered. persist middleware handles localStorage automatically. Hydration wrapper in root layout solves Next.js SSR mismatch.
- **lib/:** Pure business logic (engine functions) lives here, not inside components or stores. This makes strain calculations and ranking formulas testable in isolation.
- **data/:** Static JSON files serve as the source of truth for reference data. API routes serve these files to clients. This avoids shipping a cold MongoDB read on every page load for data that never changes between deployments.
- **app/api/:** Route Handlers wrap data access. Muscle map and exercises read from MongoDB (seeded from data/ JSON). User workout logs never leave the browser.

## Architectural Patterns

### Pattern 1: Derived State for Muscle Strain

**What:** Muscle strain state is never stored directly — it is derived on demand from the raw workout log, then cached in a Zustand store slice.
**When to use:** Any time display state is a function of user data (heatmap colors, radar axes, tier level). Keeps the workout log as the single source of truth.
**Trade-offs:** Re-derivation can be expensive if the log is long. Memoize the engine call using useMemo or debounce the store update on log writes.

```typescript
// lib/muscle-strain-engine.ts
export function computeStrainState(logs: WorkoutLog[]): Record<MuscleSlug, number> {
  const now = Date.now();
  const strain: Record<MuscleSlug, number> = {};
  // For each log entry within recovery window (default 6 days):
  // accumulate volume per muscle slug, map to 0-100 fatigue %
  // Decay linearly: full fatigue decays to 0 over RECOVERY_DAYS
  return strain;
}
```

### Pattern 2: Static Reference Data via API Route + MongoDB Seed

**What:** Muscles, exercises, and FAQ content live in MongoDB seeded once from JSON. API routes serve them as read-only. Client components fetch once on mount and cache in React state.
**When to use:** Data that changes between deployments (admin can update FAQ/exercises) but doesn't change per user request.
**Trade-offs:** Adds MongoDB dependency for what is essentially static content. Alternative is to import JSON directly in Server Components — simpler but harder to update without redeployment. For v1, direct JSON import in Server Components is acceptable.

```typescript
// app/api/exercises/[muscleSlug]/route.ts
export async function GET(req: Request, { params }: { params: { muscleSlug: string } }) {
  const db = await connectMongo();
  const exercises = await db.collection('exercises')
    .find({ muscles: params.muscleSlug })
    .toArray();
  return Response.json(exercises);
}
```

### Pattern 3: localStorage-First with Zustand persist

**What:** All user-generated data (workout logs, bio metrics) lives in localStorage via Zustand's persist middleware. MongoDB is only for reference/content data.
**When to use:** No-auth v1 where users should not need to create an account to use the app.
**Trade-offs:** Data is device-local. User loses data on browser clear. No cross-device sync. Acceptable for v1 — plan for export/import or account migration in a future milestone.

```typescript
// stores/workout.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWorkoutStore = create(
  persist<WorkoutState>(
    (set) => ({
      logs: [],
      addLog: (log) => set((s) => ({ logs: [...s.logs, log] })),
    }),
    { name: 'rip-zone-workouts' }
  )
);
```

### Pattern 4: SVG Muscle Map with Intensity-Mapped Colors

**What:** The muscle map is an SVG body illustration where each muscle region is a separate `<path>` element with a unique `id`. A color-mapping layer reads strain percentages and applies fill colors (opacity or hue shift) to each path.
**When to use:** 2.5D illustrated maps — keep as SVG, not canvas. SVG paths are CSS-styleable, accessible, and clickable without a rendering library.
**Trade-offs:** SVG with 50+ interactive paths can be verbose. Custom SVG with named paths is the most flexible approach. Libraries like react-body-highlighter cover ~20 muscle groups but may not include rare muscles required by the spec.

```typescript
// components/muscle-map/MuscleHeatmap.tsx
const strainToColor = (fatigue: number): string => {
  // fatigue: 0-100
  // 0 = rested: #4CAF50 (green)
  // 50 = moderate: #FFC107 (amber)
  // 100 = overworked: #F44336 (red)
  const hue = (1 - fatigue / 100) * 120; // 120 = green, 0 = red
  return `hsl(${hue}, 80%, 50%)`;
};
```

## Data Flow

### Workout Logging → Muscle Heatmap Update

```
User logs exercise (exercise + sets/reps/weight)
    ↓
WorkoutLogger → workoutStore.addLog(entry)
    ↓ (Zustand persist → localStorage write)
muscleStrainStore.recompute()
    ↓ calls computeStrainState(logs)
    ↓ maps workoutLog exercises → target muscles → volume sum
    ↓ applies time decay (6-day recovery window)
    → strain: Record<MuscleSlug, 0-100>
    ↓
MuscleMapViewer reads strain state
    ↓
MuscleHeatmap maps strain % → fill color per SVG path
    ↓
User sees muscle lit up on body map
```

### Muscle Click → Exercise Detail Panel

```
User clicks SVG muscle path
    ↓
onBodyPartPress(muscleSlug)
    ↓
MuscleDetail panel opens
    ↓ fetch /api/exercises/[muscleSlug]
    → exercises targeting that muscle
    → warm-up recommendations
    → intensity focus percentage
    → assisting muscles list
    ↓
Panel renders exercise cards
```

### Workout Log → Ranking Calculation

```
workoutStore (accumulated logs)
    ↓
rankingEngine.compute(logs, bioMetrics?)
    ↓
For each ranking axis (push, pull, legs, core, conditioning):
    1. Find all exercises in log mapped to that axis
    2. Calculate estimated 1RM (Epley formula: w × (1 + r/30))
    3. Normalize by bodyweight if bioMetrics available
    4. Map normalized score to tier threshold table
    ↓
radarAxes: { push: 72, pull: 65, legs: 80, core: 40, conditioning: 55 }
overallTier: 'Silver'
    ↓
RadarChart renders axes
TierBadge renders current tier
```

### Bio Metrics → Accuracy Enhancement

```
BioCollector (optional form)
    ↓ user fills height/weight/age/gender
bioStore.update(metrics)
    ↓ Zustand persist → localStorage
rankingEngine reads bioMetrics on next computation
    → enables bodyweight normalization
    → improves radar axis accuracy
    → unlocks "body composition" radar axis
MuscleStrainEngine may use body fat % to adjust recovery speed
```

### Key Data Flows Summary

1. **Reference data flow (one-way read):** MongoDB → API Routes → React Server Components or client fetch → rendered UI. Never mutated by users.
2. **User data flow (local only):** Component events → Zustand stores → localStorage. Never sent to server in v1.
3. **Derived state flow:** Zustand workout store change → strain engine → muscle strain store → SVG heatmap re-render. Computed on client.
4. **Ranking flow:** Zustand workout store + optional bio store → ranking engine → ranking store → radar chart + tier badge.

## MongoDB Collections (Reference Data Only)

### muscles collection
```typescript
{
  slug: string,              // e.g. "biceps", "anterior-deltoid"
  name: string,              // Display name
  group: string,             // e.g. "arms", "shoulders", "legs"
  view: "front" | "back" | "both",  // Which body view shows this muscle
  svgPathId: string,         // Matches the <path id> in the SVG asset
  recoveryDays: number,      // Baseline recovery time (v1 placeholder)
  assistsMuscles: string[],  // slugs of muscles this assists
}
```

### exercises collection
```typescript
{
  id: string,
  name: string,
  primaryMuscles: string[],   // muscle slugs
  secondaryMuscles: string[],
  equipment: string,
  instructions: string,
  warmupNotes?: string,       // Pre-training warm-up guidance
  intensityFocus: number,     // 0-100: how much this targets primary muscle
  rankingAxis: "push" | "pull" | "legs" | "core" | "conditioning",
}
```

### workout-plans collection
```typescript
{
  id: string,
  name: string,
  level: "beginner" | "intermediate" | "advanced",
  days: WorkoutDay[],         // Array of day plans
  targetMuscleGroups: string[],
}
```

### faq collection
```typescript
{
  slug: string,
  title: string,
  content: string,            // Markdown, may include Arabic sections
  category: string,           // e.g. "muscle-pain", "nutrition", "myths"
  tags: string[],
  arabicFriendly: boolean,    // Flags content with Egyptian gym culture context
}
```

## localStorage Schema (User Data)

```typescript
// Key: 'rip-zone-workouts'
{
  logs: Array<{
    id: string,
    date: number,               // Unix timestamp
    exercises: Array<{
      exerciseId: string,
      exerciseName: string,
      primaryMuscles: string[], // Denormalized for offline use
      sets: Array<{
        reps: number,
        weight: number,         // kg
        completed: boolean,
      }>
    }>
  }>
}

// Key: 'rip-zone-bio'
{
  height?: number,   // cm
  weight?: number,   // kg
  age?: number,
  gender?: "male" | "female",
  bodyFatPercent?: number,
  // muscle measurements if collected
}
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture is correct — localStorage, static MongoDB reference data, no auth. Ship as-is. |
| 1k-10k users | Add export/import feature for workout logs (JSON download). Consider optional account creation to sync across devices. |
| 10k+ users | Add user auth (NextAuth), migrate localStorage data to MongoDB user collections, add leaderboards using aggregated anonymous data. |

### Scaling Priorities

1. **First bottleneck:** localStorage data loss (device clear, browser, new device). Fix with optional account + cloud sync.
2. **Second bottleneck:** MongoDB reference data becomes stale (exercises/FAQ updated rarely). Add simple admin panel or direct DB seeding script.
3. **Third bottleneck:** SVG muscle map performance with many muscles (60+). Lazy-load the SVG, virtualize only visible view (front/back toggle).

## Anti-Patterns

### Anti-Pattern 1: Storing Derived State as Source of Truth

**What people do:** Save muscle strain percentages directly to localStorage alongside workout logs.
**Why it's wrong:** Creates two sources of truth. Changing the strain algorithm requires migrating stored state. Bugs cause permanent data corruption.
**Do this instead:** Store only the raw workout log. Compute strain state on demand from logs. Cache in memory (Zustand non-persisted slice).

### Anti-Pattern 2: Fetching Reference Data Inside Components on Every Render

**What people do:** Call `fetch('/api/exercises')` inside a `useEffect` in each component that needs exercises.
**Why it's wrong:** N parallel fetches on page load, no caching, waterfall on navigation.
**Do this instead:** Fetch reference data once in a Server Component (layout or page), pass as props or via React Context. Or use React Query for client-side caching with `staleTime: Infinity` for stable reference data.

### Anti-Pattern 3: Custom SVG Hitboxes Without ID Conventions

**What people do:** Create an SVG illustration with aesthetic layer naming. Path IDs are "Layer_12" or "path345".
**Why it's wrong:** Cannot map between SVG paths and muscle slugs programmatically. Every muscle requires hardcoded coordinate mappings.
**Do this instead:** Name every clickable SVG path with a slug matching the muscles collection. Convention: `<path id="muscle-biceps-left" ...>`. This makes the heatmap layer purely data-driven.

### Anti-Pattern 4: Putting All Workout State in React useState

**What people do:** Track workout log in component state, passed down through props.
**Why it's wrong:** Lost on page reload. Cannot be shared between the muscle map page and the ranking page without prop drilling or context plumbing.
**Do this instead:** Zustand store with persist middleware. Single source of truth for all user data, accessible from any component without prop drilling.

### Anti-Pattern 5: Tightly Coupling Ranking Formula to UI

**What people do:** Write the tier-calculation logic directly in the RadarChart component.
**Why it's wrong:** Formula changes require touching UI code. Cannot test ranking logic independently.
**Do this instead:** `lib/ranking-engine.ts` is a pure function: `(logs, bio) => RankingResult`. UI reads from rankingStore. Ranking store calls engine. Engine is unit-testable.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| SVG Asset ↔ MuscleMapViewer | SVG path IDs map to muscle slugs via muscles.json `svgPathId` field | The SVG is a static asset. Path IDs are the contract. Never rename path IDs after initial build. |
| WorkoutLogger ↔ MuscleStrainEngine | Via Zustand store subscription — log write triggers derived state recompute | Keep strain computation off the hot path. Debounce or batch updates. |
| RankingEngine ↔ RadarChart | rankingStore slice: `{ axes: RadarAxes, tier: RankTier }` | Engine is pure function, store is intermediate cache, chart is read-only consumer. |
| API Routes ↔ MongoDB | MongoDB connection singleton in `lib/mongodb.ts` | Use connection pooling. Don't create new connections per request. |
| BioStore ↔ RankingEngine | Optional: engine reads bio if present; falls back to non-normalized scores | Never gate ranking behind bio. Bio only improves accuracy. |

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| MongoDB Atlas | Server-side only via `lib/mongodb.ts` singleton | Connection string in env vars. Never expose to client. Read-only for reference data in v1. |
| SVG Illustration Asset | Static file in `/public/` or imported as React component | For 2.5D illustrated map: treat custom SVG as a component with named paths. Keep in `/public/svg/`. |
| Recharts (radar chart) | Client component import | Recharts is client-only. Wrap in a `"use client"` component. Do not import in Server Components. |

## Suggested Build Order

Based on component dependencies, the phases should follow this sequence:

1. **Data foundation** — Define TypeScript types, create muscle/exercise JSON seed data, set up MongoDB connection and seed script. Nothing else can work without the data contract.
2. **Static muscle map** — Render SVG body with all muscles as named paths. No interactivity yet. Establishes the SVG-to-slug mapping contract that all other features depend on.
3. **Workout logger** — Build the freestyle log entry form and Zustand store with localStorage persistence. This generates the workout logs that drive all derived features.
4. **Strain engine + heatmap** — Wire the muscle strain calculation to the workout store. Apply heatmap colors to the SVG paths. This is the hero feature — requires both the map (step 2) and the log (step 3).
5. **Exercise detail panel** — Add clickable muscle behavior. Fetch exercise references from API. Builds on the static map (step 2) and exercises data (step 1).
6. **Ranking system** — Build radar chart and tier badge from accumulated log data. Requires a populated workout log (step 3).
7. **Workout plans** — Step-by-step plan runner writes to the same workout log (step 3). Can be built after freestyle logging.
8. **FAQ** — Fully independent of user data. Can be built at any point; prioritize after core features.
9. **Bio metrics** — Optional enhancement layer. Builds on stores already established. Plugs into ranking engine.

## Sources

- [react-muscle-highlighter: SVG anatomy library data model](https://github.com/soroojshehryar/react-muscle-highlighter)
- [react-body-highlighter: muscle slugs and intensity mapping](https://github.com/giavinh79/react-body-highlighter)
- [MuscleSquad heatmap implementation reference](https://musclesquad.com/blogs/musclesquad-training-app/hits-and-heatmap)
- [Next.js App Router architecture (2026)](https://dev.to/teguh_coding/nextjs-app-router-the-patterns-that-actually-matter-in-2026-146)
- [Feature-Sliced Design + Next.js App Router guide](https://feature-sliced.design/blog/nextjs-app-router-guide)
- [Zustand persist middleware in Next.js](https://dev.to/abdulsamad/how-to-use-zustands-persist-middleware-in-nextjs-4lb5)
- [Fitbod muscle recovery algorithm reference](https://fitbod.me/blog/muscle-recovery/)
- [Strength score calculation: 1RM Epley formula and percentile ranking](https://strengthlevel.com/)
- [Fitness database schema design](https://www.geeksforgeeks.org/dbms/how-to-design-a-database-for-health-and-fitness-tracking-applications/)
- [MongoDB fitness tracker schema patterns](https://gist.github.com/GAFelton/df2a55136daf8b2aef22996f284bb673)
- [Recharts radar chart for React](https://ej2.syncfusion.com/react/documentation/chart/chart-types/radar)

---
*Architecture research for: Rip Zone — Fitness app with interactive 2.5D muscle map*
*Researched: 2026-03-22*
