# AI-Assisted SDD Project Template

A repository template for spec-driven, context-efficient, evidence-based software engineering with AI coding agents. Stack-agnostic: web, mobile (Flutter, Kotlin, React Native), and server projects with any data store use the same documents.

Version 2 is in progress; see `CHANGELOG.md` and `docs/adr/ADR-0001-v2-revamp.md`. Phase 1 (this state) ships the single template family, steering, and config. Rendering, adapters, hooks, and `init` with presets are available from 2.0.0.

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
| `lite` (default) | isolated, low-risk, reversible work | `requirements`, `design`, `tasks`, `verification`, each within 80 lines |
| `full` | shared state, realtime or async communication, external integration, security boundary, scale or cost | adds `system-architecture.md` (within 300 lines) and the sections marked `<!-- full-tier -->` (within 200 lines) |

## Repository layout

```text
.
├── AGENTS.md                  # short contract; generated from steering in 2.0.0
├── CLAUDE.md                  # Claude Code adapter
├── sdd.config.json            # project, stack, tools, paths, generated and frozen lists, limits
├── docs/
│   ├── steering/              # canonical: product, tech, structure, rules, workflow
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
└── scripts/context/           # validate, refresh git facts, archive handoff
```

## Templates

Every template carries mandatory frontmatter (`id`, `title`, `type`, `status`, `tier`, `owner`, dates, `supersedes`). Placeholders are `{{SNAKE_CASE}}`. Copy a template, replace placeholders with verified facts, remove sections that do not apply, then commit it in its canonical location.

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
| [`architecture-baseline.md`](docs/_templates/architecture-baseline.md) | cross-feature boundaries, data flow, state ownership, security, deployment |
| [`adr.md`](docs/_templates/adr.md) | one expensive-to-reverse decision |
| [`task-prompt.md`](docs/_templates/task-prompt.md) | minimum-sufficient context package for a coding agent |
| [`bug-investigation.md`](docs/_templates/bug-investigation.md) | evidence-first root-cause investigation |
| [`code-review.md`](docs/_templates/code-review.md) | correctness, architecture, security, and scope review with `CR-XXX` findings |

## Steering

`docs/steering/` is the canonical source of project rules, Kiro-style with `inclusion: always | fileMatch | manual` frontmatter: `product.md`, `tech.md`, `structure.md`, `rules.md`, `workflow.md`. `AGENTS.md` and tool adapters are rendered from it (available from 2.0.0); until then `AGENTS.md` is kept in sync by hand.

## Context system

`tasks.md` is the master for task status. `docs/context/state.yaml`, `BRIEF.md`, `PROJECT_STATE.md`, and `PROGRESS.md` are rendered views (available from 2.0.0) and never hand-edited. Read `docs/context/CONTEXT_SYSTEM.md` for the model and `docs/context/NEW_CHAT_PROTOCOL.md` for the opening prompt and fallback read order.

Commands available now:

```bash
npm install
npm test                      # node --test scripts/**/*.test.mjs
npm run context:validate      # required files, ids, statuses, links, banners
npm run context:refresh       # git facts block in PROJECT_STATE.md
npm run context:archive-handoff
```

## Starting a new project

1. Fill `docs/steering/product.md`, `tech.md`, and `structure.md` from the real repository. Set `sdd.config.json` (`project`, `stack`, `tools`, `frozen`). `init` with app and database presets is available from 2.0.0.
2. Write `docs/product/prd.md` from `docs/_templates/prd.md`; add a constitution when governance warrants it.
3. Record expensive-to-reverse choices as ADRs; write the architecture baseline from `docs/_templates/architecture-baseline.md`.
4. Keep `AGENTS.md` in sync with steering by hand.
5. Select the first vertical slice and create `docs/specs/F-001-name/` from the per-feature templates at the right tier.
6. Implement one task at a time; record evidence; update `tasks.md` and `docs/handoff/current.md`; run `npm run context:validate`.
7. Set `templateMode` to `false` in `sdd.config.json` once core placeholders are filled.

Do not create every document before the first useful slice.

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
