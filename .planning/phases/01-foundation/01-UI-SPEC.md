---
phase: 1
slug: foundation
status: draft
shadcn_initialized: false
preset: none
created: 2026-03-22
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for Phase 1: Foundation.
> Phase 1 is an infrastructure phase with no user-facing screens. The UI contract here
> defines the design system that must be configured during this phase so all subsequent
> phases inherit a consistent token set. The "UI work" in Phase 1 is: initialize shadcn,
> configure the dark neon Tailwind theme, and lock the design tokens.

---

## Phase 1 UI Scope

Phase 1 has one UI deliverable: a working smoke-test page (`/`) that proves the Next.js
app boots, the design system is configured, and the token contract below renders correctly.
No navigation, no data display, no interactive components required beyond this smoke-test.

All tokens, color variables, and typography settings defined here are the **shared contract**
that Phases 2–8 will inherit. Define them correctly here; do not revisit them in later phases.

---

## Design System

| Property | Value | Source |
|----------|-------|--------|
| Tool | shadcn/ui | CONTEXT.md D-01 |
| Preset | manual — dark neon (configure via `npx shadcn init`) | default (no preset URL available) |
| Component library | Radix UI primitives (via shadcn) | CONTEXT.md D-01 |
| Icon library | lucide-react (shadcn default) | default |
| Font | Inter | CONTEXT.md D-05 |

**shadcn initialization note:** `components.json` does not exist. During Phase 1 execution,
run `npx shadcn init` and select the **dark** base theme. After init, override CSS variables
in `globals.css` with the neon token values defined in the Color section below.

---

## Spacing Scale

Declared values (multiples of 4 only). These become the Tailwind spacing tokens.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline label padding |
| sm | 8px | Input field internal padding, compact badges |
| md | 16px | Default element spacing, card padding |
| lg | 24px | Section padding, nav item spacing |
| xl | 32px | Layout column gaps, panel padding |
| 2xl | 48px | Major section breaks between page zones |
| 3xl | 64px | Page-level top/bottom margin |

Exceptions: Touch targets for nav icons (mobile) — minimum 44px hit area per WCAG 2.1 SC 2.5.5.
Achieved via padding, not by breaking the scale.

---

## Typography

Font family: Inter (loaded via `next/font/google`).

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Body | 16px | 400 (regular) | 1.5 | Default text, descriptions, list items |
| Label | 14px | 600 (semibold) | 1.4 | Form labels, nav items, badges, captions |
| Heading | 20px | 600 (semibold) | 1.2 | Screen titles, section headers |
| Display | 28px | 600 (semibold) | 1.2 | Hero values, tier rank name, radar score |

Weights used: 400 and 600 only. No other weights permitted.

---

## Color

Dark mode only (CONTEXT.md D-03). No light mode variables needed.

Palette: Neon/electric — tech-meets-gym aesthetic (CONTEXT.md D-04).

| Role | Value | CSS Variable | Usage |
|------|-------|-------------|-------|
| Dominant (60%) | `#0a0a0f` | `--background` | Page background, base surface |
| Secondary (30%) | `#13131f` | `--card` | Cards, nav bar, sidebar, input backgrounds |
| Accent — primary (8%) | `#00e5ff` | `--primary` | Accent cyan — see reserved list below |
| Accent — secondary (2%) | `#a855f7` | `--secondary` | Accent purple — radar chart fills, tier badge background |
| Destructive | `#ef4444` | `--destructive` | Destructive action buttons and confirmation dialogs only |
| Border | `#1e1e2e` | `--border` | Dividers, card borders, input borders |
| Muted text | `#6b7280` | `--muted-foreground` | Placeholder text, disabled states, helper copy |
| Foreground | `#f0f0f5` | `--foreground` | Primary text on dark backgrounds |

**Accent (cyan `#00e5ff`) reserved for:**
- Primary CTA buttons
- Active nav item indicator
- Muscle heatmap "rested" end of gradient (Phase 5)
- Hyperlinks and clickable muscle paths (Phase 2+)
- Progress bar fill (Phase 7)

**Accent (purple `#a855f7`) reserved for:**
- Radar chart polygon fill (Phase 7)
- Tier badge backgrounds (Phase 7)
- Secondary highlight on disambiguation popover (Phase 2)

Do NOT use accent colors for body text, non-interactive decorative elements, or backgrounds.

---

## Smoke-Test Page Copy

Phase 1 has one page (`/`). It is a developer-facing smoke-test, not a user-facing screen.

| Element | Copy |
|---------|------|
| Page heading | Rip Zone |
| Subheading | Foundation loaded |
| DB status label | MongoDB |
| DB status — connected | Connected |
| DB status — error | Connection failed — check MONGODB_URI |
| Dexie status label | Local DB |
| Dexie status — ready | Ready |
| Dexie status — error | IndexedDB unavailable — private browsing? |
| Seed data label | Reference data |
| Seed data — loaded | {N} muscles · {N} exercises · {N} plans · {N} FAQ entries |
| Seed data — not loaded | No data — run `npm run seed` |

No empty states, no destructive actions, no user-facing CTAs in Phase 1.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Not applicable — Phase 1 has no user CTAs |
| Empty state heading | Not applicable — infrastructure phase |
| Empty state body | Not applicable — infrastructure phase |
| Error state | {Problem description} — {fix instruction} (see Smoke-Test Page Copy above) |
| Destructive confirmation | Not applicable — no destructive actions in Phase 1 |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | button, badge (smoke-test page only) | not required |
| Third-party | none | not applicable |

No third-party registries. Only official shadcn components needed for the smoke-test page.

---

## Phase 1 Implementation Checklist

These are the design system setup tasks the executor must complete in Phase 1:

1. Run `npx shadcn init` — select **dark** theme, **default** style, set `--radius` to `0.5rem`
2. Confirm `components.json` created with `tailwindCSS.config: "tailwind.config.ts"` and `tsx: true`
3. Override shadcn CSS variables in `globals.css` with the neon values from the Color table above
4. Add Inter font via `next/font/google` in the root layout
5. Set `background: #0a0a0f` on `<html>` — dark mode only, no `dark:` class variant needed
6. Add shadcn `button` and `badge` components for smoke-test page
7. Render smoke-test page at `/` with the copy from Smoke-Test Page Copy table
8. Confirm page loads with no console errors (ROADMAP success criterion 1)

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
