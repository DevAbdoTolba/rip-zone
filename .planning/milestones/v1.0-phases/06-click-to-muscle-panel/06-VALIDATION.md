---
phase: 6
slug: click-to-muscle-panel
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + Playwright |
| **Config file** | vitest.config.ts, playwright.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run && npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | MAP-04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | EXER-04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 1 | EXER-05 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 06-03-01 | 03 | 2 | MAP-04 | e2e | `npx playwright test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/components/MusclePanel.test.tsx` — stubs for panel open/close, exercise filtering, strain display
- [ ] `e2e/muscle-panel.spec.ts` — stubs for E2E panel interaction tests

*Existing vitest and Playwright infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Panel slide animation smoothness | MAP-04 | CSS animation quality is visual | Open panel on mobile, verify smooth slide-up animation |
| Responsive layout switch (drawer vs sheet) | MAP-04 | Breakpoint behavior requires visual check | Resize browser window, verify drawer on desktop, sheet on mobile |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
