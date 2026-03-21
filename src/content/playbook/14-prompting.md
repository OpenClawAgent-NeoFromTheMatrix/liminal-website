---
title: "14 — Prompting Best Practices"
part: 0
order: 14
description: "Part 0 — Part 4 - AI Mastery"
---


## The 10 Rules

Applied to EVERY prompt — SOUL files, cron prompts, API calls, agent-to-agent:

### Rule 1: ROLE FIRST
Every prompt opens with a clear expert identity. One sentence.
```
✅ "You are the operator's smart router. You route, never decide, never spend."
❌ "You are an AI assistant that helps with routing."
```

### Rule 2: XML TAGS FOR STRUCTURE
Wrap distinct content types in XML tags. Never mix instructions with context.
Tags: `<role>`, `<context>`, `<rules>`, `<instructions>`, `<examples>`, `<input>`, `<output_format>`

### Rule 3: CONTEXT BEFORE QUERY
Background and data always come before the actual ask.
Order: role → context → rules → examples → task

### Rule 4: EXAMPLES IN EXAMPLE TAGS
Include 1-3 concrete examples. Show good AND bad when the difference matters.
```xml
<example>
<input>!route research</input>
<output>Route to Research #research</output>
</example>
```

### Rule 5: EXPLICIT ACTION
Say exactly what to do. Never "could you" or "it might help to."
```
✅ "Read routing_map.md. Route the message. Update USES counter."
❌ "You might want to check routing_map.md before routing."
```

### Rule 6: NUMBERED STEPS FOR SEQUENCES
Use numbered lists ONLY when order matters.

### Rule 7: ONE APPROACH, COMMIT
Never present multiple alternatives. Choose one path.
```
✅ "Use Haiku for all analysis tasks."
❌ "You could use Haiku or Sonnet depending on complexity."
```

### Rule 8: SCOPE THE FILES
Always name exact full paths.
```
✅ "Read ~/.your-org/orchestrator/routing_map.md"
❌ "Check the routing configuration."
```

### Rule 9: TESTABLE END STATES
Every task ends with a verifiable success state.
```
✅ "Post to #developer. Format: PROJECT: [name] | STATUS: [status]"
❌ "Update the team on your progress."
```

### Rule 10: END WITH ACTION ANCHOR
Close every prompt with "Begin with X" to prevent overthinking.

## Prompt Scoring Checklist

Before sending any prompt, score 5/6 minimum:
- [ ] Role defined?
- [ ] XML structure used?
- [ ] Context before query?
- [ ] Examples included?
- [ ] Action is explicit?
- [ ] Files scoped with paths?

## Never Do

- Open with "You are an AI assistant"
- Use vague verbs: check, handle, manage, deal with, consider
- Mix instructions and context in the same block
- Present multiple alternatives
- Omit file paths
- End without an action anchor
- Use bullet points when prose flows better
- Write examples in prose (use example tags)

## Batch Prompting

For large builds (like the dashboard), batch prompts are self-contained documents:

```markdown
## BATCH 4 — RPG Agent Cards, Schedule, System View
You are Neo (Developer + Prompter + Opus).
You execute via MCP bash on Oracle VM.

### Step 1: Create branch
### Step 2: Agent cards page [full spec]
### Step 3: Schedule calendar [full spec]
### Step 4: Tests [full spec]
### Step 5: Deploy
### Step 6: Update CHANGELOG, push, send metrics
```

Each batch prompt includes: context recovery info, exact specs, test expectations, deploy steps. Designed to survive context compaction.
