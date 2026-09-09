---
description: "Demo 5b — Worker: audits dependencies and files findings (dispatched by the orchestrator)"
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
engine:
  id: copilot
  model: claude-sonnet-5
network:
  allowed: [defaults]
tools:
  bash: ["cat:*", "find:*", "grep:*"]
safe-outputs:
  create-issue:
    title-prefix: "[dep-audit] "
    labels: [dependencies, automated]
    deduplicate-by-title: 2
    max: 3
timeout-minutes: 15
---

# Dependency Audit Worker

You are a worker agent dispatched by the weekly ops orchestrator
(tracker id: "${{ inputs.tracker_id }}").

Inspect any dependency manifests in this repository (package.json,
requirements.txt, go.mod, etc.). Identify outdated, unmaintained, or
risky dependencies. File at most 3 issues, one per distinct finding,
with evidence and a suggested upgrade path. Reference the tracker id
in each issue body.
