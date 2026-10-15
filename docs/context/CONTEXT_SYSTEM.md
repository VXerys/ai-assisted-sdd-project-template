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
docs/context/ASSUMPTIONS.md
docs/handoff/current.md
                  ---- context:render ---->

docs/steering/*.md                        AGENTS.md (contract for every tool)
sdd.config.json (tools, generated,        CLAUDE.md, GEMINI.md (@AGENTS.md + adapter lines)
  frozen)                                 .cursor/rules/*.mdc, .kiro/steering/*.md (one per steering file)
                                          .github/copilot-instructions.md, .github/instructions/*.instructions.md
                  ---- adapters:sync ---->
```

`sdd.config.json` lists the rendered paths and the adapters under `generated`. Editing one by hand is a validation error (and, in Claude Code, a denied edit): `state.yaml` carries a `source_hash` (sha256 over `sdd.config.json`, `docs/steering/`, `docs/specs/F-*/`, `ASSUMPTIONS.md`, and the handoff), and the validator re-renders in memory and fails when any view differs from disk. Git facts are not part of the hash; they live only in the `## Git` block of `PROJECT_STATE.md`, which the freshness check ignores.

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

Each task is a parseable block: `### T-001 — title` followed by `status`, `requirements`, `depends_on`, and `evidence` lines (format in `docs/specs/_templates/tasks.md`). An optional `- scope: [paths]` line lists the files the task may touch; the brief shows it. Status vocabulary: `planned | in_progress | blocked | review | done | deferred`. `done` requires an `EV-XXX` id from `verification.md` whose `covers` names at least one AC. There is no second place to record task status.

The active pair is derived, never typed into a rendered file: the first `in_progress` task wins; otherwise `feature_id` and `task_id` from the handoff frontmatter.

## BRIEF.md is the entry point

`docs/context/BRIEF.md` is rendered from steering, the active feature's `tasks.md` and `requirements.md`, open assumptions, and the handoff, within `limits.briefTokens` from `sdd.config.json` (default 3000, estimated at four characters per token). Sections in priority order: project one-liner (first prose line under `## Vision` in `product.md`); active feature and task with its body, acceptance criteria, and scope; the `## Stop conditions` and `## Prohibited` sections of `rules.md` verbatim; generated and frozen paths; open assumptions for the active feature; the handoff's `## Exact next step`; other open tasks of the active feature; the feature table. When the budget is exceeded the lowest-priority sections are cut first and a final line names what was cut. A session starts there and loads other documents only as the brief or the task points to them.

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
| `npm run context:render` | available: writes `state.yaml`, `BRIEF.md`, `PROJECT_STATE.md`, `PROGRESS.md` with LF endings; `--check` exits 1 when a view would change, `--quiet` prints nothing on success |
| `npm run context:validate` | available: the checks below; `--strict` turns warnings into errors |
| `npm run context:archive-handoff` | available: archives an active handoff by `session_date`, `feature_id`, `task_id`, resets `current.md`, then renders |
| `npm run adapters:sync` | available: writes `AGENTS.md` and the adapters for the tools in `sdd.config.json`; `--check` exits 1 when a target differs from a clean sync, `--all` renders every tool, `--quiet` |

Validator output is one line per finding, `path:line  level  message`, sorted by file, then a count summary. `error` fails the run; `warning` only prints.

| Check | Level |
|---|---|
| Required files from `validate.requiredFiles` exist | error |
| Steering files have frontmatter with `inclusion` set to `always`, `fileMatch`, or `manual`; `fileMatchPattern` present exactly when `inclusion` is `fileMatch`; over `limits.steering` lines (120) | error; error; warning |
| Every `docs/specs/F-*/` file and `docs/adr/ADR-*.md` has frontmatter with `id`, `title`, `type`, `status`, `tier`, `owner`, `created`, `last_updated`, `last_verified`; `id` matches the folder or file name; `type` matches the file name; `status` and `tier` in vocabulary | error |
| Feature file `status` differs from `tasks.md`; `design.md` missing; full tier without `system-architecture.md` | warning |
| `requirements.md`, `tasks.md`, or `verification.md` missing in a feature folder | error |
| Duplicate `F-`, `ADR-`, `A-` ids repo-wide; duplicate `T-`, `FR-`, `AC-`, `EV-` ids within a feature; duplicate frontmatter `id` outside feature folders | error |
| Task `status` in vocabulary; `requirements` ⊆ FR ids; `depends_on` ⊆ task ids; `evidence` ⊆ EV ids | error |
| Task `done` without an evidence id whose `covers` is non-empty | error |
| FR without a task | warning while the feature is `draft`, `review`, or `approved`; error from `implementing` |
| Feature `implemented` with a task not `done` or `deferred`, or with an `open` assumption naming it | error |
| EV block missing `command`, `output`, `date` (`YYYY-MM-DD`), or `commit`; `covers` empty or naming an unknown AC | error |
| Assumption `status` not `open`, `confirmed`, or `rejected`; `feature` names an unknown feature | error; warning |
| `last_verified` older than `limits.staleDays` while `implementing` or `verification`; active handoff past `expires_after`; handoff naming an unknown feature or task | warning |
| Rendered view differs from an in-memory render (`run npm run context:render`); `state.yaml` not valid YAML or not `schema_version: 2`; generated file without its banner | error |
| Adapter differs from a clean `adapters:sync` while `tools` is non-empty (`run npm run adapters:sync`) | error |
| Spec file over its tier cap (`limits.lite`, `limits.full`, `limits.systemArchitecture`) | warning |
| Relative Markdown link does not resolve; backtick path starting with `docs/` or `scripts/` does not exist (skipping `XXX`, globs, placeholders, `CHANGELOG.md`, the handoff archive) | error; warning |
| `{{...}}` placeholder outside `_templates/` when `templateMode` is `false` (limited to `validate.placeholderSensitiveFiles` when that list is non-empty) | error; warning while the file's `status` is `draft` or `template` |
| A nested directory with its own `sdd.config.json` (an example, a fixture) is skipped by every walk; it validates on its own | skipped |

## Lifecycle

```text
task status changes      -> edit tasks.md -> npm run context:render -> npm run context:validate -> commit
steering or config change -> edit docs/steering/ or sdd.config.json -> npm run adapters:sync -> render -> validate
session ends             -> update docs/handoff/current.md
requirement or architecture changes -> update spec or ADR -> update affected tasks -> render -> validate
unknown appears          -> add A-XXX to ASSUMPTIONS.md -> mark affected task blocked
```

## Portability

Repository-relative paths and runtime discovery only. No usernames, absolute paths, provider memory directories, or one developer's toolchain in canonical files. Provider-specific configuration lives in the adapter and is overrideable.

## Acceptance

The context system is complete when a new session identifies the active task from `BRIEF.md` alone, rendered views match a clean render, repeated rendering produces no diff (`generated_at` is kept while `source_hash` is unchanged), invalid ids and statuses fail validation, and deleting provider memory loses nothing. The fixtures under `scripts/context/__fixtures__/` are the executable form of this list.
