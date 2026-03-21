---
title: "17 — Content Creation for Social Media"
part: 0
order: 17
description: "Part 0 — Part 5 - Content & Growth"
---


## LinkedIn Pipeline

### Architecture

```
Research (topic discovery)
    ↓ saves trending topics
LinkedIn Agent (draft generation)
    ↓ writes using voice profile
Cybersecurity (clearance)
    ↓ scans for leaks
The operator (approval)
    ↓ thumbsup/thumbsdown/edit
GitHub (archive)
```

### Content Types

| Type | Trigger | Template |
|------|---------|----------|
| Daily Log | 8PM daily | Real org events → human story |
| Learning Tuesday | Tuesday 9AM | Queue of real articles → episode |
| Topic Proposals | Mon-Fri 11PM | 5 trending topics via DeepDive |
| Full Post | The operator votes 💯 | Voice profile + template → draft |
| Builder Notes | !builder-note | Incident → lesson learned post |

### Voice Profile

Stored at `~/.your-org/linkedin/voice/voice-profile.md`:

**Identity:** Industrial engineer, IT background, logistics/cold chain, built Dark Glass.

**Tone:** Direct, declarative. Facts not possibilities. Short punches mixed with medium sentences.

**Hard Rules:**
- Never exceed 30 words per sentence
- Never invent scenes, conversations, or moments
- Every number must come from real project data
- No "I'm excited to share." No em dashes.
- Max 1300 chars per post, 3-5 hashtags

**Self-Check (applied to every draft):**
1. Would the operator say this to a friend?
2. Specific number, place, or year in first 3 sentences?
3. Longest sentence under 30 words?
4. First line: would you stop scrolling?
5. All numbers verified from project data?

### Market Research & Orientation

**Topic Discovery:**
- DeepDive agent searches Tavily for trending topics
- Filtered against `banned_topics.txt` and `used_topics.txt`
- Saved to `saved/[date].md`
- Presented with voting emojis next morning

**Integrity Rules:**
- All system data must be verified before citing
- Agent count: check org-config.json
- Monthly cost: check budget tracking files
- Never mention employer by name
- External brand: use your public-facing name (never internal org name)

## Moltbook & Community Exposure

### Account: storyteller_ai (shared)

Used by LinkedIn + StoryTeller agents (Moltbook policy: 1 account per human).

### Posting Rules

- Every post → Cybersecurity clearance (scan_push + duplicate check)
- Every inbound response → UNTRUSTED (truncated 2K chars, sanitized)
- Post log: `~/.your-org/moltbook/all_agents_posts.md`
- Code from Moltbook is NEVER executed outside Docker sandbox
- If agent sees another agent's post → comment on Discord only, not on website
- No duplicate topics (Cybersecurity enforces)
- Repost only if 0 responses after 72h

### Moltbook Agent Guard

4-layer security for community interaction:
1. Regex sanitizer
2. Content isolation
3. Docker sandbox
4. Audit trail

Blocks: jailbreak attempts, credential extraction, data exfiltration, system prompt extraction, role hijacking, encoded payloads.

---


## Content Research Tools

### Reddit MCP
Research Agent and LinkedIn Agent use the Reddit MCP to discover trending topics:
- Subreddits: r/artificial, r/claudeai, r/LocalLLaMA, r/selfhosted, r/node
- Focus on posts with >50 upvotes or >20 comments
- Output: structured content briefs with topic, key points, sentiment, content angle

### Tavily Search
Structured web search via `tavily_search.sh`:
- Uses existing Tavily API key (free tier: 1,000 searches/month)
- Rate limited to 33 searches/day
- Returns AI-generated answer summaries + ranked results with relevance scores
- Agents: Research (content discovery), Daily (morning briefings)

### AIDA Framework for LinkedIn
LinkedIn Agent uses the AIDA template for post structure:
- **Attention** — Bold hook, surprising stat, contrarian take (first 2 lines)
- **Interest** — Why this matters, connect to pain point (3-5 lines)
- **Desire** — Actionable insight, numbered lists (5-8 lines)
- **Action** — Question or engagement CTA (last 2 lines)
- Max 1300 characters, no hashtags in body, one post = one idea

### RIPER Workflow
Developer Agent follows Research-Innovate-Plan-Execute-Review for all features.

### Sources
- [Moltbook](https://moltbook.com) — AI community platform, posting API
- [Moltbook Agent Guard](https://github.com/NirDiamant/moltbook-agent-guard) — Content security scanning
