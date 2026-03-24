# Requirements: Rip Zone

**Defined:** 2026-03-22
**Core Value:** The interactive muscle map must work — users can see which muscles are strained, click any muscle for training guidance, and understand their body's state at a glance.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Muscle Map

- [x] **MAP-01**: User can view a 2.5D illustrated muscle map with front and back body views
- [x] **MAP-02**: User can toggle between front and back views with state preserved
- [x] **MAP-03**: User can see heatmap color overlay showing strain level per muscle (rested → strained gradient)
- [x] **MAP-04**: User can click any muscle to open an exercise reference panel
- [x] **MAP-05**: User can tap small/clustered muscles with disambiguation UI for accurate selection

### Exercise Library

- [x] **EXER-01**: User can browse a library of 100+ exercises with primary/secondary muscle tags
- [x] **EXER-02**: User can search exercises by name
- [x] **EXER-03**: User can view warm-up guidance per muscle group
- [x] **EXER-04**: User can see exercises targeting a specific muscle via click-to-muscle reference panel
- [x] **EXER-05**: User can see current strain state for a muscle in the reference panel

### Workout Tracking

- [x] **WORK-01**: User can log freestyle workouts (exercise picker → sets/reps/weight)
- [x] **WORK-02**: User can use a configurable rest timer between sets
- [x] **WORK-03**: User can view workout history in reverse chronological order
- [x] **WORK-04**: User sees automatic PR detection with visual callout on new personal records
- [x] **WORK-05**: User can follow pre-built workout plans (3-5 programs) step by step
- [x] **WORK-06**: User can use the app fully offline

### Strain Engine

- [x] **STRAIN-01**: User can see per-muscle strain/recovery state derived from logged workouts
- [x] **STRAIN-02**: Strain calculations use placeholder dataset with time-decay model
- [x] **STRAIN-03**: User sees a disclaimer indicating strain data is based on placeholder estimates

### Ranking

- [x] **RANK-01**: User earns a tier rank (Iron → Bronze → Silver → Gold → Platinum → Diamond → Elite) based on workout performance
- [x] **RANK-02**: User can view a radar chart body rating (push/pull/legs/core/conditioning axes)
- [x] **RANK-03**: User sees progress within current tier via sub-tier progress bar
- [x] **RANK-04**: User sees celebration UI when advancing to a new tier

### Community FAQ

- [x] **FAQ-01**: User can browse FAQ content categorized by Egyptian gym community topics
- [x] **FAQ-02**: User can read newbie-focused Q&A (muscle pain, progress loss, common misconceptions)

### Bio Metrics

- [ ] **BIO-01**: User can optionally provide bio info (height, weight, age, gender, body fat %, measurements)
- [ ] **BIO-02**: User sees improved accuracy in strain/ranking when bio info is provided
- [ ] **BIO-03**: All features work fully without any bio info provided

## Future Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Data

- **DATA-01**: Strain calculations use real scientific dataset from exercise science research
- **DATA-02**: AI-adaptive workout recommendations based on user history and scientific data

### Accounts & Sync

- **ACCT-01**: User can create an account with email
- **ACCT-02**: User data syncs across devices

### Social

- **SOCL-01**: User can share workout summaries as images
- **SOCL-02**: User can view optional leaderboards

### Expanded Content

- **CONT-01**: Exercise library expanded to 200+ exercises
- **CONT-02**: Per-exercise progress charts showing trends over time

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User authentication | v1 is local-only — reduces complexity, lets users try immediately |
| Real scientific dataset | Requires dedicated research; placeholder data unblocks v1 |
| Arabic UI | English-first; Egyptian gym community uses fitness apps in English |
| Mobile native app | Web-first with Next.js; responsive design covers mobile |
| Social features | Requires moderation, user management, critical mass of users |
| Nutrition/calorie tracking | Separate product category; half-baked version undermines trust |
| Wearable integration | Fragmented APIs; manual logging sufficient for early adopters |
| 3D WebGL muscle model | Higher complexity/slower render; 2.5D illustrated approach is clearer |
| Real-time AI coaching | Requires real dataset + user history depth; nonsense on placeholder data |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MAP-01 | Phase 2 | Complete |
| MAP-02 | Phase 2 | Complete |
| MAP-03 | Phase 5 | Complete |
| MAP-04 | Phase 6 | Complete |
| MAP-05 | Phase 2 | Complete |
| EXER-01 | Phase 3 | Complete |
| EXER-02 | Phase 3 | Complete |
| EXER-03 | Phase 3 | Complete |
| EXER-04 | Phase 6 | Complete |
| EXER-05 | Phase 6 | Complete |
| WORK-01 | Phase 4 | Complete |
| WORK-02 | Phase 4 | Complete |
| WORK-03 | Phase 4 | Complete |
| WORK-04 | Phase 4 | Complete |
| WORK-05 | Phase 4 | Complete |
| WORK-06 | Phase 4 | Complete |
| STRAIN-01 | Phase 5 | Complete |
| STRAIN-02 | Phase 5 | Complete |
| STRAIN-03 | Phase 5 | Complete |
| RANK-01 | Phase 7 | Complete |
| RANK-02 | Phase 7 | Complete |
| RANK-03 | Phase 7 | Complete |
| RANK-04 | Phase 7 | Complete |
| FAQ-01 | Phase 8 | Complete |
| FAQ-02 | Phase 8 | Complete |
| BIO-01 | Phase 8 | Pending |
| BIO-02 | Phase 8 | Pending |
| BIO-03 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 after roadmap creation — traceability complete*
