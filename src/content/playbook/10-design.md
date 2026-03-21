---
title: "10 — Design System: Dark Glass"
part: 0
order: 10
description: "Part 0 — Part 3 - Building"
---


## Philosophy

Dark, dense, precise. Terminal-meets-ops-center. No white surfaces. No rounded bubbly shapes. No decorative animations. Every pixel serves a purpose.

## Color System

### Base Palette

| Token | Hex | Usage |
|-------|-----|-------|
| bg-base | #0a0a0f | Page background |
| bg-surface | #111111 | Cards, panels |
| bg-elevated | #1a1a1a | Modals, dropdowns |
| bg-input | #141414 | Input fields |
| border-subtle | #222222 | Dividers |
| border-default | #2e2e2e | Active borders |

### Status Colors (Used Everywhere Consistently)

| Color | Hex | Meaning |
|-------|-----|---------|
| Green | #10b981 | Healthy, passing, active, success |
| Amber | #f59e0b | Warning, degraded, retrying |
| Red | #ef4444 | Critical, failed, blocked |
| Indigo | #6366f1 | Idle, scheduled, waiting |
| Gray | #555555 | Unknown, offline, no data |
| Blue | #3b82f6 | Info, neutral, system messages |

### Typography

```css
--font-sans: 'Inter', system-ui, sans-serif;    /* UI labels, headings */
--font-mono: 'JetBrains Mono', monospace;        /* Metrics, logs, IDs */
```

Rule: Agent names are always monospace (they're system identifiers).

## Component Library

### Glass Cards

```css
.glass-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}
```

### Status Dots (Animated)

```css
.status-dot--healthy  { background: #10b981; animation: pulse 2s infinite; }
.status-dot--critical { background: #ef4444; animation: pulse 0.8s infinite; }
```

### RPG Agent Cards

Each agent rendered as a character card with:
- Avatar (image or gradient fallback with emoji)
- Name + level badge
- Rank letter (S/A/B/C/D) with color coding
- XP progress bar
- 5 stat bars (reliability, speed, quality, cost efficiency, uptime)
- Streak counter + total XP

## Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| ≥1440px | Full sidebar + 3-column content grid |
| ≥1024px | Full sidebar + 2-column content |
| ≥768px | Collapsed sidebar (icons only) + single column |
| ≥480px | Hidden sidebar + hamburger menu + stacked cards |
| <480px | Full mobile, single column, 44px tap targets |

### Do's and Don'ts

✅ Use status colors consistently everywhere
✅ Use monospace for all data values
✅ Keep backgrounds dark — never white
✅ Animate only status indicators

❌ Never use pure white (#ffffff) anywhere
❌ Never use border-radius > 12px
❌ Never use box-shadows (use borders)
❌ Never use more than 2 font families per view

---


## AURA — Autonomous UI Reasoning Architecture

AURA is a design system framework that gives AI coding agents "eyes." Three capabilities no existing tool provides together:
1. Stack-agnostic design tokens in structured JSON
2. Autonomous visual validation (agent screenshots its own work, checks against spec)
3. Self-evolution (learns from human approvals/rejections, adapts over time)

### Token System
Design values are stored in `aura/tokens/*.json`:

| File | Content |
|------|---------|
| `colors.json` | Surface, accent, text, border, status, glass, glow colors |
| `spacing.json` | Scale (xs→2xl), aliases (sp-1→sp-5), semantic (page-padding, card-padding) |
| `typography.json` | Font families (sans, mono), 10 roles (heading, body, label, stat-value, etc.) |
| `borders.json` | Radius (sm/md/lg), widths, semantic per component |
| `motion.json` | Duration (fast/normal/slow), easing, semantic transitions |
| `breakpoints.json` | sm (640), md (768), lg (1024), xl (1280) |

The stack mapping file (`stacks/css-vars.md`) translates tokens to `var(--name)` syntax. Agents never hardcode CSS values — they reference tokens.

### Component Specs
Each UI component has a spec in `aura/components/`:
- Variants, anatomy, states, token references, do/don't rules
- Components: card, badge, stat-card, button, table, nav

### Validation
`validate.sh` runs 5 automated checks via Playwright:
1. No hardcoded colors in inline styles
2. Minimum font size ≥11px
3. No horizontal scroll overflow
4. No element overlap (bounding box intersection >10%)
5. No console errors

Reports output as structured JSON with pass/fail and violation details.

### Evolution Engine
When the operator overrides an agent's UI output, the override is logged to `history/decisions.jsonl`. Weekly, `evolution_check.sh` analyzes patterns. If the same token is overridden 3+ times in the same direction, the script proposes a token update. CEO approves before the token file is modified. The design system learns the operator's preferences over time.

### Sources
- [Contentsquare — Web Design Best Practices](https://contentsquare.com/guides/web-design/best-practices/) — Visual hierarchy, whitespace
- [Wix — Web Design Best Practices](https://www.wix.com/blog/web-design-best-practices) — Readability, consistency
- [Figma — What is Web Design](https://www.figma.com/resource-library/what-is-web-design/) — Responsive design, performance
