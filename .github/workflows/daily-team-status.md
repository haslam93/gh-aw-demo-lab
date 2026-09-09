---
description: "Demo 1 — Daily status report: schedule trigger + create-issue safe output"
on:
  schedule:
    - cron: "0 9 * * 1-5"
  workflow_dispatch:
permissions:
  contents: read
  copilot-requests: write
  issues: read
  pull-requests: read
engine:
  id: copilot
  model: gpt-5.4
network:
  allowed: [defaults]
safe-outputs:
  create-issue:
    title-prefix: "[team-status] "
    labels: [report, daily-status]
    close-older-issues: true
    max: 1
timeout-minutes: 15
---

# Daily Team Status

Create an upbeat daily status report for the team as a GitHub issue.

Include:

- Recent repository activity (issues, PRs, discussions, releases, code changes)
- Progress tracking, goal reminders and highlights
- Project status and recommendations
- Actionable next steps for maintainers

Keep it concise and scannable. Use headings, short bullet lists, and an
encouraging tone. If there was no activity, say so cheerfully and suggest
one concrete improvement the team could pick up.
