<!-- GENERATED FILE — DO NOT EDIT. Rendered by `npm run adapters:sync`.
Source: docs/steering/, sdd.config.json.
source_hash: 067e3a52cdb480660d7c5e4e7f9c2a25cdec67fa7e408699325014bb03072356 -->

# Repository contract: Todo API

Todo API is a JSON API for small teams that keeps a shared todo list consistent across clients.

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

Generated (edit the sources, then run `npm run context:render` or `npm run adapters:sync`): `docs/context/state.yaml`, `docs/context/BRIEF.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.claude/rules/`, `.cursor/rules/`, `.github/copilot-instructions.md`, `.github/instructions/`, `.kiro/steering/`

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

## Conditional rules

Read the file before editing a path that matches its pattern.

- `docs/steering/database.md` applies to `src/db/**`, `migrations/**`: Rules for the PostgreSQL layer; loaded only when a database file is edited.

Read on request:

- `docs/steering/release.md`: Checklist for cutting a release; read on request.

## Commands

Project commands: the Commands table in `docs/steering/tech.md` (the Tech section above). Context: `npm run context:render`, then `npm run context:validate`. Adapters: `npm run adapters:sync`.

Without hooks (multi-repository cloud sessions, project threads, tools without hooks): run `npm run sdd -- brief` first, and `npm run sdd -- guard --check` and `npm run sdd -- validate` before claiming done.
