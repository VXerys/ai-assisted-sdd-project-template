---
inclusion: always          # always | fileMatch | manual
---

# Workflow

The spec-driven lifecycle from session start to handoff.

## Start a session

1. Read `docs/context/BRIEF.md`. It is the single entry point: active feature and task, open assumptions, blockers, next action.
2. If `BRIEF.md` is absent or stale, read in this order: `docs/steering/*.md`, `docs/handoff/current.md`, the active feature's `tasks.md`, then its `requirements.md` and `design.md`.
3. Confirm branch and worktree match the handoff before editing anything.

## Pick a task

- Take the task the brief names, or the first `planned` task whose `depends_on` are all `done`.
- Read only the FR ids, design sections, and architecture sections the task references, plus the code it touches.
- Set `status: in_progress` in `tasks.md`. One task in progress per session. In Claude Code, `/sdd:task T-XXX` builds the task prompt from the brief and the spec and follows it.

## Status transitions

```text
planned -> in_progress -> review -> done
                |            |
                v            v
             blocked      deferred
```

- `blocked`: an unresolved decision or assumption; log it in `ASSUMPTIONS.md` and stop the task.
- `review`: implementation complete, evidence recorded, awaiting review.
- `done`: reviewed, with at least one `EV-XXX` id in `evidence`.
- `deferred`: removed from current scope with a reason; never deleted.

Feature status in frontmatter: `draft -> review -> approved -> implementing -> verification -> implemented`, or `superseded`. A feature becomes `implemented` only when every task is `done` or `deferred` and no assumption is `open`.

## Evidence

Every check runs through the commands in `tech.md` and is recorded as an EV block in `verification.md` with command, output excerpt, date, commit, and the AC ids it covers. Claims without evidence are not accepted at review.

## Close a session

1. Review `git diff` and `git status`.
2. Run the commands in `tech.md`; record evidence.
3. Update task status in `tasks.md`; run `npm run context:render`, then `npm run context:validate`. After a steering or `sdd.config.json` change, also `npm run adapters:sync`.
4. Update `docs/handoff/current.md`: objective, changed files, commands and results, uncommitted work, blockers, exact next step. In Claude Code, `/sdd:handoff` writes it and runs render and validate; `/sdd:review`, `/sdd:bug`, and `/sdd:render` fill the review template, open a bug file, and run the three context commands.
5. Report the next task.

## When to write an ADR

Write one in `docs/adr/` from `docs/_templates/adr.md` when a decision is expensive to reverse, changes a boundary or trust model, introduces or replaces a framework, provider, store, or major dependency, changes a public contract, or will be questioned later. One decision per ADR; supersede, never rewrite.

## Tiers

`lite` is the default: requirements, design, tasks, verification, each within 80 lines. `full` adds `system-architecture.md` and the sections marked `<!-- full-tier -->`, within 200 lines (300 for system architecture). Choose `full` when the feature has shared state, realtime or async communication, external integration, a security boundary, or material scale or cost.
