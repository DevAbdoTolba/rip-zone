---
phase: 3
slug: exercise-library
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + Playwright |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run tests/` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/`
- **After every plan wave:** Run `npx vitest run && npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | EXER-01 | E2E | `npx playwright test e2e/exercise-library.spec.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | EXER-02 | E2E | `npx playwright test e2e/exercise-library.spec.ts` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | EXER-02 | Unit | `npx vitest run tests/lib/exercise-filter.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | EXER-03 | E2E | `npx playwright test e2e/exercise-library.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `e2e/exercise-library.spec.ts` — E2E stubs covering EXER-01, EXER-02, EXER-03
- [ ] `tests/lib/exercise-filter.test.ts` — unit test for pure filter function (name, equipment, muscle group)

*Existing test infrastructure: Vitest with jsdom + Playwright already configured. No framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Easter egg empty state visual quality | EXER-02 | Subjective visual/humor assessment | Search for nonexistent exercise, verify GIF loads, copy is funny and culturally appropriate |
| Mini muscle map highlight correctness | EXER-01 | Visual highlight intensity verification | Expand exercise detail "More" view, verify primary muscles are bright, secondary are dimmer |
| Bottom nav responsive layout | N/A (D-06) | Layout verification across breakpoints | Check bottom nav on mobile (<768px) and tab nav on desktop (>=768px) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
