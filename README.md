# 🧪 gh-aw Demo Lab

[![Interactive Demo Lab](https://img.shields.io/badge/▶_Open_the_Interactive_Demo_Lab-b11f4b?style=for-the-badge)](https://haslam93.github.io/gh-aw-demo-lab/)

A live companion repository for the **[GitHub Agentic Workflows (gh-aw)](https://github.github.com/gh-aw/) Interactive Demo Lab** HTML app.

**🌐 View it live: [haslam93.github.io/gh-aw-demo-lab](https://haslam93.github.io/gh-aw-demo-lab/)** — 15 interactive sections covering the pipeline, workflow anatomy, AI engines & agent personas, safe outputs, multi-agent orchestration, AWF sandbox security, authentication, a workflow builder, and a run simulator. (Also available in-repo as [`demo.html`](demo.html).)

The examples link to **real, compiled workflows** in this repo. They are teaching
snapshots (some use different engines or settings); linked workflow sources are
authoritative. The browser simulator is local only and does not start Actions runs.

## 🚀 Setup — check Copilot access

Workflows are configured for the **Copilot engine with org-level billing**: every workflow declares
`copilot-requests: write` under `permissions:`, so inference authenticates with the
built-in GitHub Actions token (`${{ github.token }}`). **No PAT is needed when the
repository has access to this billing mode.** A personal fork or organization
without that access may need the fallback below.
Tokens are minted per-run and auto-revoked; billing flows through the organization's
Copilot plan.

> **Fallback:** if your org doesn't have centralized Copilot billing, runs fail with
> `403` at the inference step. Remove `copilot-requests: write` from the workflow
> frontmatter, recompile with `gh aw compile`, and set a PAT instead:
> `gh aw secrets set COPILOT_GITHUB_TOKEN --value "<fine-grained PAT with Copilot Requests: Read>"`

```bash
gh aw status   # verify everything is compiled and active
```

### Troubleshooting scheduled runs

On September 9, 2026, the daily report and site updater logs showed HTTP 400:
`The requested model is not available for integrator "agentic-workflows"`.
They were using the compiler's old `claude-sonnet-4.6` default. All nine workflow
sources now explicitly select `gpt-5.4`, which was listed as available in those
responses, and their locks were regenerated with **gh-aw v0.81.6**. A validation
run also showed that the pinned runtime rejects the newer `claude-sonnet-5`
identifier before inference, so API availability alone is insufficient.
These are model-selection failures, not evidence of a missing PAT.

- Inspect the failed **agent** job and its model error before changing secrets.
- If model access changes, select a model available to your account in the
  workflow's `engine.model`, run `gh aw compile`, and commit both source and lock.
  Retrying an old run still uses its old workflow configuration.
- The daily report is scheduled for **09:00 UTC on weekdays**; Actions schedules
  can be delayed. Use `gh aw run daily-team-status` for a manual check after merge.
- The pinned compiler is deliberately separate from the release news feed.
  Upgrading it requires recompiling and validating all workflows.

### Site freshness and validation

The site updater checks [`github/gh-aw` releases](https://github.com/github/gh-aw/releases)
**daily at 07:00 UTC**, including explicitly labeled prereleases. It compares tags,
not dates, to avoid missing same-day releases and checks for existing update PRs.
It proposes JSON-only changes; **a maintainer must merge the PR** before GitHub
Pages publishes them. It does not automatically monitor all documentation changes.

The news panel shows the latest recorded release and warns when it is more than
14 days old, with links to updater runs, pending PRs, and upstream releases.
The refreshed snapshot includes stable **v0.88.7** and prerelease **v0.89.0**
(verified September 9, 2026).

Run `npm test` (no dependency installation needed) to check the app, matching
`docs/index.html` / `demo.html` copies, release data, embedded JavaScript, news
rendering, and builder output. CI runs these same checks. The intentionally
vulnerable dependency fixtures below are not needed to serve or test the site.

## 🎬 The demos

| # | Workflow | Trigger it live | Demonstrates | HTML section |
|---|----------|-----------------|--------------|--------------|
| 1 | [`daily-team-status.md`](.github/workflows/daily-team-status.md) | `gh aw run daily-team-status` | schedule trigger, `create-issue`, `close-older-issues` | Overview / Examples |
| 2 | [`issue-triage.md`](.github/workflows/issue-triage.md) | Open any issue in this repo | event trigger, 👀 `reaction`, **triage-bot persona**, label allowlist, `add-comment` | Workflow Anatomy / AI Engines |
| 3 | [`slash-review.md`](.github/workflows/slash-review.md) | Comment `/review` on a PR or issue | slash command, **security-reviewer persona**, on-demand agents | AI Engines / Examples |
| 4 | [`docs-gardener.md`](.github/workflows/docs-gardener.md) | `gh aw run docs-gardener` | **doc-reviewer persona**, `edit` tool, draft `create-pull-request` | Safe Outputs / Examples |
| 5 | [`weekly-ops-orchestrator.md`](.github/workflows/weekly-ops-orchestrator.md) | `gh aw run weekly-ops-orchestrator` | **multi-agent orchestration**: `dispatch-workflow` fans out to [`triage-worker`](.github/workflows/triage-worker.md) + [`dep-audit-worker`](.github/workflows/dep-audit-worker.md) | Multi-Agent Orchestration |
| 6 | [`ci-doctor.md`](.github/workflows/ci-doctor.md) | Run **CI** workflow with `force_fail=true` | `workflow_run` trigger, log analysis, `deduplicate-by-title` | Examples (CI doctor) |
| 7 | [`site-updater.md`](.github/workflows/site-updater.md) | `gh aw run site-updater` | **self-updating site**: daily agent tracks [gh-aw releases](https://github.com/github/gh-aw/releases), validates synchronized 📰 *What's New* JSON, and proposes a PR for review and merge | What's New / Examples |

### Agent personas (`.github/agents/`)

Exactly the persona files explored in the HTML app's **AI Engines → Custom agent personas** tab:

- [`triage-bot.md`](.github/agents/triage-bot.md) — friendly issue concierge (used by demos 2 & 5)
- [`security-reviewer.md`](.github/agents/security-reviewer.md) — appsec specialist (demo 3)
- [`doc-reviewer.md`](.github/agents/doc-reviewer.md) — technical-writing editor (demo 4)

## 🎥 Suggested live-demo script (~10 min)

1. **Show the source** — open `issue-triage.md`: "this markdown *is* the automation." Then open its `.lock.yml`: "and this is what `gh aw compile` hardens it into."
2. **Trigger demo 2** — open an issue titled *"App crashes when uploading large files"* (mention `app/index.js`). Watch the 👀 reaction appear, then labels + a triage comment arrive. Point out the agent had **zero write permissions**.
3. **Safe-output gate** — show that the workflow can only apply the 5 allowed labels, `max: 3`.
4. **Multi-agent** — `gh aw run weekly-ops-orchestrator`, then open the Actions tab: watch it dispatch `triage-worker` and `dep-audit-worker` as independent runs, then file an `[ops-plan]` issue.
5. **CI Doctor** — Actions → CI → Run workflow with `force_fail=true` → a diagnosed `[ci-doctor]` issue appears.
6. **Cost & audit** — `gh aw logs` and `gh aw audit`.

> The `package.json` intentionally pins old dependencies (`lodash 4.17.15`, `request`) so the dependency-audit worker always has something real to find. `app/index.js` has a missing size-guard for the triage/security demos to discover.

## 🔧 Handy commands

```bash
gh aw status                       # list workflow states
gh aw compile                      # recompile after editing any .md
gh aw run <workflow>               # trigger a run
gh aw logs                         # token/AI-credit spend per run
gh aw audit                        # deep run analysis
```

## 📚 Learn more

- 📖 Official docs: https://github.github.com/gh-aw/
- 🧪 Sample collection: https://github.com/githubnext/agentics
- 🖥️ The interactive HTML lab: [`demo.html`](demo.html) in this repo
