# AI-Assisted SDD Project Template

A repository template for spec-driven, context-efficient, evidence-based software engineering with AI coding agents. Stack-agnostic: web, mobile (Flutter, Kotlin, React Native), and server projects with any data store use the same documents.

Version 2 is in progress; see `CHANGELOG.md` and `docs/adr/ADR-0001-v2-revamp.md`. Phases 1 to 4 (this state) ship the single template family, steering, config, the context renderer, the v2 validator, tool adapters, Claude Code hooks, slash commands, `init` with app and database presets, and the `examples/todo-api` reference project.

## Quick start

1. Click "Use this template" on GitHub and clone the new repository.
2. `npm install`
3. `npm run init`, answer the prompts (or pass flags), and read the plan it prints.

`init` writes `sdd.config.json`, fills the steering and product documents from your answers and the presets, prunes the documents your tier does not use, removes template-only files, then renders the context views, syncs the tool adapters, and validates. It refuses to run on a project whose `templateMode` is already `false` unless `--force` is given; `--dry-run` prints the plan and changes nothing.

| Flag | Values | Default |
|---|---|---|
| `--name <text>` | project name | the directory name |
| `--description <text>` | one sentence: what it is, for whom, the outcome; becomes the identity line of `AGENTS.md` and `BRIEF.md` | `<name> is a <app> project.` |
| `--tier lite\|full` | documentation tier (table below) | `lite` |
| `--app <preset>` | `nextjs`, `react-native`, `flutter`, `kotlin-android`, `node-api`, `python-api`, `generic` | `generic` |
| `--db <preset>` | `supabase`, `firebase`, `postgres`, `mysql`, `sqlite-drift`, `mongodb`, `none` | `none` |
| `--tools <list>` | comma-separated: `claude`, `codex`, `cursor`, `copilot`, `gemini`, `kiro`, `antigravity` | `claude` |
| `--owner <name>` | owner written into frontmatter | `git config user.name` |
| `--lang <language>` | language of the project content; the framework text stays English | `English` |
| `--yes` | accept every default, never prompt | |
| `--dry-run` | print the plan, change nothing | |
| `--force` | run again on an initialized project | |

Example: `npm run init -- --yes --name "Habit Tracker" --tier lite --app flutter --db supabase --tools claude,kiro`.

Placeholders init cannot fill (the PRD body, the architecture overview, the handoff) are listed at the end as `fill manually: path:line`; they are warnings while the document's `status` is `draft` and errors afterwards. Presets live in `scripts/init/presets/` (schema in its README); a database preset also creates `database.md` in `docs/steering/` with `inclusion: fileMatch`.

## Operating model

```text
idea -> product requirements -> architecture baseline
  -> feature requirements -> system architecture (full tier) -> design
  -> tasks -> implementation -> verification (evidence) -> review -> release
```

The sequence is a default, not bureaucracy. Depth scales with the tier.

## Principles

- Specification before non-trivial implementation.
- Repository artifacts are the durable truth; chat history and provider memory are not.
- Minimum sufficient context: a session starts from `docs/context/BRIEF.md` and loads only what the task references.
- Small, verifiable changes. One task at a time.
- Evidence over confidence: a task is `done` only with recorded command output.
- Unknowns are logged in `docs/context/ASSUMPTIONS.md`, never guessed.
- Architecture is a constraint; distributed mechanisms need a workload justification.
- High-impact decisions (contracts, destructive data changes, security, production, major dependencies) need human approval.

## Tiers

| Tier | When | Documents |
|---|---|---|
| `lite` (default) | isolated, low-risk, reversible work | `requirements`, `design`, `tasks`, `verification`, each within 80 lines. `init` removes `system-architecture.md`, `architecture-baseline.md`, the `runbooks/` directory, `test-strategy.md`, and the two modularization guides |
| `full` | shared state, realtime or async communication, external integration, security boundary, scale or cost | adds `system-architecture.md` (within 300 lines) and the sections marked `<!-- full-tier -->` (within 200 lines); keeps every document |

## Repository layout

```text
.
├── AGENTS.md                  # repository contract; rendered from docs/steering by adapters:sync
├── CLAUDE.md                  # Claude Code adapter; rendered, imports AGENTS.md
├── .claude/                   # settings.json (hooks) and commands/sdd/ (slash commands)
├── sdd.config.json            # project, stack, tools, paths, generated and frozen lists, limits
├── docs/
│   ├── steering/              # canonical: product, tech, structure, rules, workflow (+ database after init)
│   ├── _templates/            # project-level templates
│   ├── specs/
│   │   ├── _templates/        # per-feature templates
│   │   └── F-XXX-name/        # one feature package
│   ├── adr/                   # one decision per record
│   ├── architecture/          # cross-feature boundaries and invariants
│   ├── product/               # PRD, roadmap, glossary
│   ├── context/               # BRIEF, ASSUMPTIONS, rendered state and views, protocols
│   ├── handoff/               # session delta and archive
│   ├── quality/               # definition of done, review checklist, test strategy
│   ├── runbooks/              # local development, data store changes, deployment, recovery
│   ├── documentation/         # how docs are split and owned
│   └── automation/            # the context commands
├── examples/todo-api/         # fully filled lite project; reference and test fixture (removed by init)
└── scripts/                   # context/ (render, validate, archive), adapters/ (sync), hooks/, init/ (presets), lib/; __fixtures__/ test repos
```

## Templates

Every template carries mandatory frontmatter (`id`, `title`, `type`, `status`, `tier`, `owner`, dates, `supersedes`). Placeholders are `{{SNAKE_CASE}}`; `{{PRESET_*}}` ones are filled by `init`. Copy a template, replace placeholders with verified facts, remove sections that do not apply, then commit it in its canonical location.

Per feature, in `docs/specs/_templates/`:

| Template | Owns |
|---|---|
| [`requirements.md`](docs/specs/_templates/requirements.md) | observable behavior, FR and AC ids, out of scope |
| [`system-architecture.md`](docs/specs/_templates/system-architecture.md) | module boundaries, data, consistency, communication, scale, resilience, security, trade-offs (full tier) |
| [`design.md`](docs/specs/_templates/design.md) | repository mapping of approved requirements and architecture |
| [`tasks.md`](docs/specs/_templates/tasks.md) | parseable `T-XXX` blocks; the master for task status |
| [`verification.md`](docs/specs/_templates/verification.md) | parseable `EV-XXX` evidence blocks covering AC ids |

Project level, in `docs/_templates/`:

| Template | Owns |
|---|---|
| [`prd.md`](docs/_templates/prd.md) | product intent, goals, actors, success signals, feature map |
| [`constitution.md`](docs/_templates/constitution.md) | durable principles and governance behind the steering rules |
| [`architecture-baseline.md`](docs/_templates/architecture-baseline.md) | cross-feature boundaries, data flow, state ownership, security, deployment (full tier) |
| [`adr.md`](docs/_templates/adr.md) | one expensive-to-reverse decision |
| [`task-prompt.md`](docs/_templates/task-prompt.md) | minimum-sufficient context package for a coding agent |
| [`bug-investigation.md`](docs/_templates/bug-investigation.md) | evidence-first root-cause investigation |
| [`code-review.md`](docs/_templates/code-review.md) | correctness, architecture, security, and scope review with `CR-XXX` findings |

## Steering

`docs/steering/` is the canonical source of project rules, Kiro-style with `inclusion: always | fileMatch | manual` frontmatter: `product.md`, `tech.md`, `structure.md`, `rules.md`, `workflow.md`, plus `database.md` (`fileMatch`) when a database preset was chosen. `AGENTS.md` and the tool adapters listed in `sdd.config.json` `tools` are rendered from it by `npm run adapters:sync`; the validator fails when they are stale. Claude Code hooks and `/sdd:*` commands are described in `docs/automation/README.md`.

## Context system

`tasks.md` is the master for task status. `docs/context/state.yaml`, `BRIEF.md`, `PROJECT_STATE.md`, and `PROGRESS.md` are rendered by `npm run context:render` and never hand-edited; the validator fails when they are stale. Read `docs/context/CONTEXT_SYSTEM.md` for the model and `docs/context/NEW_CHAT_PROTOCOL.md` for the opening prompt and fallback read order.

Commands:

```bash
npm install
npm run init                  # interactive; flags above; --dry-run, --yes, --force
npm test                      # node --test scripts/**/*.test.mjs
npm run context:render        # state.yaml, BRIEF.md, PROJECT_STATE.md, PROGRESS.md; --check, --quiet
npm run context:validate      # structure, ids, traceability, evidence, staleness, freshness; --strict
npm run adapters:sync         # AGENTS.md, CLAUDE.md, and adapters for the tools in sdd.config.json; --check, --all, --quiet
npm run context:archive-handoff
npm run example:validate      # validates examples/todo-api on its own
```

## After init

1. Review `docs/steering/tech.md` and `structure.md` against the real repository: every command listed must run.
2. Write `docs/product/prd.md` (init filled its frontmatter) and set its `status` past `draft` once approved; the validator then treats its remaining placeholders as errors.
3. Record expensive-to-reverse choices as ADRs. In the `full` tier, write the architecture baseline from `docs/_templates/architecture-baseline.md`.
4. Select the first vertical slice and create `docs/specs/F-XXX-name/` from the per-feature templates.
5. Implement one task at a time; record evidence; update `tasks.md` and `docs/handoff/current.md`; run `npm run context:render`, then `npm run context:validate`. After a steering change, `npm run adapters:sync` (the Claude Code PostToolUse hook does both).

Do not create every document before the first useful slice.

## Example

`examples/todo-api/` is a complete `lite` project (`node-api` + `postgres`): one feature `implemented` with evidence, one `implementing` with an open assumption and an active handoff, rendered views and adapters; `examples/README.md` says what it is for. Use `examples/todo-api/` as the answer to "how filled should this file be"; `npm test` validates it, and `init` removes `examples/` from a new project.

## AI collaboration

A conversational AI drafts requirements, architecture alternatives, design, tasks, and ADR proposals; its output is a proposal until committed. A repository-integrated coding agent inspects real code, implements approved tasks, runs verification, and updates evidence and handoff. Neither invents paths, APIs, schema fields, or commands. See `docs/documentation/AI_COLLABORATION_MODEL.md`.

## Migration from v1

v2 is a fresh design for new projects. Projects on v1 of this template stay on v1 until migrated deliberately; a migration guide ships with 2.0.0.

## Philosophy

```text
clear requirements
+ minimum sufficient context
+ explicit global architecture
+ explicit module architecture when meaningful
+ bounded tasks and small changes
+ evidence-based verification
+ current durable documentation
+ human control of high-impact decisions
```

Not maximum document count, maximum distributed-system complexity, or maximum AI autonomy.
