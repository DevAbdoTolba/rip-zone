---
phase: 1
slug: foundation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-22
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (created in Plan 01-02, Task 1) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-02-01 | 02 | 2 | infra | unit | `npx vitest run tests/lib/db/ --reporter=verbose` | vitest.config.ts, tests/lib/db/*.test.ts (Wave 2 Task 1) | pending |
| 01-02-02 | 02 | 2 | infra | unit | `npx vitest run tests/lib/db/ --reporter=verbose` | tests run against Dexie files (Wave 2 Task 2) | pending |
| 01-04-02 | 04 | 3 | infra | typecheck | `npx vitest run tests/types/ --reporter=verbose` | tests/types/branded.test-d.ts (Wave 3 Task 2) | pending |
| 01-01-01 | 01 | 1 | infra | smoke | `test -f components.json && grep -q 'oklch' src/app/globals.css && npx tsc --noEmit` | N/A | pending |
| 01-03-02 | 03 | 2 | infra | data | `node -e "..." (cross-ref validation script)` | N/A | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

Vitest setup and Dexie test stubs are created in Plan 01-02 Task 1 (Wave 2), which runs before the Dexie implementation in Task 2 of the same plan. This satisfies the Nyquist requirement — tests exist before implementation code.

- [x] `vitest` + `@testing-library/react` — installed in Plan 01-01
- [x] `vitest.config.ts` — created in Plan 01-02 Task 1
- [x] `tests/lib/db/workouts.test.ts` — created in Plan 01-02 Task 1
- [x] `tests/lib/db/profile.test.ts` — created in Plan 01-02 Task 1
- [x] `fake-indexeddb` — installed in Plan 01-02 Task 1

*Wave 0 is satisfied within Plan 01-02 task ordering (Task 1 creates tests, Task 2 creates implementation).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| HMR does not duplicate MongoDB connections | infra | Requires dev server hot reload cycle | 1. Start dev server 2. Edit a file 3. Check MongoDB connection count in logs |
| Smoke-test page renders without console errors | infra | Requires browser DevTools | 1. Open localhost:3000 2. Check console for errors |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
