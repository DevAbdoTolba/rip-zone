---
phase: 06-click-to-muscle-panel
plan: 02
subsystem: testing
tags: [playwright, e2e, svgr, svgo, muscle-panel, MAP-04, EXER-04, EXER-05]

# Dependency graph
requires:
  - phase: 06-click-to-muscle-panel-01
    provides: MusclePanelDrawer component with data-testid attributes and hit-layer SVG paths
provides:
  - E2E test coverage for muscle detail panel (MAP-04, EXER-04, EXER-05)
  - SVGR svgoConfig fix preserving SVG hit-layer path IDs in dev build
  - clickMuscle helper pattern for SVG hit-target interaction in Playwright tests
affects: [future-e2e, phase-07]

# Tech tracking
tech-stack:
  added: []
  patterns: [dispatchEvent for SVG hit-target E2E interaction, svgoConfig cleanupIds:false for SVGR]

key-files:
  created: []
  modified:
    - e2e/muscle-map.spec.ts
    - next.config.ts

key-decisions:
  - "Use dispatchEvent instead of click() for SVG hit-layer paths in E2E — parent SVG intercepts viewport-based Playwright clicks; dispatchEvent fires on target directly via DOM event system which React processes correctly"
  - "svgoConfig cleanupIds:false in SVGR turbopack options — SVGO default strips all element IDs, breaking hit-layer ID-based event delegation"

patterns-established:
  - "clickMuscle(page, slug) helper: dispatches click event on path[id=hit-muscle-{slug}] — use this pattern for all future SVG muscle interaction tests"
  - "dispatchEvent over force click for SVG elements with transparent fill — more reliable in React's synthetic event system"

requirements-completed: [MAP-04, EXER-04, EXER-05]

# Metrics
duration: 25min
completed: 2026-03-24
---

# Phase 06 Plan 02: E2E Tests for Muscle Detail Panel Summary

**8 Playwright E2E tests for muscle panel covering MAP-04/EXER-04/EXER-05, plus SVGR svgoConfig fix that preserves hit-layer path IDs stripped by SVGO defaults**

## Performance

- **Duration:** 25 min
- **Started:** 2026-03-24T08:35:00Z
- **Completed:** 2026-03-24T09:00:00Z
- **Tasks:** 2 of 2 (Task 2 human verification approved)
- **Files modified:** 2

## Accomplishments
- 8 new E2E tests under `test.describe('Muscle Map — MAP-04: Muscle Detail Panel')` covering panel open, exercises list, strain status, X-close, view-toggle close, same-muscle deselect, "View all exercises" link, and different-muscle switch
- SVGR svgoConfig fix in `next.config.ts` disabling `cleanupIds` and `removeHiddenElems` so SVG hit-layer path IDs survive the build
- Fixed two pre-existing E2E tests (Muscle Selection and Disambiguation) that implicitly relied on hit-targets being unfindable; updated to use `dispatchEvent` with the same pattern as the new tests

## Task Commits

1. **Task 1: Add E2E tests for muscle detail panel** - `bd54e44` (feat)

## Files Created/Modified
- `e2e/muscle-map.spec.ts` - Added 8 MAP-04/EXER-04/EXER-05 tests, updated 2 existing tests to use dispatchEvent, added clickMuscle helper
- `next.config.ts` - Added svgoConfig to SVGR turbopack rule: cleanupIds:false, removeHiddenElems:false

## Decisions Made
- Use `dispatchEvent('click')` not `click({ force: true })` for SVG hit-layer paths. Force click dispatches at viewport coordinates where the parent SVG element intercepts. dispatchEvent fires directly on the target element node — React's delegated event handler on the container div receives it correctly via bubbling.
- Disable SVGO `cleanupIds` in the SVGR turbopack config. Default SVGO strips all element IDs as an optimization, which silently breaks the ID-based event delegation pattern used by the muscle map hit-layer.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] SVGR/SVGO strips all SVG element IDs, breaking hit-layer event delegation**
- **Found during:** Task 1 (running E2E tests)
- **Issue:** Playwright tests timed out on `path[id="hit-muscle-pectoralis-major"]` click. Debug revealed `path[id]` elements count = 0 in DOM. SVGO's default `preset-default` includes `cleanupIds` which removes all IDs from SVG during SVGR transformation.
- **Fix:** Added `svgoConfig` to the SVGR turbopack loader options in `next.config.ts`, overriding `cleanupIds: false` and `removeHiddenElems: false` within `preset-default`.
- **Files modified:** `next.config.ts`
- **Verification:** After server restart, `path[id^="hit-"]` count = 18, `hit-muscle-pectoralis-major` count = 1. All 22 E2E tests pass.
- **Committed in:** bd54e44 (Task 1 commit)

**2. [Rule 1 - Bug] Existing Muscle Selection and Disambiguation E2E tests used direct click() on SVG hit targets**
- **Found during:** Task 1 (fixing new tests exposed same issue in old tests)
- **Issue:** Once SVGR IDs were preserved (fix above), existing tests at lines 85 and 98 started failing. Previously the `if (count > 0)` guard was silently skipping the test body (count was always 0). Now count = 1 but `click()` is blocked by "SVG intercepts pointer events."
- **Fix:** Changed `hitTarget.click()` to `hitTarget.dispatchEvent('click')` in both tests, consistent with the new MAP-04 tests.
- **Files modified:** `e2e/muscle-map.spec.ts`
- **Verification:** All 22 tests pass.
- **Committed in:** bd54e44 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - bugs)
**Impact on plan:** Both fixes essential for E2E tests to work correctly. No scope creep.

## Issues Encountered
- Playwright's force click on SVG paths with transparent fill is intercepted by the parent SVG element — dispatchEvent is the reliable pattern for React + SVG event delegation.
- `locator('text=Exercises')` matched 2 elements (heading + "View all exercises" link) — changed to `locator('[data-testid="panel-exercise-list"] h3')` for specificity.

## Next Phase Readiness
- All MAP-04, EXER-04, EXER-05 E2E tests implemented and passing
- Human verification (Task 2) approved — visual appearance confirmed on desktop and mobile
- Phase 06 plan 02 fully complete

---
*Phase: 06-click-to-muscle-panel*
*Completed: 2026-03-24*

## Self-Check: PASSED

- FOUND: e2e/muscle-map.spec.ts (modified with 8 new tests + clickMuscle helper)
- FOUND: next.config.ts (modified with svgoConfig)
- FOUND: 06-02-SUMMARY.md
- FOUND commit bd54e44 (feat(06-02): add E2E tests for muscle detail panel)
- All 22 E2E tests in e2e/muscle-map.spec.ts pass (22 passed, 0 failed)
