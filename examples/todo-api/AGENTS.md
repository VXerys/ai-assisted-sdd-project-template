<!-- GENERATED FILE — DO NOT EDIT. Rendered by `npm run adapters:sync`.
Source: docs/steering/, sdd.config.json.
source_hash: a2b445c205530343119f5b518cd1f56ccf2a882bd976cd850f3797972ebe66c7 -->

# Repository contract: Todo API

Todo API is a JSON API for small teams that keeps one shared todo list consistent across a CLI and a web client.

Rendered from `docs/steering/` and `sdd.config.json` for humans and coding agents. Edit the steering files, then run `npm run adapters:sync`.

## Read first

1. `docs/context/BRIEF.md` (single entry point; rendered, never hand-edited)
2. `docs/steering/rules.md`, `docs/steering/tech.md`, `docs/steering/structure.md`, `docs/steering/workflow.md`, `docs/steering/product.md`
3. The active feature under `docs/specs/`: `tasks.md`, then the sections it references

Fallback when `BRIEF.md` is absent: `docs/context/NEW_CHAT_PROTOCOL.md`.

## Source of truth

| Question | Source |
|---|---|
| Product intent | `docs/steering/product.md`, `docs/product/prd.md` |
| Stack and commands | `docs/steering/tech.md` |
| Directory and dependency rules | `docs/steering/structure.md` |
| Engineering and security rules | `docs/steering/rules.md` |
| Lifecycle and status vocabulary | `docs/steering/workflow.md` |
| Shared architecture | `docs/architecture/` |
| Decisions | `docs/adr/` |
| Feature behavior, design, tasks, evidence | `docs/specs/F-XXX-name/` |
| Task status | `docs/specs/F-XXX-name/tasks.md` (master) |
| Unknowns | `docs/context/ASSUMPTIONS.md` |
| Session delta | `docs/handoff/current.md` |
| Current behavior | code, tests, schema, configuration |

Chat history and provider memory are never a source of truth.

## Read-only paths

Generated (edit the sources, then run `npm run context:render` or `npm run adapters:sync`): `docs/context/state.yaml`, `docs/context/PROJECT_STATE.md`, `docs/context/PROGRESS.md`, `docs/context/BRIEF.md`, `AGENTS.md`, `CLAUDE.md`

Frozen (explicit owner approval required): `db/migrations/`

## Rules

Engineering rules every agent and contributor applies. The lifecycle is in `workflow.md`.

### Engineering

- Follow existing project patterns before introducing a new abstraction.
- Keep the change inside the selected task. Discovered work becomes a new task in `tasks.md`, not a silent extension.
- Inspect the repository before asserting a path, API, schema field, command, or framework behavior. Never invent one.
- Preserve existing behavior and contracts unless the referenced spec changes them.
- Add or update tests for changed behavior. Never weaken or disable a test to make a check pass.
- Comments explain why, not what. No decorative banners or separator comments.
- Treat generated and frozen paths from `sdd.config.json` as read-only.

### Evidence before claims

- "Done" means: lint and test commands from `tech.md` ran, and their output is recorded as EV blocks in the feature's `verification.md`.
- A check that could not run is reported with the reason and residual risk. It is never reported as passed.
- A task reaches `done` only with at least one evidence id. A feature reaches `implemented` only with every task `done` or `deferred` and no `open` assumption.

### Unknowns

Log an unknown in `docs/context/ASSUMPTIONS.md` as `A-XXX` with `status: open` instead of guessing. Continue only on work the assumption does not affect; mark the affected task `blocked`.

### Prohibited without explicit owner approval

- Changing the shape of a `/todos` response or error code.
- Destructive data operations: drop, mass delete, reset, backfill with unknown impact, editing an applied migration.
- Adding a dependency outside the policy in `tech.md`.
- Importing `pg` or Fastify outside the layer that owns it (`structure.md`).
- Changing the production compose file, credentials, or configuration.
- Force push, history rewrite, or any git operation that can destroy work.
- Editing a generated or frozen path.
- Deploying or sending messages on the owner's behalf.

### Stop conditions

Stop and report, instead of implementing, when the task would require any prohibited action above, when two sources of truth conflict, when a blocking assumption is open, or when a required command is unavailable.

### Data and security

- No secrets in the repository. Never read, print, or commit `.env*` or store credentials.
- Every request carries the team `API_KEY` in `Authorization: Bearer`; the check lives in one Fastify hook, never per route.
- Validate untrusted input at the boundary with the route's JSON schema. Titles are never logged.
- Data store changes are versioned, append-only, reviewed, and reversible or explicitly accepted as forward-only.
- Project-specific rule: `closed_at` is set only by the close service; no other code path writes it.

### Source of truth and conflicts

Requirements own behavior, design owns the repository mapping, `tasks.md` owns task status, code and tests own current behavior, `tech.md` owns commands. Chat history and provider memory are never a source of truth.

When sources conflict: stop the affected work, name both sources, inspect code and git, propose the smallest correction, get approval for product, architecture, security, or data changes, update the canonical source, then continue.

## Tech

Stack and commands. Filled by `npm run init` from the `node-api` and `postgres` presets, then checked against the repository. A command listed here exists and runs.

### Stack

| Concern | Technology | Reason or constraint |
|---|---|---|
| Language and runtime | JavaScript (ESM) on Node 22 | no TypeScript in M1; JSDoc types only |
| Application framework | Node.js API on Fastify 5 | schema validation at the route boundary |
| Data store | PostgreSQL 16 | shared state across machines, see ADR-0001 |
| Source and test paths | `src/**`, `test/**` | globs used by `fileMatch` steering rules |
| Test framework | `node:test` with `supertest` | no extra runner |
| Deployment target | one container on the team server | `docker compose up` in production and locally |

### Commands

Run these before claiming any task done. Report a command that cannot run; never claim its success.

| Purpose | Command |
|---|---|
| Install | `npm ci` |
| Analyze or lint | `npx eslint .` |
| Typecheck | `none` |
| Format check | `npx prettier --check .` |
| Test | `npm test` |
| Build | `none` |
| Run locally | `npm run dev` |
| Data store change check | `psql "$DATABASE_URL" -f db/migrations/<file>.sql` |
| Context validation | `npm run context:validate` |

`npm test` needs a reachable PostgreSQL at `DATABASE_URL`; `docker compose up -d db` provides one locally.

### Stack rules

- Every request body and query is validated at the route boundary; services receive typed input only.
- Errors map to HTTP status codes in one place (`src/routes/errors.js`); handlers never leak stack traces or driver messages.
- Configuration comes from the environment; the process fails fast on a missing `DATABASE_URL`.
- `npx eslint .` clean and `npm test` green before a task is done.

### Environment and secrets

- `DATABASE_URL` and `API_KEY` come from the environment; `.env` is gitignored and `.env.example` lists the names without values.
- Agents never read, print, or commit `.env*`.

### Dependency policy

Before adding or replacing a dependency, state the problem it solves, the native alternative considered, maintenance health, runtime impact, and license. Approval rule: the owner approves every new or replaced dependency; record the approval in the task that adds it. Current runtime dependencies: `fastify`, `pg`.

### Data store changes

Schema changes are versioned SQL files under `db/migrations/`, reviewed like code. Append-only; destructive changes need explicit approval. The store's own rules are in the `database.md` steering file.

## Structure

Where things live and which direction dependencies point.

### Directory responsibilities

| Path | Responsibility | Rule |
|---|---|---|
| `docs/steering/` | canonical project rules, product, stack, structure, workflow | edit by hand; `AGENTS.md` and `CLAUDE.md` are rendered from it by `npm run adapters:sync` |
| `docs/specs/F-XXX-name/` | one feature: requirements, design, tasks, verification | `tasks.md` is the master for task status |
| `docs/adr/` | one decision per record | approved ADRs are never rewritten |
| `docs/architecture/` | cross-feature boundaries and invariants | module reasoning stays in the feature |
| `docs/context/` | rendered state, brief, assumptions log | only `ASSUMPTIONS.md` is hand-edited |
| `docs/handoff/current.md` | session delta | updated at the end of every implementation session |
| `src/routes/` | HTTP routing and request validation | no business logic; parse, validate, delegate, map errors |
| `src/services/` | use cases and domain rules | framework-free; depends on `src/db/` through the repository functions |
| `src/db/` | data access and the migration runner | the only module that imports `pg` |
| `db/migrations/` | versioned SQL migrations | frozen: a new file per change, applied files are never edited |
| `test/` | unit and HTTP tests | mirrors `src/`; one file per route |

### Generated paths

Never hand-edit. Listed in `sdd.config.json` under `generated`:

- `docs/context/state.yaml`, `docs/context/PROJECT_STATE.md`, `docs/context/PROGRESS.md`, `docs/context/BRIEF.md`
- `AGENTS.md`, `CLAUDE.md`
- Project-specific generated code: none

### Frozen paths

Listed in `sdd.config.json` under `frozen`. Edits need explicit owner approval.

- `db/migrations/`: applied migrations; add a new file instead of editing one

### Dependency direction

```text
routes -> services -> db
```

- `services/` never imports Fastify or `pg`; it receives plain objects and returns plain objects or throws a typed error from `src/services/errors.js`.
- `routes/` is the only layer that knows HTTP; `db/` is the only layer that knows SQL.
- Project-specific rule: a route handler is at most 20 lines; anything longer moves into a service.

### Naming

- Features: `F-001-short-name`. Tasks: `T-001`. Evidence: `EV-001`. Assumptions: `A-001`. ADRs: `ADR-0001-short-name.md`.
- Files are `kebab-case.js`; exported functions are `camelCase`; SQL identifiers are `snake_case`.

## Workflow

The spec-driven lifecycle from session start to handoff.

### Start a session

1. Read `docs/context/BRIEF.md`. It is the single entry point: active feature and task, open assumptions, blockers, next action.
2. If `BRIEF.md` is absent or stale, read in this order: `docs/steering/*.md`, `docs/handoff/current.md`, the active feature's `tasks.md`, then its `requirements.md` and `design.md`.
3. Confirm branch and worktree match the handoff before editing anything.

### Pick a task

- Take the task the brief names, or the first `planned` task whose `depends_on` are all `done`.
- Read only the FR ids and design sections the task references, plus the code it touches.
- Set `status: in_progress` in `tasks.md`. One task in progress per session. In Claude Code, `/sdd:task T-XXX` builds the task prompt from the brief and the spec and follows it.

### Status transitions

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

### Evidence

Every check runs through the commands in `tech.md` and is recorded as an EV block in `verification.md` with command, output excerpt, date, commit, and the AC ids it covers. Claims without evidence are not accepted at review.

### Close a session

1. Review `git diff` and `git status`.
2. Run `npx eslint .` and `npm test`; record evidence.
3. Update task status in `tasks.md`; run `npm run context:render`, then `npm run context:validate`. After a steering or `sdd.config.json` change, also `npm run adapters:sync`.
4. Update `docs/handoff/current.md`: objective, changed files, commands and results, uncommitted work, blockers, exact next step. In Claude Code, `/sdd:handoff` writes it and runs render and validate.
5. Report the next task.

### When to write an ADR

Write one in `docs/adr/` when a decision is expensive to reverse, changes a boundary or trust model, introduces or replaces a framework, provider, store, or major dependency, changes a public contract, or will be questioned later. One decision per ADR; supersede, never rewrite.

### Tiers

This project is `lite`: requirements, design, tasks, verification, each within 80 lines. Move a feature to `full` when it gains shared state beyond the todos table, async communication, an external integration, or a security boundary.

## Product

Short, always-loaded product context. The full product requirements live in `docs/product/prd.md`; this file agrees with it.

### Vision

Todo API is a JSON API for small teams that keeps one shared todo list consistent across a CLI and a web client.

Two people editing the same list from different machines currently overwrite each other's `todo.json`. Working means: every client reads and writes the same list through the API, and a todo closed on one machine disappears from the other within one refresh. Project content (specs, product docs, API messages) is written in English; the framework text stays English.

### Personas

- Maintainer: runs the team list from a terminal; creates and closes todos several times a day; expects a request to finish in under 200 ms.
- Reviewer: opens the web client once a day to see what is still open; never edits from the browser in this milestone.

### Core use cases

- UC-001: Maintainer, runs `todo add "Rotate the staging key"`, the CLI calls `POST /todos` and prints the new id.
- UC-002: Reviewer, opens the web client, `GET /todos` returns open todos newest first.
- UC-003: Maintainer, runs `todo close 42`, the CLI calls `PATCH /todos/42/close`; the todo leaves every client's default list.

### Non-goals

- Authentication and per-user lists: one team, one list, one API key held by both clients.
- Recurring todos, due dates, assignees, comments.
- A web client that edits; the browser is read-only in M1.

### Success signals

| Signal | What it tells us | Source |
|---|---|---|
| zero reports of a lost todo after two weeks of team use | the shared store replaced the overwritten file | team retro notes |
| p95 latency of `GET /todos` under 200 ms with 500 todos | the list stays usable from the CLI | `request_duration_ms` log field |

### Constraints that shape product decisions

- The CLI must keep working offline for reads: it caches the last list locally and shows it with a `stale` marker.
- No personal data beyond free-text titles; titles are never logged.

## Conditional rules

Apply the section when the edited path matches its pattern.

### Database: PostgreSQL (`docs/steering/database.md`) applies to `db/**`, `src/db/**`

Rules for every change under `db/**`, `src/db/**`. Generated by `npm run init` from the `postgres` preset, then extended by the team.

- Migration tool: versioned SQL files applied by `src/db/migrate.js`
- Apply locally: `npm run db:migrate` (runs every unapplied file in `db/migrations/` inside one transaction each)
- Migration files: `db/migrations/<YYYYMMDDHHMM>_<name>.sql`

#### Rules

- Every change is a new timestamped SQL file wrapped in `BEGIN; ... COMMIT;`; an applied migration is never edited.
- Applied versions are tracked in the `schema_migrations` table written by `src/db/migrate.js`.
- Authorization is enforced with one database role per environment (`todo_app`), which owns no DDL; migrations run as `todo_migrator`. No Row Level Security: the API is single-tenant.
- Destructive changes (drop, type narrowing) need owner approval and a `pg_dump` first; backfills run in batches of 1,000 rows with a progress query.
- The connection string comes from `DATABASE_URL` and is never committed.
- Every column that the API reads has a test that inserts through the API and reads through `psql`, so a migration that drifts from the service is caught by `npm test`.

## Commands

Project commands: the Commands table in `docs/steering/tech.md` (the Tech section above). Context: `npm run context:render`, then `npm run context:validate`. Adapters: `npm run adapters:sync`.
