---
title: "11 — CI/CD, Testing & Validation"
part: 0
order: 11
description: "Part 0 — Part 3 - Building"
---


## Validation Registry

12 reusable test modules, each focused on one concern:

| Module | Purpose | Key Parameters |
|--------|---------|---------------|
| VAL-001 | HTTP status code verification | url, method, expected status, cookies |
| VAL-002 | JSON schema validation | url, schema (field→type), custom check fn |
| VAL-003 | Auth required (expects 401) | url (no cookies) |
| VAL-004 | Expired JWT handling | url, expired token |
| VAL-005 | SQL injection defense | url, payloads tested against parameterized queries |
| VAL-006 | XSS escaping | url, script payloads |
| VAL-007 | Path traversal blocking | url, traversal patterns |
| VAL-008 | Response time limits | url, maxMs threshold |
| VAL-009 | No secrets in response | url, patterns for API keys/tokens |
| VAL-010 | DB insert + readback integrity | url, insert data, verify retrieval |
| VAL-011 | CSS file size limit | url, maxBytes |
| VAL-012 | HTML content contains string | url, expected substring |

### Usage Pattern

```javascript
const VAL001 = require('../validations/VAL-001-http-status');
const AUTH = { dash_token: TOKEN };

// Each call returns { id, name, run() } object
VAL001({ url: `${BASE}/api/agents/cards`, cookies: AUTH, expected: 200 })
```

### Test Compositions

One file per batch, exports a flat array:

```javascript
// 050-batch-4-agents.js
module.exports = [
  VAL001({ url: `${BASE}/agents`, cookies: AUTH }),
  VAL002({ url: `${BASE}/api/agents/cards`, cookies: AUTH, schema: { cards: 'array' } }),
  VAL008({ url: `${BASE}/api/agents/cards`, cookies: AUTH, maxMs: 500 }),
  VAL012({ url: `${BASE}/agents`, cookies: AUTH, expected: 'agentCards' }),
];
```

### Test Runner

```bash
node tests/runner.js                          # Run all
node tests/runner.js tests/compositions/070*  # Run specific batch
node tests/runner.js --json                   # JSON output for CI
```

Features: colorized output, auto-discovers compositions, writes JSON results, pass/fail gate.

**Gate rule:** If ANY test fails → `GATE BLOCKED — DO NOT SHIP`. Exit code 1.

## Test Statistics

| Batch | Tests | Cumulative |
|-------|-------|-----------|
| 0 - Framework | 49 | 49 |
| 1 - Design | 28 | 77 |
| 2 - Data Layer | 45 | 122 |
| 3 - Homepage | 28 | 150 |
| 4 - Agent Cards | 29 | 179 |
| 5 - Analytics | 27 | 206 |
| 7 - Infrastructure | 25 | 231 |

## Lessons Learned

1. **Compositions must export flat arrays** — Runner expects `[{ run() }]`, not wrapped objects
2. **Generate JWT inside test files** — Don't rely on env var strings; use `jwt.sign()` directly
3. **VAL naming must match file names** — VAL-003 is auth-required, VAL-008 is response-time
4. **Auth cookies must be objects** — `{ dash_token: TOKEN }`, not string `"dash_token=xxx"`
5. **Always restart server after code changes** — Old process caches the DB connection


## Test Agent (Automated QA)

The 19th agent runs nightly at 01:00 UTC:
- Full test suite (281+ tests) with `node tests/runner.js`
- Coverage audit via `coverage-audit.sh` — identifies untested endpoints
- AURA visual validation via `validate.sh` — Playwright screenshots + checklist
- Results posted to dashboard via `/api/test-coverage`
- Files GitHub issues for failures with reproduction steps

### AURA Visual Validation
Complements unit tests by checking what users actually SEE:
- Screenshots pages at desktop (1920x1080) and mobile (375x812)
- Checks: hardcoded colors, min font size, horizontal scroll, overlap, console errors
- Compares against golden reference screenshots for regression detection
- Exit code 0 = pass, 1 = violations

### TDD Enforcement
PostToolUse hooks in `.claude/settings.json` trigger after every file edit:
- Reminder to run tests after code changes
- TDD commands available: `/tdd` for Red-Green-Refactor workflow
- Test count must grow with features — static count is a red flag

### Updated Test Statistics

| Batch | Tests | Cumulative |
|-------|-------|-----------| 
| 0 - Framework | 49 | 49 |
| 1 - Design | 28 | 77 |
| 2 - Data Layer | 45 | 122 |
| 3 - Homepage | 28 | 150 |
| 4 - Agent Cards | 29 | 179 |
| 5 - Analytics | 27 | 206 |
| 7 - Infrastructure | 25 | 231 |
| 8 - PII Scanner | 2 | 233 |
| 9 - Routing/BASE_PATH | 26 | 259 |
| 10 - W-Series Features | 14 | 273 |
| 11 - Command Center Layout | 4 | 277 |
| 12 - Attention Actions | 4 | 281 |



## Test Suite Expansion (Y-Series)

The test suite has grown significantly:

| Composition | Tests | Cumulative |
|---|---|---|
| 1-8 (Original) | 281 | 281 |
| 13 - Agent Behavior | 15 | 296 |

### Agent Behavior Tests (110-agent-behavior.js)
- Routing: bindings exist, SOUL.md present, match criteria valid
- Spending: €0.01 agent limit, €0.10 CEO limit enforced in socket server
- Security: Injection patterns, PII patterns, rate limiting (100 msg/s)
- E2E: claude_runner.sh executable, inserts into task_metrics
- AURA: manifest.json, color tokens, validate.sh all present

### Burn Analysis (Automated)
- Nightly `burn-analysis.js` identifies high-burn tasks (score > 2.0x)
- Auto-generates reports: necessity, root cause, lesson learnt, recommended actions
- Dashboard: approve/reject actions inline, full audit trail
- Manual analysis via chat integration

### Visual Testing
- Playwright-based bounding box validation
- AURA design token compliance checking
- Golden reference screenshots for regression detection

### Sources
- [Anthropic Documentation](https://docs.anthropic.com) — Claude Code testing patterns
- [ClaudeLog Testing Guide](https://claudelog.com/mechanics/hooks/) — Hook-based auto-testing
