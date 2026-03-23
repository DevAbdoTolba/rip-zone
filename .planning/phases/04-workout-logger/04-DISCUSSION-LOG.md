# Phase 4: Workout Logger - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-23
**Phase:** 04-workout-logger
**Areas discussed:** Logging flow, Rest timer UX, History & PR display, Plan runner

---

## Logging Flow

### Page Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Single-page logger | One scrollable page with exercises expanding inline and set rows. Minimal navigation | ✓ |
| Step-by-step wizard | One exercise fills screen at a time. Swipe to move between exercises | |
| Bottom sheet logger | Persistent bottom sheet over main app for multi-task logging | |

**User's choice:** Single-page logger
**Notes:** Fits "under 3 taps per set" requirement

### Exercise Picker

| Option | Description | Selected |
|--------|-------------|----------|
| Search sheet | Bottom sheet with search + recent exercises | ✓ (combined) |
| Muscle group browse | Group exercises by muscle group | ✓ (combined) |
| Favorites only | User builds favorites list, picker shows only those | |

**User's choice:** Both search sheet AND muscle group browse — combined in one bottom sheet
**Notes:** User wants search + recent at top with muscle group browse tabs in the same sheet

### Set Entry

| Option | Description | Selected |
|--------|-------------|----------|
| Inline number inputs | Tap fields directly in set row, pre-fill from previous set | ✓ |
| Numpad modal | Focused numpad modal for weight + reps | |
| Stepper buttons | +/- buttons for weight and reps | |

**User's choice:** Inline number inputs
**Notes:** Pre-fills from previous set values for fast entry

### Weight Unit

| Option | Description | Selected |
|--------|-------------|----------|
| kg only | Metric only, matches Egyptian gym community | ✓ |
| kg/lbs toggle | User picks preference, stored as kg internally | |
| You decide | Claude picks | |

**User's choice:** kg only

---

## Rest Timer UX

### Timer Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Inline between sets | Timer appears as row between completed and next set | |
| Floating mini-widget | Small floating bubble at bottom of screen | ✓ |
| Full-screen countdown | Timer takes over entire screen | |

**User's choice:** Floating mini-widget
**Notes:** Visible while scrolling, doesn't block exercise navigation

### Duration Configuration

| Option | Description | Selected |
|--------|-------------|----------|
| Auto from plan + adjustable | Pre-fills from restSeconds, +/- 15s to adjust | ✓ |
| Fixed presets | Quick-pick buttons: 30s, 60s, 90s, etc. | |
| Fully custom | User types exact seconds | |

**User's choice:** Auto from plan + adjustable
**Notes:** Remembers last-used duration per exercise

### Timer Alert

| Option | Description | Selected |
|--------|-------------|----------|
| Vibration only | Phone vibrates when timer hits zero | |
| Sound + vibration | Short beep plus vibration | ✓ |
| Visual only | Screen flash/color change only | |

**User's choice:** Sound + vibration

---

## History & PR Display

### History Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Card list | Reverse chronological cards with summary | |
| Calendar + list | Calendar grid at top, list for selected day | |
| Stats dashboard | Weekly/monthly summary with charts | |

**User's choice:** (Other) Git-log style timeline
**Notes:** User specifically requested "something like git history" — compact one-liner per session (date, workout name, exercise count, sets, volume), tap to expand. Also requested a GitHub-style contribution graph heatmap at the top. Color intensity metric at Claude's discretion.

### Contribution Graph

**User's choice:** Last 3 months
**Notes:** GitHub-style contribution graph at top of history page

### History Navigation

**User's choice:** Own tab in bottom nav (4 tabs: Map, Exercises, History, Workout)

### PR Callout

| Option | Description | Selected |
|--------|-------------|----------|
| Inline badge + glow | Set row highlights with neon glow and "NEW PR" badge | ✓ |
| Toast notification | Toast slides in from top, disappears after 3s | |
| Celebration overlay | Confetti/particle animation overlay | |

**User's choice:** Inline badge
**Notes:** User also requested that exercises in history can expand to show the exercise library card detail (Phase 3 pattern)

### PR Definition

| Option | Description | Selected |
|--------|-------------|----------|
| Max weight per exercise | Heaviest weight ever lifted for 1+ rep | |
| Max weight at each rep count | Best weight at 1RM, 3RM, 5RM, 10RM etc. | ✓ |
| You decide | Claude picks for target audience | |

**User's choice:** Max weight at each rep count

---

## Plan Runner

### Plan Start

| Option | Description | Selected |
|--------|-------------|----------|
| Plan browser + day picker | Browse plans, select, see day breakdown, tap to start | ✓ |
| Smart suggestion | Auto-suggests next day from active plan | |
| Both | Suggestion + full browser | |

**User's choice:** Plan browser + day picker

### Plan Flexibility

| Option | Description | Selected |
|--------|-------------|----------|
| Full flexibility | Plan pre-loads but user can modify everything | ✓ |
| Strict mode | Follow plan exactly as written | |
| You decide | Claude picks | |

**User's choice:** Full flexibility

### Plan Progress Tracking

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, visual progress | Checkmarks for completed days, weekly count | ✓ |
| No tracking | Plans are just templates | |
| You decide | Claude picks | |

**User's choice:** Yes, visual progress
**Notes:** User also requested: (1) Ensure popular Egyptian gym plans are included — Arnold split, PPL, supersets. (2) Add plan recommendation UI that warns users about plans above their level and highlights the recommended plan based on their apparent experience.

---

## Claude's Discretion

- Contribution graph color intensity metric
- Floating timer widget design and positioning
- Sound choice for timer alert
- Plan recommendation logic (determining user level without bio data)
- Which specific Egyptian gym splits to add to seed data
- Exercise picker layout within the bottom sheet
- Bottom nav icon choices for 4 tabs
- Animation/transition details for PR badge and set confirmation

## Deferred Ideas

None — discussion stayed within phase scope
