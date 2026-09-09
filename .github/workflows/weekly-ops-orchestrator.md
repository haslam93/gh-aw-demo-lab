---
description: "Demo 5 — Orchestrator: fans work out to worker agents via dispatch-workflow"
on:
  schedule:
    - cron: "0 6 * * 1"
  workflow_dispatch:
permissions:
  contents: read
  copilot-requests: write
  issues: read
  pull-requests: read
engine:
  id: copilot
  model: claude-sonnet-5
network:
  allowed: [defaults]
tools:
  github:
    toolsets: [default]
safe-outputs:
  dispatch-workflow:
    workflows: [triage-worker, dep-audit-worker]
    max: 4
  create-issue:
    title-prefix: "[ops-plan] "
    labels: [report, automated]
    close-older-issues: true
    max: 1
timeout-minutes: 15
---

# Weekly Ops Orchestrator

Survey this repository: unlabeled issues, dependency manifests, stale
docs. Split findings into work units and dispatch the right worker for
each unit:

- `triage-worker` — when there are unlabeled or unclear issues
- `dep-audit-worker` — when dependency manifests exist and deserve a check

Generate a short tracker id (e.g. `ops-2026-w28`) and pass it as the
`tracker_id` input to every worker you dispatch.

Finally, file ONE plan issue listing what was dispatched, why, and the
tracker id — or, if nothing needed doing, a short all-clear note.
