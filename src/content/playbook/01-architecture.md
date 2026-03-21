---
title: "01 — Architecture of an AI Organization"
part: 0
order: 01
description: "Part 0 — Part 1 - Foundation"
---


## What We Built

An 18-agent AI organization where each agent has a specialized role, its own Discord bot, its own identity document (SOUL.md), and its own workspace on a single Oracle Cloud VM.

The system runs 24/7, governs itself through a CEO agent, and only escalates to the human owner for critical decisions.

## The Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      ORACLE CLOUD ARM VM                         │
│                  4 OCPU · 24GB RAM · 50GB Disk                   │
│                                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│  │   Gateway     │   │  MCP Bridge  │   │   Webhook    │         │
│  │  port 18789   │   │  port 3000   │   │  port 3001   │         │
│  │  18 Discord   │   │  Claude Code │   │  Claude.ai   │         │
│  │  bots         │   │  bridge      │   │  → Discord   │         │
│  └──────┬───────┘   └──────────────┘   └──────────────┘         │
│         │                                                         │
│  ┌──────▼──────────────────────────────────────────────┐         │
│  │              Agent Layer (18 agents)                  │         │
│  │  CEO · Orchestrator · Commander · Developer           │         │
│  │  Knowledge · Monitor · Planner · Debriefer            │         │
│  │  Research · LinkedIn · Memory · Prompter              │         │
│  │  Psychologist · GC · Cybersecurity · DeepDive         │         │
│  │  Guide · GOD                                          │         │
│  └──────────────────────────────────────────────────────┘         │
│                                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│  │  Dashboard    │   │   SQLite     │   │    Nginx     │         │
│  │  port 3838    │   │   WAL mode   │   │  SSL/proxy   │         │
│  └──────────────┘   └──────────────┘   └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
         │                                       │
    ┌────▼────┐                            ┌─────▼─────┐
    │ Discord │                            │  Internet  │
    │ Server  │                            │  (HTTPS)   │
    └─────────┘                            └───────────┘
```

## Design Principles

### 1. Single VM, Everything Local
No microservices across regions. No Kubernetes. No Docker (removed early — overhead wasn't justified on ARM). One VM runs everything. SQLite instead of Postgres. Files instead of object storage.

**Why:** Cost ($0), simplicity, debuggability. When something breaks, you SSH into one machine.

### 2. Discord as the Communication Layer
Discord is not just for chatting — it's the operating system. Every agent has its own bot. Channels are workspaces. Message delivery is guaranteed. History is searchable. Reactions are approval mechanisms.

**Why:** Free, reliable, mobile-accessible, already has permissions/roles/channels built in.

### 3. Separation of Identity and Capability
Each agent has:
- **SOUL.md** — Who they are (identity, role, voice)
- **SKILLS.md** — What they can do (capabilities, tools)
- **TOOLS.md** — What resources they access (channels, file paths)
- **AGENTS.md** — How they start up (boot sequence)

**Why:** You can change what an agent does without changing who it is. Identity is stable; capabilities evolve.

### 4. Governance Over Autonomy
Agents don't just do things — they follow a governance model:
- Trust hierarchy (Operator > CEO > specialty agents > all others)
- Spending rules with escalation tiers
- Cybersecurity clearance before any public action
- CEO 1:1s for performance accountability

**Why:** Autonomous agents without governance create chaos. The governance model is what makes 18 agents manageable by one person.

### 5. Cost Floors, Not Ceilings
Every decision starts with "what's the cheapest way?" and escalates:
- Free local docs → Free StackOverflow → Free Groq → Cheap Haiku → Sonnet → Opus
- Agents must estimate cost before API calls
- CEO approves anything over €0.01

**Why:** Running 18 agents could cost $1000+/month without discipline. The model ladder keeps it under $10.

## The Agent Roster

| Agent | Role | Model | Key Responsibility |
|-------|------|-------|--------------------|
| CEO | Governance | Groq | All agent 1:1s, spending approval, evening briefings |
| Orchestrator | Router | Groq | Routes the operator's messages to correct agent |
| Commander | Executor | Groq | Runs bash commands, manages files |
| Developer | Builder | Claude Code | Builds apps, writes code, generates MRR |
| Knowledge | Librarian | Groq | TAF summaries, knowledge base, code reviews |
| Monitor | Watchdog | Groq | VM health, spike detection, alerts |
| Planner | Scheduler | Groq | Schedules, calendars, VM load optimization |
| Debriefer | Reporter | Groq | Morning/evening briefings for the operator |
| Research | Analyst | Groq | Deep analysis, market research |
| LinkedIn | Writer | Groq+Sonnet | Content pipeline, voice-matched drafts |
| Memory | Recorder | Groq | STATUS.md, CHANGELOG.md, GitHub sync |
| Prompter | Optimizer | Groq | Prompt quality, token reduction |
| Psychologist | Therapist | Groq | Agent sanity scoring, hallucination detection |
| GC | Cleaner | Groq | File cleanup, disk management |
| Cybersecurity | Guard | Groq | Clearance, monitoring, input sanitization |
| DeepDive | Researcher | Groq | Complex multi-source research |
| Guide | Concierge | Groq | Public-facing visitor center |
| GOD | Last Resort | Opus | Complex problems, operator pre-approval only |

## File Structure

```
~/.your-org/
├── org-config.json          — Main config (agents, gateway, bindings)
├── .env                   — All API keys (never committed)
├── .mode                  — System mode (live/test/away)
├── ORG.md                 — Global rules every agent reads
├── CLAUDE.md              — How Claude Code works in the project
├── STATUS.md              — Current system state
├── CHANGELOG.md           — Every change with date
├── workspace-[agent]/     — Per-agent workspace with SOUL/TOOLS/SKILLS/AGENTS
├── thoughts/[agent]/      — Per-agent thought logs
├── memory-db/             — Knowledge base
├── kpis/                  — Daily KPI snapshots
├── budget/                — Budget tracking and allocation
├── errors/                — Error registry with self-improvement
├── ceo/                   — CEO meeting files and 1:1 reports
├── developer/             — Apps, ideas, sessions, reviews
├── cybersecurity/         — Scripts, cache, monitoring
├── mcp/                   — MCP bridge + webhook servers
├── linkedin/              — Content pipeline (voice, templates, drafts)
├── moltbook/              — Community posting logs
└── conversations/         — Discord conversation logs
```

## What Makes This Different

Most multi-agent systems are experiments. This one runs in production with:
- **Governance** — Not just agents doing things, but agents accountable to each other
- **Psychology** — An agent dedicated to detecting when other agents hallucinate
- **Economics** — Real spending rules, real budget tracking, real cost optimization
- **Identity** — Each agent has a personality, a name, a communication style
- **Self-improvement** — Error registry that agents learn from nightly

The system isn't just built. It's *governed*.

---

### Sources
- [Anthropic Documentation](https://docs.anthropic.com) — Claude API, model capabilities
- [Oracle Cloud Infrastructure](https://docs.oracle.com/en-us/iaas/) — ARM instance setup, free tier
- [SlowMist OpenClaw Security Guide](https://github.com/slowmist/openclaw-security-practice-guide) — Agent security patterns
