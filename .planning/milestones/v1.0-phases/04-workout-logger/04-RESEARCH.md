# Phase 4: Workout Logger - Research

**Researched:** 2026-03-23
**Domain:** IndexedDB / Dexie 4, Zustand 5, @base-ui/react 1.3, Next.js 16 App Router
**Confidence:** HIGH

## Summary

Phase 4 adds the workout logger, rest timer, history view, PR detection, and plan runner. All user data goes to Dexie (IndexedDB) via the already-scaffolded `WorkoutsDatabase` — no schema changes are needed for the core logging flow, but a `planProgress` table and `lastUsedRestSeconds` store need to be added (see schema gaps below). The active session state lives in Zustand (extended from the existing shell), following the established dynamic-import pattern to prevent SSR failures.

The exercise picker is a bottom sheet built with `@base-ui/react` Drawer (already in use for WarmupSheet via Dialog; Drawer is the right primitive for swipe-dismissable sheets). The floating timer widget is a fixed-position overlay (no third-party needed). The contribution graph heatmap is a pure CSS grid — no charting library required. PR detection is computed at read time by scanning all sets for the same exercise and rep count (D-11/D-13 from CONTEXT.md).

The `@base-ui/react` 1.3 package installed in the project provides: `Drawer` (bottom sheet with swipe-dismiss), `NumberField` (inline reps/weight inputs with increment/decrement), `Tabs` (exercise picker muscle-group tabs), and `Progress` (plan day progress tracking). All are available without installing new packages.

**Primary recommendation:** Extend existing Dexie schema to version 2 (add `planProgress` table + `lastUsedRestSeconds` table), extend `useWorkoutStore` with full active-session state, then build UI layer-by-layer: logger page → exercise picker sheet → timer widget → history page → plan browser.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Logging Flow**
- D-01: Single-page logger — one scrollable page. "+Exercise" opens a picker, each exercise expands inline with set rows underneath. Running workout timer at the top. "Finish Workout" button at bottom
- D-02: Exercise picker is a bottom sheet with search bar + recent/frequent exercises at top, PLUS muscle group browse tabs within the same sheet. Combines fast search with discovery browsing
- D-03: Inline number inputs for reps and weight directly in the set row. Pre-fills from previous set values. Tap checkmark to confirm set. Achieves "under 3 taps per set" — if weight/reps unchanged, just tap confirm
- D-04: kg only for weight entry — no imperial units. Consistent with Egyptian gym community (metric) and existing `weightKg` field in Dexie schema

**Rest Timer UX**
- D-05: Floating mini-widget — small floating timer bubble at bottom of screen. Visible while scrolling through exercises. Tap to expand for controls (pause, +15s, -15s, dismiss)
- D-06: Timer auto-fills from the exercise's `restSeconds` in seed data (or plan data). User can adjust with +/- 15s buttons. App remembers last-used duration per exercise for future sessions
- D-07: Sound + vibration alert when timer reaches zero. Short beep plus phone vibration. Uses Navigator.vibrate API + Audio API

**History & PR Display**
- D-08: Git-log style timeline for workout history — compact one-liner per session showing date, workout label, exercise count, total sets, total volume. Tap to expand full session details with per-exercise breakdown
- D-09: GitHub-style contribution graph heatmap at top of history page — last 3 months of data. Color intensity driven by a metric (Claude's discretion to pick best one)
- D-10: Exercises in expanded history sessions can further expand to show exercise library card detail — reuses Phase 3's two-level card expand pattern
- D-11: History lives as its own tab in bottom nav — 4 tabs total: Map, Exercises, History, Workout
- D-12: Inline PR badge with neon glow on the set row at the moment a PR is achieved during logging. Badge persists in the session view and in history
- D-13: PR defined as max weight at each rep count — track best weight at 1 rep, 3 reps, 5 reps, 8 reps, 10 reps, etc. "Best 5-rep bench" is distinct from "best 10-rep bench". Computed at read time per Phase 1 D-11

**Plan Runner**
- D-14: Plan browser with day picker — dedicated plans section where user browses available plans, selects one, sees the day breakdown. Tap a day to start that workout with exercises pre-loaded into the single-page logger
- D-15: Full flexibility during plan workouts — plan pre-loads exercises and suggested sets/reps/rest, but user can add/remove exercises, change weights, add extra sets
- D-16: Visual progress tracking across sessions — each day shows a checkmark when completed. User sees "3/4 days done this week". Progress persisted in Dexie
- D-17: Seed data should include popular Egyptian gym splits: Arnold split, PPL (Push/Pull/Legs), and superset-based programs alongside existing plans
- D-18: Plan recommendation UI — when browsing plans, show "Recommended for you" highlight based on user's apparent level. Show a brief warning/explanation for plans above their likely level

### Claude's Discretion

- Contribution graph color intensity metric (volume, set count, or sessions)
- Floating timer widget exact design, positioning, and expand behavior
- Sound choice for timer completion alert
- Plan recommendation logic — how to determine user level without bio data (could use workout history volume/frequency)
- Which specific Egyptian gym splits to include in seed data (research popular programs)
- Exercise picker layout within the bottom sheet (tabs vs scrollable sections for muscle groups)
- Exact bottom nav icon choices for the 4 tabs
- Animation/transition for set confirmation and PR badge appearance

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WORK-01 | User can log freestyle workouts (exercise picker → sets/reps/weight) | Dexie schema ready; @base-ui Drawer for picker, NumberField for inputs; Zustand store extension pattern established |
| WORK-02 | User can use a configurable rest timer between sets | setInterval in React useEffect; Navigator.vibrate + AudioContext APIs; floating fixed-position widget |
| WORK-03 | User can view workout history in reverse chronological order | Dexie `orderBy('startedAt').reverse()` query; git-log timeline UI pattern; contribution graph via CSS grid |
| WORK-04 | User sees automatic PR detection with visual callout on new personal records | Computed at read time: query all sets for exercise+repCount, compare weightKg; neon glow badge via Tailwind shadow |
| WORK-05 | User can follow pre-built workout plans (3-5 programs) step by step | Existing 4 plans in MongoDB/seed data; +3 new Egyptian splits to add; plan progress in new Dexie table |
| WORK-06 | User can use the app fully offline | IndexedDB (Dexie) is offline-first by nature; plan reference data needs to be client-side cached; SSG for plan data already the pattern |
</phase_requirements>

## Standard Stack

### Core (already installed — no new packages needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| dexie | 4.3.0 | IndexedDB ORM — sessions, exercisesInSession, sets, planProgress tables | Already scaffolded; established pattern in project |
| zustand | 5.0.12 | Active session state, timer state, plan runner state | Established pattern; dynamic import for SSR safety |
| @base-ui/react | 1.3.0 | Drawer (exercise picker sheet), NumberField (reps/weight), Tabs (muscle-group tabs), Progress | Already in use (WarmupSheet); covers all needed primitives |
| lucide-react | 0.577.0 | Icons: Timer, Play, Pause, Check, Plus, Minus, History, Dumbbell, Trophy, X, Calendar, Clock | All needed icons confirmed present |
| tailwindcss | 4.x | Styling, neon glow shadows, contribution grid via CSS | Established project standard |
| next | 16.2.1 | App Router route group, SSG for plan data | Established; plan pages use SSG pattern from Phase 3 |

### No New Packages Needed
All required functionality is covered by existing dependencies. Key confirmations:
- `@base-ui/react` Drawer: swipe-dismiss bottom sheet, `swipeDirection: 'down'` (default), supports snap points
- `@base-ui/react` NumberField: increment/decrement + direct input with min/max; renders `<div>` with Input, Increment, Decrement sub-components
- `@base-ui/react` Tabs: Root, List, Tab, Panel — suitable for muscle-group tabs in picker
- `@base-ui/react` Progress: Root, Track, Indicator — for plan day completion progress
- Web Audio API (`AudioContext`, `OscillatorNode`): no install needed, browser-native; synthesize a short beep
- `Navigator.vibrate([200])`: browser-native; fallback is no-op on desktop

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS grid contribution graph | react-github-contribution-calendar or cal-heatmap | External dep unnecessary; 13-week × 7-day grid is trivial with Tailwind |
| AudioContext synthesized beep | Howler.js | Howler adds 30KB for a single sound; AudioContext is zero-weight |
| @base-ui Drawer | vaul (Radix drawer) | vaul not installed; @base-ui Drawer equivalent, already in project |

## Architecture Patterns

### Recommended Project Structure (additions to existing src/)
```
src/
├── app/(main)/
│   ├── workout/
│   │   └── page.tsx           # Workout logger + plan browser (tab-switched view)
│   └── history/
│       └── page.tsx           # History page with contribution graph + session list
├── components/
│   ├── workout/
│   │   ├── WorkoutLogger.tsx       # Single-page logger (main logging UI)
│   │   ├── ExercisePickerSheet.tsx # @base-ui Drawer bottom sheet
│   │   ├── SetRow.tsx              # Inline set row with NumberField inputs + confirm
│   │   ├── RestTimerWidget.tsx     # Floating fixed-position timer bubble
│   │   ├── PRBadge.tsx             # Neon glow badge component
│   │   └── WorkoutSummary.tsx      # Post-finish summary modal
│   ├── plans/
│   │   ├── PlanBrowser.tsx         # Plan cards with recommendation callout
│   │   ├── PlanDayPicker.tsx       # Day breakdown within a plan
│   │   └── PlanProgressTracker.tsx # Day checkmarks + weekly progress
│   └── history/
│       ├── ContributionGraph.tsx   # GitHub-style heatmap (13 weeks × 7 days)
│       ├── SessionRow.tsx          # Collapsed one-liner session entry
│       └── SessionDetail.tsx       # Expanded session with per-exercise breakdown
├── stores/
│   └── useWorkoutStore.ts     # Extended (see store shape below)
└── lib/
    ├── db/workouts.ts         # Extended to version 2 (planProgress + lastUsedRest tables)
    └── pr-detection.ts        # Pure function: computePRs(sets: SetLogRecord[]) → Map
```

### Pattern 1: Extended Zustand Store (active session + timer + plan runner)
**What:** Extend existing `useWorkoutStore` shell to hold all in-flight workout state
**When to use:** All workout logging components read/write from this store; downstream phases (5, 6) also read it

```typescript
// Source: src/stores/useWorkoutStore.ts (extension of existing shell)
// Per D-18/19: dynamic import for Dexie, manual sync — no auto-persist middleware

interface ActiveExerciseState {
  exerciseLogId: ExerciseLogId
  exerciseSlug: ExerciseSlug
  sets: SetLogRecord[]            // confirmed sets only
  pendingSet: { reps: number; weightKg: number }  // pre-fill state for next set
}

interface TimerState {
  running: boolean
  remaining: number               // seconds
  total: number                   // for progress ring
  exerciseSlug: ExerciseSlug | null  // which exercise triggered it
}

interface WorkoutState {
  // Existing
  activeSession: WorkoutSessionRecord | null
  // New
  activeExercises: ActiveExerciseState[]
  currentPlanId: WorkoutPlanId | null
  currentDayLabel: string | null
  timer: TimerState
  elapsedSeconds: number          // workout total timer (top of logger page)

  // Actions
  startSession: (planId?: WorkoutPlanId, dayLabel?: string) => Promise<void>
  finishSession: () => Promise<void>
  addExercise: (slug: ExerciseSlug, restSeconds: number) => Promise<void>
  confirmSet: (exerciseLogId: ExerciseLogId, reps: number, weightKg: number) => Promise<void>
  startTimer: (seconds: number, exerciseSlug: ExerciseSlug) => void
  pauseTimer: () => void
  adjustTimer: (delta: number) => void
  dismissTimer: () => void
}
```

### Pattern 2: Dexie Schema Version 2 (planProgress + lastUsedRestSeconds)
**What:** Add two new tables; follow established migration pattern with `.version(2)` block
**When to use:** D-16 requires persistent plan progress; D-06 requires per-exercise rest memory

```typescript
// Source: src/lib/db/workouts.ts — append version(2) block, NEVER modify version(1)
// New tables:
export interface PlanProgressRecord {
  id: string                    // `${planId}-${dayLabel}`
  planId: WorkoutPlanId
  dayLabel: string
  completedAt: number           // timestamp of completion
  sessionId: WorkoutSessionId
}

export interface LastUsedRestRecord {
  exerciseSlug: ExerciseSlug    // primary key
  restSeconds: number
  updatedAt: number
}

// version(2).stores():
// sessions: 'id, startedAt, completedAt, planId'
// exercisesInSession: 'id, sessionId, exerciseSlug, orderIndex'
// sets: 'id, exerciseInSessionId, completedAt'
// planProgress: 'id, planId, dayLabel, completedAt'
// lastUsedRest: 'exerciseSlug'
```

### Pattern 3: PR Detection at Read Time
**What:** Pure function that takes all SetLogRecord for a given exercise and returns a Map of repCount → bestWeightKg
**When to use:** Called when a new set is confirmed during logging (to show PR badge) and when rendering history

```typescript
// Source: src/lib/pr-detection.ts — new file, no Dexie imports
// Computed at read time per D-11/D-13

export type PRMap = Map<number, number>  // repsCount → bestWeightKg

export function computePRs(sets: SetLogRecord[]): PRMap {
  const map = new Map<number, number>()
  for (const s of sets) {
    const current = map.get(s.reps)
    if (current === undefined || s.weightKg > current) {
      map.set(s.reps, s.weightKg)
    }
  }
  return map
}

// To check if a new set is a PR:
export function isNewPR(newSet: { reps: number; weightKg: number }, historicPRs: PRMap): boolean {
  const best = historicPRs.get(newSet.reps)
  return best === undefined || newSet.weightKg > best
}
```

### Pattern 4: Rest Timer (setInterval with useEffect cleanup)
**What:** `setInterval` managed in `useEffect` inside `RestTimerWidget` — reads from store, dispatches store actions
**When to use:** Timer widget is mounted once at app level; survives exercise list scroll

```typescript
// Source: component pattern — timer lives in RestTimerWidget.tsx
useEffect(() => {
  if (!timer.running) return
  const id = setInterval(() => {
    if (timer.remaining <= 1) {
      // Alert: synthesize beep + vibrate
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      osc.connect(ctx.destination)
      osc.frequency.value = 880  // A5 — short beep
      osc.start(); osc.stop(ctx.currentTime + 0.2)
      navigator.vibrate?.([200, 100, 200])
      dismissTimer()
    } else {
      decrementTimer()
    }
  }, 1000)
  return () => clearInterval(id)
}, [timer.running, timer.remaining])
```

### Pattern 5: Contribution Graph (CSS grid, no library)
**What:** 13-column × 7-row CSS grid, one cell per day, last 3 months. Color intensity = total volume (kg × reps) per day
**When to use:** Top of /history page

```typescript
// Volume chosen as intensity metric (discretion): most meaningful motivational signal
// for weightlifters (sessions-count undercounts hard days, set-count ignores weight)

// Build 91-day window:
const days = Array.from({ length: 91 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (90 - i))
  return { date: d.toISOString().split('T')[0], volume: 0 }
})

// Tailwind classes per volume bucket:
const intensityClass = (vol: number) => {
  if (vol === 0) return 'bg-muted'          // #oklch(0.12 0.02 265)
  if (vol < 2000) return 'bg-primary/20'
  if (vol < 5000) return 'bg-primary/40'
  if (vol < 10000) return 'bg-primary/70'
  return 'bg-primary'                       // full neon cyan
}
// Grid: grid-cols-13 with Tailwind arbitrary value or inline style
```

### Pattern 6: Bottom Sheet (Exercise Picker) with @base-ui Drawer
**What:** Drawer from `@base-ui/react/drawer`, swipes down to dismiss, contains search + Tabs for muscle groups
**When to use:** "+Exercise" button tap on workout logger page

```typescript
// Source: @base-ui/react 1.3 — Drawer component (same package as Dialog used in WarmupSheet)
import { Drawer } from '@base-ui/react/drawer'

// Key props for bottom sheet behavior:
// swipeDirection="down" (default) — swipe down to dismiss
// snapPoints={[0.5, 1]} — half-height default, full on scroll
// modal={true} — standard modal behavior

<Drawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="down">
  <Drawer.Portal>
    <Drawer.Backdrop className="fixed inset-0 z-40 bg-background/80" />
    <Drawer.Popup className="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col">
      {/* Search bar */}
      {/* Tabs: Recent | All | Chest | Back | ... */}
      {/* Exercise list (filtered) */}
    </Drawer.Popup>
  </Drawer.Portal>
</Drawer.Root>
```

### Pattern 7: NumberField for Set Inputs
**What:** `@base-ui/react` NumberField provides accessible number inputs with increment/decrement
**When to use:** Reps and weightKg inputs in each set row

```typescript
import { NumberField } from '@base-ui/react/number-field'

// For reps: min=1, max=100, step=1
// For weight: min=0, step=0.5 (allow 0.5kg increments), no max
// defaultValue pre-fills from previous set values (D-03)

<NumberField.Root value={reps} onValueChange={setReps} min={1} max={100} step={1}>
  <NumberField.Group className="flex items-center gap-1">
    <NumberField.Decrement className="..."><Minus size={14} /></NumberField.Decrement>
    <NumberField.Input className="w-12 text-center bg-input rounded px-1 py-1 text-[16px]" />
    <NumberField.Increment className="..."><Plus size={14} /></NumberField.Increment>
  </NumberField.Group>
</NumberField.Root>
```

### Pattern 8: Plan Recommendation Logic (without bio data)
**What:** Infer user level from workout history — beginner/intermediate/advanced
**When to use:** Plan browser "Recommended for you" callout (D-18, Claude's discretion)

```typescript
// Inference rules (no bio data):
// < 5 sessions total OR < 2 weeks of history → 'beginner'
// 5-30 sessions OR 2-12 weeks → 'intermediate'
// 30+ sessions OR 12+ weeks → 'advanced'
// Warning threshold: show warning if plan.difficulty > inferredLevel

export function inferUserLevel(sessions: WorkoutSessionRecord[]): Difficulty {
  const count = sessions.length
  if (count < 5) return 'beginner'
  const firstDate = sessions.reduce((a, b) => Math.min(a, b.startedAt), Infinity)
  const weeksActive = (Date.now() - firstDate) / (7 * 24 * 3600 * 1000)
  if (count >= 30 || weeksActive >= 12) return 'advanced'
  return 'intermediate'
}
```

### Pattern 9: Bottom Nav Extension (2 new tabs)
**What:** Extend existing `BottomNav.tsx` tabs array — add History (/history) and Workout (/workout)
**Icon choices (discretion):** History = `History` icon from lucide, Workout = `Dumbbell` icon (already imported)
**Note:** Map = `MapPin`, Exercises = `Dumbbell` (current), so Workout tab needs a distinct icon

Recommended icons (all confirmed in lucide-react 0.577.0):
- Map: `MapPin` (existing)
- Exercises: `Dumbbell` (existing) — keep but consider `ListChecks` for contrast with Workout
- History: `History`
- Workout: `Timer` (represents active workout/logging)

### Anti-Patterns to Avoid
- **Auto-persist Zustand middleware (persist/immer):** Project explicitly uses manual sync (D-19). Do not add `persist` middleware.
- **dexie-react-hooks / useLiveQuery:** Not installed; not needed. Use manual Zustand-Dexie sync.
- **Modifying version(1) Dexie block:** Append `.version(2)` only; never touch version(1).
- **Storing computed PRs in Dexie:** Violates D-11 (compute at read time). PRs are derived from raw sets.
- **Imperial weight:** D-04 locks to kg only. No unit toggle, no conversion logic.
- **Web Workers for timer:** Overkill for foreground timer; setInterval in useEffect with cleanup is correct.
- **SSR accessing Dexie:** Always dynamic-import Dexie in store actions, never at module top level.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bottom sheet / swipe drawer | Custom CSS transform + touch handlers | `@base-ui/react` Drawer | Swipe physics, snap points, focus trap, scroll lock — 100+ edge cases |
| Number inputs with +/- buttons | Custom `<input>` + button state | `@base-ui/react` NumberField | Keyboard accessibility, mobile virtual keyboard, touch scrub, value clamping |
| Muscle-group tab navigation | Custom tab state manager | `@base-ui/react` Tabs | ARIA roles, keyboard navigation, focus management |
| Contribution graph heatmap | Chart.js / D3 | CSS grid + Tailwind | Grid is 13×7 squares — zero-dependency, < 50 lines |
| Beep sound | Audio file + `<audio>` element | `AudioContext` synthesized tone | No network request, instant, no asset management |
| Vibration | Third-party library | `navigator.vibrate()` | Browser native, one-liner, graceful no-op on desktop |
| Unique IDs for Dexie records | UUID library | `crypto.randomUUID()` | Browser native in all modern browsers, no install |

**Key insight:** The `@base-ui/react` package already installed covers the three hardest UX problems (drawer, number input, tabs). Using it consistently avoids introducing Radix UI, shadcn modals, or vaul as a second component system.

## Common Pitfalls

### Pitfall 1: SSR crash from top-level Dexie import
**What goes wrong:** `WorkoutsDatabase` instantiates at module level → crashes Next.js server render with "IndexedDB is not defined"
**Why it happens:** Dexie uses IndexedDB which is browser-only
**How to avoid:** Follow the established pattern — always `await import('@/lib/db/workouts')` inside async store actions, never at the top of a store file
**Warning signs:** "ReferenceError: indexedDB is not defined" in build or dev server logs

### Pitfall 2: Timer drift on mobile when screen locks
**What goes wrong:** `setInterval` is throttled or paused when the phone screen locks or the tab is backgrounded (D-07 says "foreground only" — this is acceptable)
**Why it happens:** Browser background throttling of `setInterval`
**How to avoid:** Store `startedAt` timestamp when timer starts; on visibility change (`document.addEventListener('visibilitychange')`), recalculate remaining as `total - (Date.now() - startedAt)`. Timer shows accurate value on return.
**Warning signs:** Timer shows wrong time after switching apps and back

### Pitfall 3: @base-ui Drawer vs Dialog confusion
**What goes wrong:** Using `Dialog` for the exercise picker bottom sheet loses swipe-dismiss behavior
**Why it happens:** WarmupSheet used Dialog — that is correct for a modal sheet without swipe. Exercise picker needs swipe-to-dismiss
**How to avoid:** Use `Drawer` from `@base-ui/react/drawer` for exercise picker. Keep Dialog for WarmupSheet (it doesn't need swipe).
**Warning signs:** Exercise picker doesn't respond to swipe gestures on mobile

### Pitfall 4: Dexie compound query performance for PR detection
**What goes wrong:** Querying all sets across all sessions to compute PRs for one exercise is slow at scale
**Why it happens:** No compound index on `(exerciseInSessionId, reps, weightKg)` — but sets are indexed only by `exerciseInSessionId`
**How to avoid:** Query via join: get all ExerciseInSession records for a given slug, then get their sets via `exerciseInSessionId`. For v1 scale (hundreds of sessions) this is acceptable. Add index in version(3) if needed.
**Warning signs:** PR detection takes > 100ms (check in browser DevTools IndexedDB timing)

### Pitfall 5: NumberField `onValueChange` vs `onChange`
**What goes wrong:** Using `onChange` (native input event) instead of `onValueChange` gives string values, not numbers
**Why it happens:** NumberField wraps an `<input>` but provides its own typed callback
**How to avoid:** Use `onValueChange={(val) => setReps(val ?? 0)}` — the callback receives `number | null`
**Warning signs:** TypeScript error "Type 'string' is not assignable to type 'number'"

### Pitfall 6: Plan data offline availability
**What goes wrong:** Plan reference data fetched from MongoDB API at runtime fails when offline
**Why it happens:** SSG fetches at build time but if the API fails (or ISR triggers), runtime fetch is attempted
**How to avoid:** Use `generateStaticParams` + `getStaticProps` equivalent (fetch at build via `async function` in Server Component) so plan data is baked into the static bundle. If plans come from a dedicated `/api/plans` route, cache in Zustand on first load and use that as offline fallback.
**Warning signs:** Plan browser shows empty state when airplane mode is on

### Pitfall 7: Contribution graph misaligned week columns
**What goes wrong:** 91-day window doesn't align to Sunday/Monday column starts — graph looks offset
**Why it happens:** Day 0 of the array may be mid-week
**How to avoid:** Pad the start of the array to the nearest week boundary (add empty cells at the start). Calculate `startPadding = dayOfWeek(firstDay)` cells to prepend.
**Warning signs:** Heatmap columns appear shifted compared to reference GitHub graphs

### Pitfall 8: `crypto.randomUUID()` in test environment
**What goes wrong:** `crypto.randomUUID()` throws in jsdom test environment (fake-indexeddb does not need it, but store action tests do)
**Why it happens:** jsdom has incomplete crypto support in some versions
**How to avoid:** In vitest tests that need IDs, use `'test-id-' + Math.random()` or mock `crypto.randomUUID`. The project vitest setup already loads fake-indexeddb — add crypto mock to `tests/setup.ts` if needed.
**Warning signs:** "crypto.randomUUID is not a function" in test output

## Code Examples

Verified patterns from installed packages and existing codebase:

### Dexie version 2 migration (append-only)
```typescript
// Source: src/lib/db/workouts.ts — extend existing file
// NEVER modify version(1) block
this.version(2).stores({
  sessions: 'id, startedAt, completedAt, planId',
  exercisesInSession: 'id, sessionId, exerciseSlug, orderIndex',
  sets: 'id, exerciseInSessionId, completedAt',
  planProgress: 'id, planId, dayLabel, completedAt',
  lastUsedRest: 'exerciseSlug',
})
// No upgrade() needed — new tables start empty; existing tables unchanged
```

### Query: all sets for an exercise slug (for PR detection)
```typescript
// Source: Dexie 4 API — EntityTable.where()
// Step 1: get all ExerciseInSession records for this exercise
const exerciseLogs = await workoutsDb.exercisesInSession
  .where('exerciseSlug').equals(slug)
  .toArray()
const exerciseLogIds = exerciseLogs.map(e => e.id)

// Step 2: get all sets for those exercise logs
const sets = await workoutsDb.sets
  .where('exerciseInSessionId').anyOf(exerciseLogIds)
  .toArray()
```

### Query: sessions for history page (reverse chronological)
```typescript
// Source: Dexie 4 API
const sessions = await workoutsDb.sessions
  .where('completedAt').above(0)   // exclude in-progress sessions
  .reverse()
  .sortBy('startedAt')
// Or simpler:
const sessions = await workoutsDb.sessions
  .orderBy('startedAt').reverse().toArray()
  .then(all => all.filter(s => s.completedAt !== null))
```

### @base-ui Drawer (bottom sheet) — established project pattern
```typescript
// Source: @base-ui/react 1.3.0 — mirrors WarmupSheet pattern (Dialog → Drawer)
import { Drawer } from '@base-ui/react/drawer'

<Drawer.Root open={open} onOpenChange={onOpenChange}>
  <Drawer.Portal>
    <Drawer.Backdrop className="fixed inset-0 z-40 bg-background/80" />
    <Drawer.Popup className="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden">
      <Drawer.Title className="sr-only">Pick an exercise</Drawer.Title>
      {/* ... content ... */}
    </Drawer.Popup>
  </Drawer.Portal>
</Drawer.Root>
```

### @base-ui Tabs (muscle-group navigation in picker)
```typescript
// Source: @base-ui/react 1.3.0 — Tabs component
import { Tabs } from '@base-ui/react/tabs'

<Tabs.Root defaultValue="recent">
  <Tabs.List className="flex overflow-x-auto border-b border-border px-4 gap-1">
    <Tabs.Tab value="recent" className="...">Recent</Tabs.Tab>
    <Tabs.Tab value="chest" className="...">Chest</Tabs.Tab>
    {/* ... */}
  </Tabs.List>
  <Tabs.Panel value="recent" className="overflow-y-auto flex-1">
    {/* recent/frequent exercises */}
  </Tabs.Panel>
</Tabs.Root>
```

### Floating timer widget (fixed position, z-above nav)
```typescript
// Source: pattern — no library needed
// Fixed position above bottom nav (bottom-20 on mobile to clear 64px nav bar)
// z-40 — below Drawer/Dialog overlays but above page content
<div className="fixed bottom-20 right-4 z-40 md:bottom-6">
  {/* Collapsed bubble: */}
  <button
    onClick={() => setExpanded(true)}
    className="flex items-center gap-2 bg-card border border-primary/50 rounded-full px-3 py-2 shadow-lg shadow-primary/20"
  >
    <Timer size={16} className="text-primary" />
    <span className="text-primary font-mono text-[16px]">{formatTime(remaining)}</span>
  </button>
</div>
```

### PR badge with neon glow
```typescript
// Source: Tailwind shadow utilities (neon glow pattern used throughout project)
// --primary is oklch(0.85 0.18 195) — cyan/teal
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[12px] font-semibold shadow-[0_0_8px_2px] shadow-primary/50">
  <Trophy size={12} />
  PR
</span>
```

## Egyptian Gym Splits Research (Seed Data — D-17)

**Recommendation for 3 new plans to add to `data/workout-plans.json`:**

Based on community knowledge (MEDIUM confidence — reflects established gym culture):

1. **PPL (Push/Pull/Legs)** — 6 days/week, intermediate. The most popular structured split globally and well-known in Egyptian gyms. Day 1: Push A, Day 2: Pull A, Day 3: Legs A, Day 4: Push B, Day 5: Pull B, Day 6: Legs B.

2. **Arnold Split** — 6 days/week, advanced. Named after Arnold Schwarzenegger's competition prep. Three pairings: Chest+Back (×2), Shoulders+Arms (×2), Legs (×2). Popular with intermediate-to-advanced lifters who want higher frequency.

3. **Upper/Lower Split with Supersets** — 4 days/week, intermediate. Egyptian gym trainers commonly program supersets (chest/back paired) to maximize time efficiency. Day 1: Upper A (superset pairs), Day 2: Lower A, Day 3: Upper B, Day 4: Lower B.

These three + the existing 4 plans = 7 total plans covering beginner → advanced across 3-6 days/week.

All plan exercises must use slugs that exist in `data/exercises.json` (110 exercises available). Verify slug matches before adding.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| dexie-react-hooks `useLiveQuery` | Manual Zustand sync (D-19) | Phase 1 decision | All Dexie reads are explicit async calls inside store actions |
| File-based plans JSON | MongoDB + SSG pattern | Phase 1 | Plan data seeded to MongoDB, fetched at build time, no runtime API calls |
| Separate sheet libraries (vaul, react-spring-bottom-sheet) | `@base-ui/react` Drawer | Phase 3 WarmupSheet | Consistent component system, one package |

**Deprecated/outdated (do not use):**
- `dexie-react-hooks`: Not installed; manual sync is the project pattern
- `navigator.vibrate` without optional chaining: Always use `navigator.vibrate?.()` — not available on desktop/iOS Safari

## Open Questions

1. **iOS Safari and Navigator.vibrate**
   - What we know: `navigator.vibrate` is not supported on iOS Safari (returns undefined)
   - What's unclear: Whether user base is predominantly Android or mixed
   - Recommendation: Use optional chaining (`navigator.vibrate?.([200])`) and document iOS limitation as known behavior. Sound alert via AudioContext works on iOS.

2. **Plan exercises referencing slugs not in exercises.json**
   - What we know: Existing 4 plans were verified against the 110-exercise data during seed
   - What's unclear: The 3 new Egyptian split plans need slug verification before adding
   - Recommendation: Plan task must cross-reference every `exerciseSlug` against `data/exercises.json` before writing plan JSON. If a needed exercise is missing, either add it or substitute a close equivalent.

3. **Contribution graph grid-cols-13**
   - What we know: Tailwind 4 supports arbitrary values: `grid-cols-[13]` or `[repeat(13,1fr)]`
   - What's unclear: Whether `tw-animate-css` or other Tailwind plugins affect arbitrary value generation
   - Recommendation: Use inline `style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}` as a safe fallback rather than arbitrary Tailwind class.

## Environment Availability

Step 2.6: SKIPPED (no external tool dependencies — all implementation uses browser APIs and already-installed npm packages)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run tests/` |
| Full suite command | `npx vitest run && npx playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WORK-01 | Log freestyle workout: add exercise, confirm sets, finish | unit (store) + e2e | `npx vitest run tests/stores/useWorkoutStore.test.ts` | ❌ Wave 0 |
| WORK-01 | Exercise picker opens and filters exercises | e2e | `npx playwright test e2e/workout.spec.ts` | ❌ Wave 0 |
| WORK-01 | Set row pre-fills from previous set | unit (component) | `npx vitest run tests/components/SetRow.test.ts` | ❌ Wave 0 |
| WORK-02 | Rest timer counts down and triggers alert | unit (timer logic) | `npx vitest run tests/stores/useWorkoutStore.test.ts` | ❌ Wave 0 |
| WORK-03 | History shows sessions in reverse chronological order | e2e | `npx playwright test e2e/history.spec.ts` | ❌ Wave 0 |
| WORK-03 | Contribution graph renders correct cell count (91 cells) | unit (component) | `npx vitest run tests/components/ContributionGraph.test.ts` | ❌ Wave 0 |
| WORK-04 | PR detection: new max weight triggers PR badge | unit (pure fn) | `npx vitest run tests/lib/pr-detection.test.ts` | ❌ Wave 0 |
| WORK-05 | Plan browser shows plans; tap day pre-loads logger | e2e | `npx playwright test e2e/workout.spec.ts` | ❌ Wave 0 |
| WORK-05 | Plan progress recorded after session finish | unit (store) | `npx vitest run tests/stores/useWorkoutStore.test.ts` | ❌ Wave 0 |
| WORK-06 | Dexie schema v2 has planProgress and lastUsedRest tables | unit (db) | `npx vitest run tests/lib/db/workouts.test.ts` | ✅ (extend) |
| WORK-06 | Completed sessions persist across db reload | unit (db) | `npx vitest run tests/lib/db/workouts.test.ts` | ✅ (extend) |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/`
- **Per wave merge:** `npx vitest run && npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/stores/useWorkoutStore.test.ts` — covers WORK-01, WORK-02, WORK-05 store actions
- [ ] `tests/lib/pr-detection.test.ts` — covers WORK-04 PR detection pure function
- [ ] `tests/components/ContributionGraph.test.ts` — covers WORK-03 graph rendering
- [ ] `tests/components/SetRow.test.ts` — covers WORK-01 set row pre-fill behavior
- [ ] `e2e/workout.spec.ts` — covers WORK-01 end-to-end logging flow, WORK-05 plan runner
- [ ] `e2e/history.spec.ts` — covers WORK-03 history page, WORK-06 data persistence
- [ ] Extend `tests/lib/db/workouts.test.ts` — add v2 schema table tests for WORK-06

## Sources

### Primary (HIGH confidence)
- Installed package: `@base-ui/react@1.3.0` — TypeScript definitions inspected directly for Drawer, NumberField, Tabs, Progress APIs
- Installed package: `dexie@4.3.0` — TypeScript definitions and exports inspected; `liveQuery`, `Dexie.prototype.transaction`, EntityTable API verified
- Installed package: `lucide-react@0.577.0` — All required icons confirmed present via Node.js require
- Source file: `src/lib/db/workouts.ts` — Existing schema version 1 inspected; migration comment pattern documented
- Source file: `src/stores/useWorkoutStore.ts` — Existing store shell inspected; extension approach planned
- Source file: `src/components/exercise-library/WarmupSheet.tsx` — @base-ui Dialog pattern confirmed; Drawer follows same API shape

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions D-01 through D-18 — directly drives all design decisions; locked by user
- `data/workout-plans.json` — 4 existing plans inspected; exercise slugs and dayLabel structure confirmed
- Community knowledge: Egyptian gym split preferences (PPL, Arnold, Upper/Lower w/ supersets) — general fitness community knowledge, standard splits worldwide

### Tertiary (LOW confidence)
- iOS Safari `navigator.vibrate` absence — documented browser behavior (MDN), confirmed at-training-time; recommend optional chaining regardless

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages inspected from node_modules directly
- Architecture: HIGH — extends established project patterns, schema gaps identified precisely
- Pitfalls: HIGH — derived from code inspection of existing patterns and API signatures
- Seed data (Egyptian splits): MEDIUM — standard gym culture knowledge; exercise slug availability needs runtime verification

**Research date:** 2026-03-23
**Valid until:** 2026-06-23 (stable ecosystem; Next.js 16 / @base-ui 1.3 unlikely to change APIs in 3 months)
