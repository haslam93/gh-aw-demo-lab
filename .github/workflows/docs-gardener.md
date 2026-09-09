---
description: "Demo 4 — Docs gardener: scheduled docs-drift sweep that opens a draft PR"
on:
  schedule:
    - cron: "0 4 * * 3"
  workflow_dispatch:
permissions:
  contents: read
  copilot-requests: write
engine:
  id: copilot
  model: gpt-5.4
imports:
  - .github/agents/doc-reviewer.md
network:
  allowed: [defaults]
tools:
  edit:
  bash: ["grep:*", "find:*", "cat:*"]
safe-outputs:
  create-pull-request:
    title-prefix: "[docs] "
    labels: [documentation, automated]
    draft: true
timeout-minutes: 20
---

# Weekly Docs Gardener

Scan README.md and any docs in this repository for drift against the
current code and workflows: broken links, outdated commands, renamed
files, stale examples.

Fix what you find and open ONE draft pull request with a clear summary
of each change. Do not touch anything outside documentation files.
