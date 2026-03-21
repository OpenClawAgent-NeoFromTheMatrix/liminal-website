---
title: "09 — Development Best Practices"
part: 0
order: 09
description: "Part 0 — Part 3 - Building"
---


## Standards

### Every Project Must Have

1. **README.md** — What it does, how to run it, environment vars
2. **CLAUDE.md** — How Claude should work on this project (under 3000 tokens)
3. **FILE_MAP.md** — Complete file structure with anchor names
4. **CHANGELOG.md** — Every change with date and reason
5. **STATUS.md** — Current build state

### Anchor Naming Convention

```
Functions:  #fn-[name]        e.g. #fn-getAgentStatus
Classes:    #cls-[name]       e.g. #cls-AgentRouter
Modules:    #mod-[name]       e.g. #mod-auth
Routes:     #route-[method]-[path]  e.g. #route-get-agents
Config:     #cfg-[name]       e.g. #cfg-database
```

### Task Quality Standard

Every task must have before pickup:
- Unique ID, action-verb title, time estimate, phase, category
- Input files, output files, acceptance test (bash command)

Reject if: accept_test is "manual check", inputs don't exist, estimate is blank.

### Failure Protocol

| Attempt | Action |
|---------|--------|
| 1st fail | Log error, diagnose, retry with fix |
| 2nd fail | Retry with different approach, log both |
| 3rd fail | STOP. Write failure report. Escalate to CEO → Operator |

## Backend Optimization

### SQLite Best Practices (better-sqlite3)

```javascript
// ✅ CORRECT — params in .all()/.get()
db.prepare("SELECT * FROM tasks WHERE status = ?").all('pending');

// ❌ WRONG — better-sqlite3 doesn't accept params in prepare()
db.prepare("SELECT * FROM tasks WHERE status = ?", ['pending']).all();
```

**WAL mode** for concurrent reads:
```javascript
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
```

### Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Page load (server-side) | <50ms | <5ms |
| API response | <50ms | <10ms |
| CSS file size | <50KB | 43.6KB |
| Memory leak after 100 requests | <1MB | 8KB |
| SQLite query time | <50ms | <5ms |

### Process Management

```bash
# Kill by port (when you can't find the PID)
fuser -k 3838/tcp

# Start with logging
nohup node server.js > /tmp/org-logs/dashboard.log 2>&1 &

# Verify running
curl -s http://localhost:3838/health
```

## Data Architecture

### Data Tiering (Hot → Warm → Cold)

| Tier | Storage | Retention | Access |
|------|---------|-----------|--------|
| HOT | SQLite | 7 days | Real-time dashboard queries |
| WARM | JSON archives | 30 days | On-demand API calls |
| COLD | Compressed tar.gz | Permanent | Manual retrieval |

`scripts/data_tier.sh` manages migration:
```bash
# Hot→Warm: export old rows to JSON, delete from DB
# Warm→Cold: monthly compression + cleanup
# Tables: agent_tasks, notifications, sessions, agent_model_usage
```

### Database Migrations

```bash
bash db/migrate.sh            # Apply pending migrations
bash db/migrate.sh --status   # Show migration status
bash db/migrate.sh --dry-run  # Preview without applying
```

6 migrations: initial schema, XP system, notifications, sessions/reviews, KPI daily, prompts.

## Tech Stacks vs Usage

| Use Case | Stack | Why |
|----------|-------|-----|
| Dashboard | Express + EJS + Alpine.js + Chart.js | No build step, CDN for frontend libs |
| Database | better-sqlite3 (WAL) | Synchronous API, embedded, no server |
| Auth | JWT httpOnly cookies | Stateless, secure, simple |
| CSS | Custom (Dark Glass) | Full control, no framework bloat |
| Gateway | Node.js + discord.js | Native Discord API support |
| Process mgmt | PM2 / fuser+nohup | Lightweight, auto-restart |
| Reverse proxy | Nginx + Let's Encrypt | SSL, routing, static caching |
| Backup | Git (GitHub) | Versioned, token-redacted |

### Why No Build Step

No webpack, no Vite, no bundler:
- Alpine.js loaded from CDN (8KB gzipped)
- Chart.js loaded from CDN
- Custom CSS written by hand
- EJS templates rendered server-side

**Trade-off:** No tree-shaking or minification, but zero build complexity. Deploys are `git pull && restart`.

## GitHub Strategy

### Repositories

| Repo | Purpose | Visibility |
|------|---------|-----------|
| <your-org-account>/org-dashboard | Dashboard code | Private |
| <your-github-user>/system-backup | System backup (SOUL files, scripts, configs) | Private |
| <your-github-user>/archive-repo | Archived/deleted files | Private |
| <your-github-user>/docs-repo | This documentation | Private |

### Branch Strategy

```
main              — production, always deployable
batch-N-description — feature branches per batch
```

Merge to main only after all tests pass. Push immediately.

### Git Rules

- Never commit under <your-github-user> for app code → use <your-org-account>
- Never commit .env, SOUL.md to public repos, API keys
- Always run scan_push.sh before push
- Token redaction in backup scripts


## Claude Code Configuration

### Rules Directory (.claude/rules/)
CLAUDE.md is kept under 200 lines. Domain-specific rules are split into `.claude/rules/` with glob-scoped files:

| File | Scope | Content |
|------|-------|---------|
| `code-style.md` | `**/*.js` | ESLint, naming, error handling, no hardcoded values |
| `testing.md` | `**/*.js` | TDD Red-Green-Refactor, coverage targets, retry prompting |
| `security.md` | `**/*` | PII protection, secrets management, concurrency control |
| `dashboard.md` | `*/dashboard-v2/**` | Express+EJS+Alpine.js rules, AURA tokens, feature checklist |
| `agents.md` | `*/agents/**` | Spending rules, session discipline, self-improvement |

Rules load automatically based on file path being edited. YAML frontmatter `paths:` glob determines scope.

### PostToolUse Hooks
Configured in `.claude/settings.json`:
- After any `Edit` or `Write` tool use → reminder to run tests
- Deterministic (100% enforcement) vs CLAUDE.md advisory (~80% adherence)
- Timeout: 120s to accommodate full test suite

### Claude Code Commands
Custom commands in `.claude/commands/`:

| Command | Purpose |
|---------|---------|
| `/brainstorm` | Socratic questioning before coding — 5 questions to explore approach |
| `/tdd` | TDD Red-Green-Refactor workflow — write failing test first |
| `/riper` | Research-Innovate-Plan-Execute-Review methodology |
| `/aura-validate` | Run AURA visual validation against a dashboard page |

### TDD Protocol (Mandatory)
Every feature must follow Red-Green-Refactor:
1. Write a FAILING test — what does "done" look like?
2. Run the test — confirm it FAILS
3. Implement — minimal code to pass
4. Run the test — confirm it PASSES
5. Refactor if needed
6. Add to CI — new tests update GitHub Actions



## Stack Protocol (AB-Series)

When adopting a new technology stack:

1. **Evaluate**: Run `stack-evaluate.js` — 100-point scorecard across 10 criteria
2. **POC**: Build one page with `stack-poc.js` — measure token cost and visual fidelity
3. **Gate**: Pass 35 checks across 7 gates with `stack-gates.js`
4. **Validate**: Run category validation (`validate-category.sh`) for all 5 categories (UX, Feature, Bugfix, Infra, Perf)
5. **Deploy**: Only if Gate 5 (Security) passes — blocker enforced

### Category Validation System

Each task category has its own AURA-like validation spec:
- **aura-ux/**: Flow validation, WCAG AA accessibility, feedback states, timing budgets
- **aura-feature/**: Input/output contracts, side effects, edge cases
- **aura-bugfix/**: Regression test, root cause, side-effect check
- **aura-infra/**: Service health, resource bounds, failure modes
- **aura-perf/**: Bundle size, response time, token efficiency
