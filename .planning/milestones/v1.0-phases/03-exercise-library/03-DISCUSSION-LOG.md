# Phase 3: Exercise Library - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-23
**Phase:** 03-exercise-library
**Areas discussed:** Library layout & browsing, Navigation & routing, Exercise detail view, Warm-up guidance content, Data loading strategy, Empty & loading states, Warm-up link destination

---

## Library Layout & Browsing

### Default organization

| Option | Description | Selected |
|--------|-------------|----------|
| Grouped by muscle group | Exercises grouped under muscle group headers, collapsible sections | ✓ |
| Flat searchable list | All 110 exercises in one scrollable list, sorted alphabetically | |
| Card grid | Visual card grid showing exercise name, primary muscles, equipment icon | |

**User's choice:** Grouped by muscle group
**Notes:** Matches how gym-goers think about training

### Filtering beyond search

| Option | Description | Selected |
|--------|-------------|----------|
| Equipment + difficulty filters | Filter chips for equipment type and difficulty level | ✓ |
| Search only | Just the name search bar | |
| Full filter bar | Equipment, difficulty, AND muscle group filter | |

**User's choice:** Equipment + difficulty filters

### List item display

| Option | Description | Selected |
|--------|-------------|----------|
| Compact row with muscle badges | Dense row with name, equipment icon, difficulty badge, muscle tags | |
| Card with description preview | Larger cards with name, equipment, difficulty, primary muscles, 1-line description | ✓ |
| You decide | Claude picks best pattern | |

**User's choice:** Card with description preview

### Search behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Sticky top with instant filter | Pinned at top, results filter as you type | ✓ |
| Inline with filters | Search alongside filter chips in horizontal toolbar | |
| You decide | Claude picks placement and behavior | |

**User's choice:** Sticky top with instant filter

---

## Navigation & Routing

### Library location

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated /exercises page | Separate route with bottom nav tab | ✓ |
| Tab within muscle map page | Exercise library as a tab on the main page | |
| Drawer/panel from muscle map | Slide-out panel from muscle map page | |

**User's choice:** Dedicated /exercises page

### Bottom navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add bottom nav now | 2 tabs (Map, Exercises), sets pattern for later phases | ✓ |
| No, just add a link | Simple navigation link between pages | |
| You decide | Claude picks | |

**User's choice:** Yes, add bottom nav now

### Deep-linking

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, URL query params | Support ?muscle=slug, ?equipment=barbell, ?q=bench | ✓ |
| No deep linking | Library always opens fresh | |

**User's choice:** Yes, URL query params

---

## Exercise Detail View

### Tap behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Expand inline | Card expands in-place, collapse to return | ✓ |
| Slide-up sheet/modal | Bottom sheet or modal overlay | |
| Separate /exercises/[slug] page | Each exercise gets its own page | |

**User's choice:** Expand inline

### Detail info shown

| Option | Description | Selected |
|--------|-------------|----------|
| Full seed data fields | All fields in a single expand | |
| Essentials only | Name, description, primary muscles | |
| Full + visual muscle highlight | All fields + mini muscle map | |

**User's choice:** Other — Two-level expand: essentials first (name, description, primary muscles), then "More" button reveals full details with a body graph showing all targeted muscles and how each is affected

### Primary vs secondary muscle visualization

| Option | Description | Selected |
|--------|-------------|----------|
| Color intensity | Primary in bright neon, secondary in dimmer/muted version | ✓ |
| Two different colors | Primary cyan, secondary purple | |
| You decide | Claude picks | |

**User's choice:** Color intensity

---

## Warm-up Guidance Content

### Data structure

| Option | Description | Selected |
|--------|-------------|----------|
| Per muscle group | One warm-up guide per group (9 groups), 3-5 movements each | ✓ |
| Per exercise | Each exercise gets its own warm-up recommendation | |
| You decide | Claude picks | |

**User's choice:** Per muscle group

### Access method

| Option | Description | Selected |
|--------|-------------|----------|
| Section within muscle group header | Expandable card at top of each group section | |
| Separate warm-up page | Dedicated /warmups page or tab | |
| Badge/link on exercise cards | Each card has a warm-up link for its primary muscle group | ✓ |

**User's choice:** Badge/link on exercise cards

### Warm-up content depth

| Option | Description | Selected |
|--------|-------------|----------|
| Exercises + stretches + duration | 3-5 movements per group with name, instruction, duration/reps | ✓ |
| Just exercise list | Simple list of names with one-line descriptions | |
| You decide | Claude picks | |

**User's choice:** Exercises + stretches + duration

---

## Data Loading Strategy

### Loading approach

| Option | Description | Selected |
|--------|-------------|----------|
| Server Component + MongoDB | Fetch from MongoDB at request time | |
| API route + client fetch | /api/exercises endpoint with client fetch | |
| Static generation (SSG) | Pre-render at build time | ✓ |

**User's choice:** Static generation (SSG)

---

## Empty & Loading States

### No search results state

| Option | Description | Selected |
|--------|-------------|----------|
| Friendly message + suggestion | "No exercises found" with suggestion to try different search | |
| Just a message | Simple "No results" text | |
| You decide | Claude picks for neon theme | |

**User's choice:** Other — Easter egg with a funny GIF, friendly and interactive. Should fit the Egyptian gym community vibe

---

## Warm-up Link Destination

### Tap destination

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom sheet/modal | Opens warm-up guide for primary muscle group in bottom sheet | ✓ |
| Scroll to group header | Smooth-scrolls to warm-up section at group header | |
| Inline expand below card | Warm-up expands below the exercise card | |

**User's choice:** Bottom sheet/modal

---

## Claude's Discretion

- Card styling, spacing, expand/collapse animation
- Filter chip visual design and placement
- Bottom nav icons and active state styling
- Mini muscle map rendering size and placement
- Warm-up bottom sheet design and dismiss behavior
- Easter egg GIF selection and witty copy
- SSG revalidation strategy

## Deferred Ideas

None — discussion stayed within phase scope
