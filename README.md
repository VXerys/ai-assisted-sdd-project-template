# AI-Assisted SDD Project Template

A repository template for spec-driven development with AI coding agents. Stack-agnostic: web, mobile (Flutter, Kotlin, React Native), and server projects with any data store use the same documents. Version 2.0.0; see [`CHANGELOG.md`](CHANGELOG.md) and [ADR-0001](docs/adr/ADR-0001-v2-revamp.md).

## Spec-driven development, in short

1. A feature starts as a specification: observable requirements with `FR` and `AC` ids, a design that maps them onto the repository, and tasks with ids.
2. An agent implements one task at a time and records command output as evidence against the acceptance criteria.
3. A task is `done` only with evidence; a feature is `implemented` only when every task is done or deferred and no assumption is open.
4. Project rules live in five steering files. Every tool adapter and every context view is rendered from them, never written by hand.
5. Unknowns are logged as assumptions instead of guessed.
6. Each session starts from one rendered brief and loads only what the task references.
7. Decisions that are expensive to reverse get an ADR.
8. The validator fails on a stale render, a missing evidence id, an unresolved placeholder, or a path that does not exist.
9. Chat history and provider memory are never a source of truth; the repository is.
10. Depth scales with a tier: `lite` by default, `full` when the feature has system concerns.

## The model

```text
hand-edited sources                                rendered (never hand-edited)
docs/steering/{product,tech,structure,rules,        docs/context/state.yaml    machine-readable, source_hash
               workflow}.md                         docs/context/BRIEF.md      single session entry point
docs/specs/F-XXX/{requirements,design,tasks,        docs/context/PROJECT_STATE.md
                  verification}.md                  docs/context/PROGRESS.md
docs/context/ASSUMPTIONS.md                  context:render
docs/handoff/current.md               ------------------------->

docs/steering/*.md + sdd.config.json         adapters:sync        AGENTS.md            Codex, Antigravity
                                      ------------------------->  CLAUDE.md + hooks    Claude Code
                                                                  .cursor/rules/*.mdc  Cursor
                                                                  .github/copilot-instructions.md  Copilot
                                                                  GEMINI.md            Gemini CLI
                                                                  .kiro/steering/*.md  Kiro
```

`tasks.md` is the master for task status. `state.yaml`, `BRIEF.md`, `PROJECT_STATE.md`, and `PROGRESS.md` are rendered from it, the steering files, the assumptions log, and the handoff. `AGENTS.md` and the tool adapters are rendered from the steering files and `sdd.config.json`. The validator fails when any rendered file differs from a clean render.

## Quick start

1. Click "Use this template" on GitHub and clone the new repository.
2. `npm install`
3. `npm run init`, answer the prompts (or pass flags), and read the plan it prints.

`init` writes `sdd.config.json`, fills the steering and project documents from your answers and the presets, prunes the documents your tier does not use, removes template-only files, replaces the template CI with a workflow that runs the app preset's commands and strict context validation, then renders the context views, syncs the tool adapters, and validates. `--dry-run` prints the plan and changes nothing; `--yes` takes every default; `--force` re-runs on an initialized project.

| Flag | Values | Default |
|---|---|---|
| `--name <text>` | project name | the directory name |
| `--description <text>` | one sentence: what it is, for whom, the outcome | `<name> is a <app> project.` |
| `--tier lite\|full` | documentation tier | `lite` |
| `--app <preset>` | `nextjs`, `react-native`, `flutter`, `kotlin-android`, `node-api`, `python-api`, `generic` | `generic` |
| `--db <preset>` | `supabase`, `firebase`, `postgres`, `mysql`, `sqlite-drift`, `mongodb`, `none` | `none` |
| `--tools <list>` | comma-separated: `claude`, `codex`, `cursor`, `copilot`, `gemini`, `kiro`, `antigravity` | `claude` |
| `--owner <name>` | owner written into frontmatter | `git config user.name` |
| `--lang <language>` | language of the project content; the framework text stays English | `English` |

Example: `npm run init -- --yes --name "Habit Tracker" --tier lite --app flutter --db supabase --tools claude,kiro`.

After init: review `docs/steering/tech.md` and `structure.md` against the real repository (every command listed must run, and `.github/workflows/context-integrity.yml` runs them in CI), write `docs/product/prd.md`, record expensive-to-reverse choices as ADRs, create the first feature from `docs/specs/_templates/`, and implement one task at a time. Do not write every document before the first useful slice.

## Daily workflow

1. Start from `docs/context/BRIEF.md`: active feature and task, open assumptions, blockers, next step. The Claude Code SessionStart hook injects it; other tools read it through `AGENTS.md`. When the brief is absent, `docs/context/NEW_CHAT_PROTOCOL.md` gives the fallback read order.
2. Take the task the brief names. In Claude Code, `/sdd:task T-XXX` builds the task prompt from the brief and the spec, sets the task `in_progress`, and implements it. Elsewhere, fill `docs/_templates/task-prompt.md` by hand.
3. Run the commands in `docs/steering/tech.md` and record each result as an EV block in the feature's `verification.md`; add the id to the task's `evidence`.
4. Update `tasks.md`, then `npm run context:render` and `npm run context:validate`. The Claude Code PostToolUse hook re-renders after spec edits; the PreToolUse hook denies edits to generated and frozen paths, also through Bash or PowerShell, and refuses any access to secret files.
5. Close the session with `docs/handoff/current.md`: changed files, commands, uncommitted work, one exact next step. In Claude Code, `/sdd:handoff` writes it; `/sdd:review` fills the code-review template, `/sdd:bug` opens a bug investigation, `/sdd:converge` turns the gaps between code and acceptance criteria into tasks, `/sdd:adopt` onboards an existing codebase, `/sdd:render` runs the three context commands.

## Commands

| Command | Does |
|---|---|
| `npm run init` | turns the template into a project; flags above, `--dry-run`, `--yes`, `--force` |
| `npm run context:render` | writes `state.yaml`, `BRIEF.md`, `PROJECT_STATE.md`, `PROGRESS.md`; `--check` exits 1 when a view would change |
| `npm run context:validate` | structure, ids, traceability, evidence, staleness, rendered-view freshness, adapter freshness; `--strict` turns warnings into errors |
| `npm run context:archive-handoff` | archives an active handoff under `docs/handoff/archive/` and resets `current.md` |
| `npm run adapters:sync` | writes `AGENTS.md` and the adapters for the tools in `sdd.config.json`; `--check`, `--all` |
| `npm run example:validate` | validates `examples/todo-api` on its own |
| `npm test` | `node --test scripts/**/*.test.mjs`; in the template, `test:unit` and `test:e2e` run the two halves |
| `npm run sdd -- brief` | prints the session brief; sessions without hooks run it first |
| `npm run sdd -- guard --check` | fails when the diff against the base branch touches a secret or frozen path; warns on SDD configuration (`--strict` fails) |
| `npm run sdd -- status` | lists managed files edited since the last `init` or upgrade (`.sdd/manifest.json`) |
| `npm run sdd -- check --from <template>` | exits 1 when the template checkout has a newer version |
| `npm run sdd -- upgrade --from <template>` | 3-way merges a newer template into the project; `--dry-run`, `--to <ref>`, `--conflict inline\|rej` |

Details, hooks, and slash commands: `docs/automation/README.md`. The validator checks and the context model: `docs/context/CONTEXT_SYSTEM.md`.

## Tiers

| Tier | When | Documents |
|---|---|---|
| `lite` (default) | isolated, low-risk, reversible work | `requirements`, `design`, `tasks`, `verification`, each within 80 lines. `init` removes `system-architecture.md`, `architecture-baseline.md`, `docs/runbooks/`, `test-strategy.md`, and the two modularization guides |
| `full` | shared state, realtime or async communication, external integration, security boundary, scale or cost | adds `system-architecture.md` (within 300 lines) and the sections marked `<!-- full-tier -->` (within 200 lines); keeps every document |

## Tool support

| Tool | What it gets | Rendered from |
|---|---|---|
| Claude Code | `CLAUDE.md` (imports `AGENTS.md`), `.claude/rules/<name>.md` (other `always` files without `paths`, `fileMatch` files with `paths`), four hooks in `.claude/settings.json` (SessionStart injects the brief and installs the tooling in a cloud session, PreToolUse guards generated, frozen, protected, and secret paths including Bash and PowerShell commands, PostToolUse re-renders, Stop warns when the handoff is stale), `/sdd:task`, `/sdd:bug`, `/sdd:review`, `/sdd:converge`, `/sdd:adopt`, `/sdd:handoff`, `/sdd:render` | steering, `.claude/` |
| Codex, Antigravity | `AGENTS.md` | steering, `sdd.config.json` |
| Cursor | `AGENTS.md` plus `.cursor/rules/<name>.mdc` for every steering file not inlined in it, with `globs` for `fileMatch` files | steering |
| GitHub Copilot | `AGENTS.md`, a short `.github/copilot-instructions.md`, and `.github/instructions/<name>.instructions.md` with `applyTo` | steering |
| Gemini CLI | `GEMINI.md` (imports `AGENTS.md`) | steering |
| Kiro | `AGENTS.md` plus `.kiro/steering/<name>.md` for every steering file not inlined in it, verbatim | steering |

`AGENTS.md` inlines only `rules.md` and `tech.md` (target 150 lines): every tool above reads it natively, so a tool's own files carry only the rest, and nothing loads twice (ADR-0003).

## Upgrading a project

`init` records the template version, commit, and your answers in `sdd.config.json` (`template`) and the hash of every managed file in `.sdd/manifest.json`. To take a newer template release:

1. Clone or fetch this template repository somewhere with its tags.
2. In the project, with a clean working tree: `npm run sdd -- check --from ../ai-assisted-sdd-project-template`, then `npm run sdd -- upgrade --from ../ai-assisted-sdd-project-template --dry-run`, then without `--dry-run`.
3. Upgrade rebuilds the old and the new template output from your recorded answers, takes the new file where you never edited it, 3-way merges where you did, and leaves conflict markers (or `<file>.rej` with `--conflict rej`). It never touches steering, specs, product documents, ADRs, the handoff, or assumptions. It then renders, syncs, and validates.

A project initialized before 2.1.0 has no `template` record: pass `--base-ref v2.0.0 --answers answers.json` (name, description, tier, app, db, tools, owner, lang, date). The managed list can be replaced with `managed` in `sdd.config.json`.

Distribution: the tooling ships inside this template until it is extracted to the `@vxerys/sdd` package (ADR-0003). A project that depends on it from a GitHub tag needs `allow-git=root` in its `.npmrc`, because npm 12 blocks git dependencies by default.

Steering files carry `inclusion: always | fileMatch | manual` frontmatter; a database preset adds a `database.md` steering file with `fileMatch`, which Claude Code surfaces once per session when a matching file is edited.

## Repository layout

```text
.
├── AGENTS.md, CLAUDE.md        # rendered by adapters:sync
├── .claude/                    # settings.json (hooks), commands/sdd/ (slash commands)
├── sdd.config.json             # project, stack, tools, paths, generated and frozen lists, limits
├── docs/
│   ├── steering/               # canonical: product, tech, structure, rules, workflow (+ database)
│   ├── _templates/             # prd, constitution, architecture-baseline, adr, task-prompt, bug-investigation, code-review
│   ├── specs/_templates/       # requirements, system-architecture, design, tasks, verification
│   ├── specs/F-XXX-name/       # one feature package
│   ├── adr/, architecture/, product/, quality/, runbooks/, documentation/
│   ├── context/                # BRIEF, ASSUMPTIONS, rendered state and views, protocols
│   └── handoff/                # current.md and archive/
├── examples/todo-api/          # filled lite project; reference and test fixture (removed by init)
└── scripts/                    # context/, adapters/, hooks/, init/ (presets/), migrate/, lib/
```

Every template carries frontmatter (`id`, `title`, `type`, `status`, `tier`, `owner`, dates, `supersedes`). `init` fills the placeholders it can (project name, owner, dates, preset values); the remaining prose is guidance to replace with verified facts.

## Example

[`examples/todo-api/`](examples/todo-api/) is a complete `lite` project (`node-api` + `postgres`): one feature `implemented` with evidence, one `implementing` with an open assumption and an active handoff, rendered views and adapters. Open the same file there when a template leaves you unsure how filled a section should be. `npm test` validates it; `init` removes it from a new project.

## Migrating from v1

v2 is a fresh design. A project on v1 of this template stays on v1 until migrated deliberately; [`docs/MIGRATION-v1-to-v2.md`](docs/MIGRATION-v1-to-v2.md) is the step-by-step guide, with `scripts/migrate/v1-tasks.mjs` for the task files.

## AI collaboration

A conversational AI drafts requirements, architecture alternatives, design, tasks, and ADR proposals; its output is a proposal until committed. A repository-integrated coding agent inspects real code, implements approved tasks, runs verification, and updates evidence and handoff. Neither invents paths, APIs, schema fields, or commands. See `docs/documentation/AI_COLLABORATION_MODEL.md`.

## License

MIT, see `LICENSE`. `init` removes the template's license, security policy, code owners, and release pipeline, so a project chooses its own.
