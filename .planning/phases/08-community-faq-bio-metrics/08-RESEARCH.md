# Phase 8: Community FAQ + Bio Metrics - Research

**Researched:** 2026-03-24
**Domain:** Next.js App Router feature extension — static content page + optional profile form + engine integration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**FAQ Page Layout & Navigation**
- New /faq tab in bottom nav with BookOpen icon — FAQ is a standalone feature per requirements
- Accordion card layout — category header with expandable Q&A items; compact, scannable, matches dark card aesthetic
- Horizontal scrollable filter chips at top — mirrors exercise library filter pattern (Phase 3); "All" default chip
- Tap question to expand answer inline below — no navigation away from the FAQ list

**Bio Metrics Form & UX**
- Dedicated /profile page — accessible from settings/user icon; bio data is personal, separate from workout flow
- Single scrollable form with all 6 fields visible — no wizard overhead for ~6 optional fields (height, weight, age, gender, body fat %, measurements)
- Completion meter — circular progress ring showing "Accuracy: X%" that fills as more fields are completed; visible on ranking and strain pages
- Never auto-prompt — user discovers /profile naturally; BIO-03 demands zero gates, no nudges or banners

**Bio-Enhanced Strain & Ranking Integration**
- Weight-based volume normalization for strain — divide raw volume by bodyweight so same exercise means different strain for different body sizes; falls back to raw volume when no weight provided
- Relative strength scoring for ranking — volume/bodyweight ratio as secondary signal shown alongside absolute tier; tier thresholds stay absolute (no disruption to existing ranking)
- Accuracy percentage based on filled fields — 6 fields, each adds ~15-17% accuracy; "Accuracy: X%" shown as small label near strain disclaimer and on ranking page
- Subtle "enhanced" badge — small pill next to strain/ranking values when bio data is present; no dramatic before/after comparison

### Claude's Discretion
None — all questions answered by user.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FAQ-01 | User can browse FAQ content categorized by Egyptian gym community topics | Static JSON data at `data/faq-entries.json` already exists with 20 entries across 6 categories; Server Component page passes as props to client FAQ component |
| FAQ-02 | User can read newbie-focused Q&A (muscle pain, progress loss, common misconceptions) | Content already written with Egyptian cultural tone; accordion pattern from ExerciseCard level 0→1 is the established model |
| BIO-01 | User can optionally provide bio info (height, weight, age, gender, body fat %, measurements) | `BioMetricRecord` in Dexie + `useProfileStore` already wired; need measurements field added + new /profile page form |
| BIO-02 | User sees improved accuracy in strain/ranking when bio info is provided | `computeStrainMap()` takes injectable `NORMALIZE_DIVISOR`; `computeTierRank()` uses `totalVolume`; both need optional bodyweight parameter + accuracy display |
| BIO-03 | All features work fully without any bio info provided | All bio integrations must be optional/fallback; zero gates, no prompts — structural BIO-03 smoke test verifies this |
</phase_requirements>

---

## Summary

Phase 8 delivers two standalone features against a well-prepared codebase: a static FAQ page and an optional bio-metrics profile. The preparatory work from prior phases is substantial — the FAQ content JSON (`data/faq-entries.json`) is fully written, the Dexie `ProfileDatabase` with `bioMetrics` table exists, the Zustand `useProfileStore` with `loadLatestBio`/`saveBio` is wired, and the engine functions (`computeStrainMap`, `computeTierRank`) are structured to receive optional parameters.

The primary development work is UI construction (two new pages, new bottom-nav tabs, filter chip pattern, accordion FAQ pattern, circular accuracy ring) and thin engine integration (optional `bodyweightKg` parameter to `computeStrainMap` and relative-strength display in ranking). All engine changes are additive with fallback to existing behavior when bio data is absent, satisfying BIO-03.

One schema gap exists: the current `BioMetricRecord` has 5 fields (height, weight, age, gender, bodyFat) but the design specifies 6 fields totalling 100% accuracy. A `measurementsCm` field (waist circumference in cm) needs to be added to the type, Dexie DB, and form. Dexie v4 handles this as a new table version with upgrade callback per the established pattern documented in `profile.ts` comments (D-13).

**Primary recommendation:** Build in three waves — (1) FAQ page + /faq nav tab, (2) /profile bio form + Dexie schema update + accuracy ring, (3) bio-enhanced strain/ranking integration + BIO-03 smoke test.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | App Router pages for /faq and /profile | Already in use; Server Component data loading pattern established |
| Dexie | 4.3.0 | Persist bio metric entries in IndexedDB | Already in use for all user data; `ProfileDatabase` pre-wired |
| Zustand | (in use) | `useProfileStore` for bio state management | Already in use; established store pattern with dynamic Dexie import |
| lucide-react | 0.577.0 | `BookOpen` icon for FAQ tab, `User` icon for Profile | Both confirmed present in v0.577.0 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fake-indexeddb | (in devDeps) | IndexedDB mock for Vitest unit tests | Any test touching `ProfileDatabase` or Dexie stores |
| @playwright/test | (in devDeps) | E2E smoke tests for FAQ-01, FAQ-02, BIO-03 | New pages need nav + content + no-data-access verification |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline accordion state (useState per item) | URL-based state | URL state adds complexity for a simple expand/collapse; local useState per item is simpler |
| Circular SVG progress ring (hand-rolled) | Third-party donut chart | No library needed for a simple ring; 1 SVG circle element with stroke-dasharray is 10 lines of code |

**Installation:** No new dependencies required for this phase.

---

## Architecture Patterns

### Recommended Project Structure

```
src/app/(main)/
├── faq/
│   └── page.tsx               # Server Component — reads faq-entries.json, passes to FaqPage client
├── profile/
│   └── page.tsx               # Client Component — bio form, loads from useProfileStore

src/components/
├── faq/
│   ├── FaqPage.tsx            # 'use client' — filter chips state + accordion list
│   ├── FaqFilters.tsx         # Filter chip row — "All" + 6 category chips (mirrors ExerciseFilters)
│   └── FaqAccordion.tsx       # Single FAQ item — collapsed question / expanded answer
├── profile/
│   ├── BioForm.tsx            # 'use client' — scrollable 6-field form
│   └── AccuracyRing.tsx       # 'use client' — SVG circular progress ring
├── bottom-nav/
│   └── BottomNav.tsx          # Add /faq (BookOpen) and /profile (User) tabs

tests/lib/
└── bio-accuracy.test.ts       # Vitest: computeAccuracyPct pure function

e2e/
├── faq.spec.ts                # FAQ-01, FAQ-02 E2E tests
└── bio-profile.spec.ts        # BIO-01, BIO-02, BIO-03 E2E tests
```

### Pattern 1: Server Component → Client Component Data Hand-Off (FAQ)

**What:** FAQ page is a Server Component that reads `data/faq-entries.json` at build/request time and passes the full array as a prop to a client component. No client-side fetch.

**When to use:** Static data that never changes between builds; same pattern used for exercises, muscles, warmups.

**Example:**
```typescript
// src/app/(main)/faq/page.tsx  (Server Component — no 'use client')
import faqData from '@/../data/faq-entries.json'
import { FaqPage } from '@/components/faq/FaqPage'

export default function FaqPageRoute() {
  return <FaqPage entries={faqData} />
}
```

```typescript
// src/components/faq/FaqPage.tsx
'use client'
// receives entries as prop, manages filter/expand state locally
```

### Pattern 2: Filter Chip Row (mirrors ExerciseFilters)

**What:** Horizontal scrollable chip row with `overflow-x-auto flex-nowrap scrollbar-hide`. Active chip gets `bg-primary text-primary-foreground border-transparent`. Inactive chips get `bg-card text-muted-foreground border border-border hover:bg-muted`. Uses native `<button>` elements for Playwright `getByRole('button')` compatibility (Phase 03 decision).

**Categories from faq-entries.json:** `muscle-pain`, `progress`, `misconceptions`, `nutrition-basics`, `recovery`, `training-form` — plus "All" default chip.

**Example:**
```typescript
// Source: established ExerciseFilters.tsx pattern
const chipBase = 'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-[14px] font-medium whitespace-nowrap transition-all cursor-pointer'

<button
  type="button"
  onClick={() => setCategory(cat)}
  className={cn(
    chipBase,
    activeCategory === cat
      ? 'bg-primary text-primary-foreground border-transparent'
      : 'bg-card text-muted-foreground border border-border hover:bg-muted'
  )}
>
  {CATEGORY_LABELS[cat]}
</button>
```

### Pattern 3: Accordion FAQ Item

**What:** Collapsed state shows question text + ChevronRight icon. Expanded state shows question + ChevronDown + answer paragraph inline. State managed as `Set<string>` of open slugs in parent FaqPage. No navigation away.

**Example:**
```typescript
// FaqAccordion.tsx — collapses/expands inline
interface FaqAccordionProps {
  entry: { slug: string; question: string; answer: string; category: string }
  isOpen: boolean
  onToggle: () => void
}
// Level 0: question + ChevronRight → mirrors ExerciseCard Level 0 pattern
// Level 1: question + ChevronDown + answer paragraph → mirrors ExerciseCard Level 1 pattern
```

### Pattern 4: Circular Accuracy Ring (hand-rolled SVG)

**What:** Small SVG with two circles — background track and colored fill using `stroke-dasharray` / `stroke-dashoffset`. Shows "Accuracy: X%" text in center.

**Calculation:** `accuracyPct = (filledFieldCount / 6) * 100`. A field is "filled" if it is not `null`. Exported as a pure function for unit testing.

**Example:**
```typescript
// AccuracyRing.tsx
function AccuracyRing({ pct }: { pct: number }) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const filled = (pct / 100) * circumference
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-label={`Accuracy ${pct}%`}>
      {/* Track */}
      <circle cx="28" cy="28" r={radius} fill="none" stroke="var(--muted)" strokeWidth="4" />
      {/* Fill */}
      <circle
        cx="28" cy="28" r={radius}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="4"
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="32" textAnchor="middle" className="text-[10px] fill-foreground font-medium">
        {pct}%
      </text>
    </svg>
  )
}
```

### Pattern 5: Bio-Enhanced Strain Engine

**What:** Pass optional `bodyweightKg` to `computeStrainMap`. When provided, use per-bodyweight normalization divisor instead of fixed `NORMALIZE_DIVISOR`. Falls back to raw volume when `bodyweightKg` is null/undefined.

**Decision math:** A 100kg person lifting 5 sets × 10 reps × 100kg produces 5000 volume. With bodyweight = 100kg, the relative load is 5000/100 = 50 (same for a 60kg person lifting 3000kg total). The existing `NORMALIZE_DIVISOR = 5000` represents "average" strain. Divide by bodyweight to normalize: `effectiveDivisor = bodyweightKg ? bodyweightKg * 50 : NORMALIZE_DIVISOR`.

**Example:**
```typescript
// strain-engine.ts — extended signature
export function computeStrainMap(
  doses: WorkoutMuscleDose[],
  now: number,
  bodyweightKg?: number | null,   // NEW optional parameter
): Map<MuscleSlug, StrainLevel> {
  // When bodyweightKg provided: divisor scales proportionally to body size
  const divisor = bodyweightKg != null ? bodyweightKg * 50 : NORMALIZE_DIVISOR
  // ... rest of function uses divisor instead of NORMALIZE_DIVISOR
}
```

### Pattern 6: Bio-Enhanced Ranking Display

**What:** Compute `relativeStrength = totalVolume / weightKg` alongside existing absolute tier. Show as secondary label "Relative: X kg/kg" near tier badge when bio data present. Tier thresholds stay absolute (locked decision).

**Example:**
```typescript
// In RankingDashboard.tsx — added display when latestBio?.weightKg present
{latestBio?.weightKg && (
  <p className="text-sm text-muted-foreground">
    Relative strength: {(totalVolume / latestBio.weightKg).toFixed(1)} kg/kg
    <span className="ml-1 text-[10px] text-primary px-1 py-0.5 rounded-full border border-primary/30">
      enhanced
    </span>
  </p>
)}
```

### Pattern 7: Adding /faq and /profile to BottomNav

**What:** Append two entries to the `tabs` array. For 7 tabs on mobile, the nav remains scrollable (existing `overflow-x-auto` pattern if needed, or accept 7 icons at slightly reduced spacing). Desktop nav handles unlimited tabs as a horizontal flex row.

**Note on /profile access:** CONTEXT.md says "accessible from settings/user icon." The simplest implementation is a tab in BottomNav (simpler, more discoverable, consistent with the rest of the nav pattern). Add as a tab with `User` icon and label "Profile".

**Example:**
```typescript
// BottomNav.tsx — add to tabs array
import { MapPin, Dumbbell, History, Timer, Trophy, BookOpen, User } from 'lucide-react'

const tabs = [
  { href: '/', label: 'Map', icon: MapPin },
  { href: '/exercises', label: 'Exercises', icon: Dumbbell },
  { href: '/history', label: 'History', icon: History },
  { href: '/ranking', label: 'Ranking', icon: Trophy },
  { href: '/workout', label: 'Workout', icon: Timer },
  { href: '/faq', label: 'FAQ', icon: BookOpen },       // NEW
  { href: '/profile', label: 'Profile', icon: User },   // NEW
]
```

### Pattern 8: Dexie Schema Migration (measurements field)

**What:** `BioMetricRecord` needs a `measurementsCm` field (waist circumference in cm — a practical single body measurement representing the "measurements" category). Dexie v4 handles this with a new `version(2)` block per D-13 in `profile.ts`.

**Example:**
```typescript
// profile.ts — add measurementsCm to BioMetricRecord interface
export interface BioMetricRecord {
  id: BioMetricEntryId
  recordedAt: number
  heightCm: number | null
  weightKg: number | null
  ageYears: number | null
  gender: 'male' | 'female' | null
  bodyFatPct: number | null
  measurementsCm: number | null   // NEW: waist circumference in cm
}

// Add version 2 migration block:
this.version(2).stores({
  bioMetrics: 'id, recordedAt',
  rankState: 'id',
}).upgrade(tx => {
  return tx.table('bioMetrics').toCollection().modify((entry: BioMetricRecord) => {
    if (entry.measurementsCm === undefined) {
      entry.measurementsCm = null
    }
  })
})
```

**Also update `src/types/bio.ts`** to add `measurementsCm: number | null` to `BioMetricEntry`.

### Anti-Patterns to Avoid

- **Gating features on bio data:** BIO-03 is absolute. Never show a modal, banner, or prompt asking for bio data. User discovers `/profile` organically via nav.
- **Storing computed accuracy in Dexie:** Accuracy is derived from field count — compute it at render time, never persist it.
- **Mutating NORMALIZE_DIVISOR global constant:** The existing constant should remain unchanged for the no-bio fallback. Pass bodyweight as a parameter, compute divisor locally inside the function.
- **Recomputing strain on bio change without session change:** `useStrainMap` currently re-fires on `activeSessionId`. For bio-enhanced strain, also re-fire when `latestBio?.weightKg` changes. Use stable primitive dependency: `latestBio?.weightKg ?? null`.
- **7-tab mobile nav overflow:** With 7 tabs, test that the mobile bottom nav doesn't overflow or clip. If needed, apply `overflow-x-auto` and `min-w-[44px]` on each tab to maintain touch target size.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FAQ data storage | Dynamic DB for FAQ content | Static `data/faq-entries.json` as Server Component import | Data is build-time static; MongoDB is already used for reference data but adds unnecessary complexity for 20 items |
| IndexedDB for bio form | Custom localStorage serialization | Existing `ProfileDatabase` Dexie + `useProfileStore` | Already fully implemented; handles versioned entries |
| Donut/progress chart | Recharts or Chart.js import | 8-line SVG circle with stroke-dasharray | No dependency needed; simpler, smaller, already matches dark OKLCH aesthetic |
| Number inputs | Custom spinners | Native `<input type="number">` with `min`/`max`/`step` | Phase 04 found `NumberField` uses `onValueChange` not `onChange`; for a simple profile form native input is sufficient and avoids @base-ui dependency |
| Category filtering logic | Fuzzy-match library | Simple `entries.filter(e => category === 'all' || e.category === category)` | 20 items; exact match is all that's needed |

**Key insight:** This phase is almost entirely UI composition over pre-wired infrastructure. The engine layer (strain + ranking) only needs thin optional parameter additions.

---

## Common Pitfalls

### Pitfall 1: 6-Field Accuracy Count vs. 5-Field Dexie Schema

**What goes wrong:** CONTEXT.md and REQUIREMENTS.md both say "6 fields" for 100% accuracy. The current `BioMetricRecord` only has 5 non-id fields. Building the accuracy ring to count 6 fields while the form only has 5 fields produces a max of 83%.

**Why it happens:** `data/faq-entries.json` was pre-written and `src/types/bio.ts` was pre-created in Phase 1 scaffolding, but the "measurements" field was left as a comment in the architecture doc.

**How to avoid:** Add `measurementsCm: number | null` to both `BioMetricEntry` (types/bio.ts) and `BioMetricRecord` (db/profile.ts) with a Dexie v2 migration. The `computeAccuracyPct` function counts 6 fields.

**Warning signs:** If the accuracy ring maxes at 83% (5/6 × 100), the measurements field is missing.

### Pitfall 2: useStrainMap Not Re-firing on Bio Change

**What goes wrong:** User fills in their weight on /profile, navigates to the muscle map, and the strain heatmap still shows the old non-normalized strain levels. The bio data was saved but `useStrainMap` didn't recalculate because only `activeSessionId` is in its dependency array.

**Why it happens:** `useStrainMap` subscribes to `activeSessionId` from the workout store — it doesn't know about `useProfileStore`.

**How to avoid:** In `useStrainMap`, also subscribe to `useProfileStore(s => s.latestBio?.weightKg ?? null)` as a primitive dependency. This triggers recalculation when bodyweight is saved.

**Warning signs:** Strain levels appear identical before and after filling in body weight.

### Pitfall 3: BottomNav Mobile Overflow with 7 Tabs

**What goes wrong:** The mobile nav has `justify-around` which divides available width equally. With 7 tabs on a 390px mobile screen, each tab gets ~55px — minimum touch target (44px) is still satisfied, but the text label may get clipped.

**Why it happens:** The current 5-tab design was not tested with 7 tabs.

**How to avoid:** Use `overflow-x-auto scrollbar-hide` on the mobile nav and `min-w-[44px]` on each tab rather than `justify-around`. Or: reduce label text to shorter names (e.g., "FAQ" stays "FAQ", "Profile" stays "Profile" — both are short). Test at 390px viewport.

**Warning signs:** Text labels wrap or get clipped on small screens.

### Pitfall 4: BIO-03 Accidental Gates

**What goes wrong:** A well-intentioned developer adds a "Complete your profile for better accuracy!" banner on the ranking page, a tooltip on the strain disclaimer, or a redirect from a feature page to /profile. Any of these violates BIO-03.

**Why it happens:** It feels helpful to nudge users toward better accuracy.

**How to avoid:** The only bio-related UI on non-profile pages is: (a) the accuracy ring (passive, informational), and (b) the "enhanced" badge on strain/ranking values. No CTAs, no links to /profile from feature pages, no conditional visibility of features. Test with zero bio data to confirm all 6 features (map, heatmap, exercises, logging, ranking, FAQ) are fully accessible.

**Warning signs:** Any element that links to /profile from outside the nav, or any feature that requires bio data to render.

### Pitfall 5: Dexie Singleton vs. Migration in Tests

**What goes wrong:** Tests for the `ProfileDatabase` schema v2 fail because `fake-indexeddb/auto` is a shared singleton. A test that opens DB at version 1 prevents a subsequent test from opening at version 2.

**Why it happens:** Established in `profile.test.ts` — each test creates a `new ProfileDatabase()` and deletes it in `afterEach`. This pattern works but only if the upgrade callback runs correctly.

**How to avoid:** In the new profile DB test, always `await db.delete()` in `afterEach`. Use `db.open()` explicitly before testing upgrade migration. Reference the established pattern in `tests/lib/db/profile.test.ts`.

---

## Code Examples

### computeAccuracyPct — pure function

```typescript
// Source: derived from CONTEXT.md decision "6 fields, each adds ~15-17% accuracy"
import type { BioMetricRecord } from '@/lib/db/profile'

const BIO_FIELDS: Array<keyof BioMetricRecord> = [
  'heightCm',
  'weightKg',
  'ageYears',
  'gender',
  'bodyFatPct',
  'measurementsCm',
]

export function computeAccuracyPct(bio: BioMetricRecord | null): number {
  if (!bio) return 0
  const filled = BIO_FIELDS.filter(f => bio[f] !== null && bio[f] !== undefined).length
  return Math.round((filled / BIO_FIELDS.length) * 100)
}
```

### Enhanced strain call in useStrainMap

```typescript
// After loading bio from useProfileStore:
const bodyweightKg = useProfileStore(s => s.latestBio?.weightKg ?? null)

// Inside recalculate():
setStrainMap(computeStrainMap(doses, Date.now(), bodyweightKg))
```

### FAQ entry type

```typescript
// No new type file needed — inline or in types/faq.ts
export interface FaqEntry {
  slug: string
  question: string
  answer: string
  category: string
  tags: string[]
}
```

### FAQ category labels

```typescript
// Source: data/faq-entries.json category values
const CATEGORY_LABELS: Record<string, string> = {
  'all': 'All',
  'muscle-pain': 'Muscle Pain',
  'progress': 'Progress',
  'misconceptions': 'Myths',
  'nutrition-basics': 'Nutrition',
  'recovery': 'Recovery',
  'training-form': 'Form',
}
const CATEGORY_VALUES = ['all', 'muscle-pain', 'progress', 'misconceptions', 'nutrition-basics', 'recovery', 'training-form']
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Absolute-only strain (NORMALIZE_DIVISOR=5000) | Optional bodyweight-relative normalization (divisor = weightKg * 50 when available) | Phase 8 | Same behavior for users without bio data; personalized strain for users with weight |
| 5-field BioMetricRecord | 6-field with measurementsCm | Phase 8 | Enables 100% accuracy ring; requires Dexie version 2 migration |
| 5-tab BottomNav | 7-tab BottomNav | Phase 8 | /faq and /profile become primary navigation destinations |

**Deprecated/outdated:**
- Fixed `NORMALIZE_DIVISOR` as the sole normalization path: still valid as fallback but bio-enhanced path replaces it for users who provide weight.

---

## Open Questions

1. **Measurements field — waist only vs. multiple?**
   - What we know: Requirements say "measurements" (singular concept). Architecture doc left it as a comment. CONTEXT says "6 fields."
   - What's unclear: Is "measurements" a single waist circumference, or a set of measurements (waist + hip + arm)?
   - Recommendation: Use a single `measurementsCm: number | null` field (waist circumference) to keep the form simple and satisfy the 6-field accuracy requirement. Label it "Waist (cm)" in the form. This is the simplest interpretation that satisfies the requirement.

2. **Profile access — tab vs. icon in header?**
   - What we know: CONTEXT says "accessible from settings/user icon." The bottom nav currently has no settings icon.
   - What's unclear: Is /profile a full nav tab or a hidden icon link?
   - Recommendation: Add /profile as a full BottomNav tab with the `User` icon. This is more discoverable, consistent with the existing nav pattern, and simpler to implement and test. The "user icon" framing in CONTEXT aligns with the `User` lucide icon in the nav.

---

## Environment Availability

Step 2.6: This phase has no external dependencies beyond the existing project stack. All tools are already installed.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Next.js | /faq and /profile pages | Yes | 16.2.1 | — |
| Dexie | Bio metrics persistence | Yes | 4.3.0 | — |
| lucide-react BookOpen | FAQ nav tab | Yes | 0.577.0 (confirmed) | — |
| lucide-react User | Profile nav tab | Yes | 0.577.0 (confirmed) | — |
| fake-indexeddb | Vitest bio tests | Yes | in devDeps | — |
| Playwright | E2E FAQ + bio tests | Yes | in devDeps | — |

**Missing dependencies with no fallback:** None.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (unit) + Playwright (E2E) |
| Config file | `vitest.config.ts` / `playwright.config.ts` |
| Quick run command | `npm test` (vitest run) |
| Full suite command | `npm test && npm run test:e2e` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FAQ-01 | /faq page loads, shows heading and category chips | E2E | `npx playwright test e2e/faq.spec.ts -x` | No — Wave 0 |
| FAQ-01 | Filter chip "All" active by default, all entries visible | E2E | `npx playwright test e2e/faq.spec.ts -x` | No — Wave 0 |
| FAQ-01 | Filter chip "Muscle Pain" shows only muscle-pain entries | E2E | `npx playwright test e2e/faq.spec.ts -x` | No — Wave 0 |
| FAQ-02 | Tapping a question expands the answer inline | E2E | `npx playwright test e2e/faq.spec.ts -x` | No — Wave 0 |
| FAQ-02 | Answer text is not visible when question is collapsed | E2E | `npx playwright test e2e/faq.spec.ts -x` | No — Wave 0 |
| BIO-01 | /profile page loads with all 6 input fields | E2E | `npx playwright test e2e/bio-profile.spec.ts -x` | No — Wave 0 |
| BIO-01 | Saving bio data persists across page reload | E2E | `npx playwright test e2e/bio-profile.spec.ts -x` | No — Wave 0 |
| BIO-01 | `computeAccuracyPct` returns 0 for null bio | Unit | `npm test -- tests/lib/bio-accuracy.test.ts` | No — Wave 0 |
| BIO-01 | `computeAccuracyPct` returns 100 for fully filled bio | Unit | `npm test -- tests/lib/bio-accuracy.test.ts` | No — Wave 0 |
| BIO-02 | Accuracy ring shows 0% with no bio data | E2E | `npx playwright test e2e/bio-profile.spec.ts -x` | No — Wave 0 |
| BIO-02 | Accuracy ring updates when fields are filled | E2E | `npx playwright test e2e/bio-profile.spec.ts -x` | No — Wave 0 |
| BIO-02 | `computeStrainMap` with bodyweight produces different result than without | Unit | `npm test -- tests/lib/strain-engine.test.ts` | Partial (file exists, new test needed) |
| BIO-03 | All 6 features accessible with zero bio data (smoke test) | E2E | `npx playwright test e2e/bio-profile.spec.ts -x` | No — Wave 0 |
| BIO-03 | No prompt/gate/banner appears without bio data | E2E | `npx playwright test e2e/bio-profile.spec.ts -x` | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test && npx playwright test e2e/faq.spec.ts e2e/bio-profile.spec.ts`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `e2e/faq.spec.ts` — covers FAQ-01, FAQ-02
- [ ] `e2e/bio-profile.spec.ts` — covers BIO-01, BIO-02, BIO-03
- [ ] `tests/lib/bio-accuracy.test.ts` — covers BIO-01 (computeAccuracyPct unit tests)
- [ ] Extend `tests/lib/strain-engine.test.ts` — add test for bodyweight-parameterized `computeStrainMap`
- [ ] Extend `tests/lib/db/profile.test.ts` — add test for Dexie v2 migration with measurementsCm field

---

## Sources

### Primary (HIGH confidence)
- Direct code reading: `src/lib/strain-engine.ts`, `src/lib/ranking.ts`, `src/lib/db/profile.ts`, `src/stores/useProfileStore.ts`, `src/components/bottom-nav/BottomNav.tsx`, `src/hooks/useStrainMap.ts`, `src/hooks/useRankingData.ts`
- Direct data reading: `data/faq-entries.json` (20 entries, 6 categories confirmed)
- Direct type reading: `src/types/bio.ts` (5 fields confirmed, measurementsCm gap identified)
- Test infrastructure: `vitest.config.ts`, `playwright.config.ts`, `tests/` directory structure

### Secondary (MEDIUM confidence)
- lucide-react v0.577.0 runtime verification: `BookOpen` and `User` icons confirmed present via node module inspection
- Dexie v4 migration pattern: verified in `profile.ts` comments (D-13) and existing v1 schema

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use; versions read from installed modules
- Architecture: HIGH — all patterns are extensions of existing Phase 3–7 patterns already in the codebase
- Pitfalls: HIGH — three pitfalls (schema gap, useStrainMap dep, nav overflow) confirmed by code inspection; one (BIO-03 accidental gates) from requirements analysis

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable stack; no external API dependencies)
