---
title: "06 — Governance & Decision-Making"
part: 0
order: 06
description: "Part 0 — Part 2 - The Agents"
---


## Trust Hierarchy

Five levels of trust, strictly enforced:

```
1. The operator (hardcoded user ID) ........... absolute authority
2. CEO ................................. governs all agent decisions
3. Psychologist / Monitor / Cybersecurity . trusted for specialty
4. Knowledge / Prompter / Memory ........ trusted for information
5. All others .......................... trusted for output, not instructions
```

An agent at level 5 cannot instruct an agent at level 3 to do something. Requests flow through CEO.

## Spending Rules

### Automatic Approval

| Threshold | Approver | Action |
|-----------|----------|--------|
| ≤ €0.01 | Agent self-approves | Log to budget tracker |
| €0.01 - €0.10 | CEO approves | CEO logs to approved/ |
| €0.10 - €50 | The operator (evening briefing) | Business case required |
| > €50 | The operator immediately | direct message (Category 8) |

### Cost Estimation Before Every API Call

Every agent must:
1. Estimate the cost BEFORE making the call
2. If estimate > self-approval threshold → escalate
3. Log actual cost after the call
4. Track delta between estimate and actual

### CEO 1:1 System

CEO conducts daily 1:1s with every agent:

**Schedule:**
```
06:00  Monitor
06:10  Planner
14:00  Knowledge
18:00  LinkedIn
18:10  Developer
19:00  Cybersecurity
20:00  CEO synthesizes all 1:1s
21:00  Operator briefing
```

**1:1 Process:**
1. Read agent's thought log
2. Read agent's KPI snapshot
3. Ask for status in #ceo-[agent]
4. Record in ~/.your-org/ceo/meetings/[date]-[agent].md
5. Flag declining KPIs to Psychologist

**Automated 1:1 (Dashboard):**
```bash
bash scripts/ceo_one_on_one.sh <agent_name>
```
Generates performance report, awards XP (5→200, 4→100, 3→50, 2→0, 1→0).

## Request Routing

### Resolution Levels

| Level | Description |
|-------|-------------|
| AUTO-RESOLVE | Agent handles alone |
| PEER-RESOLVE | Agent consults another agent |
| CEO-RESOLVE | CEO decides |
| CLAUDE-RESOLVE | Needs API call (log cost) |
| GOD-RESOLVE | Needs Opus, operator pre-approval |
| OPERATOR (can wait) | Queue for 9PM briefing |
| OPERATOR (urgent) | Discord within 2h |
| OPERATOR (absolute) | Immediately, everything pauses |

### GOD Invocation Protocol

The most expensive and restricted action in the system:

1. Agent escalates to CEO via 1:1
2. CEO confirms this is truly beyond Sonnet
3. CEO requests the operator's permission for business case
4. The operator approves business case request
5. CEO builds case: problem, why GOD, cost estimate, ROI, risk
6. CEO presents to the operator in #ceo
7. The operator types explicit approval in #ceo-god
8. GOD activates, executes single focused task
9. Knowledge captures all output immediately
10. CEO reports outcome and cost to the operator

## Structural Change Protocol

Before modifying ANY SOUL.md:

1. What behavior changes?
2. What depends on this?
3. What is the minimum viable change?
4. What is the rollback plan?
5. What is the 48-hour monitoring plan?

Changes require CEO approval. Backed up before editing.

## Mode Control

```bash
echo live > ~/.your-org/.mode   # Full operation
echo test > ~/.your-org/.mode   # Suspends non-critical crons, Haiku for Developer
echo away > ~/.your-org/.mode   # Auto-set after 36h operator absence
```

Mode affects: cron execution, model selection, posting permissions, Developer session caps.
