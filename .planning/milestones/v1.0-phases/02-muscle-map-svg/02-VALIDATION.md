---
phase: 2
slug: muscle-map-svg
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + Testing Library + Playwright 1.58.2 |
| **Config file** | `vitest.config.ts` (jsdom environment, setupFiles: `tests/setup.ts`) |
| **Quick run command** | `npx vitest run tests/stores/` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/stores/`
- **After every plan wave:** Run `npx vitest run && npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | MAP-01 | E2E | `npx playwright test e2e/muscle-map.spec.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | MAP-01 | E2E | `npx playwright test e2e/muscle-map.spec.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | MAP-02 | E2E | `npx playwright test e2e/muscle-map.spec.ts` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | MAP-02 | E2E | `npx playwright test e2e/muscle-map.spec.ts` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | MAP-05 | E2E | `npx playwright test e2e/muscle-map.spec.ts` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | MAP-05 | unit | `npx vitest run tests/stores/useMapStore.test.ts` | ❌ W0 | ⬜ pending |
| 02-04-01 | 01 | 1 | MAP-02 | unit | `npx vitest run tests/stores/useMapStore.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `e2e/muscle-map.spec.ts` — stubs for MAP-01, MAP-02, MAP-05 E2E scenarios
- [ ] `tests/stores/useMapStore.test.ts` — covers store unit tests for new fields (detailMode, selectedMuscle, disambiguation)

*Existing infrastructure: `vitest.config.ts`, `tests/setup.ts`, Playwright config — all in place from Phase 1. No framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 2.5D illustrated muscle map looks correct visually | MAP-01 | Visual fidelity cannot be asserted programmatically | Open `/muscle-map`, visually confirm all major groups rendered on front/back views |
| Disambiguation popover appears at correct screen position near tapped muscle | MAP-05 | Position relative to tap target requires visual inspection | Tap a clustered muscle on mobile viewport, confirm popover appears near the tap |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
