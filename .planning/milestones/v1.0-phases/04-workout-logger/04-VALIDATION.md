---
phase: 4
slug: workout-logger
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + @testing-library/react 16.3.2 + Playwright |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run tests/` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/`
- **After every plan wave:** Run `npx vitest run && npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | WORK-01 | unit (store) + e2e | `npx vitest run tests/stores/useWorkoutStore.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | WORK-01 | e2e | `npx playwright test e2e/workout.spec.ts` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | WORK-01 | unit (component) | `npx vitest run tests/components/SetRow.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | WORK-02 | unit (timer) | `npx vitest run tests/stores/useWorkoutStore.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | WORK-03 | e2e | `npx playwright test e2e/history.spec.ts` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 2 | WORK-03 | unit (component) | `npx vitest run tests/components/ContributionGraph.test.ts` | ❌ W0 | ⬜ pending |
| 04-04-01 | 04 | 2 | WORK-04 | unit (pure fn) | `npx vitest run tests/lib/pr-detection.test.ts` | ❌ W0 | ⬜ pending |
| 04-05-01 | 05 | 3 | WORK-05 | e2e | `npx playwright test e2e/workout.spec.ts` | ❌ W0 | ⬜ pending |
| 04-05-02 | 05 | 3 | WORK-05 | unit (store) | `npx vitest run tests/stores/useWorkoutStore.test.ts` | ❌ W0 | ⬜ pending |
| 04-06-01 | 06 | 1 | WORK-06 | unit (db) | `npx vitest run tests/lib/db/workouts.test.ts` | ✅ (extend) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/stores/useWorkoutStore.test.ts` — stubs for WORK-01, WORK-02, WORK-05 store actions
- [ ] `tests/lib/pr-detection.test.ts` — stubs for WORK-04 PR detection pure function
- [ ] `tests/components/ContributionGraph.test.ts` — stubs for WORK-03 graph rendering
- [ ] `tests/components/SetRow.test.ts` — stubs for WORK-01 set row pre-fill behavior
- [ ] `e2e/workout.spec.ts` — stubs for WORK-01 end-to-end logging, WORK-05 plan runner
- [ ] `e2e/history.spec.ts` — stubs for WORK-03 history page, WORK-06 data persistence
- [ ] Extend `tests/lib/db/workouts.test.ts` — add v2 schema table tests for WORK-06

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sound + vibration on timer completion | WORK-02 | Browser audio/vibration APIs require real device | Start timer, wait for completion, verify sound plays and device vibrates |
| "Under 3 taps per set" UX | WORK-01 | Interaction efficiency is a human judgment | Log a set where weight/reps match previous — count physical taps |
| Git-log visual style matches design intent | WORK-03 | Visual appearance judgment | Compare history page to the git-log mockup in CONTEXT.md |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
