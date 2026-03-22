---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | none — Wave 0 installs |
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
| 01-01-01 | 01 | 1 | infra | smoke | `curl -s http://localhost:3000 \| grep -q "Rip Zone"` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | infra | unit | `npx vitest run src/lib/mongodb.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | infra | unit | `npx vitest run src/lib/dexie.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | infra | integration | `npx tsx scripts/seed.ts && echo OK` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | infra | typecheck | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@testing-library/react` — install test framework
- [ ] `src/lib/mongodb.test.ts` — stubs for MongoDB connection singleton
- [ ] `src/lib/dexie.test.ts` — stubs for Dexie schema init
- [ ] `vitest.config.ts` — vitest configuration

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| HMR does not duplicate MongoDB connections | infra | Requires dev server hot reload cycle | 1. Start dev server 2. Edit a file 3. Check MongoDB connection count in logs |
| Smoke-test page renders without console errors | infra | Requires browser DevTools | 1. Open localhost:3000 2. Check console for errors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
