---
title: "02 — Hardware & Infrastructure"
part: 0
order: 02
description: "Part 0 — Part 1 - Foundation"
---


## VM Setup

### Oracle Cloud Always Free Tier

The entire organization runs on Oracle's permanently free ARM instance:

| Spec | Value |
|------|-------|
| Provider | Oracle Cloud Infrastructure (OCI) |
| Shape | VM.Standard.A1.Flex (ARM/aarch64) |
| CPU | 4 OCPU (Ampere A1) |
| RAM | 24GB |
| Disk | 50GB boot volume |
| OS | Ubuntu 24.04 LTS (Minimal) |
| Cost | $0/month (Always Free) |
| Region | Choose closest to you (latency matters for Discord) |

### Why Oracle Over AWS/GCP/Azure Free Tier

- AWS free tier expires after 12 months. Oracle's is permanent.
- AWS gives 1GB RAM. Oracle gives up to 24GB on ARM.
- 4 ARM cores handle 18 Node.js bots + dashboard + nginx comfortably.
- The catch: ARM (aarch64) means some packages need compilation. Plan for this.

### ARM-Specific Considerations

```
✅ Works perfectly: Node.js, Python, SQLite, Nginx, certbot, git
⚠️ Needs compilation: better-sqlite3 (requires build-essential, gcc, make)
❌ Removed: Docker (overhead not justified), Ollama (RAM too heavy with 18 agents)
```

Key lesson: We started with Docker + Ollama. Removed both. Docker added 2-3GB RAM overhead. Ollama's smallest model (Qwen 7B) consumed 4.7GB. With 18 bots running, every GB counts.

### Security Group (Firewall)

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP only | SSH access |
| 80 | TCP | 0.0.0.0/0 | HTTP → HTTPS redirect |
| 443 | TCP | 0.0.0.0/0 | HTTPS (nginx) |
| 18789 | TCP | 127.0.0.1 | Gateway (internal only) |
| 3000 | TCP | 127.0.0.1 | MCP bridge (internal only) |
| 3001 | TCP | 127.0.0.1 | Webhook (internal only) |
| 3838 | TCP | 127.0.0.1 | Dashboard (internal only) |

**Rule:** Only 22, 80, and 443 are exposed. Everything else goes through nginx reverse proxy.

## Job Planning and Optimization

### Cron Schedule Design

39 cron jobs run on this single VM. The key is **time distribution** — never stack jobs:

```
── 02:00-04:00 UTC ── MAINTENANCE WINDOW ──
  02:00  daily_memory_cleanup.sh
  03:00  nightly_backup.sh + gc_scan.sh
  03:30  analyze_conversations.sh
  04:00  soul_backup.sh

── 05:00-08:00 UTC ── MORNING OPERATIONS ──
  05:45  monitor_planner_meeting.sh
  06:00  CEO 1:1 (monitor, planner) + dev_knowledge_meeting
  07:00  stock_update.sh
  07:30  morning_briefing.sh
  08:00  dev_knowledge_meeting + api_usage_report

── 08:00-20:00 UTC ── ACTIVE HOURS ──
  Every 5 min: vm_monitor.sh
  Every 10 min: developer_progress.sh
  Every 2h: dev_knowledge_meeting.sh
  14:00-19:00: CEO 1:1s (knowledge, linkedin, developer, cybersecurity)

── 20:00-23:00 UTC ── EVENING ──
  20:00  CEO synthesize.sh
  21:00  operator_briefing.sh
  23:00  cost_tracker.sh + knowledge_refactor + linkedin_research
```

### VM Load Thresholds

Planner manages load in coordination with Monitor:

| Level | CPU | RAM | Action |
|-------|-----|-----|--------|
| GREEN | <30% | <40% | All agents active, full posting |
| YELLOW | 30-60% | 40-65% | Core agents only, restricted posting |
| ORANGE | 60-80% | 65-80% | Essential only, no posting |
| RED | >80% | >80% | Emergency, alert CEO immediately |

### Process Management

We use two approaches (this is a known inconsistency to resolve):

**Gateway + MCP + Webhook:** PM2 for process management
```bash
pm2 start gateway/index.js --name gateway
pm2 start mcp/server.js --name mcp
pm2 start mcp/webhook.js --name webhook
pm2 save && pm2 startup  # survives reboot
```

**Dashboard:** fuser/nohup (lighter weight, manual restarts)
```bash
fuser -k 3838/tcp 2>/dev/null
nohup node server.js > /tmp/org-logs/dashboard.log 2>&1 &
```

**Watchdogs:** Both gateway and dashboard have watchdog scripts that run at @reboot and auto-restart on crash.

### Disk Management

50GB fills faster than you think with 18 agents generating logs:

| Directory | Typical Size | Cleanup Strategy |
|-----------|-------------|-----------------|
| node_modules/ | 200-400MB | .gitignore, never backup |
| /tmp/org-logs/*.log | 50-200MB/week | GC agent rotates weekly |
| thoughts/*/thoughts.md | 1-5MB/agent/month | Archive monthly |
| conversations/ | 10-50MB/month | analyze then archive |
| kpis/ | <1MB/month | Keep all (small) |
| SQLite DBs | 1-10MB | Data tiering (hot/warm/cold) |

GC agent runs nightly: identify → tag (Memory) → archive (archive-repo repo) → CEO approves deletion.

## Error Handling

### Error Registry

Centralized error tracking at `~/.your-org/errors/registry.json`:

```bash
# Log an error from any agent or script
bash ~/.your-org/errors/log_error.sh \
  "high" \
  "network" \
  "Groq API timeout" \
  "3 consecutive 504s from Groq" \
  "Retry with exponential backoff" \
  "Add circuit breaker" \
  "monitor"
```

Each error gets: ID, severity (critical/high/medium/low), category, description, solution, prevention strategy, and originating agent.

### Self-Improvement Loop

`self_improve.sh` runs nightly at 3:15 AM:
1. Reads error registry for open errors
2. Picks highest severity
3. Attempts automated fix
4. Logs result

### Gateway Circuit Breaker

The gateway watchdog checks health every 30 seconds:
- Healthy → do nothing
- Unhealthy → restart gateway
- 3 consecutive failures → alert Monitor → escalate to CEO

### Backup Strategy

Three backup destinations:
1. **system-backup** (GitHub) — All SOUL files, configs, scripts (nightly, token-redacted)
2. **archive-repo** (GitHub) — Archived/deleted files (GC sends here)
3. **Local snapshots** — Version rotation weekly (version_rotate.sh)

Backups run in ALL modes (live, test, away) — never skipped.
