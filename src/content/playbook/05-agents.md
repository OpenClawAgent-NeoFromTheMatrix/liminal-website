---
title: "05 — Agent Setup & Handling"
part: 0
order: 05
description: "Part 0 — Part 2 - The Agents"
---


## Organization Setup

### Creating an Agent (Checklist)

Every new agent requires:

1. **Discord bot** — Create in Discord Developer Portal, get token, store in .env
2. **SOUL.md** — Identity document (who they are, max 50 lines)
3. **SKILLS.md** — Capabilities (what they can do, with costs)
4. **TOOLS.md** — Resources (channels, file paths, endpoints)
5. **AGENTS.md** — Boot sequence (ORG.md → SOUL → TOOLS → SKILLS)
6. **org-config.json entry** — Agent config with name, model, channel binding
7. **Workspace directory** — `~/.your-org/workspace-[agent]/`
8. **Thought log directory** — `~/.your-org/thoughts/[agent]/`
9. **Gateway binding** — Map agent to Discord channel in org-config.json

### SOUL.md Standard Structure

```xml
<role>
One sentence: who you are and primary function.
</role>

<context>
2-4 sentences: what you own, what you access, what you never do.
</context>

<instructions>
Numbered steps for core workflow. Specific file paths. No vague verbs.
</instructions>

<rules>
Non-negotiable constraints. Short. Direct.
</rules>

<examples>
<example>
<input>[trigger]</input>
<output>[expected behavior]</output>
</example>
</examples>

<output_format>
Exact format for recurring output. Max 20 lines per message.
</output_format>
```

**Target:** Under 200 lines. Move details to SKILLS.md if longer.

### File Structure Per Agent

```
~/.your-org/workspace-[agent]/
├── SOUL.md          — Identity (read-only except by CEO)
├── SKILLS.md        — Capabilities
├── TOOLS.md         — Resources and paths
├── AGENTS.md        — Boot sequence
└── proposals/       — Self-challenge proposals (date.md)
```

## Self-Handling

### Agent Self-Challenge Protocol

Every agent has the right to challenge the organization:

1. **Gather evidence** over minimum 3 cycles (days or blocks)
2. **Write concrete proposal:** problem (with data), solution, expected improvement, risks
3. **Consult Planner first:** feasibility, VM impact, schedule conflicts
4. **Submit to CEO** in daily 1:1
5. **CEO evaluates** impact on all agents
6. **CEO submits to the operator** in evening briefing
7. **The operator decides:** approve / reject / modify
8. **Accept decision** for minimum 2 weeks before re-proposing

Rules: Evidence-based only. No complaints without data. One proposal at a time.

### Developer Self-Assessment (Every 2h Block)

```
- Was I fully utilized this block? (1-10)
- How long did preparation actually take?
- How long did implementation plan take?
- Was Knowledge's info sufficient?
- Was the 2h cadence right for this task type?
```
Logged to: `~/.your-org/developer/self-assessment/[date].md`

### Agent Performance: XP & Rank System

**10-Level XP System:**

| Level | XP Required | Title |
|-------|-------------|-------|
| 1 | 0 | Intern |
| 2 | 100 | Junior |
| 3 | 300 | Associate |
| 4 | 600 | Specialist |
| 5 | 1000 | Senior |
| 6 | 1500 | Lead |
| 7 | 2200 | Principal |
| 8 | 3000 | Director |
| 9 | 4000 | VP |
| 10 | 5500 | Legend |

**Streak Multipliers:** 0-2 days: 1.0x → 3-6 days: 1.2x → 7-13 days: 1.5x → 14+ days: 2.0x

**Rank System (S/A/B/C/D):** Weighted average of reliability (25%), speed (20%), quality (30%), cost efficiency (10%), uptime (15%).

**Grounding:** No XP penalties, but grounding freezes XP accumulation until lifted.

## Self-Improvement

### Error-Driven Learning

`self_improve.sh` runs nightly:
1. Reads error registry for open errors
2. Picks top 3 by severity
3. Attempts automated fix
4. Logs result with what worked/didn't

### Knowledge Refactoring

`knowledge_refactor.sh` runs nightly at 23:00:
- Reviews knowledge base for stale entries
- Tags outdated information
- Suggests consolidations

### Conversation Analysis

`analyze_conversations.sh` runs daily at 03:30:
- Analyzes Discord conversation patterns
- Identifies routing inefficiencies
- Feeds into Orchestrator's routing map improvements

## Skills vs Tools

### Skills (SKILLS.md)

What an agent CAN do — capabilities with costs:

```
## Skill: Summarize Link
Model: Haiku | Cost: ~€0.001 | Approval: self
Input: URL | Output: TAF summary
```

### Tools (TOOLS.md)

What resources an agent HAS ACCESS to:

```
## Discord Channels
#knowledge (1483186671787970791) — primary channel
#dev-knowledge — meeting channel with Developer

## File Paths
~/.your-org/memory-db/ — knowledge base
~/.your-org/knowledge/so_cache/ — StackOverflow cache
```

**Why separate?** A skill can be added/removed without changing what the agent can access. A tool can be shared across agents without changing what they can do.


## Test Agent (19th Agent) — QA Sentinel

The Test Agent is the 19th agent, dedicated to quality assurance. It runs nightly and on demand.

### Capabilities
- Full test suite execution (281+ tests) with pass/fail reporting
- Test coverage audit: identifies untested API endpoints and page features
- AURA visual validation via Playwright (screenshots + checklist)
- Visual regression detection against golden reference screenshots
- Console error monitoring across all dashboard pages
- GitHub issue creation for discovered problems

### Schedule
- **Nightly at 01:00 UTC** — full test suite + coverage audit + visual regression
- **On demand** — triggered by Developer Agent after code changes

### Rules
- Never modifies production code — report only
- Includes reproduction steps in issue reports
- Escalates critical failures (auth bypass, data exposure) to CEO immediately
- Logs results to dashboard via `/api/test-coverage`

## Self-Improving Agent Pattern

All 19 agents participate in the self-improving loop:

1. **Error logging** — PostToolUse hooks capture errors to `.learnings/errors.jsonl`
2. **Success logging** — Successful patterns logged to `.learnings/successes.jsonl`
3. **Weekly review** — Memory Agent runs `promotion_check.sh`, identifies patterns with 3+ occurrences
4. **Promotion** — Memory Agent proposes new `.claude/rules/` entries. CEO approves before activation.
5. **Evolution** — Rules improve over time based on real error data, not assumptions.

Each entry includes: date, agent, error_type, context, file path. Promotion requires threshold of 3 identical patterns.
