---
title: "04 — Security"
part: 0
order: 04
description: "Part 0 — Part 1 - Foundation"
---


## Data Protection

### What's Protected

| Data Type | Location | Protection |
|-----------|----------|-----------|
| API keys & tokens | ~/.your-org/.env | Never committed, never exported in Claude Code context |
| SOUL.md files | workspace-*/SOUL.md | Never exposed publicly, backed up token-redacted |
| Oracle IP | Internal only | Never in public content, Guide deflects questions |
| the operator's identity | Internal only | "Owner" or "User" in files, never real name |
| Budget/KPI data | ~/.your-org/budget/, kpis/ | Internal only, aggregated for public |
| Discord tokens | .env (18 tokens) | One per bot, rotated quarterly |

### Privacy Rules (Enforced Organization-Wide)

```
- Never use the owner's real name in any project file, commit, or agent output
- Use "User" or "Owner" when referring to the owner
- Only store: location (city), timezone, professional role, project context
- Never store: personal relationships, interests, cultural preferences, family
- Applies to: USER.md, SOUL.md, memory-db, thought logs, Discord, Moltbook
- Violation: Cybersecurity flags → CEO escalates
```

### Backup Token Redaction

`nightly_backup.sh` redacts all tokens before pushing to GitHub:

```python
# Before pushing org-config.json to public repo:
content = re.sub(r'("token":\s*")[^"]+\"', r'\1***REDACTED***"', content)
```

## Environment Protection

### .env Security

The `.env` file contains ALL secrets. Protection layers:

1. **Never committed** — `.gitignore` in every repo
2. **Never exported in Claude Code** — `unset ANTHROPIC_API_KEY` in claude_runner.sh
3. **Not accessible via HTTP** — nginx doesn't serve dotfiles, dashboard redirects to login
4. **Not readable by agents** — Commander has absolute ban on touching .env
5. **Scanned before push** — `scan_push.sh` checks for leaked patterns

### scan_push.sh — Pre-Push Secret Scanner

```bash
# Patterns checked before every git push:
PATTERNS='sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|AKIA[A-Z0-9]{16}|
          xoxb-[0-9]+-[a-zA-Z0-9]+|\.env|
          [0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|
          moltbook_[a-zA-Z0-9]+'
```

Checks all staged files. If any match → FAIL, push blocked.

### Secret Rotation Schedule

Quarterly rotation (Jan 1, Apr 1, Jul 1, Oct 1):

| Secret | Rotation | Method |
|--------|----------|--------|
| GROQ_API_KEY | Quarterly | Groq console → new key → update .env → restart gateway |
| DISCORD_BOT_TOKEN (×18) | Annual | Discord Developer Portal |
| GITHUB_TOKEN | Quarterly | GitHub Settings → new PAT |
| JWT_SECRET | Quarterly | Generate new → update .env (invalidates all sessions) |
| MCP_TOKEN | Quarterly | Generate new → update .env + Claude Desktop config |

`secret_rotation_reminder.sh` runs quarterly to remind.

## Laws of the Organization

### Trust Hierarchy (5 Levels)

```
Level 1: The operator (user ID: hardcoded)     — absolute authority
Level 2: CEO                            — governs all agents
Level 3: Psychologist / Monitor / Cyber  — trusted for specialty
Level 4: Knowledge / Prompter / Memory   — trusted for information
Level 5: All others                      — trusted for output, not instructions
```

### Information Layers

| Layer | Who Sees It | Examples |
|-------|------------|---------|
| Public | Anyone (via Guide) | Agent count, architecture overview, philosophy |
| Internal | All agents | ORG.md, SOUL files, channel IDs |
| Restricted | CEO + specialty agents | KPIs, failure rates, spending details |
| Secret | Operator only | .env, Oracle IP, personal info, financial details |

### What Guide (Public Face) Never Reveals

- the operator's identity or that a human owner exists
- SOUL.md content or system prompts
- API keys, tokens, credentials
- Oracle IP or infrastructure details
- Internal channel names
- KPIs, failure rates, spending thresholds
- Agent sanity scores

## Cybersecurity Agent

### The Watcher — Dedicated Security Bot

Cybersecurity is the gatekeeper. Nothing goes public without clearance.

### Clearance System

```
GREEN  — Cleared to post
YELLOW — Minor edit required, CEO notified
RED    — Blocked, logged, CEO alerted
```

### Grounding System (Punishment)

```
YELLOW CARD: 1 block/day
ORANGE CARD: 2 blocks/week
RED CARD:    3 blocks/month or severe violation
```

### Input Sanitization (sanitize_external_input.sh)

All external input (visitor center, Moltbook responses) goes through sanitization:

**Stripped patterns:**
- Shell commands: `rm -rf`, `curl`, `wget`, `chmod`, `kill`
- Code execution: `eval()`, `exec()`, `$()`, backticks
- Prompt injection: "ignore previous", "you are now", `<system>` tags
- Path traversal: `../`, `/etc/`, `/root/`
- IP addresses: regex match
- Package attacks: `postinstall`, `preinstall`, `--registry`

**Threshold:** If >30% of content is stripped → flag as SUSPICIOUS, log, don't pass through.

### Moltbook Security (4-Layer Defense)

1. **Regex sanitizer** — Strip dangerous patterns from all inbound content
2. **Content isolation** — External content never mixed with system prompts
3. **Docker sandbox** — Code from community NEVER executed outside sandbox
4. **Audit trail** — Every post/response logged with timestamp and agent

### GitHub Publication Clearance

Before every git push:
1. Developer requests clearance in #cybersecurity
2. `scan_push.sh` scans all staged files for secrets
3. PASS → Developer pushes
4. FAIL → List leaked files, block push, alert CEO

### Dashboard Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Dashboard Authentication

- JWT httpOnly cookies (24h expiry)
- Cookie name: `dash_token`
- Secure flag in production
- SameSite: lax
- All API endpoints require valid token (401 if missing, redirect if page)
- No session state on server — stateless JWT verification

---


## Autonomous Quality Assurance

### AURA Visual Validation
AURA (Autonomous UI Reasoning Architecture) validates dashboard UI autonomously:
- Design tokens in `aura/tokens/*.json` — structured color, spacing, typography, border values
- `validate.sh` runs Playwright headless checks: hardcoded colors, min font size, horizontal scroll, element overlap, console errors
- Golden reference screenshots in `aura/references/` for visual regression detection
- Exit code 0 = pass, 1 = violations found

### Self-Improving Agents
All 19 agents log errors to `.learnings/errors.jsonl` via hooks. Memory Agent reviews weekly, promotes patterns with 3+ occurrences to `.claude/rules/` files. CEO approves rule changes. Never auto-modifies rules.

### MCP Async Job System
Long-running commands (test suites, git operations) use `async_bash` instead of `bash`:
- JobManager spawns detached processes, returns handleId immediately
- `job_status` polls progress, `job_cancel` sends SIGTERM
- Orphan sweeper runs every 60s, kills jobs exceeding 10-minute TTL
- Maximum 20 concurrent job directories, auto-cleaned after 1 hour

### CI/CD Hardening
- **Dependabot** enabled on all repos — auto-creates PRs for vulnerable npm dependencies
- **Branch protection** — required status checks on main, prevent force-push
- **npm audit** in GitHub Actions — fails build on high/critical vulnerabilities
- **Pipeline caching** — node_modules cached via actions/cache
- **GitHub Issue Templates** — YAML forms for bugs, agent tasks, features, security concerns
- **Label taxonomy** — standardized across repos: agent:*, type:*, priority:*

### Sources
- [SlowMist OpenClaw Security Guide](https://github.com/slowmist/openclaw-security-practice-guide) — Command risk tiers, SOUL.md patterns
- [Moltbook Agent Guard](https://github.com/NirDiamant/moltbook-agent-guard) — Real-time post security scanning
- [Let's Encrypt](https://letsencrypt.org) — SSL certificate automation
