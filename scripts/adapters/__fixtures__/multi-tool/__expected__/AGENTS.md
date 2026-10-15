<!-- GENERATED FILE — DO NOT EDIT. Rendered by `npm run adapters:sync`.
Source: docs/steering/, sdd.config.json.
source_hash: 2f0709d98d3777b8e6588b4e18296ef112538b907a66d0a4cda1c4a7bc48856b -->

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

Generated (edit the sources, then run `npm run context:render` or `npm run adapters:sync`): `docs/context/state.yaml`, `docs/context/BRIEF.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `.github/instructions/`, `.kiro/steering/`

Frozen (explicit owner approval required): `src/legacy/`

## Rules

Engineering rules every agent applies.

### Prohibited without explicit owner approval

- Changing a public API or data contract.

### Stop conditions

Stop and report when the task needs a prohibited action.

## Tech

Stack and commands.

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

Task status: `planned | in_progress | blocked | review | done | deferred`.

```markdown
# Not a heading: fenced example stays untouched
```

## Product

Short product context for every session.

### Vision

Todo API is a JSON API for small teams that keeps a shared todo list consistent across clients.

### Non-goals

- Recurring todos.

## Conditional rules

Apply the section when the edited path matches its pattern.

### Database (`docs/steering/database.md`) applies to `src/db/**`, `migrations/**`

Rules for the PostgreSQL layer; loaded only when a database file is edited.

#### Migrations

- Append-only; never edit an applied migration.

Read on request:

- `docs/steering/release.md`: Checklist for cutting a release; read on request.

## Commands

Project commands: the Commands table in `docs/steering/tech.md` (the Tech section above). Context: `npm run context:render`, then `npm run context:validate`. Adapters: `npm run adapters:sync`.
