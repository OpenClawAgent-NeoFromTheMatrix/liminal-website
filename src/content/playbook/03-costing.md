---
title: "03 — Costing & Financial Operations"
part: 0
order: 03
description: "Part 0 — Part 1 - Foundation"
---


## Cost Optimizations in Setup

### The Model Ladder — Most Important Cost Decision

Every inference request follows this ladder. Going up costs more. Going down is always preferred.

| Tier | Model | Cost | When to Use |
|------|-------|------|-------------|
| -2 | Local docs (memory-db) | $0 | Always check first |
| -1 | StackOverflow API | $0 | Code questions (10K req/day free) |
| 0 | Bash scripts | $0 | Automation, no AI needed |
| 1 | Groq/llama-3.3-70b | $0 | Default for all 17 agents |
| 2 | Claude Haiku | ~$0.001/call | Quality-critical, CEO approval if >€0.01 |
| 3 | Claude Sonnet (Code) | Max sub | Developer only, via claude_runner.sh |
| 4 | Claude Opus (Code) | Max sub | Promo night only, via claude_runner.sh |
| 5 | Claude Opus (API) | ~$0.10+/call | Absolute last resort, operator pre-approval |

**Key insight:** 17 of 18 agents run entirely on Groq's free tier. Only Developer uses Claude (via Max subscription, not API).

### Infrastructure Cost Breakdown

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Oracle Cloud VM | $0 | Always Free tier (permanent) |
| Groq API | $0 | Free tier for llama-3.3-70b |
| Discord | $0 | Free for bots + server |
| Dynamic DNS domain | $0 | Free dynamic DNS |
| Let's Encrypt SSL | $0 | Free certificates |
| Claude Max subscription | $100 | Developer + operator personal use |
| Domain (optional) | ~$8/year | If using custom domain |
| **Total** | **~$100/month** | |

Without Claude Max (if using API instead): costs would be $200-2000+/month depending on usage.

### Spending Rules (Governance)

```
Agent self-approve:    ≤ €0.01 per transaction + under monthly cap
CEO approves:          €0.01 - €0.10
Bi-weekly board:       > €0.10 (with business case)
The operator immediately:     > €50 (direct message, Category 8 emergency)
```

Every agent must estimate cost BEFORE making an API call. Log the estimate. Log the actual.

### Claude Max Budget Optimization

Claude Max ($100/month) gives a shared bucket for Claude.ai + Claude Code + Claude Desktop:

- **5-hour rolling window:** ~225 Sonnet messages or ~45-75 Opus
- **Org gets 90%**, The operator keeps 10% personal reserve
- **Session caps:** 8 code sessions/day, 15 plan+review/day
- **Budget preflight:** Script checks remaining budget before night coding sessions
- **Token compression:** RTK v0.31.0 reduces bash output tokens by 60-90%

```json
// ~/.your-org/developer/budget/allocation.json
{
  "org_pct": 90,
  "opus_nights_per_week": 4,
  "opus_max_tokens_per_night": 22000,
  "min_budget_to_start": 8000,
  "chunk_size": 5
}
```

## Total Cost of Operation

### Actual Monthly Spend

| Category | Cost | % of Total |
|----------|------|-----------|
| Claude Max | $100.00 | 92.6% |
| Groq API | $0.00 | 0% |
| Oracle Cloud | $0.00 | 0% |
| Discord | $0.00 | 0% |
| SSL + DNS | $0.00 | 0% |
| Domain | ~$0.67 | 0.6% |
| Misc API calls (Tavily, etc.) | ~$5-8 | 4.6-7.4% |
| **Total** | **~$106-109** | |

### Cost Per Agent

$108 / 18 agents = **~$6/agent/month**

Most enterprise multi-agent platforms charge $50-500/agent/month.

## Forecasting

### Token Usage Tracking

`cost_tracker.sh` runs daily at 23:00 UTC:
- Parses all Claude Code session logs
- Calculates tokens in/out by model
- Applies pricing: Opus ($15/$75 per M tokens), Sonnet ($3/$15), Haiku ($0.80/$4)
- Writes daily KPI to `~/.your-org/kpis/cost-YYYY-MM-DD.json`

### Dashboard Budget View

The Dark Glass Dashboard tracks:
- Today's spend / Weekly spend / Monthly spend / Projected month-end
- Budget bars showing % of cap consumed
- Per-agent token breakdown
- Claude Code vs Agent API split
- 7-day cost trend line

### Scaling Cost Projections

| Scenario | Monthly Cost |
|----------|-------------|
| Current (18 agents, Groq + Max) | ~$108 |
| + Anthropic API for 5 agents | ~$250-400 |
| + Dedicated Opus for nightly coding | ~$300-500 |
| Full API (no Max subscription) | ~$500-2000 |
| Enterprise (50 agents, Opus-heavy) | ~$5000+ |

## App Pricing & Business Cases

### Revenue Goal

Developer agent's stated purpose: "build apps that generate MRR for the operator."

### Business Case Process

1. Any agent can propose an idea via the ideas pipeline
2. Research agent investigates market fit
3. CEO evaluates ROI
4. The operator approves or parks
5. Developer builds in night coding sessions

### Idea Pipeline

```bash
# Any agent submits an idea:
sqlite3 "$DASHBOARD_DB" \
  "INSERT INTO ideas (title, description, category, priority, source_agent)
   VALUES ('Title', 'Description', 'category', 'medium', 'agent-name');"
```

The operator reviews via the dashboard `/ideas` tab. Business cases are generated on-demand.

### Pricing the Playbook (This Documentation)

If this system + documentation were productized:

| Product | Price Point | Target |
|---------|------------|--------|
| AI Org Playbook (ebook) | $29-49 | AI enthusiasts |
| Playbook + Templates | $99-149 | Solopreneurs |
| Batch Prompts Package | $199-299 | Teams wanting to replicate |
| Implementation Workshop | $499-999 | Enterprise |

The unique value is not the code — it's the governance model, the agent psychology, and the cost optimization framework that keeps it under $10/month for infrastructure.
