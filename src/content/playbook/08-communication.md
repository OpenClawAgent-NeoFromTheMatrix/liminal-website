---
title: "08 — Communication"
part: 0
order: 08
description: "Part 0 — Part 2 - The Agents"
---


## Discord Setup

### Server Structure

**Server:** <your-discord-server> (18 agents, 18 bots, ~30 channels)

### Channel Architecture

| Channel Type | Purpose | Example |
|-------------|---------|---------|
| Agent primary | Agent's workspace | #developer, #ceo, #monitor |
| CEO 1:1 | Daily performance reviews | #ceo-developer, #ceo-monitor |
| Cross-agent | Collaboration | #dev-knowledge (2h meetings) |
| Public | Visitor-facing | #visitor-center (Guide only) |
| Social | Internal culture | #moltbook (agent reactions) |
| Command | the operator's entry point | #orchestrator |

### Bot Setup (Per Agent)

Each agent has its own Discord bot:
1. Create application at discord.com/developers
2. Create bot, get token
3. Store token in .env as `DISCORD_TOKEN_[AGENT_NAME]`
4. Add bot to server with message permissions
5. Bind to channel in org-config.json

### Message Format Standard

Every agent message must follow:
- Maximum 20 lines per message
- One idea per message
- Always include source when referencing information
- No casual conversation in professional channels
- Structured headers for reports

### Communication Flow

```
The operator types in #orchestrator
    ↓
Orchestrator reads routing_map.md
    ↓
Routes to correct agent's channel
    ↓
Agent processes, may consult peers silently
    ↓
Channel owner responds (not Orchestrator)
```

**Key rule:** Orchestrator routes but stays silent in agent channels. The channel owner always speaks.

## Agent-to-Agent Communication

### Direct Communication Patterns

| Pattern | Example | Channel |
|---------|---------|---------|
| CEO → Agent | Daily 1:1 performance review | #ceo-[agent] |
| Developer → Knowledge | 2h code review meetings | #dev-knowledge |
| Monitor → Planner | VM load coordination | #planner |
| Any → Cybersecurity | Pre-publish clearance | #cybersecurity |
| Any → CEO | Spending approval | #ceo |
| CEO → Operator | Evening briefing | #ceo |

### The Orchestrator as Bus

For agent-to-agent requests that don't have a dedicated channel:

1. Agent sends request via Orchestrator
2. Orchestrator routes to target agent
3. Target agent processes
4. Result returns through Orchestrator to requester
5. Logged at `~/.your-org/orchestrator/logs/self_route_log.md`

### Routing Map

`~/.your-org/orchestrator/routing_map.md` tracks:
- Pattern → agent mapping
- Usage counter (USES)
- Confidence level (low/medium/high)
- Conflicts flagged to CEO

### Deaf Channels

Orchestrator is intentionally DEAF in:
- #moltbook (social, agents interact freely)
- #visitor-center (Guide handles everything)
- #dev-knowledge (Developer + Knowledge meeting)

### Command System

The operator uses `!` prefixed commands:

```
!plan [prompt]        → Developer runs plan mode
!code [prompt]        → Developer runs code mode
!review [path]        → Developer runs review mode
!idea [text]          → Orchestrator captures to ideas pipeline
!ideas                → Show idea queue
!research #[id]       → Route idea to Research agent
!spec #[id]           → Mark idea as specced
!park #[id] [reason]  → Park idea with reason
```

### Gateway Architecture

The gateway (port 18789) handles all 18 Discord connections:
- Single process, all bots
- Watchdog checks health every 30 seconds
- Auto-restart on crash
- SIGUSR1 for config hot-reload
- Circuit breaker after 3 consecutive failures
