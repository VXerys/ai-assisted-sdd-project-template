---
id: CONTEXT-SYSTEM
title: Repository Context System
status: template
owner: ""
last_updated: 2026-10-15
---

# Repository Context System

Gives every new session the current project state from repository files alone. No chat history, no provider memory.

## Model

```text
hand-edited sources                       rendered views (never hand-edited)
docs/steering/*.md                        docs/context/state.yaml   (machine-readable, source_hash)
docs/specs/F-XXX/{requirements,design,    docs/context/BRIEF.md     (single entry point)
  system-architecture,verification}.md    docs/context/PROJECT_STATE.md (compact view)
docs/specs/F-XXX/tasks.md  <- task master docs/context/PROGRESS.md  (full board)
docs/context/ASSUMPTIONS.md               AGENTS.md and tool adapters (from steering + sdd.config.json)
docs/handoff/current.md
                  ---- context:render, adapters:sync (available from 2.0.0) ---->
```

`sdd.config.json` lists the rendered paths under `generated`. Editing one by hand is a validation error.

## Source rules

| Information | Canonical source |
|---|---|
| Product intent | `docs/steering/product.md`, `docs/product/` |
| Stack, commands, dependency policy | `docs/steering/tech.md` |
| Directory and dependency rules | `docs/steering/structure.md` |
| Engineering, security, stop conditions | `docs/steering/rules.md` |
| Lifecycle and status vocabulary | `docs/steering/workflow.md` |
| Shared architecture | `docs/architecture/` |
| Decisions | `docs/adr/` |
| Feature behavior, design, evidence | `docs/specs/F-XXX-name/` |
| Task status | `docs/specs/F-XXX-name/tasks.md` |
| Unknowns | `docs/context/ASSUMPTIONS.md` |
| Session delta | `docs/handoff/current.md` |

## tasks.md is the master

Each task is a parseable block: `### T-001 — title` followed by `status`, `requirements`, `depends_on`, and `evidence` lines (format in `docs/specs/_templates/tasks.md`). Status vocabulary: `planned | in_progress | blocked | review | done | deferred`. `done` requires an `EV-XXX` id from `verification.md`. There is no second place to record task status.

## BRIEF.md is the entry point

`docs/context/BRIEF.md` is rendered from steering, the active feature's `tasks.md`, open assumptions, and the handoff. It names the active feature and task, open assumptions, blockers, the verification commands, and the exact next action, within a token budget. A session starts there and loads other documents only as the brief or the task points to them.

## Fallback read order when BRIEF.md is absent or stale

1. `docs/steering/rules.md`, `tech.md`, `structure.md`, `workflow.md`, `product.md`
2. `docs/handoff/current.md`
3. The active feature's `tasks.md`; the active feature is the one with an `in_progress` task, otherwise the one the handoff names
4. The `requirements.md`, `design.md`, and `system-architecture.md` sections the task references
5. `docs/context/ASSUMPTIONS.md`, open entries only
6. `git status`, branch, and recent log

## Commands

| Command | Status |
|---|---|
| `npm run context:validate` | available: required files, ids, statuses, links, generated banners |
| `npm run context:refresh` | available: refreshes the git-facts block in `PROJECT_STATE.md` |
| `npm run context:archive-handoff` | available: archives an active handoff and resets `current.md` |
| `npm run context:render` | available from 2.0.0 |
| `npm run adapters:sync` | available from 2.0.0 |

## Lifecycle

```text
task status changes      -> edit tasks.md -> render (available from 2.0.0) -> validate -> commit
session ends             -> update docs/handoff/current.md
requirement or architecture changes -> update spec or ADR -> update affected tasks -> render -> validate
unknown appears          -> add A-XXX to ASSUMPTIONS.md -> mark affected task blocked
```

## Portability

Repository-relative paths and runtime discovery only. No usernames, absolute paths, provider memory directories, or one developer's toolchain in canonical files. Provider-specific configuration lives in the adapter and is overrideable.

## Acceptance

The context system is complete when a new session identifies the active task from `BRIEF.md` alone, rendered views match a clean render, repeated rendering produces no diff, invalid ids and statuses fail validation, and deleting provider memory loses nothing.
