---
phase: 02-muscle-map-svg
verified: 2026-03-23T12:00:00Z
status: human_needed
score: 14/14 must-haves verified
human_verification:
  - test: "Open http://localhost:3001 and confirm the full body silhouette renders — head, neck, hands, feet visible around the muscle regions"
    expected: "Complete human figure outline visible with muscles as filled regions inside it"
    why_human: "SVG path coordinates and shapes can only be confirmed visually; the code structure is correct but proportions and aesthetics require a human eye"
  - test: "Click the Back toggle, then in Advanced mode tap the upper shoulder area (rear deltoid / scapula region)"
    expected: "Disambiguation zoom triggers showing individual rotator cuff muscle labels (Supraspinatus, Infraspinatus, Teres Minor, Rotator Cuff)"
    why_human: "Hit-target centroid coordinates and cluster viewBox bounds were set as estimates; visual tuning may be required after seeing actual rendered positions"
  - test: "Hover over a muscle path and confirm the fill brightens"
    expected: "Fill shifts from oklch(0.22 0.02 265) to oklch(0.32 0.05 265) — a visible lightening"
    why_human: "CSS hover state is browser-rendered and cannot be confirmed by static code analysis"
  - test: "Click a muscle, then switch detail mode (Normal -> Advanced)"
    expected: "zoomRegion resets to null (any active disambiguation zoom closes), setDetailMode resets zoom per store contract"
    why_human: "Interaction sequence involves Zustand state transitions that are functionally verified but require user flow confirmation"
---

# Phase 02: Muscle Map SVG Verification Report

**Phase Goal:** Users can see a 2.5D illustrated muscle map with front and back body views and toggle between them — the visual contract (slug-based path IDs, two-layer SVG architecture, invisible hit-target overlays) is locked in for all downstream phases
**Verified:** 2026-03-23T12:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | @svgr/webpack is installed and resolvable by Turbopack | VERIFIED | `node_modules/@svgr/webpack/package.json` exists; `package.json` devDependencies contains `@svgr/webpack`; `next.config.ts` has `turbopack.rules` referencing `@svgr/webpack` |
| 2 | TypeScript recognizes *.svg imports as React components | VERIFIED | `src/types/svg.d.ts` declares `module '*.svg'` with `FC<SVGProps<SVGSVGElement>>` and `export default ReactComponent` |
| 3 | useMapStore has detailMode, zoomRegion fields with setters | VERIFIED | `src/stores/useMapStore.ts` exports `detailMode: 'normal'`, `zoomRegion: null`, `setDetailMode` (resets zoomRegion), `setZoomRegion`; 12/12 unit tests pass |
| 4 | globals.css has CSS selectors for muscle path default fill, hover, selected states | VERIFIED | All 8 required selectors present: `[data-view] path[id^="muscle-"]`, `:hover`, `[data-selected="true"]`, `[id^="outline-"]`, `[id^="hit-"]`, `[data-detail-mode="anatomy"]`, `.disambiguation-overlay`, `.disambiguation-cluster` |
| 5 | Normal mode SVGs have slug-based path IDs in two-layer architecture (visual + hit) | VERIFIED | Both files have `viewBox="0 0 100 250"`, `outline-layer`, `visual-layer`, `hit-layer` groups; front has 18 muscle paths, back has 18; validation script exits 0 |
| 6 | Advanced mode SVGs split grouped muscles into individual heads | VERIFIED | Front contains `muscle-biceps-long-head`, `muscle-biceps-short-head`, `muscle-quadriceps-vastus-intermedius`; Back contains `muscle-triceps-lateral-head`, `muscle-supraspinatus`, `muscle-piriformis`; both files have 27 paths |
| 7 | Anatomy mode SVGs use left/right side separation and thinner strokes | VERIFIED | `muscle-biceps-brachii-left` and `muscle-latissimus-dorsi-left` present; `stroke-width="0.75"` appears 53 times in anatomy-front; 53/48 paths in front/back anatomy SVGs |
| 8 | Validation script confirms all 6 SVG files pass | VERIFIED | `npx tsx scripts/validate-svg-ids.ts` exits 0: "6/6 passed — All 6 SVG files validated successfully" |
| 9 | User can see the muscle map SVG on the home page | VERIFIED | `src/app/page.tsx` imports and renders `MuscleMap`; no `'use client'` on page.tsx; heading "Rip Zone" present; E2E test coverage for MAP-01 |
| 10 | User can toggle between front and back views | VERIFIED | `MuscleMapControls` has `role="group" aria-label="Body view"` with Front/Back buttons calling `setView()`; `aria-pressed` on each button; E2E test coverage for MAP-02 |
| 11 | User can switch between Normal, Advanced, Anatomy detail modes | VERIFIED | `MuscleMapControls` has `role="group" aria-label="Detail level"` with Normal/Advanced/Anatomy buttons calling `setDetailMode()`; `SVG_MAP` lookup in `MuscleMapCanvas` selects correct SVG component |
| 12 | SVG renders as React component via SVGR import | VERIFIED | `MuscleMapCanvas` imports all 6 SVGs as React components; `SVG_MAP[detailMode][currentView]` selects the correct one; `data-view` and `data-detail-mode` attributes on wrapper div activate CSS selectors |
| 13 | Disambiguation zoom triggers for clustered muscles in Advanced/Anatomy modes | VERIFIED | `CLUSTER_MAP` in `muscle-clusters.ts` has entries for rotator cuff, glute complex, and posterior knee clusters; `MuscleMapCanvas` checks `CLUSTER_MAP[id]` before `selectMuscle`; guard `detailMode !== 'normal'` ensures Normal mode bypasses disambiguation |
| 14 | DisambiguationZoom renders labels, dim overlay, and auto-zooms back on selection | VERIFIED | `DisambiguationZoom` renders SVG `<text>` elements at centroids, `<rect>` for dim overlay; `handleMuscleSelect` calls `selectMuscle(slug)` then `setZoomRegion(null)`; overlay SVG positioned absolutely on top of main SVG |

**Score:** 14/14 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/types/svg.d.ts` | TypeScript module declaration for *.svg | VERIFIED | `declare module '*.svg'` with `FC<SVGProps<SVGSVGElement>>`, `export default ReactComponent` |
| `src/stores/useMapStore.ts` | Extended map state with detailMode and zoomRegion | VERIFIED | Exports `useMapStore`, `MapView`, `DetailMode`, `ZoomRegion`; all 4 required fields and setters present |
| `src/app/globals.css` | CSS attribute selectors for muscle path fill states | VERIFIED | 8 selectors confirmed; default fill `oklch(0.22)`, hover `oklch(0.32)`, selected `oklch(0.85)`, anatomy `stroke-width: 0.75px` |
| `tests/stores/useMapStore.test.ts` | Unit tests for useMapStore | VERIFIED | 12/12 tests pass (vitest run confirms) |
| `e2e/muscle-map.spec.ts` | E2E tests for MAP-01, MAP-02, MAP-05 | VERIFIED | 0 test.skip; describe blocks for MAP-01, MAP-02, Detail Mode, Selection, MAP-05, No Console Errors |
| `src/assets/svg/muscle-map-normal-front.svg` | Front view Normal mode muscle map | VERIFIED | viewBox 0 0 100 250; outline-layer, visual-layer, hit-layer; `muscle-pectoralis-major` present; 18 muscle paths; validation passes |
| `src/assets/svg/muscle-map-normal-back.svg` | Back view Normal mode muscle map | VERIFIED | Same structure; `muscle-latissimus-dorsi` present; 18 muscle paths; validation passes |
| `scripts/validate-svg-ids.ts` | Validation script for all 6 SVG files | VERIFIED | Reads `svgRegion` from muscles.json; validates NORMAL/ADVANCED/ANATOMY x FRONT/BACK; exits 0 |
| `src/assets/svg/muscle-map-advanced-front.svg` | Front view Advanced mode | VERIFIED | `muscle-biceps-long-head`, `muscle-biceps-short-head`, `muscle-quadriceps-vastus-intermedius` present; 27 paths |
| `src/assets/svg/muscle-map-advanced-back.svg` | Back view Advanced mode | VERIFIED | `muscle-triceps-lateral-head`, `muscle-supraspinatus`, `muscle-piriformis` present; 27 paths |
| `src/assets/svg/muscle-map-anatomy-front.svg` | Front view Anatomy mode | VERIFIED | `muscle-biceps-brachii-left` present; 53 `stroke-width="0.75"` occurrences; 53 muscle paths |
| `src/assets/svg/muscle-map-anatomy-back.svg` | Back view Anatomy mode | VERIFIED | `muscle-latissimus-dorsi-left` present; 48 muscle paths |
| `src/components/muscle-map/MuscleMap.tsx` | Orchestrator component | VERIFIED | Exports `MuscleMap`; renders `MuscleMapControls` and `MuscleMapCanvas` in flex-col layout |
| `src/components/muscle-map/MuscleMapCanvas.tsx` | SVG rendering with click handling | VERIFIED | Imports all 6 SVGs; SVG_MAP lookup; `data-view`/`data-detail-mode` attributes; click delegation; disambiguation check; `data-selected` via useEffect |
| `src/components/muscle-map/MuscleMapControls.tsx` | Front/Back and detail mode toggles | VERIFIED | Both `role="group"` elements; `setView`/`setDetailMode` on click; `aria-pressed`; `min-h-[44px]` touch targets |
| `src/app/page.tsx` | Home page with MuscleMap | VERIFIED | Imports `MuscleMap`; no `'use client'`; `<h1>Rip Zone</h1>`; `px-8 py-12` padding; no smoke-test code |
| `src/components/muscle-map/DisambiguationZoom.tsx` | Zoomed cluster view with labels | VERIFIED | Exports `DisambiguationZoom`; renders SVG text at centroids; auto-zooms back via `setZoomRegion(null)` |
| `src/components/muscle-map/muscle-clusters.ts` | CLUSTER_MAP and centroid data | VERIFIED | Exports `CLUSTER_MAP` (rotator cuff, glute, posterior knee clusters), `MUSCLE_DISPLAY_NAMES`, `MUSCLE_CENTROIDS` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/types/svg.d.ts` | `*.svg imports` | TypeScript module resolution | WIRED | `declare module '*.svg'` present; `next.config.ts` turbopack rules reference `@svgr/webpack` |
| `src/stores/useMapStore.ts` | `src/components/muscle-map/` | Zustand store import | WIRED | All 4 component files import `useMapStore`; destructure relevant fields and actions |
| `MuscleMapCanvas.tsx` | `src/assets/svg/*.svg` | SVGR import as React component | WIRED | All 6 SVG imports present (`NormalFront`, `NormalBack`, `AdvancedFront`, `AdvancedBack`, `AnatomyFront`, `AnatomyBack`); used in `SVG_MAP` |
| `MuscleMapCanvas.tsx` | `useMapStore.ts` | Store state for SVG selection | WIRED | Destructures `currentView`, `detailMode`, `selectedMuscle`, `selectMuscle`, `zoomRegion`, `setZoomRegion` |
| `MuscleMapControls.tsx` | `useMapStore.ts` | `setView` and `setDetailMode` actions | WIRED | Calls `setView(view)` and `setDetailMode(mode)` on button click |
| `src/app/page.tsx` | `MuscleMap.tsx` | Component import | WIRED | `import { MuscleMap } from '@/components/muscle-map/MuscleMap'`; renders `<MuscleMap />` |
| `MuscleMapCanvas.tsx` | `muscle-clusters.ts` | CLUSTER_MAP lookup on click | WIRED | `import { CLUSTER_MAP }` present; `CLUSTER_MAP[id]` check before selectMuscle in click handler |
| `DisambiguationZoom.tsx` | `useMapStore.ts` | Reads zoomRegion, calls selectMuscle/setZoomRegion | WIRED | Destructures `zoomRegion`, `selectMuscle`, `setZoomRegion`; calls both on muscle selection |
| `MuscleMapCanvas.tsx` | `DisambiguationZoom.tsx` | Renders when zoomRegion is not null | WIRED | `{zoomRegion && (<svg>...<DisambiguationZoom /></svg>)}` conditional render |
| `scripts/validate-svg-ids.ts` | `data/muscles.json` | Reads svgRegion values | WIRED | Script references svgRegion 8 times; reads muscles.json; exits 0 after full validation |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `MuscleMapCanvas` | `CurrentSvg` | `SVG_MAP[detailMode][currentView]` — static lookup into 6 imported SVG components | Yes — SVG files contain real path geometry | FLOWING |
| `MuscleMapCanvas` | `selectedMuscle` | `useMapStore()` — updated via click handler calling `selectMuscle(slug)` | Yes — slug extracted from hit-target path ID at click time | FLOWING |
| `MuscleMapCanvas` | `zoomRegion` | `useMapStore()` — set by `setZoomRegion(CLUSTER_MAP[id])` in click handler | Yes — CLUSTER_MAP has real viewBox and muscle arrays | FLOWING |
| `DisambiguationZoom` | `zoomRegion.muscles` | `useMapStore()` — populated by MuscleMapCanvas click | Yes — renders text labels at MUSCLE_CENTROIDS coordinates | FLOWING |
| `MuscleMapControls` | `currentView`, `detailMode` | `useMapStore()` — reflects actual store state | Yes — button variant and aria-pressed derived from live store state | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Store unit tests (12 tests) | `npx vitest run tests/stores/useMapStore.test.ts` | "12 passed" | PASS |
| SVG validation (all 6 files) | `npx tsx scripts/validate-svg-ids.ts` | "6/6 passed — All 6 SVG files validated successfully" | PASS |
| @svgr/webpack installed | `ls node_modules/@svgr/webpack/package.json` | File exists | PASS |
| validate:svg npm script exists | `grep '"validate:svg"' package.json` | `"validate:svg": "npx tsx scripts/validate-svg-ids.ts"` | PASS |
| E2E tests (Playwright, live browser) | Requires running dev server on port 3001 | Cannot test without server | SKIP — needs human |

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| MAP-01 | 02-02, 02-03, 02-04 | User can view a 2.5D illustrated muscle map with front and back body views | SATISFIED | All 6 SVG files exist with correct IDs and structure; MuscleMapCanvas renders them; home page wired |
| MAP-02 | 02-01, 02-04 | User can toggle between front and back views with state preserved | SATISFIED | MuscleMapControls wires setView; useMapStore persists currentView; aria-pressed reflects state |
| MAP-05 | 02-01, 02-03, 02-05 | User can tap small/clustered muscles with disambiguation UI for accurate selection | SATISFIED (automation) / NEEDS HUMAN (visual flow) | CLUSTER_MAP, DisambiguationZoom, MuscleMapCanvas click guard all wired; centroid coordinates estimated and need visual confirmation |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `DisambiguationZoom.tsx` | 10, 54, 74 | `return null` | Info | Guard clauses — not stubs. Line 10 exits when no zoom active (correct); lines 54/74 skip muscles with no centroid data (defensive, not hollow) |

No blocker anti-patterns found. No TODO/FIXME/placeholder comments. No hardcoded empty data flowing to render output.

### Human Verification Required

#### 1. Full Body Silhouette Renders Correctly

**Test:** Start dev server (`npm run dev -- --port 3001`), open http://localhost:3001
**Expected:** Complete human figure silhouette visible — head, neck, hands, and feet as non-interactive outline elements surrounding the muscle regions. Body centered with front muscle groups (chest, abs, quads, biceps) visible as distinct filled regions.
**Why human:** SVG path coordinates are programmatically valid but the visual proportions and anatomical accuracy can only be confirmed by eye. The code structure and layer grouping are correct.

#### 2. Disambiguation Zoom Flow

**Test:** Click Back toggle, then switch to Advanced mode, then tap the upper shoulder/scapula area (rear deltoid region)
**Expected:** Zoomed view appears overlaid showing "Rotator Cuff" as title label, with individual muscle names (Supraspinatus, Infraspinatus, Teres Minor, Rotator Cuff) visible at their centroid positions. Clicking a label selects that muscle and returns to full-body view.
**Why human:** Centroid coordinates in `muscle-clusters.ts` are estimated from the SVG coordinate system. Whether labels appear centered on their actual muscle paths depends on the rendered SVG geometry and requires visual inspection.

#### 3. CSS Hover and Selection States

**Test:** Hover over a muscle path on the front view (e.g., pectoralis major area), then click it
**Expected:** On hover: fill visibly brightens (from dark gray to slightly lighter gray). On click: muscle path switches to cyan/primary accent fill `oklch(0.85 0.18 195)`.
**Why human:** CSS hover state transitions are browser-rendered and cannot be confirmed by static code analysis. The selectors are correctly written but the visual result requires browser verification.

#### 4. Detail Mode SVG Swap

**Test:** Toggle through Normal, Advanced, Anatomy modes while viewing both front and back
**Expected:** Normal shows grouped muscle regions (fewer, larger paths). Advanced shows individual muscle heads (more paths, subdivided regions). Anatomy shows bilateral separation (left/right sides distinct). All transitions are instant (no animation per D-12).
**Why human:** The SVG content differences between modes are authoring-quality questions that require visual inspection of the rendered output.

### Gaps Summary

No gaps found. All 14 observable truths verified at all four levels (exists, substantive, wired, data flowing). The phase goal is fully implemented in code. The four human verification items are quality and aesthetic confirmations — particularly the disambiguation centroid coordinates — not missing functionality. The visual contract (slug-based path IDs, two-layer SVG architecture, invisible hit-target overlays) is locked into the codebase and confirmed by the passing validation script.

---

_Verified: 2026-03-23T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
