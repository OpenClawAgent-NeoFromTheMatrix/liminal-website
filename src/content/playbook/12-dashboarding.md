---
title: "12 — Dashboarding: The Dark Glass Command Center"
part: 0
order: 12
description: "Part 0 — Part 3 - Building"
---


## What We Built

A real-time operations dashboard with 18 pages, ~90 API endpoints, and 274 tests. Single-user (operator), dark theme, mobile responsive.

**Live:** https://<your-domain>/dashboard/

## Pages

| Page | Purpose | Key Data |
|------|---------|----------|
| Command Center | Homepage — system pulse | KPIs, notifications, active tasks, daily snapshot |
| Overview | System architecture view | VM stats, agent roster, model distribution, data tiers |
| Agents | RPG character cards | XP, levels, ranks, stats, profile modals |
| Schedule | Calendar views | Day timeline, week gantt, task status |
| System | Cron job viewer | Grouped by frequency, parsed from crontab |
| Costs | Financial dashboard | Budget bars, token usage, per-agent breakdown |
| Reviews | Code review history | Session cards, file changes, search |
| Action Center | Quick actions | Approve/reject notifications |
| Agent Health | Health monitoring | Status dots, alerts |
| Task Queue | Work tracker | In-progress, completed, failed |
| Metrics | KPI dashboard | Trends, charts |
| Feedback | Rating capture | Star ratings from Discord |
| Ideas | Innovation pipeline | Agent proposals, voting |
| Logs | System logs viewer | Gateway, MCP, agent logs |
| Sessions | Claude Code sessions | Token usage, cost per session |

## Real-Time Features

### Multi-Tier Polling (Command Center)

```javascript
// homepage.js — commandCenter() Alpine component
setInterval(() => this.loadStatus(), 10000);       // System status: 10s
setInterval(() => this.loadNotifications(), 30000); // Notifications: 30s
setInterval(() => this.loadTasks(), 120000);        // Active tasks: 2min
setInterval(() => this.loadPulse(), 300000);        // KPI pulse: 5min
```

### Chart.js Integration

```javascript
// dashChart() — wrapper with dark theme defaults
dashChart(canvasId, {
  type: 'line',
  labels: ['Mon','Tue','Wed','Thu','Fri'],
  datasets: [{ label: 'Tasks', data: [12,19,15,22,18] }]
});

// dashSparkline() — tiny inline charts (no axes, no legend)
dashSparkline(canvasId, data, color);
```

## Metrics Tracked

| Category | Metrics |
|----------|---------|
| Tasks | Completed, failed, in-progress, acceptance rate |
| XP | Total per agent, level, streak, daily earned |
| Costs | Tokens in/out, cost per model, per agent, daily/weekly/monthly |
| Performance | Response time, uptime %, CEO rating |
| Rank | S/A/B/C/D based on 5 weighted dimensions |
| System | CPU, RAM, disk, load average, service status |
| Data | Hot/warm/cold tier counts, DB size |

## Architecture

```
Express server (port 3838)
├── JWT auth middleware → httpOnly cookies
├── Security headers middleware
├── API routes (~85 endpoints)
├── Page routes (18 pages)
├── EJS templates (server-rendered)
├── Alpine.js components (client-side reactivity)
├── Chart.js (data visualization)
├── SQLite (better-sqlite3, WAL mode)
└── Nginx reverse proxy (SSL termination)
```

---


## Recent Enhancements (X-Series)

### Test Coverage API
`GET /api/test-coverage` — returns latest coverage audit results:
- Endpoint count, test count, pass/fail, coverage percentage
- Powered by `coverage-audit.sh` run by Test Agent nightly

### AURA Integration
Dashboard uses AURA design tokens for all styling:
- Token JSON files in `aura/tokens/` define colors, spacing, typography
- `stacks/css-vars.md` maps tokens to `var(--name)` CSS custom properties
- `validate.sh` checks compliance after UI changes
- Component specs in `aura/components/` define card, badge, button, table patterns

### Test Count: 281
12 test composition files covering: endpoints, design, data layer, homepage, agents, analytics, infrastructure, PII scanning, routing, W-series features, command center layout, attention actions.

### Sources
- [Express.js](https://expressjs.com) — HTTP server framework
- [Alpine.js 3](https://alpinejs.dev) — Reactive UI components
- [Chart.js](https://www.chartjs.org) — Data visualization
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — SQLite with WAL mode
