# Phase 06: Click-to-Muscle Panel - Research

**Researched:** 2026-03-24
**Domain:** React UI panels, @base-ui/react Drawer, Zustand state integration, exercise/strain data presentation
**Confidence:** HIGH

## Summary

Phase 6 adds a slide-out muscle detail panel — the "aha moment" that ties together the muscle map (Phase 2), exercise library (Phase 3), and strain engine (Phase 5) into a single interactive experience. When a user taps any muscle on the map, a panel opens showing the muscle's strain state, exercises that target it, and warm-up guidance.

All infrastructure for this phase already exists. The `useMapStore` already tracks `selectedMuscle`. The `useStrainMap()` hook already provides `Map<MuscleSlug, StrainLevel>`. The `STRAIN_COLORS` palette, exercise data, muscle data, and warmup data are all available. The @base-ui/react `Drawer` component (already used in Phase 4) supports `swipeDirection='left'` for right-side drawers and `swipeDirection='down'` for bottom sheets, and Tailwind responsive utilities handle the desktop-vs-mobile layout split.

This phase is primarily a UI composition task: wire existing state and data into a new `MusclePanelDrawer` component, mount it on the home page, and close the panel on view toggle. No new data, no new stores, no new libraries are required.

**Primary recommendation:** Build `MusclePanelDrawer` as a controlled `Drawer.Root` driven by `selectedMuscle !== null`, using `swipeDirection='left'` on desktop and `swipeDirection='down'` on mobile via responsive Tailwind classes on `Drawer.Popup`, and call `selectMuscle(null)` on close to keep map and panel in sync.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Panel Layout & Appearance**
- Right-side drawer on desktop (~380px wide), bottom sheet on mobile (~85vh height) — standard detail panel pattern, keeps map visible
- Map stays visible while panel is open — map shifts/shrinks to accommodate drawer on desktop, visible behind bottom sheet on mobile
- Semi-transparent backdrop on mobile only — mobile bottom sheet gets dimmed backdrop for focus; desktop drawer pushes content with no overlay

**Panel Content & Information Architecture**
- Content order: Header (muscle name + strain badge) → Strain status card → Exercises list → Warm-up section — strain first gives instant "body status" answer, exercises below for action
- Exercises displayed as compact card list (name + equipment + difficulty badge), tap to expand details — reuses Phase 3 card pattern
- All primary exercises shown for the muscle, with secondary exercises in a collapsible "Also targets" section — primary exercises are the main value, secondary available but not cluttering
- Warm-up presented as inline collapsible section at bottom of panel — always accessible, reuses warmup data from Phase 3

**Interaction & Navigation**
- Panel opens automatically on muscle tap — subscribes to `selectedMuscle` in useMapStore, opens when non-null
- Multiple close paths: X button, swipe down (mobile), click backdrop (mobile), tap same muscle again (deselect), or tap a different muscle (switches panel content)
- "View all exercises" link at bottom of exercises section, pre-filtered to `?muscle=slug` — leverages Phase 3 D-07 deep-linking
- Panel closes and muscle deselects on view toggle (front/back) — switching views changes available muscles; keeping a stale panel is confusing

**Strain Display & Visual Feedback**
- Strain level shown as colored badge with level text (e.g., "Heavy" in orange) + a mini strain bar (0-100% fill) — immediate visual read with precise info
- Reuse STRAIN_COLORS from strain-engine.ts — consistency with heatmap colors (blue→yellow→orange→red) so panel and map match
- Show "Rested" state explicitly with a muted "Rested" badge in slate color — clicking a rested muscle should still communicate its state
- Keep existing `data-selected` brighten effect (Phase 2 D-10) for selected muscle highlight on map while panel is open

### Claude's Discretion
- Exact drawer/sheet animation and transition timing
- Panel header design details (icon, typography sizing)
- Strain bar visual style (rounded vs angular, height)
- Exercise card expand/collapse animation approach
- Warm-up section collapsible trigger design
- Mobile swipe-to-close gesture threshold
- Responsive breakpoint for drawer vs bottom sheet switch

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MAP-04 | User can click any muscle to open an exercise reference panel | `MuscleMapCanvas` already calls `selectMuscle(slug)` on hit-target click; panel subscribes to `selectedMuscle` from `useMapStore` |
| EXER-04 | User can see exercises targeting a specific muscle via click-to-muscle reference panel | `data/exercises.json` has `primaryMuscles`/`secondaryMuscles` arrays; `filterExercises` in `exercise-filter.ts` filters by muscle slug; panel renders filtered list |
| EXER-05 | User can see current strain state for a muscle in the reference panel | `useStrainMap()` returns `Map<MuscleSlug, StrainLevel>`; `STRAIN_COLORS` maps level to color; panel displays badge + bar per locked decision |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @base-ui/react | ^1.3.0 | `Drawer.Root`, `Drawer.Popup`, `Drawer.Backdrop`, `Drawer.Portal`, `Drawer.Close` | Already used in Phase 4 for bottom sheets — established project pattern |
| zustand | ^5.0.12 | `useMapStore` for `selectedMuscle` state | Established store; panel subscribes to existing state |
| tailwindcss | ^4 | Responsive layout classes for mobile/desktop switching | Project CSS framework; responsive breakpoints handle drawer/sheet split |
| lucide-react | ^0.577.0 | X close icon, chevron for collapsibles | Already used across the project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `src/lib/exercise-filter.ts` | (project) | Filter exercises by `muscle` slug | Primary and secondary exercise lists |
| `src/lib/strain-engine.ts` | (project) | `STRAIN_COLORS` for strain badge/bar color | Strain display in panel header |
| `src/hooks/useStrainMap.ts` | (project) | Current per-muscle strain levels | Fetching strain state for selected muscle |
| `data/exercises.json` | (project) | 110 exercises with muscle arrays | Exercise list data source |
| `data/muscles.json` | (project) | 54 muscles with displayName and group | Muscle display name lookup |
| `data/warmups.json` | (project) | Warm-up movements per muscle group | Warm-up section in panel |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @base-ui/react Drawer | Custom CSS fixed-position panel | Drawer gives swipe-to-close, focus management, animation, and ARIA for free — custom is significant hand-roll |
| `useMapStore.selectedMuscle` | Separate `usePanelStore` | No new store needed; selectedMuscle IS the panel open/close signal already |
| Inline data import | Server component + props | Home page is already client-side; inline import avoids prop drilling through page.tsx |

**Installation:** No new packages required. All dependencies already installed.

---

## Architecture Patterns

### Recommended Component Structure
```
src/components/muscle-panel/
├── MusclePanelDrawer.tsx     # Root component: Drawer.Root controlled by selectedMuscle
├── MusclePanelContent.tsx    # Inner content: header, strain card, exercise list, warm-up
├── StrainStatusCard.tsx      # Colored badge + progress bar for strain level
├── PanelExerciseList.tsx     # Primary + collapsible secondary exercise lists
└── PanelWarmupSection.tsx    # Collapsible warm-up movements section
```

### Pattern 1: Controlled Drawer Driven by selectedMuscle

**What:** `MusclePanelDrawer` receives no open prop — it reads `selectedMuscle` from `useMapStore` directly. Panel is open when `selectedMuscle !== null`.

**When to use:** Panel must respond to ALL muscle selection changes (map click, tap-same-to-deselect, view toggle reset). Centralizing in `useMapStore` means no duplicated state.

**Example:**
```typescript
// MusclePanelDrawer.tsx
'use client'
import { Drawer } from '@base-ui/react/drawer'
import { useMapStore } from '@/stores/useMapStore'

export function MusclePanelDrawer({ exercises, muscles, warmups }) {
  const { selectedMuscle, selectMuscle } = useMapStore()
  const isOpen = selectedMuscle !== null

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => { if (!open) selectMuscle(null) }}
      modal={false}           // desktop: map stays interactive behind panel
      swipeDirection="left"   // right-side drawer dismissed by swiping left
    >
      <Drawer.Portal>
        {/* Mobile-only backdrop */}
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-background/80 md:hidden" />
        <Drawer.Popup
          className={[
            // Mobile: bottom sheet
            'fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-2xl',
            'max-h-[85vh] flex flex-col outline-none',
            // Desktop: right-side drawer
            'md:inset-y-0 md:right-0 md:left-auto md:w-[380px] md:max-h-none',
            'md:border-t-0 md:border-l md:rounded-none md:rounded-tl-none',
          ].join(' ')}
        >
          {/* ... panel content ... */}
        </Drawer.Popup>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
```

**Confidence:** HIGH — verified against DrawerRoot.d.ts props: `open`, `onOpenChange`, `modal`, `swipeDirection`. The `modal={false}` keeps map interactive on desktop. `swipeDirection='left'` for right-side drawers confirmed from SwipeDirection type (`'up' | 'down' | 'left' | 'right'`).

### Pattern 2: View Toggle Closes Panel

**What:** `MuscleMapControls` already calls `setView()` which mutates `currentView` in `useMapStore`. A `useEffect` in the panel (or home page) watches `currentView` and calls `selectMuscle(null)` when it changes while a muscle is selected.

**When to use:** Prevents stale panel (muscle on front view, user switches to back view — muscle no longer visible).

**Example:**
```typescript
// Inside MusclePanelDrawer or page-level effect
const { currentView, selectedMuscle, selectMuscle } = useMapStore()

useEffect(() => {
  if (selectedMuscle !== null) {
    selectMuscle(null)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentView])
// NOTE: selectMuscle excluded from deps — it's a stable Zustand action
```

### Pattern 3: Exercise Filtering for Primary/Secondary

**What:** Use `filterExercises` from `exercise-filter.ts` with the selected muscle slug. Then split by whether the muscle appears in `primaryMuscles` vs `secondaryMuscles`.

**When to use:** Separates "targets this muscle directly" from "also engages it" per locked content architecture decision.

**Example:**
```typescript
const primaryExercises = useMemo(
  () => allExercises.filter(ex => ex.primaryMuscles.includes(selectedMuscle)),
  [allExercises, selectedMuscle]
)
const secondaryExercises = useMemo(
  () => allExercises.filter(
    ex => ex.secondaryMuscles.includes(selectedMuscle) &&
          !ex.primaryMuscles.includes(selectedMuscle)
  ),
  [allExercises, selectedMuscle]
)
```

### Pattern 4: Strain Badge + Bar

**What:** Look up `strainMap.get(selectedMuscle)` to get the level (or default to `StrainLevel.Rested`). Render a colored badge using `STRAIN_COLORS[level]` and a progress bar with inline style for fill width.

**Note on Rested:** `useStrainMap()` does NOT include muscles with `Rested` level in the Map (Rested = absent key). Check `strainMap.has(slug)` to distinguish Rested from unknown.

**Example:**
```typescript
// StrainStatusCard.tsx
import { STRAIN_COLORS } from '@/lib/strain-engine'
import { StrainLevel } from '@/types'

const STRAIN_PERCENTS: Record<StrainLevel, number> = {
  [StrainLevel.Rested]: 0,
  [StrainLevel.Light]: 30,
  [StrainLevel.Moderate]: 50,
  [StrainLevel.Heavy]: 70,
  [StrainLevel.Strained]: 90,
}

const level = strainMap.get(slug) ?? StrainLevel.Rested
const color = STRAIN_COLORS[level]
const pct = STRAIN_PERCENTS[level]
```

### Pattern 5: Warmup Lookup by Muscle Group

**What:** Given a `MuscleSlug`, look up the muscle's `group` from `muscles.json`, then find the warmup entry in `warmups.json` by `muscleGroup`.

**Example:**
```typescript
const muscleData = muscles.find(m => m.slug === selectedMuscle)
const warmupEntry = warmups.find(w => w.muscleGroup === muscleData?.group)
const movements = warmupEntry?.movements ?? []
```

### Pattern 6: "View All Exercises" Deep-Link

**What:** Use Next.js `Link` component pointing to `/exercises?muscle={slug}`. This leverages Phase 3 D-07 deep-linking already implemented in `ExerciseLibrary`.

**Example:**
```typescript
import Link from 'next/link'
// ...
<Link href={`/exercises?muscle=${selectedMuscle}`} className="...">
  View all exercises
</Link>
```

### Pattern 7: Mounting on Home Page

**What:** `page.tsx` renders `<MuscleMap />`. Add `<MusclePanelDrawer>` as a sibling. Load exercise, muscle, and warmup JSON data at the page level (server component data fetch via `import`) and pass as props.

**Note on current page.tsx:** It is a Server Component (no `'use client'` directive). Data can be imported at the top. `MusclePanelDrawer` itself will be `'use client'`.

**Example:**
```typescript
// src/app/(main)/page.tsx
import exercisesData from '@/../data/exercises.json'
import musclesData from '@/../data/muscles.json'
import warmupsData from '@/../data/warmups.json'
import { MuscleMap } from '@/components/muscle-map/MuscleMap'
import { MusclePanelDrawer } from '@/components/muscle-panel/MusclePanelDrawer'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-8 py-12">
      <h1 className="text-[20px] font-semibold text-foreground mb-6">Rip Zone</h1>
      <MuscleMap />
      <MusclePanelDrawer
        exercises={exercisesData}
        muscles={musclesData}
        warmups={warmupsData}
      />
    </main>
  )
}
```

### Anti-Patterns to Avoid

- **Separate `isPanelOpen` state in addition to `selectedMuscle`:** The `selectedMuscle !== null` IS the open signal. Two sources of truth cause drift where panel can be "open" with no muscle or "closed" with a muscle still selected.
- **Using `modal={true}` on desktop:** Desktop drawer should not trap focus or lock scroll — the map needs to remain interactive. Use `modal={false}` for desktop behavior.
- **Watching `selectedMuscle` for the close side-effect AND using `onOpenChange`:** Only close via `onOpenChange` calling `selectMuscle(null)`. Don't add a second `useEffect` for the same purpose.
- **Importing exercise/warmup data inside the client component:** This forces the JSON into the client bundle unnecessarily. Import at the server-component page level and pass as props.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Swipe-to-close gesture | Custom touch event listeners + velocity detection | `Drawer.Root` with `swipeDirection` | @base-ui handles pointer capture, velocity calc, snap-back animation, and momentum |
| Focus trap & ARIA | Custom focus management | `Drawer.Root` + `Drawer.Popup` | ARIA `dialog` role, focus trap, escape-key close are all built-in |
| Animated panel entry/exit | CSS keyframes + JS class toggling | `tw-animate-css` + @base-ui transition state data attributes | @base-ui sets `data-open`/`data-closed` on popup for CSS transitions; `tw-animate-css` provides `animate-in`/`animate-out` utilities |
| Backdrop blur on mobile | Custom `<div>` with event listeners | `Drawer.Backdrop` | Correct z-index layering and dismiss-on-click handled |
| Exercise filtering | Re-implementing filter logic | `filterExercises` from `exercise-filter.ts` | Already handles query + equipment + muscle slug with AND logic |

**Key insight:** @base-ui/react Drawer already handles every interactive complexity of a panel component. The task is CSS layout and content composition, not behavior engineering.

---

## Common Pitfalls

### Pitfall 1: Right-Side Drawer CSS Positioning
**What goes wrong:** The @base-ui Drawer is designed for bottom sheets by default. A right-side desktop drawer requires explicit positioning overrides — the popup's default CSS transform originates from the bottom.
**Why it happens:** @base-ui Drawer uses CSS variables (e.g., `--drawer-swipe-distance`) that are set based on `swipeDirection`. When `swipeDirection='left'`, the transform axis changes to X.
**How to avoid:** On the `Drawer.Popup`, use Tailwind responsive utilities: bottom-sheet styles for mobile, right-fixed styles for `md:` breakpoint. The transition CSS may need explicit `translate-x` override on desktop if the default `translate-y` persists.
**Warning signs:** Drawer appears from wrong direction on desktop, or doesn't animate.

### Pitfall 2: modal=true Locks Map Scroll and Focus on Desktop
**What goes wrong:** If `modal={true}` (the default), the Drawer traps focus and locks document scroll. On desktop, the map would become non-interactive while the panel is open.
**Why it happens:** DrawerRoot.d.ts shows `modal` defaults to `true`.
**How to avoid:** Set `modal={false}` unconditionally (since the map should stay usable on both mobile and desktop while panel is open). The backdrop still provides visual focus cue on mobile.

### Pitfall 3: Stale Panel Content on Rapid Muscle Switches
**What goes wrong:** User taps muscle A, then quickly taps muscle B before animations complete. Panel shows A's content while B is selected.
**Why it happens:** If exercises/warmups are derived from local state (not directly from `selectedMuscle`), there can be a lag.
**How to avoid:** Derive all panel content directly from `selectedMuscle` at render time — `useMemo` with `selectedMuscle` as the dependency. Never copy `selectedMuscle` into local `useState`.

### Pitfall 4: Rested Muscles Not in strainMap
**What goes wrong:** `strainMap.get(slug)` returns `undefined` for rested muscles because `useStrainMap()` excludes Rested entries from the Map by design (Phase 5 decision). Code that doesn't handle `undefined` crashes or shows incorrect state.
**Why it happens:** Phase 5 decision: "Rested muscles excluded from result Map — Rested is the absence of a key, not a Map entry."
**How to avoid:** Always use `strainMap.get(slug) ?? StrainLevel.Rested` pattern. The fallback provides the correct display state.

### Pitfall 5: View Toggle Leaving Panel Open with Stale Muscle
**What goes wrong:** User has left biceps selected (front view), switches to back view. Biceps doesn't appear on back view, but panel stays open showing biceps data.
**Why it happens:** `currentView` changes but `selectedMuscle` does not auto-clear.
**How to avoid:** Add a `useEffect` watching `currentView` in `MusclePanelDrawer` (or in `MuscleMapControls` — either location). Call `selectMuscle(null)` when view changes while a muscle is selected. Per locked decision: "Panel closes and muscle deselects on view toggle."

### Pitfall 6: Exercises Data Not Loaded on Initial Render
**What goes wrong:** Panel opens but exercise list is empty or shows wrong content.
**Why it happens:** If exercise data is loaded via dynamic import inside the client component, there's an async delay. The muscle is selected, but the exercise list hasn't loaded yet.
**How to avoid:** Pass exercise data as props from the Server Component page (`import exercisesData from '@/../data/exercises.json'`). This is synchronous and available before any interaction.

### Pitfall 7: Secondary Exercises Showing Duplicates
**What goes wrong:** An exercise with `pectoralis-major` in both `primaryMuscles` and `secondaryMuscles` appears in both the primary list and the "Also targets" section.
**Why it happens:** The secondary filter checks `secondaryMuscles.includes(slug)` without excluding exercises already in primary.
**How to avoid:** Secondary filter: `ex.secondaryMuscles.includes(slug) && !ex.primaryMuscles.includes(slug)`.

---

## Code Examples

### DrawerRoot Controlled Pattern (verified from DrawerRoot.d.ts)
```typescript
// Source: node_modules/@base-ui/react/drawer/root/DrawerRoot.d.ts
<Drawer.Root
  open={selectedMuscle !== null}
  onOpenChange={(open) => { if (!open) selectMuscle(null) }}
  modal={false}
  swipeDirection="left"   // 'up' | 'down' | 'left' | 'right'
>
```

### Mobile Bottom Sheet + Desktop Right Drawer (Tailwind responsive split)
```typescript
// Source: Pattern derived from ExercisePickerSheet.tsx Phase 4 + locked decisions
<Drawer.Popup
  className={cn(
    // Mobile: bottom sheet (default)
    'fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-2xl',
    'max-h-[85vh] flex flex-col outline-none overflow-y-auto',
    // Desktop: right-side drawer
    'md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:w-[380px]',
    'md:max-h-none md:border-t-0 md:border-l md:rounded-none'
  )}
>
```

### Strain Badge + Bar Component
```typescript
// Source: STRAIN_COLORS from src/lib/strain-engine.ts
const level = strainMap.get(selectedMuscle) ?? StrainLevel.Rested

const STRAIN_PERCENTS: Record<StrainLevel, number> = {
  [StrainLevel.Rested]: 0,
  [StrainLevel.Light]: 30,
  [StrainLevel.Moderate]: 50,
  [StrainLevel.Heavy]: 70,
  [StrainLevel.Strained]: 90,
}

// Badge uses STRAIN_COLORS for background tint, level name as text
// Bar: <div style={{ width: `${STRAIN_PERCENTS[level]}%`, backgroundColor: STRAIN_COLORS[level] }} />
```

### View Toggle Close Effect
```typescript
// Source: useMapStore.ts — setView action, selectMuscle action
const currentView = useMapStore(s => s.currentView)
const selectMuscle = useMapStore(s => s.selectMuscle)

useEffect(() => {
  selectMuscle(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentView])
// selectMuscle is a stable Zustand action — safe to exclude from deps
```

### Existing ExercisePickerSheet Drawer Pattern (Phase 4 reference)
```typescript
// Source: src/components/workout/ExercisePickerSheet.tsx
<Drawer.Root open={open} onOpenChange={onOpenChange}>
  <Drawer.Portal>
    <Drawer.Backdrop className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
    <Drawer.Popup className="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col outline-none">
      <Drawer.Title className="sr-only">Pick an exercise</Drawer.Title>
      {/* ... */}
    </Drawer.Popup>
  </Drawer.Portal>
</Drawer.Root>
```

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified — phase is purely UI composition using existing project dependencies).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright (E2E) + Vitest (unit) |
| Config file | `playwright.config.ts` / `vitest.config.ts` |
| Quick run command | `npm run test` (Vitest unit suite) |
| Full suite command | `npm run test:e2e` (Playwright against `localhost:3001`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MAP-04 | Clicking a muscle opens the detail panel | E2E | `npx playwright test e2e/muscle-map.spec.ts` | ❌ Wave 0 (new tests in existing file) |
| EXER-04 | Panel shows exercises for the selected muscle | E2E | `npx playwright test e2e/muscle-map.spec.ts` | ❌ Wave 0 |
| EXER-05 | Panel shows strain state for the selected muscle | E2E | `npx playwright test e2e/muscle-map.spec.ts` | ❌ Wave 0 |
| MAP-04 | Panel closes when X button is clicked | E2E | `npx playwright test e2e/muscle-map.spec.ts` | ❌ Wave 0 |
| MAP-04 | Panel closes and muscle deselects on view toggle | E2E | `npx playwright test e2e/muscle-map.spec.ts` | ❌ Wave 0 |
| MAP-04 | Tapping same muscle again closes the panel | E2E | `npx playwright test e2e/muscle-map.spec.ts` | ❌ Wave 0 |
| EXER-04 | "View all exercises" link navigates to /exercises?muscle=slug | E2E | `npx playwright test e2e/muscle-map.spec.ts` | ❌ Wave 0 |

All new tests extend the existing `e2e/muscle-map.spec.ts` file under a new `describe` block: `Muscle Map — MAP-04: Muscle Detail Panel`.

### Sampling Rate
- **Per task commit:** `npm run test` (Vitest unit — fast, no server needed)
- **Per wave merge:** `npm run test:e2e` (full Playwright suite)
- **Phase gate:** Full E2E suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] New `describe` block in `e2e/muscle-map.spec.ts` — covers MAP-04, EXER-04, EXER-05
- [ ] Tests should use `page.locator('path[id="hit-muscle-pectoralis-major"]').click()` pattern (established in existing muscle-map.spec.ts)
- [ ] Panel open assertion: check for element with `data-testid="muscle-panel"` or `[aria-label*="muscle panel"]`
- [ ] Strain badge assertion: panel contains text matching strain level (Rested/Light/Moderate/Heavy/Strained)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom fixed-position panels with manual JS | @base-ui/react Drawer with swipe gesture built-in | Phase 4 (project adopted) | Swipe, focus, ARIA all handled |
| Tailwind v3 responsive classes | Tailwind v4 `@theme inline` tokens | Phase 1 (project setup) | OKLCH color tokens on `:root`, not `.dark` class |

**Deprecated/outdated:**
- `Drawer.Content`: The Phase 4 decisions confirm the project uses `Drawer.Popup` (not `Drawer.Content`). The @base-ui package has both — use `Drawer.Popup`.

---

## Open Questions

1. **Right-side Drawer CSS transform conflict on desktop**
   - What we know: `swipeDirection='left'` sets the dismissal direction. The actual CSS transform origin for entry/exit animation may default to Y-axis (bottom-up entry).
   - What's unclear: Whether @base-ui/react v1.3.0 automatically changes the CSS transform axis when `swipeDirection='left'` is set, or whether custom CSS overrides are needed for the right-side entry animation.
   - Recommendation: In Wave 1 (component build), test the drawer on desktop viewport immediately. If entry animation comes from bottom instead of right, add `translate-x-full` to the closed state via `data-closed:translate-x-full` utility or a CSS variable override.

2. **modal={false} with mobile backdrop dismiss**
   - What we know: `modal={false}` disables focus trap and scroll lock. `Drawer.Backdrop` still renders.
   - What's unclear: Whether clicking the backdrop still closes the drawer when `modal={false}`.
   - Recommendation: Verify backdrop dismiss works in early E2E test. If not, the `Drawer.Root`'s `disablePointerDismissal` prop controls this behavior separately — use `disablePointerDismissal={false}` (which is the default) to keep backdrop click-dismiss.

---

## Sources

### Primary (HIGH confidence)
- `node_modules/@base-ui/react/drawer/root/DrawerRoot.d.ts` — confirmed `open`, `onOpenChange`, `modal`, `swipeDirection` props and `SwipeDirection = 'up' | 'down' | 'left' | 'right'`
- `node_modules/@base-ui/react/drawer/popup/DrawerPopup.d.ts` — confirmed `DrawerPopup` API
- `src/stores/useMapStore.ts` — confirmed `selectedMuscle`, `selectMuscle`, `currentView`, `setView` exist
- `src/hooks/useStrainMap.ts` — confirmed return type `Map<MuscleSlug, StrainLevel>`
- `src/lib/strain-engine.ts` — confirmed `STRAIN_COLORS` palette and Rested-exclusion behavior
- `src/components/workout/ExercisePickerSheet.tsx` — Phase 4 Drawer.Portal + Drawer.Backdrop + Drawer.Popup pattern
- `src/components/exercise-library/ExerciseCard.tsx` — Phase 3 card expand/collapse pattern
- `src/components/exercise-library/WarmupSheet.tsx` — Phase 3 warmup display pattern
- `src/lib/exercise-filter.ts` — confirmed `filterExercises({ exercises, muscle })` API
- `data/exercises.json` — confirmed 110 exercises with `primaryMuscles`/`secondaryMuscles` arrays
- `data/muscles.json` — confirmed 54 muscles with `slug`, `displayName`, `group`
- `data/warmups.json` — confirmed warmup entries keyed by `muscleGroup`
- `e2e/muscle-map.spec.ts` — confirmed hit-target click pattern for E2E tests
- `vitest.config.ts` + `playwright.config.ts` — confirmed test commands

### Secondary (MEDIUM confidence)
- `src/app/globals.css` — OKLCH color tokens, `data-selected` CSS rule, muscle path selectors

---

## Project Constraints (from CLAUDE.md)

CLAUDE.md delegates to AGENTS.md, which states:

- **This is NOT the Next.js you know** — breaking changes from training data. Read `node_modules/next/dist/docs/` before writing Next.js code.
- **Heed deprecation notices** — do not assume Next.js 15/14 patterns apply.

**Verification for this phase:** Next.js involvement is minimal (page.tsx data import, one `Link` component). Checked `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md` path exists. The `Link` component usage pattern (href as string prop) is stable. No other Next.js-specific APIs are required for this phase.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed; APIs verified from type definitions and existing usage
- Architecture: HIGH — all infrastructure (store, hook, data files) confirmed to exist with correct shapes
- Pitfalls: HIGH — derived from existing codebase patterns and Phase 5 decisions documented in STATE.md
- Test plan: HIGH — test framework and existing patterns confirmed from file inspection

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable — no fast-moving dependencies)
