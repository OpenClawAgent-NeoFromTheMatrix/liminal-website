---
title: "16 — Memory, Context & Knowledge Management"
part: 0
order: 16
description: "Part 0 — Part 4 - AI Mastery"
---


## The Memory Problem

AI agents lose all context between sessions. Every conversation starts from zero. This is the single biggest operational challenge.

## Our Solutions

### 1. CLAUDE.md as Persistent Memory

Every project has a CLAUDE.md that Claude reads on startup. It contains:
- Current state of the project
- What was done, what's next, known issues
- File paths, architecture decisions, constraints

**Rule:** Before ending ANY Claude Code session, update CLAUDE.md with current state. This IS the memory.

### 2. Thought Logs

Every agent writes to `~/.your-org/thoughts/[agent]/thoughts.md`:
```
[TIMESTAMP]
TASK: [what was requested]
REASONING: [how I approached it]
OUTCOME: [what happened]
COST: [tokens/cost if applicable]
```

CEO reads these during 1:1s. Psychologist reads these for sanity scoring.

### 3. Memory Agent (Leonard Shelby)

Dedicated agent who maintains institutional memory:
- Owns STATUS.md and CHANGELOG.md
- Extracts knowledge from thought logs into KB
- Syncs key files to GitHub
- Tags files for GC (KEEP / ARCHIVED / HISTORICAL / SAFE-TO-DELETE)

### 4. Knowledge Base (memory-db)

```
~/.your-org/memory-db/
├── docs/              — Local documentation (free, instant access)
├── knowledge-base/    — Extracted knowledge from articles, conversations
└── so_cache/          — Cached StackOverflow answers
```

Knowledge Agent maintains this with TAF framework:
- **T**akeaways: 3 key points
- **A**rguments: main thesis and evidence
- **F**laws: weaknesses or counterarguments

### 5. Batch Prompts as Context Recovery

For long builds (like the dashboard), each batch prompt is self-contained:
- Full project state summary
- All file paths and contents created so far
- Technical decisions made
- Errors encountered and fixes applied
- What the next batch needs to build on

This means if context is lost (conversation compaction), the next batch prompt can recover completely.

### 6. Session Logging

All Claude Code sessions logged to `~/.your-org/developer/sessions/`:
- Input/output token counts
- Model used
- Duration
- Cost estimate
- Session ID for resume capability

### 7. Error Registry as Learning Memory

`~/.your-org/errors/registry.json` is a permanent record of what went wrong and how to fix it. The `self_improve.sh` script reads this nightly and attempts automated fixes.

## Context Window Management

### The Problem
Claude's context window is large but not infinite. Long conversations get compressed ("compacted"), losing detail.

### Our Approach
- **Fresh sessions per task** — Never continue a 50-turn conversation
- **Batch architecture** — Each batch is a self-contained prompt
- **CLAUDE.md updates** — Persistent state across sessions
- **Scoped file reads** — "Read lines 40-60" not "read everything"
- **Structured outputs** — JSON/tables compress better than prose

### What Gets Lost (And How We Prevent It)

| Risk | Prevention |
|------|-----------|
| Code changes from previous session | CLAUDE.md records what was built |
| Error patterns | Error registry persists across sessions |
| Architecture decisions | CHANGELOG.md records every decision |
| Agent performance history | KPI snapshots in SQLite |
| Knowledge from research | Knowledge base with TAF summaries |

## GitHub as External Memory

Three repos serve as permanent external memory:
1. **system-backup** — Current state (nightly backup)
2. **archive-repo** — Historical state (archived files)
3. **Dashboard repo** — Application code with full git history

Version control IS memory. Every commit message is a memory entry.


## Self-Improving Memory (.learnings/)

A structured error-learning pipeline that builds organizational memory from failures:

### How It Works
1. All 19 agents log errors to `.learnings/errors.jsonl` via PostToolUse hooks
2. Each entry: `{date, agent, error_type, context, file}`
3. Weekly, Memory Agent runs `promotion_check.sh`
4. Patterns with 3+ identical occurrences are flagged for promotion
5. Memory Agent proposes new `.claude/rules/` entries
6. CEO approves before activation

### AURA Evolution
UI-specific learnings flow through `aura/history/decisions.jsonl`:
- Every human override of agent UI output is logged
- Token, old value, new value, reason recorded
- Weekly `evolution_check.sh` detects repeated overrides
- At threshold (3x same token, same direction) → propose token update
- Design system evolves from real feedback, not assumptions
