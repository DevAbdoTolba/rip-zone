---
phase: 08-community-faq-bio-metrics
plan: 01
subsystem: faq
tags: [faq, navigation, e2e, accordion, filter-chips]
dependency_graph:
  requires: []
  provides: [faq-page, faq-components, faq-nav-tab]
  affects: [bottom-nav]
tech_stack:
  added: []
  patterns: [server-component-data-pass, client-filter-state, accordion-toggle-set, chip-filter-pattern]
key_files:
  created:
    - src/app/(main)/faq/page.tsx
    - src/components/faq/FaqPage.tsx
    - src/components/faq/FaqFilters.tsx
    - src/components/faq/FaqAccordion.tsx
    - e2e/faq.spec.ts
  modified:
    - src/components/bottom-nav/BottomNav.tsx
decisions:
  - "Use exact:true for 'All' chip button selector in E2E tests — FAQ accordion buttons contain 'all' substring in question text, causing strict mode violations without exact match"
  - "FaqPage clears openSlugs Set when category changes — prevents stale expanded items carrying across filter switches"
metrics:
  duration: ~8min
  completed_date: "2026-03-24"
  tasks_completed: 2
  files_created: 5
  files_modified: 1
requirements: [FAQ-01, FAQ-02]
---

# Phase 8 Plan 1: FAQ Browsing Feature Summary

**One-liner:** FAQ page with 7-chip category filter and accordion Q&A built from faq-entries.json, plus BookOpen nav tab.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create FAQ page components and route | a4a198d | src/app/(main)/faq/page.tsx, FaqPage.tsx, FaqFilters.tsx, FaqAccordion.tsx |
| 2 | Add FAQ tab to BottomNav and E2E tests | f125186 | BottomNav.tsx, e2e/faq.spec.ts |

## What Was Built

- `/faq` Server Component page reading `data/faq-entries.json` via static import, passing 20 entries to `FaqPage` client component
- `FaqFilters`: horizontal scrollable chip row with 7 categories (All + 6), reusing exact `chipBase` class from `ExerciseFilters`
- `FaqAccordion`: expand/collapse card using `isOpen` state with `ChevronRight`/`ChevronDown` toggle, `data-testid="faq-item"` for E2E count assertions
- `FaqPage`: manages `activeCategory` string state + `openSlugs` Set state; clears open set on category change
- `BottomNav`: added `BookOpen` import and FAQ tab entry — 6 tabs total (Map, Exercises, History, Ranking, Workout, FAQ)
- 6 E2E tests covering FAQ-01 (page load, 20 entries, category filter) and FAQ-02 (expand inline, collapse)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed strict mode violation in E2E test for 'All' chip**
- **Found during:** Task 2 — first E2E test run
- **Issue:** `getByRole('button', { name: 'All' })` matched 3 elements because FAQ accordion buttons contain "All" in their longer question text (e.g., "Will I lose **all** my muscle?")
- **Fix:** Changed to `getByRole('button', { name: 'All', exact: true })` to match only the chip button with exact text "All"
- **Files modified:** e2e/faq.spec.ts
- **Commit:** f125186

## Known Stubs

None — all 20 FAQ entries are real data from faq-entries.json, filters are wired, accordion state is managed properly.

## Verification

- `npx next build` passes: /faq route listed as static
- `npx playwright test e2e/faq.spec.ts`: 6/6 tests pass

## Self-Check: PASSED

Files created:
- src/app/(main)/faq/page.tsx: FOUND
- src/components/faq/FaqPage.tsx: FOUND
- src/components/faq/FaqFilters.tsx: FOUND
- src/components/faq/FaqAccordion.tsx: FOUND
- e2e/faq.spec.ts: FOUND

Commits:
- a4a198d: FOUND (feat(08-01): create FAQ page components and route)
- f125186: FOUND (feat(08-01): add FAQ tab to BottomNav and E2E tests)
