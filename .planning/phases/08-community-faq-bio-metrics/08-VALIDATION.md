---
phase: 8
slug: community-faq-bio-metrics
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + playwright |
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
| 08-01-01 | 01 | 1 | FAQ-01 | E2E | `npx playwright test faq` | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | FAQ-02 | E2E | `npx playwright test faq` | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 1 | BIO-01 | unit+E2E | `npx vitest run bio && npx playwright test profile` | ❌ W0 | ⬜ pending |
| 08-02-02 | 02 | 1 | BIO-02 | unit | `npx vitest run strain ranking` | ❌ W0 | ⬜ pending |
| 08-03-01 | 03 | 2 | BIO-03 | E2E | `npx playwright test smoke` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/e2e/faq.spec.ts` — stubs for FAQ-01, FAQ-02
- [ ] `tests/e2e/profile.spec.ts` — stubs for BIO-01
- [ ] `src/lib/__tests__/strain-engine-bio.test.ts` — stubs for BIO-02
- [ ] `tests/e2e/smoke-no-bio.spec.ts` — stubs for BIO-03

*Existing vitest + playwright infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| FAQ tone reflects Egyptian culture | FAQ-02 | Content quality is subjective | Read 3+ FAQ answers and verify cultural references |
| Accuracy meter visual feedback | BIO-02 | Visual accuracy ring rendering | Fill bio fields and observe accuracy % change |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
