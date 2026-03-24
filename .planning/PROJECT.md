# Rip Zone

## What This Is

A fitness app for the Egyptian gym community built with Next.js and MongoDB. It centers on an interactive 2.5D muscle map with heatmap visualization showing muscle strain, clickable exercise references, workout tracking, community FAQ, and a gamified ranking system.

## Core Value

The interactive muscle map must work — users can see which muscles are strained, click any muscle for training guidance, and understand their body's state at a glance.

## Current Milestone: v1.0 Core MVP

**Goal:** Ship the interactive 2.5D muscle map fitness app with workout tracking, strain visualization, exercise references, gamified ranking, and Egyptian community FAQ.

**Target features:**
- 2.5D illustrated muscle map with heatmap strain overlay
- Clickable muscles → exercise references with warm-up guidance
- Freestyle workout logger with rest timer
- Pre-built workout plans
- Placeholder muscle strain/recovery engine
- Radar chart body rating
- Iron → Elite tier ranking system
- Egyptian gym community FAQ
- Optional bio-info collection with accuracy rewards

## Requirements

### Validated

- [x] TypeScript domain types, data storage split, seed data infrastructure — Validated in Phase 1: Foundation
- [x] 2.5D illustrated muscle map (front/back views) covering all muscles including rare/obscure ones — Validated in Phase 2: Muscle Map SVG
- [x] Browseable, searchable exercise library with 110 exercises, muscle tags, and warm-up guidance — Validated in Phase 3: Exercise Library
- [x] Workout tracker — freestyle logging (exercise → sets/reps/weight → rest timer) — Validated in Phase 4: Workout Logger
- [x] Pre-built workout plans users can follow step by step — Validated in Phase 4: Workout Logger
- [x] Heatmap overlay showing strain level per muscle based on training data — Validated in Phase 5: Strain Engine + Heatmap
- [x] Placeholder scientific dataset for muscle strain/recovery calculations — Validated in Phase 5: Strain Engine + Heatmap
- [x] Clickable muscles opening exercise references with pre-training warm-up and training intensity info — Validated in Phase 6: Click-to-Muscle Panel

### Active
- [ ] Optional bio-info collection (height, weight, age, gender, body fat %, muscle measurements)
- [ ] Bio-info reward system — more data improves accuracy, never gates features
- [ ] AI-generated FAQ content from Egyptian gym community topics (Reddit, Twitter, Facebook)
- [ ] Newbie-focused Q&A (muscle pain, progress loss, common misconceptions)
- [x] Radar chart body rating based on reps, weight, and body metrics — Validated in Phase 7: Ranking + Radar
- [x] Tier ranking system: Iron → Bronze → Silver → Gold → Platinum → Diamond → Elite — Validated in Phase 7: Ranking + Radar

### Out of Scope

- User authentication — v1 is local-only, no accounts
- Real scientific dataset — placeholder data for v1, real data integrated later
- Arabic UI — English-first, Arabic content in FAQ only
- Mobile native app — web-first with Next.js
- Social features — no sharing, following, or community interaction in v1

## Context

- Target audience: Egyptian gym-goers, especially newbies
- The muscle map is the hero feature — everything else supports it
- Muscle strain data will eventually come from scientific papers (reps, weight, intensity, recovery time per muscle)
- Each muscle's training info includes: intensity % focus, assisting/helping muscles
- FAQ content should reflect real questions from Egyptian fitness culture
- Ranking equations combine workout performance (reps, weight) with body metrics when available

## Constraints

- **Tech stack**: Next.js + MongoDB — non-negotiable
- **Language**: English UI
- **Auth**: No authentication for v1 — all data stored locally
- **Muscle data**: Placeholder datasets for v1, real scientific data added in future milestone
- **Bio-info**: All fields optional — app must work fully without any bio data

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 2.5D illustrated map over WebGL 3D | Simpler to build, faster to render, flat views show all muscles clearly | — Pending |
| No auth for v1 | Reduces complexity, lets users try immediately without friction | — Pending |
| English UI with Arabic FAQ content | Simpler i18n, community content stays culturally relevant | — Pending |
| Placeholder muscle data | Unblocks development while scientific data is researched | — Pending |
| Local storage for v1 | No backend user management needed, faster to ship | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-24 after Phase 7: Ranking + Radar complete — tier ranking (Iron→Elite), 5-axis radar chart body rating, sub-tier progress bar, and celebration overlay on tier advance*
