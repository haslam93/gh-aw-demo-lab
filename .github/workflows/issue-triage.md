---
description: "Demo 2 — Issue triage: event trigger + custom agent persona + gated labels/comment"
on:
  issues:
    types: [opened, reopened]
  reaction: eyes
permissions:
  contents: read
  copilot-requests: write
  issues: read
  pull-requests: read
engine:
  id: copilot
  model: gpt-5.4
imports:
  - .github/agents/triage-bot.md
network:
  allowed: [defaults]
tools:
  github:
    toolsets: [default]
safe-outputs:
  add-labels:
    allowed: [bug, enhancement, question, docs, duplicate]
    max: 3
  add-comment:
    max: 1
timeout-minutes: 10
---

# Issue Triage Agent

Analyze the newly opened issue:

1. Read the issue title and body carefully.
2. Check for duplicates among recent open issues.
3. Apply the most fitting labels from the allowed list.
4. Post one short, friendly comment summarizing your triage decision and
   any missing information the author should provide.
