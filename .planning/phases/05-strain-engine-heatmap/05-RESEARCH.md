# Phase 5: Strain Engine + Heatmap - Research

**Researched:** 2026-03-23
**Domain:** Derived-state computation from IndexedDB, SVG CSS custom-property injection, React custom hooks
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Strain Calculation Model**
- Volume-weighted strain accumulation: sets x reps x weight determines how much strain a muscle receives from a workout
- Exponential decay with ~72hr half-life: muscle recovers ~50% in 3 days, ~75% in 6 days
- Primary muscles receive 100% strain from an exercise, secondary muscles receive 40%
- Strain caps at 100% with diminishing returns above threshold — prevents unrealistic values from marathon sessions, maps cleanly to 5 StrainLevel enum buckets

**Heatmap Color Palette & Rendering**
- Cool blue (#3b82f6) → warm red (#ef4444) gradient for rested → strained. Classic heat map convention, pops on dark background
- Discrete 5-level buckets matching existing StrainLevel enum: Rested=slate/gray (default), Light=blue, Moderate=yellow, Heavy=orange, Strained=red
- CSS custom properties on SVG container — muscle paths use `var(--strain-{slug})` style fills, leveraging existing SVGR + globals.css pattern from Phase 2
- Rested muscles stay default gray/slate fill (Phase 2 D-08) — only muscles with recent activity get color overlay

**Disclaimer & Data Flow**
- Small muted text below muscle map: "Strain data based on placeholder estimates" — always visible, non-intrusive, no dismiss needed
- Strain engine lives as pure utility lib `src/lib/strain-engine.ts` — takes workout history + current time, returns `Map<MuscleSlug, StrainLevel>`. Per Phase 1 D-11, never persisted
- `useStrainMap()` hook reads Dexie workout data and calls strain engine. Recalculates on page mount + after workout session ends (useMemo with session count dependency). No polling
- Heatmap applies to all 3 detail modes (normal, advanced, anatomy) — color fills work the same regardless of SVG path granularity

### Claude's Discretion
- Exact diminishing returns curve shape for strain cap
- StrainLevel threshold boundaries (e.g., Light=20%, Moderate=40%, Heavy=60%, Strained=80%)
- How CSS custom properties are set (useEffect on container div vs style tag injection)
- Exercise volume normalization approach (absolute weight vs relative to exercise type)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MAP-03 | User can see heatmap color overlay showing strain level per muscle (rested → strained gradient) | CSS custom property injection on SVG container; StrainLevel → color map in globals.css |
| STRAIN-01 | User can see per-muscle strain/recovery state derived from logged workouts | `useStrainMap()` hook reads Dexie, calls strain engine, drives CSS vars |
| STRAIN-02 | Strain calculations use placeholder dataset with time-decay model | Pure `computeStrainMap()` function: volume accumulation + 72hr half-life exponential decay |
| STRAIN-03 | User sees a disclaimer indicating strain data is based on placeholder estimates | Static text node below `MuscleMapCanvas` in `MuscleMap` component |
</phase_requirements>

---

## Summary

Phase 5 connects Phase 2's SVG muscle map with Phase 4's Dexie workout history. The work divides cleanly into three sub-problems: (1) a pure TypeScript strain engine that computes `Map<MuscleSlug, StrainLevel>` from raw DB records plus a timestamp, (2) a `useStrainMap()` React hook that reads Dexie and calls the engine, and (3) the heatmap rendering layer that injects CSS custom properties onto the SVG container so existing CSS selectors can color the paths.

The SVG custom-property approach is the key architectural choice. The existing `MuscleMapCanvas` already has a `svgContainerRef` and a `useEffect` that mutates DOM attributes for the selected-muscle highlight. The same technique applies here: on strain map change, a `useEffect` iterates over the `Map<MuscleSlug, StrainLevel>`, sets `--strain-{slug}` on the container element's `style`, and a new CSS block in `globals.css` declares `path[id^="muscle-"]` fill as `var(--strain-{slug}, <default>)`. Only muscles with actual strain records need a color; the CSS default fallback maintains the Phase 2 gray for untouched muscles.

The disclaimer is one line of text rendered inside `MuscleMap` (the wrapper component that owns both `MuscleMapControls` and `MuscleMapCanvas`), requiring no new component.

**Primary recommendation:** Build the strain engine as a pure function with no external dependencies, unit-test it in isolation, wire it to Dexie via a hook that returns a stable `Map`, and apply strain colors via a `useEffect` that sets CSS custom properties on the existing `svgContainerRef`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| dexie | ^4.3.0 | Read workout sessions/exercises/sets from IndexedDB | Already in project; established usage pattern |
| zustand | ^5.0.12 | `useWorkoutStore` — access `activeSession` to detect session count | Already in project |
| react (useEffect, useMemo, useState) | 19.2.4 | Hook plumbing for `useStrainMap` | Core framework |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | ^4.1.0 | Unit tests for pure `computeStrainMap` function | Pure function — fast, no DOM needed |
| @testing-library/react | ^16.3.2 | Hook test for `useStrainMap` if needed | Integration test of hook + fake DB |
| fake-indexeddb | ^6.2.5 | IndexedDB in test environment | Already in `tests/setup.ts` via `fake-indexeddb/auto` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS custom properties | inline style per path | Custom props: one DOM write on container; inline: N writes per muscle. Custom props wins on performance and aligns with existing CSS scoping pattern |
| CSS custom properties | dataset attributes + CSS selectors | Dataset: requires generating 50+ CSS rules per level; custom props: CSS handles the lookup. Custom props wins |
| useEffect for CSS prop injection | CSS-in-JS / style tag injection | `useEffect` on container ref is the same pattern used for `data-selected` in `MuscleMapCanvas`. Consistent with codebase |

**Installation:** No new packages needed — all dependencies already present.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   └── strain-engine.ts          # Pure function: computeStrainMap(history, now) → Map<MuscleSlug, StrainLevel>
├── hooks/
│   └── useStrainMap.ts           # React hook: reads Dexie → calls engine → returns Map
├── components/
│   └── muscle-map/
│       ├── MuscleMap.tsx         # ADD: disclaimer text + pass strainMap to canvas
│       └── MuscleMapCanvas.tsx   # ADD: accept strainMap prop, apply CSS custom props via useEffect
└── app/
    └── globals.css               # ADD: --strain-{slug} CSS custom property fills
```

No new directories need to be created (though `src/hooks/` currently does not exist — it should be created for `useStrainMap`).

### Pattern 1: Pure Strain Engine (Verified from codebase patterns)

**What:** Stateless function, no I/O. Takes a denormalized flat array of `WorkoutMuscleDose` records (session timestamp, muscle slug, volume, primary/secondary flag) and a `now` timestamp. Returns `Map<MuscleSlug, StrainLevel>`.

**When to use:** Any time strain state is needed — both hook and future uses (e.g., the muscle reference panel in Phase 6).

```typescript
// src/lib/strain-engine.ts
import { StrainLevel } from '@/types'
import type { MuscleSlug } from '@/types'

export interface WorkoutMuscleDose {
  muscleSlug: MuscleSlug
  volume: number          // sets × reps × weightKg
  multiplier: number      // 1.0 for primary, 0.4 for secondary
  completedAt: number     // Unix ms
}

const HALF_LIFE_MS = 72 * 60 * 60 * 1000  // 72 hours

// Threshold boundaries (Claude's discretion — these are the recommended values)
const THRESHOLDS = {
  Light:    20,
  Moderate: 40,
  Heavy:    60,
  Strained: 80,
}

function decayedStrain(dose: WorkoutMuscleDose, now: number): number {
  const ageMs = now - dose.completedAt
  const decayFactor = Math.pow(0.5, ageMs / HALF_LIFE_MS)
  const rawStrain = dose.volume * dose.multiplier
  return rawStrain * decayFactor
}

function strainToLevel(pct: number): StrainLevel {
  if (pct >= THRESHOLDS.Strained) return StrainLevel.Strained
  if (pct >= THRESHOLDS.Heavy)    return StrainLevel.Heavy
  if (pct >= THRESHOLDS.Moderate) return StrainLevel.Moderate
  if (pct >= THRESHOLDS.Light)    return StrainLevel.Light
  return StrainLevel.Rested
}

export function computeStrainMap(
  doses: WorkoutMuscleDose[],
  now: number
): Map<MuscleSlug, StrainLevel> {
  // Accumulate decayed strain per muscle
  const rawMap = new Map<MuscleSlug, number>()
  for (const dose of doses) {
    const current = rawMap.get(dose.muscleSlug) ?? 0
    rawMap.set(dose.muscleSlug, current + decayedStrain(dose, now))
  }

  // Normalize to 0-100 scale, cap at 100, map to StrainLevel
  const NORMALIZE_DIVISOR = 5000  // tuning constant: ~5 sets × 10 reps × 100kg = 5000 "raw" at peak
  const result = new Map<MuscleSlug, StrainLevel>()
  for (const [slug, raw] of rawMap) {
    const pct = Math.min(100, (raw / NORMALIZE_DIVISOR) * 100)
    const level = strainToLevel(pct)
    if (level !== StrainLevel.Rested) {
      result.set(slug, level)
    }
    // Rested muscles NOT added to map — CSS default handles them
  }
  return result
}
```

**Note on NORMALIZE_DIVISOR:** This is Claude's discretion. 5000 (5 sets × 10 reps × 100kg × 1.0 multiplier) maps a typical heavy session to roughly 100% strain at the moment of completion. Lighter exercises and secondary muscles decay faster due to the 0.4 multiplier. This value should be documented as a tuning constant.

### Pattern 2: useStrainMap Hook

**What:** Client-only hook that reads Dexie, flattens data into `WorkoutMuscleDose[]`, calls `computeStrainMap`. Returns `Map<MuscleSlug, StrainLevel>`. Recalculates on mount and when `completedSessionCount` changes (derived from Zustand store watching `activeSession` transitions).

**When to use:** Mounted on the map page only; no polling.

```typescript
// src/hooks/useStrainMap.ts
'use client'

import { useEffect, useState } from 'react'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { computeStrainMap } from '@/lib/strain-engine'
import { StrainLevel } from '@/types'
import type { MuscleSlug } from '@/types'

export function useStrainMap(): Map<MuscleSlug, StrainLevel> {
  const [strainMap, setStrainMap] = useState<Map<MuscleSlug, StrainLevel>>(new Map())
  // Recalculate when session ends: activeSession null → session count bumps
  const activeSession = useWorkoutStore(s => s.activeSession)

  useEffect(() => {
    let cancelled = false

    async function recalculate() {
      try {
        const { workoutsDb } = await import('@/lib/db/workouts')
        const exercisesData = await import('@/../data/exercises.json')
        const exerciseMap = new Map(
          (exercisesData.default as Array<{ slug: string; primaryMuscles: string[]; secondaryMuscles: string[] }>)
            .map(e => [e.slug, e])
        )

        // Load all completed sessions
        const sessions = await workoutsDb.sessions
          .filter(s => s.completedAt !== null)
          .toArray()

        const doses: import('@/lib/strain-engine').WorkoutMuscleDose[] = []
        for (const session of sessions) {
          const exercises = await workoutsDb.exercisesInSession
            .where('sessionId').equals(session.id).toArray()
          for (const ex of exercises) {
            const sets = await workoutsDb.sets
              .where('exerciseInSessionId').equals(ex.id).toArray()
            const volume = sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0)
            if (volume === 0) continue
            const def = exerciseMap.get(ex.exerciseSlug)
            if (!def) continue
            for (const slug of def.primaryMuscles) {
              doses.push({ muscleSlug: slug as MuscleSlug, volume, multiplier: 1.0, completedAt: session.completedAt! })
            }
            for (const slug of def.secondaryMuscles) {
              doses.push({ muscleSlug: slug as MuscleSlug, volume, multiplier: 0.4, completedAt: session.completedAt! })
            }
          }
        }

        if (!cancelled) {
          setStrainMap(computeStrainMap(doses, Date.now()))
        }
      } catch (err) {
        console.error('useStrainMap: failed to compute', err)
      }
    }

    recalculate()
    return () => { cancelled = true }
  }, [activeSession])  // null→session = recalc on end; session→null = recalc after finish

  return strainMap
}
```

**Key design note:** The dependency is `activeSession` (the object reference). When `finishSession` sets `activeSession` to `null`, the effect re-fires — this is the "after session ends" recalculation trigger the context doc specifies.

### Pattern 3: CSS Custom Property Injection

**What:** `useEffect` in `MuscleMapCanvas` that iterates the `strainMap`, sets `--strain-{slug}` on the container div's style. `globals.css` uses these vars as fill fallbacks.

**When to use:** Whenever `strainMap` changes.

```typescript
// In MuscleMapCanvas.tsx — add this effect alongside the existing data-selected effect
useEffect(() => {
  const container = svgContainerRef.current
  if (!container) return

  // Clear all previous strain custom properties
  // Strategy: iterate known muscles and remove, OR set Rested to default
  // Best: iterate strainMap entries and set; muscles not in map keep CSS default (gray)

  // First, clear all previously set strain props
  // We store which slugs were set in a ref to avoid iterating all 50+ muscles
  container.style.cssText = container.style.cssText
    .split(';')
    .filter(rule => !rule.trim().startsWith('--strain-'))
    .join(';')

  // Then set current strain values
  for (const [slug, level] of strainMap) {
    container.style.setProperty(`--strain-${slug}`, STRAIN_COLORS[level])
  }
}, [strainMap])
```

**STRAIN_COLORS constant (locked by context):**
```typescript
const STRAIN_COLORS: Record<StrainLevel, string> = {
  [StrainLevel.Rested]:   'oklch(0.22 0.02 265)',    // same as default gray — not applied
  [StrainLevel.Light]:    '#3b82f6',                  // blue
  [StrainLevel.Moderate]: '#eab308',                  // yellow
  [StrainLevel.Heavy]:    '#f97316',                  // orange
  [StrainLevel.Strained]: '#ef4444',                  // red
}
```

**CSS change in globals.css:**
```css
/* Phase 5: Strain heatmap — override fill if --strain-{slug} is set on container */
[data-view] path[id^="muscle-"] {
  /* var() with fallback: if CSS custom prop is set, use it; else keep Phase 2 default */
  fill: var(--strain-PLACEHOLDER, oklch(0.22 0.02 265));
}
```

**Problem:** CSS `var()` requires the exact property name at parse time. We cannot use a dynamic variable name like `var(--strain-${slug})` in a static CSS rule. This means a different approach is needed.

**Correct approach:** The `useEffect` must set `fill` directly on individual `path` elements (like the `MiniMuscleMap` pattern), OR generate per-muscle CSS rules dynamically. Looking at the `MiniMuscleMap` precedent (Phase 3 decision: "MiniMuscleMap uses style.fill inline overrides"), the correct approach for dynamic per-muscle fills is **direct path element mutation**, not CSS custom properties.

**Revised approach (correct):**

```typescript
// useEffect in MuscleMapCanvas: directly set fill on visual-layer path elements
useEffect(() => {
  const container = svgContainerRef.current
  if (!container) return

  // Reset all muscle paths to default (remove inline fill override)
  container.querySelectorAll<SVGPathElement>('path[id^="muscle-"]').forEach(el => {
    el.style.fill = ''
  })

  // Apply strain colors to muscles with non-Rested strain
  for (const [slug, level] of strainMap) {
    const path = container.querySelector<SVGPathElement>(`#muscle-${slug}`)
    if (path) {
      path.style.fill = STRAIN_COLORS[level]
    }
  }
}, [strainMap, currentView, detailMode])  // re-apply when SVG re-renders
```

This aligns with the MiniMuscleMap precedent and avoids the CSS custom property naming problem. The context doc's mention of `var(--strain-{slug})` was a design idea — the MiniMuscleMap proof-of-concept demonstrates the inline style approach is already established and working in this codebase.

**Note on `currentView`/`detailMode` in deps:** SVG components re-render when view/mode changes, replacing path elements. The useEffect must re-apply fills after those changes.

### Anti-Patterns to Avoid

- **Storing computed strain in Dexie:** D-11 is explicit — derived values are never persisted. Strain is recomputed from raw logs every time.
- **Polling for strain updates:** The context doc explicitly says "no polling." Only recalculate on mount and session end.
- **Using absolute weight without sets×reps multiplication:** Volume must include all three factors (sets × reps × weight). Looking at the data model, `SetLogRecord` stores individual sets — the volume for one set is `reps × weightKg`; the hook accumulates across all sets per exercise per session.
- **Applying CSS vars as per-slug custom properties:** CSS cannot reference dynamic variable names in static rules. Use direct path style mutations (MiniMuscleMap pattern).
- **SSR execution of Dexie calls:** All Dexie access must be inside `async function` with `await import('@/lib/db/workouts')` (D-18 pattern). The hook is `'use client'` only.
- **Applying strain color to the selected muscle path:** The `data-selected` CSS rule (primary accent fill) and inline strain fill would conflict. Selected muscle should override strain color — the `data-selected` CSS rule has higher specificity since it's an attribute selector, but inline style has highest priority. Resolution: skip `style.fill` override for the currently selected muscle, letting CSS handle it.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Exponential decay formula | Custom half-life calculator | `Math.pow(0.5, age / halfLife)` — standard formula | One line; well-understood; no library needed |
| Accessing workout history | Custom DB query layer | Direct Dexie `.where()` chained queries (exact pattern from history page) | Already proven in `src/app/(main)/history/page.tsx` |
| Color interpolation | Linear RGB interpolation utility | Discrete 5-bucket constants (STRAIN_COLORS record) | Discrete buckets were explicitly decided; no continuous interpolation needed |
| SVG path lookup | Custom SVG traversal | `container.querySelector('#muscle-{slug}')` | Already used in `MuscleMapCanvas` for `data-selected` |

**Key insight:** This phase has no dependency on new libraries. Every primitive needed (Dexie queries, SVG path mutation, exponential math) is already present in the codebase.

---

## Common Pitfalls

### Pitfall 1: SVG re-renders clobber strain fills

**What goes wrong:** When `currentView` or `detailMode` changes, React replaces the SVG component entirely (new instance of `NormalFront`, `AdvancedFront`, etc.). All inline style overrides from the previous SVG are gone.

**Why it happens:** SVGR renders SVG as a React component. View/mode changes swap which SVG component is rendered, creating fresh DOM nodes.

**How to avoid:** Include `currentView` and `detailMode` in the strain `useEffect` dependency array. This re-runs the fill injection after each view/mode swap.

**Warning signs:** Strain colors disappear when user toggles front/back or changes detail mode.

### Pitfall 2: Selected muscle color conflict

**What goes wrong:** A muscle that is both selected AND strained gets its strain fill overwritten by the useEffect, removing the primary-accent selected highlight. Or vice versa — strain fill overwrites selection highlight.

**Why it happens:** `useEffect` for strain fires after render; `data-selected` CSS attribute is also set. Inline `style.fill` has higher specificity than CSS attribute selectors.

**How to avoid:** In the strain `useEffect`, skip the currently selected muscle: `if (slug === selectedMuscle) continue`.

**Warning signs:** Clicking a strained muscle loses its blue selection highlight.

### Pitfall 3: Session count dependency ambiguity

**What goes wrong:** Using `activeSession?.id` as a dependency works for detecting session start, but `finishSession` sets `activeSession` to `null` — so the dep goes from `string` → `undefined` → new session `string`. This is correct. But if the dep is the whole `activeSession` object (same ID, different reference), the effect could re-fire on unrelated store updates.

**Why it happens:** Zustand state updates with new object references on every `set()`.

**How to avoid:** Subscribe to `activeSession?.id ?? null` (primitive) rather than the full `activeSession` object. Primitive comparison is stable.

### Pitfall 4: Volume normalization scale

**What goes wrong:** Using `reps * weightKg` without a normalization divisor means a user who lifts 200kg has `2000/set` volume while someone lifting 20kg has `200/set` — same number of sets produces a 10x strain difference.

**Why it happens:** Absolute weight creates enormous variance across exercises and user populations.

**How to avoid:** The `NORMALIZE_DIVISOR` tuning constant brings scale into 0-100. The exact value is Claude's discretion (5000 recommended). Document it clearly with the reasoning so it can be tuned.

**Warning signs:** Powerlifters show max strain from a single set; beginners show near-zero even after 20 sets.

### Pitfall 5: Bilateral muscles in anatomy mode

**What goes wrong:** Anatomy mode has bilateral paths like `muscle-biceps-brachii-left` and `muscle-biceps-brachii-right` as separate IDs. The muscles.json slug is `biceps-brachii` (no side suffix). Querying `#muscle-biceps-brachii` in anatomy mode finds nothing.

**Why it happens:** Phase 2 anatomy mode extends `svgRegion` values with `-left`/`-right` suffixes for bilateral muscles.

**How to avoid:** When applying strain fills, also attempt `#muscle-${slug}-left` and `#muscle-${slug}-right` path lookups. If either exists, apply the fill to both.

**Warning signs:** Arm/leg muscles show no strain color in anatomy mode while working correctly in normal/advanced mode.

---

## Code Examples

### Querying completed sessions with exercises and sets (verified from history/page.tsx)

```typescript
// Pattern verified from src/app/(main)/history/page.tsx
const { workoutsDb } = await import('@/lib/db/workouts')

const sessions = await workoutsDb.sessions
  .filter(s => s.completedAt !== null)
  .toArray()

for (const session of sessions) {
  const exercises = await workoutsDb.exercisesInSession
    .where('sessionId').equals(session.id).toArray()
  for (const ex of exercises) {
    const sets = await workoutsDb.sets
      .where('exerciseInSessionId').equals(ex.id).toArray()
    const volume = sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0)
  }
}
```

### Direct SVG path fill mutation (verified from MiniMuscleMap decision)

```typescript
// Pattern: useEffect resets ALL paths then applies highlights
// Per Phase 3 decision: MiniMuscleMap uses style.fill inline overrides
container.querySelectorAll<SVGPathElement>('path[id^="muscle-"]').forEach(el => {
  el.style.fill = ''
})
// Then apply per slug:
const path = container.querySelector<SVGPathElement>(`#muscle-${slug}`)
if (path) path.style.fill = colorValue
```

### Selected-muscle attribute effect (verified from MuscleMapCanvas.tsx)

```typescript
// Existing pattern at line 62-77 of MuscleMapCanvas.tsx
useEffect(() => {
  const container = svgContainerRef.current
  if (!container) return
  container.querySelectorAll('path[data-selected="true"]').forEach(el => {
    el.removeAttribute('data-selected')
  })
  if (selectedMuscle) {
    const visualPath = container.querySelector(`#muscle-${selectedMuscle}`)
    if (visualPath) visualPath.setAttribute('data-selected', 'true')
  }
}, [selectedMuscle, currentView, detailMode])
```

The strain fill useEffect should follow the same pattern and include the same deps.

### Anatomy mode bilateral muscle lookup

```typescript
// Handle both base slug and bilateral variants
function applyStrainToSlug(container: HTMLDivElement, slug: string, color: string) {
  const base = container.querySelector<SVGPathElement>(`#muscle-${slug}`)
  if (base) {
    base.style.fill = color
  } else {
    // Try bilateral variants (anatomy mode)
    const left = container.querySelector<SVGPathElement>(`#muscle-${slug}-left`)
    const right = container.querySelector<SVGPathElement>(`#muscle-${slug}-right`)
    if (left) left.style.fill = color
    if (right) right.style.fill = color
  }
}
```

### Exponential decay formula

```typescript
// Standard half-life decay: value × 0.5^(age/halfLife)
const HALF_LIFE_MS = 72 * 60 * 60 * 1000
const decayFactor = Math.pow(0.5, (now - completedAt) / HALF_LIFE_MS)
// At t=0:   decayFactor = 1.0  (no decay)
// At t=72h: decayFactor = 0.5  (~50% recovered)
// At t=144h: decayFactor = 0.25 (~75% recovered)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Animating color transitions on hover | Instant fills, no transition (D-12 snappy philosophy) | Phase 1 | No `transition: fill` in CSS — strain colors appear immediately |
| Global CSS without scope | `[data-view]` ancestor scoping | Phase 2 | All muscle CSS must remain under `[data-view]` selector |
| Per-component SVG imports | SVGR webpack transforms | Phase 1/2 | SVG components have no React children — disambiguation uses absolute-positioned sibling SVG |

**Deprecated/outdated:**
- CSS custom property for per-path color: Architecturally appealing but CSS cannot resolve dynamic property names in static rule selectors. Inline style override (MiniMuscleMap pattern) is the established approach.

---

## Open Questions

1. **Volume normalization divisor (NORMALIZE_DIVISOR = 5000)**
   - What we know: The value controls mapping from raw volume units to 0-100% strain scale. Must be chosen so typical workouts produce meaningful strain levels (not all Strained, not all Rested).
   - What's unclear: The right value depends on the user population's typical weight ranges. Egyptian gym context may skew heavier for compound lifts.
   - Recommendation: Start with 5000 (5 sets × 10 reps × 100kg). Document as a named constant. Leave a comment that this is a tuning parameter.

2. **Selected muscle + strain color precedence**
   - What we know: `data-selected` CSS rule uses primary accent fill. Strain fill is applied via `style.fill` (inline, highest specificity).
   - What's unclear: Should a selected+strained muscle show selection color or strain color?
   - Recommendation: Show selection color — skip strain fill for `selectedMuscle`. Consistent with interaction model: user clicked it, selection is the active state.

3. **useStrainMap trigger on in-progress session**
   - What we know: The hook recalculates when `activeSession` changes. During an active session, sets are being added but `activeSession` object reference changes on each `confirmSet` (Zustand `set()` creates new object).
   - What's unclear: Does this cause excessive recalculations while a session is in progress?
   - Recommendation: Subscribe to `activeSession?.id` (primitive). This stabilizes to the same string for the entire session; only changes on session start/end. No in-session recalculations.

---

## Environment Availability

Step 2.6: SKIPPED — This phase is purely code/config changes. No external dependencies beyond the existing project stack.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run tests/lib/strain-engine.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STRAIN-01 | `computeStrainMap` returns correct StrainLevel per muscle from dose history | unit | `npx vitest run tests/lib/strain-engine.test.ts` | Wave 0 |
| STRAIN-02 | Exponential decay: muscle at 72h is ~50% of fresh strain | unit | `npx vitest run tests/lib/strain-engine.test.ts` | Wave 0 |
| STRAIN-02 | Primary muscles receive full volume; secondary receive 40% | unit | `npx vitest run tests/lib/strain-engine.test.ts` | Wave 0 |
| STRAIN-02 | Strain caps at Strained level (no overflow above enum max) | unit | `npx vitest run tests/lib/strain-engine.test.ts` | Wave 0 |
| STRAIN-02 | Muscles with no recent workouts return Rested (not in map) | unit | `npx vitest run tests/lib/strain-engine.test.ts` | Wave 0 |
| MAP-03 | Heatmap fills visible on map page after workout logged | manual / E2E | Playwright smoke test | Wave 0 |
| STRAIN-03 | Disclaimer text present in DOM | unit | `npx vitest run tests/components/muscle-map/MuscleMap.test.tsx` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/lib/strain-engine.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/lib/strain-engine.test.ts` — unit tests for `computeStrainMap` covering REQ STRAIN-01, STRAIN-02
- [ ] `tests/components/muscle-map/MuscleMap.test.tsx` — disclaimer text render test for STRAIN-03

*(No new test infra needed — `tests/setup.ts` with `fake-indexeddb/auto` already handles IndexedDB. Vitest config already includes `tests/**/*.test.ts`.)*

---

## Sources

### Primary (HIGH confidence)

- Codebase direct read — `src/types/strain.ts`: StrainLevel enum confirmed (Rested, Light, Moderate, Heavy, Strained)
- Codebase direct read — `src/components/muscle-map/MuscleMapCanvas.tsx`: `svgContainerRef`, `useEffect` for `data-selected`, SVGR imports, view/detailMode deps
- Codebase direct read — `src/lib/db/workouts.ts`: Dexie schema v2, table names, indexed fields
- Codebase direct read — `src/app/(main)/history/page.tsx`: Full query chain — sessions → exercisesInSession → sets
- Codebase direct read — `src/app/globals.css`: `[data-view]` scoping pattern, Phase 2 muscle path CSS
- Codebase direct read — `data/muscles.json`: 52 muscle slugs, svgRegion convention (`muscle-{slug}`)
- Codebase direct read — `data/exercises.json`: primaryMuscles/secondaryMuscles arrays, ExerciseSlug format
- STATE.md Phase 3 decision: "MiniMuscleMap uses style.fill inline overrides — container lacks data-view so globals.css muscle selectors don't apply"
- STATE.md Phase 2 decisions: anatomy mode bilateral paths (`-left`/`-right`), midline muscles keep base IDs, `[data-view]` scoping

### Secondary (MEDIUM confidence)

- Standard exponential decay formula `Math.pow(0.5, age/halfLife)` — mathematical property, not library-specific
- NORMALIZE_DIVISOR value 5000 — derived from 5 sets × 10 reps × 100kg as representative heavy session

### Tertiary (LOW confidence)

- None — all findings are backed by direct codebase inspection

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already present in package.json
- Architecture: HIGH — patterns verified from 4+ existing implementations in the codebase
- Pitfalls: HIGH — anatomy bilateral path pitfall verified from STATE.md; others derived from existing useEffect patterns
- Strain math: HIGH — standard exponential decay formula; threshold values are Claude's discretion per context doc

**Research date:** 2026-03-23
**Valid until:** 2026-04-22 (stable codebase; no fast-moving external APIs involved)
