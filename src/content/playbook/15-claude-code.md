---
title: "15 — Claude Code: Embedding AI in the VM"
part: 0
order: 15
description: "Part 0 — Part 4 - AI Mastery"
---


## Architecture

Claude Code runs on the Oracle VM via Max subscription (not API key):

```
Claude Desktop (the operator's laptop)
    ↓ MCP protocol
MCP Bridge Server (port 3000)
    ↓ HTTP
claude_runner.sh
    ↓ spawns
Claude Code CLI (--model, --max-turns, --allowedTools)
    ↓ reads/writes
Project files on VM
```

### claude_runner.sh

The central entry point for all Claude Code invocations:

```bash
claude_runner.sh <mode> <prompt> [session_id] [agent_id] [workdir] [turns_override]
```

**Security:** `unset ANTHROPIC_API_KEY` — enforces Max subscription auth, never API billing.

### Modes

| Mode | Tools Available | Max Turns | Purpose |
|------|----------------|-----------|---------|
| plan | Read | 5 | Implementation planning |
| code | Read, Write, Edit, Bash | 20 | Building features |
| review | Read | 5 | Quality/security analysis |
| prompt | Read, Write | 10 | Prompt optimization (forces Opus) |

### Session Caps

- 8 code sessions/day, 15 plan+review/day
- Test mode: 20 code, 30 plan
- Checked before every invocation
- Daily counters reset at midnight UTC

### Promotion Window Block

During promotion periods (when Opus quota needs saving):
- 08:00-22:00 UTC: NO org Claude Code (save for Opus at night)
- 22:00-02:00 UTC: Opus coding via night task system

## MCP Bridge (Model Context Protocol)

### Server (port 3000)

Exposes tools for Claude Desktop:
- `POST /bash` — Execute bash commands on VM
- `POST /claude-code` — Async job pattern for Claude Code invocations
- `GET /claude-code/:jobId` — Poll for results
- `GET /health` — Health check

Auth: Bearer token (MCP_TOKEN in .env).

### Webhook (port 3001)

HTTP API for Claude.ai → Discord message delivery:
- `POST /send` — Send message to channel
- `POST /orchestrate` — Send via orchestrator account
- `POST /idea` — Capture idea to pipeline

## Night Task System

For Opus coding sessions (most expensive, most capable):

```
~/.your-org/developer/tasks/
├── pending/          — New tasks waiting
├── pending-resume/   — Unfinished tasks from previous night
├── done/             — Completed tasks
├── failed/           — Failed after 3 attempts
├── paused/           — On hold
└── cancelled/        — No longer needed
```

Task format (markdown):
```markdown
# Task: [title]
## Objective: [what to build]
## Context: [background]
## Constraints: [limits]
## Acceptance Criteria: [testable]
## Out of Scope: [what NOT to do]
```

Opus runs in 5-turn chunks with budget check between chunks. Resume support: unfinished tasks keep session_id.

Self-review on Sonnet after Opus commits. Rollback if Critical found.

## API Caching

### Prompt Caching

- Identical/similar prompts benefit from partial caching
- Starting sessions with same system prompt (CLAUDE.md) enables cache hits
- CLAUDE.md is kept under 3000 tokens for efficient caching

### StackOverflow-First Policy

Before using Claude Code tokens for a code question:
1. Check local docs (free, instant)
2. Check StackOverflow API (free, 10K requests/day)
3. If clear answer found → use it, cite in code comments
4. Log: "Used SO instead of LLM for [topic]"

### MCPs (Model Context Protocol)

MCP enables Claude Desktop to interact with the VM:
- **bash tool** — Run commands remotely
- **claude_code tool** — Trigger Claude Code sessions
- **orchestrate tool** — Send Discord messages

Configuration lives in Claude Desktop settings, pointing to `localhost:3000/mcp`.

---


## MCP Servers (Extended)

Beyond the base 3 tools, additional MCPs are configured:

| MCP | Purpose | Agent(s) |
|-----|---------|----------|
| **Context7** | Live library documentation for Express, Alpine.js, better-sqlite3 | Developer |
| **Reddit** | Browse subreddits for content research and trend discovery | Research, LinkedIn |
| **async_bash** | Long-running commands (>30s) without timeout — returns handleId, poll for results | Developer, DevOps |
| **job_status** | Poll async job progress | Developer, DevOps |
| **job_cancel** | Cancel running async jobs | Developer, DevOps |

### Configuration
MCPs are configured in `.claude/settings.json` under `mcpServers`. Limit to 2-3 per agent to avoid context bloat.

### Rules Directory
`.claude/rules/` contains glob-scoped rule files that load automatically based on the file being edited. 5 files: code-style, testing, security, dashboard, agents. CLAUDE.md is kept under 200 lines.

### PostToolUse Hooks
After every `Edit` or `Write` tool use, hooks automatically remind to run tests. This is deterministic (100% enforcement) unlike CLAUDE.md instructions (~80% adherence).

### Session Discipline
- Start fresh sessions per task — long conversations degrade quality
- Full context in first message (task file + code paths + criteria)
- Use `/compact` at 80% context usage
- Agents should run short, focused sessions (new session per task)

### Sources
- [Anthropic Claude Code](https://docs.anthropic.com) — Session management, MCP bridge
- [RTK v0.31.0](https://github.com/nicobailey/rtk) — Token compression (60-90% savings)
