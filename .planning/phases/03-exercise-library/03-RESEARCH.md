# Phase 3: Exercise Library - Research

**Researched:** 2026-03-23
**Domain:** Next.js 16 App Router (SSG + 'use cache'), React client-side filtering, shadcn/Base UI components, Mongoose seed data, bottom navigation shell
**Confidence:** HIGH

## Summary

Phase 3 builds on an already complete data foundation. The 110-exercise seed file (`data/exercises.json`) and Mongoose model exist; the Muscle model and 54-muscle seed file (`data/muscles.json`) provide grouping keys. The work is UI-heavy: a new `/exercises` route, a bottom nav shell that wraps both pages, client-side search and filter state, a two-level inline expand with a mini muscle map silhouette, a warm-up bottom sheet model and seed file, and deep-linkable URL query params.

The most important technical decision is the data loading strategy. Decision D-13 specifies SSG — reading `data/exercises.json` directly at build time, not via a database call. In Next.js 16 App Router this is trivially achieved by importing the JSON directly in a Server Component (no `fetch`, no `'use cache'` needed — the component is static by default because it has no dynamic inputs). The `'use cache'` directive requires `cacheComponents: true` in `next.config.ts` and is not currently configured; the simpler `export const dynamic = 'force-static'` or plain static import is sufficient.

The second key concern is the bottom navigation shell. D-06 introduces a 2-tab bottom nav (Map, Exercises) in this phase. This requires adding a shared layout wrapper — either a `src/app/layout.tsx` modification (risky, affects all pages) or a route group layout (`src/app/(main)/layout.tsx`) that wraps both the muscle map and exercises pages. The route group approach is the correct pattern: it avoids touching the root layout and allows the bottom nav to be added at the group level without affecting `src/app/api/`.

The primary recommendation is: import `data/exercises.json` directly in a Server Component for static generation, use a `(main)` route group layout for the bottom nav shell, and implement all filtering/search as pure client state initialized from URL search params on mount.

**Primary recommendation:** Use a `(main)` route group layout for the bottom nav shell, import exercise/muscle JSON directly for SSG, and handle all search/filter/expand state client-side in a single `ExerciseLibrary` client component.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Exercises grouped by muscle group (Chest, Back, Shoulders, Arms, Forearms, Core, Legs, Glutes, Calves) with collapsible sections
- **D-02:** Card-based list items showing exercise name, equipment, difficulty, primary muscles, and a 1-line description excerpt
- **D-03:** Equipment + difficulty filter chips alongside search — 8 equipment types and 3 difficulty levels from existing seed data
- **D-04:** Sticky search bar pinned at top of page with instant filter-as-you-type — muscle group sections collapse/expand to show matches, no submit button
- **D-05:** Dedicated `/exercises` page — separate route, not embedded in muscle map page
- **D-06:** Bottom navigation bar introduced in this phase with 2 tabs (Map, Exercises) — sets the pattern for Phase 4+ to add more tabs. Bottom nav on mobile, tab nav on desktop (per Phase 1 D-02)
- **D-07:** URL query param deep-linking supported — `?muscle=slug`, `?equipment=barbell`, `?q=bench`
- **D-08:** Two-level inline expand on tap: Level 1 (essentials — name, description, primary muscles), Level 2 ("More" button — full details, secondary muscles, equipment, difficulty, plus mini muscle map silhouette)
- **D-09:** Mini muscle map reuses Normal mode SVG from Phase 2, rendered small. Primary muscles in bright neon accent, secondary in dimmer/muted version — color intensity distinguishes primary vs secondary
- **D-10:** Warm-up data structured per muscle group (9 groups) — new seed data file with 3-5 warm-up movements per group, each with name, brief instruction, and suggested duration/reps
- **D-11:** Warm-up accessed via badge/link on exercise card — opens a bottom sheet/modal showing warm-up guide for that exercise's primary muscle group
- **D-12:** New Mongoose model and seed data file needed for warm-up content (data/warmups.json)
- **D-13:** Static generation (SSG) — exercise data pre-rendered at build time from MongoDB. 110 exercises is small enough for full static generation. Rebuild when seed data changes
- **D-14:** Search and filter handled client-side after initial static load — no network requests for browsing/filtering
- **D-15:** Easter egg empty state for no search results — funny GIF with a witty, friendly message and interactive "clear filters" button

### Claude's Discretion
- Exact card styling, spacing, and animation for expand/collapse transitions
- Filter chip visual design and placement relative to search bar
- Bottom navigation icon choices and active state styling
- Mini muscle map rendering size and placement within detail view
- Warm-up bottom sheet design and dismiss behavior
- Easter egg GIF selection and witty copy for empty state
- SSG revalidation strategy (if any)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EXER-01 | User can browse a library of 100+ exercises with primary/secondary muscle tags | 110 exercises in `data/exercises.json`; grouping via `data/muscles.json` `group` field; SSG via direct JSON import in Server Component |
| EXER-02 | User can search exercises by name | Client-side `useState` filter in `ExerciseLibrary` client component; search input value filters `exercises` array in memory |
| EXER-03 | User can view warm-up guidance per muscle group | New `Warmup` Mongoose model + `data/warmups.json` seed; 9 muscle groups × 3-5 movements; Bottom sheet UI triggered from exercise card; data loaded statically at build time same as exercises |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 16.2.1 (installed) | SSG page at `/exercises`, route group layout | Already in project; App Router enables static Server Components |
| React | 19.2.4 (installed) | Client state for search/filter/expand | Already in project |
| Zustand | ^5.0.12 (installed) | Not needed for exercise library state — local `useState` is sufficient | Only use for cross-page state; library filter is page-local |
| shadcn Badge | installed | Muscle tags on exercise cards and filter chips | Already installed, matches project pattern |
| shadcn Button | installed | Filter chip active/inactive, expand toggle, warm-up trigger | Already installed |
| @base-ui/react | ^1.3.0 (installed) | Dialog/Sheet primitive for warm-up bottom sheet | Already powering Badge; provides unstyled accessible Dialog |
| lucide-react | ^0.577.0 (installed) | Bottom nav icons, search input icon, close icon | Already in project |
| tw-animate-css | ^1.4.0 (installed) | Expand/collapse transitions on exercise cards | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Mongoose | ^9.3.1 (installed) | Warmup model definition and seed script | New `Warmup` model only; no runtime DB calls needed for SSG |
| Vitest + jsdom | ^4.1.0 (installed) | Unit tests for filter logic | Test pure filtering function independent of React |
| Playwright | ^1.58.2 (installed) | E2E: search, filter, expand, warm-up flow | Already configured for port 3001 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct JSON import (SSG) | MongoDB fetch with `'use cache'` | `'use cache'` requires `cacheComponents: true` in next.config.ts and adds complexity; direct JSON import is simpler, already used by seed script, and achieves the same static result |
| Route group `(main)` layout | Root layout modification | Modifying root layout affects all routes including API; route group keeps nav shell isolated |
| `useState` for filter state | Zustand store | Cross-page state is not needed for filter; Zustand adds unnecessary complexity for page-local state |
| @base-ui Dialog | Custom bottom sheet | Accessible focus trapping, keyboard dismiss, and scroll lock are non-trivial to hand-roll |

**Installation:** No new runtime dependencies needed. All required packages already installed.

**Version verification:** All packages confirmed from `package.json` and `node_modules`. No npm view needed — locked versions in use.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (main)/              # Route group — shared bottom nav layout
│   │   ├── layout.tsx       # BottomNav shell — wraps Map and Exercises
│   │   ├── page.tsx         # Renamed from app/page.tsx (muscle map)
│   │   └── exercises/
│   │       └── page.tsx     # /exercises — Server Component, loads data
├── components/
│   ├── bottom-nav/
│   │   └── BottomNav.tsx    # 'use client' — nav with active state
│   ├── exercise-library/
│   │   ├── ExerciseLibrary.tsx   # 'use client' — all search/filter/expand state
│   │   ├── ExerciseCard.tsx      # Exercise card with two-level expand
│   │   ├── ExerciseFilters.tsx   # Search bar + filter chips
│   │   ├── MiniMuscleMap.tsx     # Small SVG silhouette with muscle highlights
│   │   └── WarmupSheet.tsx       # Bottom sheet for warm-up guidance
├── models/
│   └── Warmup.ts            # New Mongoose model
data/
└── warmups.json             # New seed data (9 groups × 3-5 movements)
```

### Pattern 1: Direct JSON Import for SSG
**What:** Import exercise and muscle data from `/data/*.json` directly into a Server Component. No database call at runtime. Next.js will prerender the page at build time.
**When to use:** Exercise list page, warmup data — any static reference data that only changes on seed re-run.
**Example:**
```typescript
// Source: Next.js 16 docs — "Public pages" guide (public-static-pages.md)
// app/(main)/exercises/page.tsx — Server Component (no 'use client')
import exercisesData from '@/../data/exercises.json'
import musclesData from '@/../data/muscles.json'
import warmupsData from '@/../data/warmups.json'

export default function ExercisesPage() {
  // This component has no dynamic inputs → prerendered at build time
  return (
    <ExerciseLibrary
      exercises={exercisesData}
      muscles={musclesData}
      warmups={warmupsData}
    />
  )
}
```

### Pattern 2: Route Group Layout for Bottom Nav Shell
**What:** Move the muscle map page into `app/(main)/page.tsx` and add `app/(main)/layout.tsx` with the bottom nav. Route groups (`(name)`) create shared layouts without affecting URL structure.
**When to use:** Any time multiple pages share a layout component (nav bars, sidebars) without the layout being at root level.
**Example:**
```typescript
// Source: Next.js 16 docs — file-conventions/route-groups (confirmed in project docs)
// app/(main)/layout.tsx — Server Component
import { BottomNav } from '@/components/bottom-nav/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-16">{/* pb-16 = bottom nav height */}
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
```

### Pattern 3: Client Component for All Interactive Library State
**What:** Server Component passes static data as props to a single `'use client'` `ExerciseLibrary` component that owns search, filter, and expand state. URL params read on mount via `useSearchParams()` to initialize state.
**When to use:** Pages where data is static but interaction is rich (filter, expand, deep-link).
**Example:**
```typescript
// src/components/exercise-library/ExerciseLibrary.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

export function ExerciseLibrary({ exercises, muscles, warmups }) {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [equipment, setEquipment] = useState(searchParams.get('equipment') ?? '')
  const [muscleFilter, setMuscleFilter] = useState(searchParams.get('muscle') ?? '')

  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      const matchesQuery = !query || ex.name.toLowerCase().includes(query.toLowerCase())
      const matchesEquipment = !equipment || ex.equipment === equipment
      const matchesMuscle = !muscleFilter || ex.primaryMuscles.includes(muscleFilter)
      return matchesQuery && matchesEquipment && matchesMuscle
    })
  }, [exercises, query, equipment, muscleFilter])

  // ... group by muscle group, render sections
}
```

### Pattern 4: Mini Muscle Map — Inline SVG with Programmatic Highlights
**What:** Import the NormalFront and NormalBack SVGs (already in `src/assets/svg/`) and use CSS class injection or inline style to highlight specific muscle paths by ID. Rendered small (e.g., 120px wide) in the exercise detail level 2 expand.
**When to use:** Exercise detail "More" view — D-09.
**Example:**
```typescript
// src/components/exercise-library/MiniMuscleMap.tsx
'use client'

import NormalFront from '@/assets/svg/muscle-map-normal-front.svg'
import NormalBack from '@/assets/svg/muscle-map-normal-back.svg'
import { useEffect, useRef } from 'react'

// Primary: oklch(0.85 0.18 195) — matches --primary token
// Secondary: oklch(0.55 0.10 195) — dimmer version of same hue
const PRIMARY_FILL = 'oklch(0.85 0.18 195)'
const SECONDARY_FILL = 'oklch(0.55 0.10 195)'

export function MiniMuscleMap({ primaryMuscles, secondaryMuscles }) {
  // Determine front/back from which muscles are being highlighted
  // Apply fills via useEffect + querySelector('#muscle-{slug}')
  // Same pattern as MuscleMapCanvas useEffect for selectedMuscle
}
```

### Pattern 5: Bottom Sheet via @base-ui Dialog
**What:** Use `@base-ui/react` Dialog primitive for the warm-up bottom sheet. Base UI is already powering the Badge component; its Dialog provides accessible focus trap, scroll lock, and keyboard dismiss without custom code.
**When to use:** Warm-up guidance modal triggered from exercise card (D-11).

### Anti-Patterns to Avoid
- **Calling `useSearchParams()` in a Server Component:** It is a client-only hook. Only call it inside `'use client'` components.
- **Accessing `data/exercises.json` via API route:** Adds unnecessary network overhead at build time. Direct import is simpler and produces the same static output.
- **Putting filter state in Zustand:** Library filter state is page-local. Zustand is reserved for cross-page state (muscle map selections). Using Zustand here creates unnecessary coupling.
- **`'use cache'` without enabling `cacheComponents: true`:** The `'use cache'` directive requires opt-in via `next.config.ts`. The current config does not have it. Use plain static import instead.
- **Modifying `app/layout.tsx` to add the bottom nav:** The root layout wraps everything including the API routes' HTML (even though they don't render). Use a route group `(main)` to scope the bottom nav only to page routes.
- **Passing NormalFront/NormalBack SVGs as serializable props:** SVGR SVG components are React components (functions) — not serializable. Import them directly in the client component that renders them.
- **Using `router.push` to update URL on every keystroke:** Causes full navigation events. Use `replaceState` or `window.history.replaceState` directly for URL sync during search, or accept that URL params are init-only and don't reflect mid-session filter changes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bottom sheet / modal | Custom overlay with `position: fixed` and scroll lock | @base-ui Dialog (already installed) | Focus trapping, scroll lock, keyboard dismiss, accessibility attributes are a 50+ line problem to get right |
| Accessible filter chips (toggle group) | Custom toggle button group | shadcn Badge with `onClick` + active class | Chips are stateless presentation; just track active filter in state |
| SVG muscle highlight | Custom SVG manipulation library | Direct `querySelector` + setAttribute (same as Phase 2 pattern) | MuscleMapCanvas already uses this pattern; consistency is more important than abstraction |
| Icon set | Custom SVG icons | lucide-react (already installed, 577 icons) | Already a project dependency |
| Expand/collapse animation | Custom CSS keyframes | `tw-animate-css` classes (`animate-accordion-down/up`) | Already installed and used in project |

**Key insight:** All needed UI primitives are already installed. This phase is about composing them into the exercise library UI, not adding new infrastructure.

## Common Pitfalls

### Pitfall 1: `useSearchParams()` Causing Build Bailout
**What goes wrong:** Wrapping a page component with `useSearchParams()` forces the entire page to be dynamically rendered, defeating SSG.
**Why it happens:** `useSearchParams()` is a request-time API — it reads the current URL, which Next.js considers dynamic.
**How to avoid:** Keep `useSearchParams()` inside the `'use client'` `ExerciseLibrary` component that is a *child* of the static Server Component page. Wrap the client component in `<Suspense>` to allow the static shell to still prerender.
**Warning signs:** `next build` output shows the `/exercises` route as dynamic (not `○ static`).

### Pitfall 2: Route Group Migration Breaking the Muscle Map Page
**What goes wrong:** Moving `app/page.tsx` to `app/(main)/page.tsx` without updating imports and without verifying the root layout still applies correctly.
**Why it happens:** Route groups are transparent to URLs but the file must physically move.
**How to avoid:** After moving, verify `app/layout.tsx` still wraps `(main)/layout.tsx` → `(main)/page.tsx`. The root layout's `children` will receive the route group layout's output. Run the existing E2E smoke test to confirm.
**Warning signs:** 404 on `/`, or bottom nav appearing on pages it shouldn't.

### Pitfall 3: Mini Muscle Map SVG — Wrong Muscle IDs
**What goes wrong:** Exercise `primaryMuscles` array contains slugs like `pectoralis-major` but the SVG uses IDs like `muscle-pectoralis-major`. Need to prepend `muscle-` before querying.
**Why it happens:** Exercise model stores bare slugs; SVG naming convention is `muscle-{slug}`.
**How to avoid:** In `MiniMuscleMap`, always transform slug → `muscle-{slug}` before `querySelector`.
**Warning signs:** No muscles highlighted in mini map despite correct prop values.

### Pitfall 4: SVGR SVG Components Used Without Turbopack Rule
**What goes wrong:** NormalFront/NormalBack SVG imports in `MiniMuscleMap` will fail if the turbopack SVGR rule is not applied, showing a raw SVG string instead of a React component.
**Why it happens:** SVGR requires the webpack/turbopack loader rule in `next.config.ts`.
**How to avoid:** The `turbopack.rules['*.svg']` config is already in place from Phase 2. Verify imports use `@/assets/svg/` path — same pattern as `MuscleMapCanvas`.
**Warning signs:** TypeScript error "Cannot find module" or SVG renders as `<img>` tag instead of inline paths.

### Pitfall 5: Bilateral Muscle Paths in Normal Mode SVG
**What goes wrong:** Normal mode bilateral muscles (e.g., `muscle-biceps-brachii`) are compound paths — left+right share a single path element ID. The mini map must reference the compound ID, not try to look up `muscle-biceps-brachii-left`.
**Why it happens:** Phase 2 decision: Normal mode uses compound bilateral paths with base IDs; anatomy mode has left/right suffixes.
**How to avoid:** Mini muscle map always uses Normal mode SVGs. Only base muscle IDs (e.g., `muscle-pectoralis-major`, `muscle-biceps-brachii`) exist in Normal mode paths.
**Warning signs:** `querySelector('#muscle-biceps-brachii-left')` returns null in Normal mode.

### Pitfall 6: `data/exercises.json` TypeScript Import — Needs `resolveJsonModule`
**What goes wrong:** TypeScript may throw an error when importing JSON if `resolveJsonModule` is not enabled in `tsconfig.json`.
**Why it happens:** TypeScript does not import JSON by default.
**How to avoid:** Check `tsconfig.json` for `"resolveJsonModule": true`. If absent, add it. Alternatively, read JSON via `fs.readFileSync` in a server utility function.
**Warning signs:** `Cannot find module '..../data/exercises.json'` TypeScript error.

### Pitfall 7: Warmup Bottom Sheet Scroll Lock Conflict
**What goes wrong:** Opening the warmup bottom sheet while the exercise list is scrolled causes background scroll jitter or the sheet's inner content not being scrollable.
**Why it happens:** @base-ui Dialog adds `overflow: hidden` to `<body>` — this is correct behavior but requires the sheet's content container to have `overflow-y: auto` and a max-height.
**How to avoid:** Set explicit `max-h-[80vh] overflow-y-auto` on the inner content div of the warm-up sheet.
**Warning signs:** Sheet cannot be scrolled when warmup list is long, or page jumps on open/close.

## Code Examples

Verified patterns from existing project code and Next.js 16 docs:

### SSG Page — Static Data Import Pattern
```typescript
// Source: Next.js 16 public-static-pages.md + project pattern
// app/(main)/exercises/page.tsx
import type { ExerciseDocument } from '@/models/Exercise'
import exercisesData from '@/../data/exercises.json'
import musclesData from '@/../data/muscles.json'
import warmupsData from '@/../data/warmups.json'
import { ExerciseLibrary } from '@/components/exercise-library/ExerciseLibrary'

// No dynamic inputs → prerendered at build time automatically
export default function ExercisesPage() {
  return (
    <ExerciseLibrary
      exercises={exercisesData}
      muscles={musclesData}
      warmups={warmupsData}
    />
  )
}
```

### Route Group Layout with Bottom Nav
```typescript
// Source: Next.js 16 file-conventions — route-groups pattern
// app/(main)/layout.tsx
import { BottomNav } from '@/components/bottom-nav/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <div className="flex-1 pb-16">{children}</div>
      <BottomNav />
    </div>
  )
}
```

### Muscle Highlight via DOM Query (consistent with Phase 2 pattern)
```typescript
// Source: src/components/muscle-map/MuscleMapCanvas.tsx useEffect (Phase 2 established pattern)
// Phase 2 established: querySelector('#muscle-{slug}') + setAttribute
useEffect(() => {
  const container = svgRef.current
  if (!container) return
  container.querySelectorAll('path[id^="muscle-"]').forEach((el) => {
    el.removeAttribute('data-highlight')
  })
  primaryMuscles.forEach(slug => {
    container.querySelector(`#muscle-${slug}`)?.setAttribute('data-highlight', 'primary')
  })
  secondaryMuscles.forEach(slug => {
    container.querySelector(`#muscle-${slug}`)?.setAttribute('data-highlight', 'secondary')
  })
}, [primaryMuscles, secondaryMuscles])
```

### Warmup Model Schema
```typescript
// src/models/Warmup.ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const WarmupMovementSchema = new Schema({
  name: { type: String, required: true },
  instruction: { type: String, required: true },
  duration: { type: String, required: true }, // e.g., "30 seconds" or "10 reps"
})

const WarmupSchema = new Schema({
  muscleGroup: {
    type: String,
    required: true,
    enum: ['chest', 'back', 'shoulders', 'arms', 'forearms', 'core', 'legs', 'glutes', 'calves'],
    unique: true,
  },
  movements: { type: [WarmupMovementSchema], required: true },
})

export type WarmupDocument = InferSchemaType<typeof WarmupSchema>
const Warmup = mongoose.models.Warmup ?? mongoose.model('Warmup', WarmupSchema)
export default Warmup
```

### Suspense Boundary for `useSearchParams` Client Component
```typescript
// Source: Next.js 16 — useSearchParams forces dynamic rendering at client boundary
// app/(main)/exercises/page.tsx
import { Suspense } from 'react'
import { ExerciseLibrary } from '@/components/exercise-library/ExerciseLibrary'
import exercisesData from '@/../data/exercises.json'
import musclesData from '@/../data/muscles.json'
import warmupsData from '@/../data/warmups.json'

export default function ExercisesPage() {
  return (
    <Suspense fallback={<div className="p-4 text-muted-foreground">Loading exercises...</div>}>
      <ExerciseLibrary
        exercises={exercisesData}
        muscles={musclesData}
        warmups={warmupsData}
      />
    </Suspense>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getStaticProps` / `getStaticPaths` | Server Components with direct import or `generateStaticParams` | Next.js 13 (App Router) | No Pages Router exports needed; static by default |
| `unstable_cache` for DB queries | `'use cache'` directive (opt-in via `cacheComponents: true`) | Next.js 16 | More explicit caching model; project hasn't opted in |
| Custom modal components | @base-ui Dialog (already installed) | Project baseline | Accessible primitives already in project |

**Deprecated/outdated:**
- `getStaticProps` / `getStaticPaths`: Only applies to Pages Router. Project uses App Router exclusively.
- `experimental.appDir`: Now stable in Next.js 16; no configuration needed.

## Open Questions

1. **`tsconfig.json` `resolveJsonModule` setting**
   - What we know: Direct JSON imports require this flag. Project has not been verified.
   - What's unclear: Whether the existing tsconfig already has it (exercises.json hasn't been imported by a Server Component yet).
   - Recommendation: Wave 0 plan should verify and add if missing. Fallback: use `fs.readFileSync` + `JSON.parse` in a `src/lib/exercise-data.ts` utility.

2. **Easter egg GIF for empty state (D-15)**
   - What we know: Should fit Egyptian gym community vibe and neon/dark aesthetic.
   - What's unclear: Specific GIF choice and copy. Left to Claude's discretion.
   - Recommendation: Use a publicly available gym/workout meme GIF via URL (no local asset needed for v1). Copy should be friendly and motivational in gym community tone.

3. **Bottom nav desktop layout (tab nav)**
   - What we know: D-06 says "Bottom nav on mobile, tab nav on desktop (per Phase 1 D-02)".
   - What's unclear: Phase 1 D-02 established "responsive breakpoints" but the research hasn't confirmed a specific breakpoint value or which shadcn/Tailwind pattern to follow.
   - Recommendation: Use `md:hidden` / `md:flex` breakpoint (768px) consistently. Bottom nav hidden on md+, horizontal tabs visible. This is the standard Tailwind responsive pattern.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js build, seed script | ✓ | inferred from project | — |
| MongoDB | Warm-up seed script | ✓ | inferred from Phase 1/2 (health API works) | — |
| tsx | Seed script execution | ✓ | ^4.21.0 (devDependency) | — |
| @svgr/webpack | Mini muscle map SVG imports | ✓ | ^8.1.0 (devDependency, configured) | — |

All dependencies are available. No blocking missing dependencies.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run tests/` |
| Full suite command | `npx vitest run && npx playwright test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EXER-01 | 110 exercises visible, grouped by muscle group, primary/secondary muscle tags shown | E2E | `npx playwright test e2e/exercise-library.spec.ts` | ❌ Wave 0 |
| EXER-02 | Search by name filters results as user types; clear search restores all | E2E | `npx playwright test e2e/exercise-library.spec.ts` | ❌ Wave 0 |
| EXER-02 | Filter logic (name/equipment/muscle) returns correct subset | Unit | `npx vitest run tests/lib/exercise-filter.test.ts` | ❌ Wave 0 |
| EXER-03 | Warm-up sheet opens with correct movements for a muscle group; dismiss works | E2E | `npx playwright test e2e/exercise-library.spec.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run && npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `e2e/exercise-library.spec.ts` — covers EXER-01, EXER-02, EXER-03
- [ ] `tests/lib/exercise-filter.test.ts` — unit test for pure filter function (name, equipment, muscle group)

*(Existing test infrastructure: Vitest with jsdom + Playwright already configured. No framework install needed.)*

## Project Constraints (from CLAUDE.md)

Per `AGENTS.md` (referenced by CLAUDE.md):
- **This is NOT the standard Next.js.** Next.js 16.2.1 has breaking API changes. Read `node_modules/next/dist/docs/` before writing code — confirmed done during this research.
- **Key Next.js 16 findings for this phase:**
  - `'use cache'` directive requires opt-in via `cacheComponents: true` in `next.config.ts` — project does NOT have this enabled. Use plain static Server Component import pattern instead.
  - `params` in page/layout components is now a `Promise` — must `await params` before accessing properties.
  - `useSearchParams()` forces a client boundary. Wrap in `<Suspense>` to avoid breaking static prerendering of parent.
  - `generateStaticParams` replaces `getStaticPaths`. Not needed here since `/exercises` is a flat static route (not dynamic segments).

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/02-guides/public-static-pages.md` — Server Component static rendering pattern for list pages
- `node_modules/next/dist/docs/01-app/02-guides/incremental-static-regeneration.md` — ISR and `revalidate` options
- `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md` — `'use cache'` requires `cacheComponents: true` opt-in
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md` — static params, dynamic routes
- `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md` — `dynamic`, `revalidate` segment config
- `src/models/Exercise.ts` — confirmed Exercise schema fields
- `src/models/Muscle.ts` — confirmed Muscle schema with group enum
- `data/exercises.json` — confirmed 110 exercises, exercise slug/primaryMuscles/equipment/difficulty fields
- `data/muscles.json` — confirmed 54 muscles, group field values (9 groups)
- `src/components/muscle-map/MuscleMapCanvas.tsx` — confirmed SVGR import pattern and DOM mutation pattern for muscle highlighting
- `package.json` — confirmed all dependency versions
- `next.config.ts` — confirmed turbopack SVGR rule active, `cacheComponents` NOT enabled
- `src/app/globals.css` — confirmed OKLCH color tokens and existing CSS patterns

### Secondary (MEDIUM confidence)
- `src/components/ui/badge.tsx` — confirmed @base-ui/react is the underlying primitive library, Dialog likely follows same pattern

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed from package.json and node_modules
- Architecture: HIGH — route group pattern confirmed from Next.js 16 docs; SSG via JSON import is a documented App Router pattern
- Data loading: HIGH — `'use cache'` opt-in requirement confirmed from official docs; direct JSON import confirmed as valid
- Pitfalls: HIGH — based on actual project code (Phase 2 patterns), Next.js 16 official docs, and locked decisions

**Research date:** 2026-03-23
**Valid until:** 2026-06-23 (stable stack — Next.js 16 minor versions unlikely to break these patterns within 90 days)
