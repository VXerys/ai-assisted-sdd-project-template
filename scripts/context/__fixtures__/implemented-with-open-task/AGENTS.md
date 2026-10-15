<!-- GENERATED FILE — DO NOT EDIT. Rendered by `npm run adapters:sync`.
Source: docs/steering/, sdd.config.json.
source_hash: 9298244495368c0424766c38d9dde8a4efedfff0f72590ee6600ee56158352c8 -->

# Repository contract: Todo API

Todo API is a JSON API for small teams that keeps a shared todo list consistent across clients.

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

Generated (edit the sources, then run `npm run context:render` or `npm run adapters:sync`): `docs/context/state.yaml`, `docs/context/PROJECT_STATE.md`, `docs/context/PROGRESS.md`, `docs/context/BRIEF.md`

Frozen (explicit owner approval required): `src/legacy/`

## Rules

### Engineering

- Keep the change inside the selected task.

### Prohibited without explicit owner approval

- Changing a public API or data contract.
- Force push or history rewrite.

### Stop conditions

Stop and report when the task needs a prohibited action, when two sources conflict, or when a blocking assumption is open.

## Tech

| Concern | Technology |
|---|---|
| Language and runtime | Node 22 |
| Data store | PostgreSQL |

### Commands

| Purpose | Command |
|---|---|
| Test | `npm test` |
| Context validation | `npm run context:validate` |

## Structure

| Path | Responsibility |
|---|---|
| `src/` | application code |
| `src/legacy/` | frozen until F-002 lands |

## Workflow

Task status: `planned | in_progress | blocked | review | done | deferred`. Feature status: `draft -> review -> approved -> implementing -> verification -> implemented`.

## Product

### Vision

Todo API is a JSON API for small teams that keeps a shared todo list consistent across clients.

### Personas

- Maintainer: creates and closes todos from a CLI.

### Non-goals

- Recurring todos.

## Commands

Project commands: the Commands table in `docs/steering/tech.md` (the Tech section above). Context: `npm run context:render`, then `npm run context:validate`. Adapters: `npm run adapters:sync`.
