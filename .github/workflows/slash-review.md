---
description: "Demo 3 — /review slash command: on-demand security review with a specialist persona"
on:
  slash_command:
    name: review
permissions:
  contents: read
  copilot-requests: write
  pull-requests: read
  issues: read
engine:
  id: copilot
  model: gpt-5.4
imports:
  - .github/agents/security-reviewer.md
network:
  allowed: [defaults]
tools:
  github:
    toolsets: [default]
  bash: ["git diff:*", "git log:*", "grep:*"]
safe-outputs:
  add-comment:
    max: 1
timeout-minutes: 15
---

# /review — On-Demand Security Review

A maintainer typed /review on this pull request or issue. Review the
relevant changes as a security specialist: injection risks, secret
leakage, authorization gaps, unsafe deserialization.

Post one structured review comment with severity-ranked findings and
concrete fix suggestions. If nothing significant is found, say so and
list what you checked.
