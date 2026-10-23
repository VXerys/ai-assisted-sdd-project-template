<!-- GENERATED FILE — DO NOT EDIT. Rendered by `npm run adapters:sync`.
Source: docs/steering/, sdd.config.json.
source_hash: 63cab2b27dcaf8ddd91d83598e0c70d64c091e2bfd29bef6052210dfe128ab3e -->

# Repository contract: Todo API

Todo API is a JSON API for small teams that keeps one shared todo list consistent across a CLI and a web client.

Rendered from `docs/steering/` and `sdd.config.json` for humans and coding agents. Edit the steering files, then run `npm run adapters:sync`.

## Read first

1. `docs/context/BRIEF.md` (single entry point; rendered, never hand-edited)
2. The Rules and Tech sections below; the other steering files in the table reach each tool through its rule files, otherwise read one before work on its topic
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

## Read-only paths

Generated (edit the sources, then run `npm run context:render` or `npm run adapters:sync`): `docs/context/state.yaml`, `docs/context/PROJECT_STATE.md`, `docs/context/PROGRESS.md`, `docs/context/BRIEF.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/rules/`

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

Requirements own behavior, design owns the repository mapping, `tasks.md` owns task status, code and tests own current behavior, `tech.md` owns commands. Chat history and provider memory, including subagent memory under `.claude/agent-memory/`, are never a source of truth; that directory stays out of git.

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

## Conditional rules

Read the file before editing a path that matches its pattern.

- `docs/steering/database.md` applies to `db/**`, `src/db/**`: Rules for every change under `db/**`, `src/db/**`. Generated by `npm run init` from the `postgres` preset, then extended by the team.

## Commands

Project commands: the Commands table in `docs/steering/tech.md` (the Tech section above). Context: `npm run context:render`, then `npm run context:validate`. Adapters: `npm run adapters:sync`.

Without hooks (multi-repository cloud sessions, project threads, tools without hooks): run `npm run sdd -- brief` first, and `npm run sdd -- guard --check` and `npm run sdd -- validate` before claiming done.
