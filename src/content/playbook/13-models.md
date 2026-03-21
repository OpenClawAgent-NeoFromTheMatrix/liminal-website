---
title: "13 — Model Selection, Swaps & Token Optimization"
part: 0
order: 13
description: "Part 0 — Part 4 - AI Mastery"
---


## The Model Ladder

Every inference request follows this hierarchy. Always start at the bottom:

| Tier | Model | Cost/Call | Use When |
|------|-------|-----------|----------|
| -2 | Local docs | $0 | Answer exists in knowledge base |
| -1 | StackOverflow | $0 | Code question with accepted answer |
| 0 | Bash script | $0 | Pure automation, no AI needed |
| 1 | Groq llama-3.3-70b | $0 | Default for 17 agents (routing, monitoring, analysis) |
| 2 | Haiku | ~$0.001 | Quality-critical, CEO approval if >€0.01 |
| 3 | Sonnet (Claude Code) | Max sub | Developer coding, via claude_runner.sh |
| 4 | Opus (Claude Code) | Max sub | Promo night only, budget-checked |
| 5 | Opus (API) | ~$0.10+ | Absolute last resort, operator pre-approval |

## Model Suggestion Engine

Rules-based keyword matching (no AI needed for this):

```javascript
// scripts/suggest_model.js
const RULES = [
  { keywords: ['monitor','health','status','check'], model: 'haiku', reason: 'Simple monitoring' },
  { keywords: ['route','forward','send','deliver'], model: 'haiku', reason: 'Simple routing' },
  { keywords: ['write','code','build','implement'], model: 'sonnet', reason: 'Coding task' },
  { keywords: ['analyze','research','deep'], model: 'sonnet', reason: 'Analysis needed' },
  { keywords: ['security','audit','review'], model: 'opus', reason: 'Complex reasoning' },
];

// Token-based override
if (estimatedTokens > 50000) return 'opus';    // Large context = Opus
if (estimatedTokens < 5000) return 'haiku';    // Small task = Haiku
```

## Token Reduction Strategies

### RTK Token Compression

RTK v0.31.0 installed globally. All Claude Code bash calls are compressed via PreToolUse hook:
- **60-90% reduction** in bash output tokens
- Prefer shell commands (cat, rg, find) over built-in tools (Read, Grep, Glob)
- Built-in tools bypass RTK hook

```bash
rtk gain    # Check cumulative savings
rtk read    # Smart file reading
rtk test    # Show failures only
rtk err     # Errors only
```

### Session Efficiency Rules

1. **Fresh sessions per task** — Long conversations cost exponentially more per message
2. **Full context upfront** — Task file + code paths + criteria in first message
3. **Batch requests** — 1 message with 3 questions, not 3 messages
4. **Minimize tool calls** — Tools are token-intensive
5. **Scope files explicitly** — "Read server.js lines 40-60" not "read the codebase"
6. **Mode-appropriate tools** — Plan/review: Read only. Code: Read+Write+Edit+Bash

### Prompt Compression (Prompter Agent)

Target: 30% token reduction per prompt while maintaining 8/10 quality floor.

Before/after tracking:
```
BEFORE: 2400 tokens
AFTER:  1680 tokens
REDUCTION: 30%
QUALITY: 9/10
CHANGES: Removed hedging language, consolidated examples, used XML tags
```

## Token Caps and Limits

### Claude Max Shared Bucket

```
Claude.ai chat + Claude Code + Claude Desktop = ONE pool

5-hour rolling window: ~225 Sonnet msgs or ~45-75 Opus
Separate weekly limits: Opus vs other models
Org allocation: 90% | Operator personal: 10%
```

### Session Caps (claude_runner.sh)

| Mode | Max Turns | Daily Cap |
|------|-----------|-----------|
| code | 20 | 8 sessions |
| plan | 5 | 15 sessions |
| review | 5 | 15 sessions |
| prompt | 10 | Included in plan cap |

Test mode doubles caps (20 code, 30 plan).

### Budget Preflight

Before every Opus night session:
```bash
bash budget_preflight.sh
# Checks: remaining budget estimate, tokens available, rate limit history
# Returns: GO (enough budget) or STOP (save for tomorrow)
```

### When Limits Are Hit

Claude degrades gradually:
1. Shorter responses
2. Model downgrade (Opus → Sonnet)
3. Block (wait for 5-hour window to roll)

Our system detects this via `is_rate_limited` in session output. Night sessions save progress and resume tomorrow.

---


## Test Agent Model Allocation

The Test Agent (19th agent) runs on Groq (llama-3.3-70b), same as other operational agents. It does not need Claude Code access — it runs shell scripts (`coverage-audit.sh`, `validate.sh`) and reports results via API.

Model ladder unchanged: Test Agent sits at Tier 1 (Groq, free).

### Sources
- [Anthropic Usage Documentation](https://docs.anthropic.com) — Claude model tiers, pricing, capabilities
- [Groq Documentation](https://groq.com) — Free inference API, llama-3.3-70b-versatile
- [RTK Repository](https://github.com/nicobailey/rtk) — Token compression for Claude Code sessions
