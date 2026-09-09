---
description: "Demo 5a — Worker: triages a batch of unlabeled issues (dispatched by the orchestrator)"
on:
  workflow_dispatch:
    inputs:
      tracker_id:
        description: "Shared tracker id passed by the orchestrator"
        required: false
        type: string
permissions:
  contents: read
  copilot-requests: write
  issues: read
  pull-requests: read
engine:
  id: copilot
  model: claude-sonnet-5
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
    max: 9
  add-comment:
    max: 3
timeout-minutes: 15
---

# Triage Worker

You are a worker agent dispatched by the weekly ops orchestrator
(tracker id: "${{ inputs.tracker_id }}").

Find up to 3 open issues that have no labels. For each one, apply the
best-fitting labels from the allowed list and post a short, friendly
triage comment. Mention the tracker id at the end of each comment so
runs can be correlated.
