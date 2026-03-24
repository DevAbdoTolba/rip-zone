---
phase: 05
slug: strain-engine-heatmap
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run tests/lib/strain-engine.test.ts --reporter=verbose` |
| **Full suite command** | `npx vitest run tests/lib/strain-engine.test.ts tests/hooks/useStrainMap.test.ts --reporter=verbose` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/lib/strain-engine.test.ts --reporter=verbose`
- **After every plan wave:** Run `npx vitest run tests/lib/strain-engine.test.ts tests/hooks/useStrainMap.test.ts --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | STRAIN-01, STRAIN-02 | unit | `npx vitest run tests/lib/strain-engine.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | MAP-03 | unit | `npx vitest run tests/hooks/useStrainMap.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | MAP-03, STRAIN-03 | visual | Manual: check heatmap colors on muscle map | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/lib/strain-engine.test.ts` — stubs for STRAIN-01, STRAIN-02 (volume calc, decay, thresholds)
- [ ] `tests/hooks/useStrainMap.test.ts` — stubs for MAP-03 (hook returns correct strain map from workout data)

*Existing vitest infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Heatmap color gradient visible on SVG | MAP-03 | CSS fill colors on SVG paths require visual inspection | Open muscle map page, log a workout, verify warm colors appear on trained muscles |
| Disclaimer text visible below map | STRAIN-03 | Layout/typography requires visual inspection | Check disclaimer text is visible and non-intrusive on map page |
| Recovery visible next day | STRAIN-01 | Time-decay requires multi-session testing | Log workout, advance system time or wait, verify lighter colors |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
