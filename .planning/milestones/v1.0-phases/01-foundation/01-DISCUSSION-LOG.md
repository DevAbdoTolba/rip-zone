# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-22
**Phase:** 01-Foundation
**Areas discussed:** Styling & UI toolkit, Seed data format, Dexie schema design, TypeScript type system, State management, MongoDB collections

---

## Styling & UI Toolkit

### CSS Approach
| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind CSS | Utility-first, fast iteration, great Next.js integration | |
| CSS Modules | Scoped CSS per component, more traditional | |
| Tailwind + CSS Modules | Tailwind for layout, CSS Modules for complex styles | |

**User's choice:** "use shadcn. modern fast and looks cool" — shadcn/ui (which includes Tailwind + Radix)
**Notes:** User specifically wants shadcn for its modern aesthetic and speed.

### Layout Structure
| Option | Description | Selected |
|--------|-------------|----------|
| Single-page with tabs | One view with tab navigation, app-like feel | |
| Multi-page with sidebar | Separate routes with sidebar nav | |
| Bottom nav mobile-first | Mobile-style bottom navigation | |

**User's choice:** Responsive hybrid — bottom nav on mobile, single-page with tabs on desktop
**Notes:** User specified both breakpoints explicitly.

### Theme
| Option | Description | Selected |
|--------|-------------|----------|
| Dark mode only | Gym apps typically dark, heatmap pops | ✓ |
| Light mode only | Cleaner, simpler | |
| Both with toggle | User can switch | |

**User's choice:** Dark mode only

### Color Palette
| Option | Description | Selected |
|--------|-------------|----------|
| Red/black aggressive | Bold red, Nike Training Club vibe | |
| Neon/electric | Bright neon accents, gaming meets fitness | ✓ |
| Blue/slate clean | Cool blue, Apple Fitness+ vibe | |
| You decide | Claude picks | |

**User's choice:** Neon/electric

### Typography
| Option | Description | Selected |
|--------|-------------|----------|
| Inter | Clean modern sans-serif, shadcn default | ✓ |
| Geist | Vercel's font, geometric feel | |
| You decide | Claude picks for neon aesthetic | |

**User's choice:** Inter

---

## Seed Data Format

### Exercise Organization
| Option | Description | Selected |
|--------|-------------|----------|
| Single flat JSON | One file with all 100+ entries | |
| Split by muscle group | Separate files per group | |
| You decide | Claude picks | ✓ |

**User's choice:** You decide — Claude's discretion on file organization

### Muscle Granularity
| Option | Description | Selected |
|--------|-------------|----------|
| Comprehensive (~50-60) | Including rare/obscure muscles | ✓ |
| Major groups only (~25-30) | Simpler but may miss requirements | |
| You decide | Claude picks | |

**User's choice:** Comprehensive

### Workout Plan Types
| Option | Description | Selected |
|--------|-------------|----------|
| Classic splits | PPL, Upper/Lower, Full Body, Bro Split | |
| Goal-based | Beginner Strength, Muscle Building, Fat Loss, Athletic Performance | ✓ |
| You decide | Claude picks for Egyptian gym culture | |

**User's choice:** Goal-based programs

---

## Dexie Schema Design

### Workout Session Storage
| Option | Description | Selected |
|--------|-------------|----------|
| Nested in session | Array of exercises with array of sets per session doc | |
| Separate tables | Separate tables for sessions, exercise logs, and sets | ✓ |
| You decide | Claude picks | |

**User's choice:** Separate tables (relational model)

### Computed Data
| Option | Description | Selected |
|--------|-------------|----------|
| Compute on the fly | Derive strain, PRs, rankings from raw logs | ✓ |
| Cache computed values | Store computed values with invalidation | |
| You decide | Claude decides per metric | |

**User's choice:** Compute on the fly (aligns with pre-phase decision)

### Bio Metrics Storage
| Option | Description | Selected |
|--------|-------------|----------|
| Single profile record | One record updated in place | |
| Versioned entries | Timestamped records for change tracking | ✓ |
| You decide | Claude picks | |

**User's choice:** Versioned entries — enables progress tracking

### Schema Migrations
| Option | Description | Selected |
|--------|-------------|----------|
| Simple version bumps | Clear and re-init on incompatible changes | |
| Full migration scripts | Upgrade functions preserving all user data | ✓ |
| You decide | Claude picks | |

**User's choice:** Full migration scripts

### Database Split
| Option | Description | Selected |
|--------|-------------|----------|
| Single database | One Dexie DB with multiple tables | |
| Split databases | Separate DBs for workouts vs profile/bio | ✓ |
| You decide | Claude picks | |

**User's choice:** Split databases with independent versioning

---

## TypeScript Type System

### Domain ID Types
| Option | Description | Selected |
|--------|-------------|----------|
| Branded types | Compile-time safety with __brand tag | ✓ |
| Plain string aliases | Simple aliases, no safety | |
| You decide | Claude picks | |

**User's choice:** Branded types

### Runtime Validation
| Option | Description | Selected |
|--------|-------------|----------|
| Zod at boundaries | Zod schemas for parsing, types inferred | |
| TypeScript only | No runtime validation, TS compile-time only | ✓ |
| You decide | Claude picks | |

**User's choice:** TypeScript only — no Zod

### Enum Strategy
| Option | Description | Selected |
|--------|-------------|----------|
| String union types | Lightweight, tree-shakeable | |
| TypeScript enums | Traditional enums with reverse mapping | ✓ |
| const objects + typeof | Most flexible, supports iteration | |

**User's choice:** TypeScript enums

---

## State Management

### Store Organization
| Option | Description | Selected |
|--------|-------------|----------|
| Domain-based stores | Separate store per domain | ✓ |
| Single global store | One big store with slices | |
| You decide | Claude picks | |

**User's choice:** Domain-based stores

### Zustand-Dexie Sync
| Option | Description | Selected |
|--------|-------------|----------|
| Manual sync | Explicit read/write functions | ✓ |
| Auto-sync middleware | Middleware auto-persists changes | |
| You decide | Claude picks | |

**User's choice:** Manual sync

---

## MongoDB Collections

### Collection Strategy
| Option | Description | Selected |
|--------|-------------|----------|
| One per domain | muscles, exercises, workoutPlans, faqEntries | ✓ |
| Single reference collection | One collection with type discriminator | |
| You decide | Claude picks | |

**User's choice:** One per domain

### Seeding Approach
| Option | Description | Selected |
|--------|-------------|----------|
| CLI script | npm run seed command | ✓ |
| On-demand at startup | Auto-seed on first load | |
| You decide | Claude picks | |

**User's choice:** CLI script

### Exercise Content Depth
| Option | Description | Selected |
|--------|-------------|----------|
| Full content | Name, slug, muscles, equipment, difficulty, description, form cues | ✓ |
| Metadata only | Name, slug, muscles, equipment, difficulty | |
| You decide | Claude picks | |

**User's choice:** Full content

---

## Claude's Discretion

- Exercise seed data file organization (flat vs split)
- Exact shadcn theme customization (spacing, sizing)
- Zustand store internal structure
- MongoDB index strategy
- Project folder structure

## Deferred Ideas

None — discussion stayed within phase scope
