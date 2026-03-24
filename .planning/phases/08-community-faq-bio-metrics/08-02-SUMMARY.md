---
phase: 08-community-faq-bio-metrics
plan: 02
subsystem: ui
tags: [dexie, zustand, react, svg, e2e, playwright, vitest]

# Dependency graph
requires:
  - phase: 08-community-faq-bio-metrics
    provides: Phase 08 context — FAQ plan 01 established BottomNav BookOpen icon and tab pattern
  - phase: 07-ranking-radar
    provides: ProfileDatabase with bioMetrics + rankState tables (v1)

provides:
  - BioMetricEntry and BioMetricRecord with 6 fields including measurementsCm
  - Dexie ProfileDatabase v2 schema migration backfilling measurementsCm
  - computeAccuracyPct pure function (src/lib/bio-accuracy.ts)
  - AccuracyRing SVG component (reusable circular progress ring)
  - BioForm 6-field form with live accuracy ring and save/persist
  - /profile page route
  - Profile tab in BottomNav (7 total tabs, User icon)

affects: [08-community-faq-bio-metrics plan 03, future phases using accuracy ring or bio metrics]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dexie schema migration: always append version(N+1).stores().upgrade() — never modify prior version blocks"
    - "Live accuracy ring computed from form state before save (pseudo-record passed to computeAccuracyPct)"
    - "Label+input linked via htmlFor/id AND aria-label for Playwright getByLabel() compatibility"
    - "Gender toggle: clicking active gender deselects it (null), clicking inactive selects it"
    - "Saved! confirmation: button text switches for 2 seconds via setTimeout"

key-files:
  created:
    - src/types/bio.ts (added measurementsCm field)
    - src/lib/bio-accuracy.ts (computeAccuracyPct pure function)
    - src/components/profile/AccuracyRing.tsx (SVG circular progress)
    - src/components/profile/BioForm.tsx (6-field form with accuracy ring)
    - src/app/(main)/profile/page.tsx (/profile route)
    - tests/lib/bio-accuracy.test.ts (5 unit tests)
    - e2e/bio-profile.spec.ts (5 E2E tests)
  modified:
    - src/lib/db/profile.ts (BioMetricRecord + measurementsCm + version(2) migration)
    - src/components/bottom-nav/BottomNav.tsx (User icon + Profile tab)
    - tests/lib/db/profile.test.ts (measurementsCm test cases + updated existing tests)

key-decisions:
  - "ProfileDatabase v2 migration: stores() definition unchanged — same indexes, upgrade() backfills measurementsCm=null for existing records"
  - "computeAccuracyPct checks bio[f] !== null && bio[f] !== undefined — handles both null and missing fields"
  - "BioForm uses both htmlFor+id and aria-label on inputs for dual Playwright selector compatibility"
  - "Gender toggle uses exact:true in E2E test — 'Female' contains 'Male' substring, causing strict mode violation without exact match"
  - "Profile page kept as Server Component — BioForm is client-only, page itself needs no client interactivity"

patterns-established:
  - "AccuracyRing: SVG with aria-label=Accuracy N%, stroke-dasharray for fill — reusable for plan 03"
  - "BioForm: loads via loadLatestBio() on mount, saves via saveBio() with new UUID per save"

requirements-completed: [BIO-01, BIO-03]

# Metrics
duration: 5min
completed: 2026-03-24
---

# Phase 8 Plan 02: Bio Metrics Profile Page Summary

**6-field optional bio form with Dexie v2 schema migration, pure computeAccuracyPct function, live SVG accuracy ring, and zero-gate BIO-03 smoke tests passing**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-24T11:18:23Z
- **Completed:** 2026-03-24T11:22:46Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- BioMetricEntry and BioMetricRecord both extended with `measurementsCm` field, Dexie v2 migration correctly backfills null for existing records
- computeAccuracyPct pure function counts non-null fields across all 6 bio fields and returns Math.round percentage (13 unit tests pass)
- Profile page at /profile with 6-field BioForm, gender toggle, live AccuracyRing SVG, save/persist via Dexie, Profile tab in BottomNav with User icon (5 E2E tests pass)

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema migration, accuracy function, and unit tests** - `24d0618` (feat)
2. **Task 2: Profile page UI, AccuracyRing, BottomNav update, and E2E tests** - `57ae49e` (feat)

**Plan metadata:** (docs commit follows)

_Note: Task 1 used TDD — tests written RED first, then implementation turned them GREEN_

## Files Created/Modified

- `src/types/bio.ts` - Added `measurementsCm: number | null` field to BioMetricEntry
- `src/lib/db/profile.ts` - Added measurementsCm to BioMetricRecord, added version(2) migration block
- `src/lib/bio-accuracy.ts` - New: computeAccuracyPct pure function over 6 BIO_FIELDS
- `src/components/profile/AccuracyRing.tsx` - New: SVG circular progress ring with aria-label
- `src/components/profile/BioForm.tsx` - New: 6-field form with live ring, save button, persistence
- `src/app/(main)/profile/page.tsx` - New: /profile route rendering BioForm
- `src/components/bottom-nav/BottomNav.tsx` - Added User icon import and Profile tab entry
- `tests/lib/bio-accuracy.test.ts` - New: 5 unit tests for computeAccuracyPct (null, 0, 1, 3, 6 fields)
- `tests/lib/db/profile.test.ts` - Added measurementsCm test cases, updated existing records to include field
- `e2e/bio-profile.spec.ts` - New: 5 E2E tests covering heading/fields, save/persist, accuracy ring 0%, BIO-03 zero-gate smoke, no-prompt check

## Decisions Made

- ProfileDatabase v2 keeps same store indexes as v1 — only upgrade() needed to backfill null for measurementsCm
- computeAccuracyPct uses `!== null && !== undefined` to handle both null fields and missing fields from older records
- BioForm inputs use both `htmlFor/id` pairs AND `aria-label` — ensures `page.getByLabel()` works in E2E via aria-label
- E2E gender button selectors use `exact: true` — "Female" contains "Male" substring, strict mode requires exact match
- Profile page is a Server Component (no 'use client') — BioForm handles all client state, page is static wrapper

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] E2E gender button selector strict mode violation**
- **Found during:** Task 2 (E2E test execution)
- **Issue:** `getByRole('button', { name: 'Male' })` resolved to 2 elements — "Female" button text contains "Male" as substring
- **Fix:** Added `exact: true` to both Male and Female button selectors in bio-profile.spec.ts
- **Files modified:** e2e/bio-profile.spec.ts
- **Verification:** All 5 E2E tests pass after fix
- **Committed in:** 57ae49e (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Minor test selector fix. No scope creep. Same pattern as Phase 08 decision "[Phase 08]: Use exact:true for 'All' chip button selector".

## Issues Encountered

None beyond the auto-fixed selector issue.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- AccuracyRing component ready for reuse in Plan 03 (strain/ranking integration)
- computeAccuracyPct exported and tested — ready for any consumer
- ProfileDatabase v2 deployed, migration tested with fake-indexeddb
- BIO-03 principle (zero gates) verified via smoke test: all 6 routes accessible without bio data

---
*Phase: 08-community-faq-bio-metrics*
*Completed: 2026-03-24*
