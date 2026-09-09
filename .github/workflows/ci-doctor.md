---
description: "Demo 6 — CI Doctor: analyzes failed CI runs and files a diagnosed, deduplicated issue"
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: [main]
if: ${{ github.event.workflow_run.conclusion == 'failure' }}
permissions:
  contents: read
  copilot-requests: write
  actions: read
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
  bash: ["gh run view:*", "gh api:*"]
safe-outputs:
  create-issue:
    title-prefix: "[ci-doctor] "
    labels: [ci, automated]
    deduplicate-by-title: 2
    max: 1
timeout-minutes: 15
---

# CI Doctor

The CI workflow just failed. Download and analyze the failing run logs
(run id: ${{ github.event.workflow_run.id }}).

Identify the root cause — flaky test, infrastructure problem, or real
regression. Search recent issues for similar past failures.

File ONE issue containing: the failing job/step, a short error excerpt,
your probable-cause diagnosis, and a suggested fix or next step.
