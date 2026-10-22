---
inclusion: always
---

# Structure

Where things live and which direction dependencies point.

## Directory responsibilities

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

## Generated paths

Never hand-edit. Listed in `sdd.config.json` under `generated`:

- `docs/context/state.yaml`, `docs/context/PROJECT_STATE.md`, `docs/context/PROGRESS.md`, `docs/context/BRIEF.md`
- `AGENTS.md`, `CLAUDE.md`, `.claude/rules/`
- Project-specific generated code: none

## Frozen paths

Listed in `sdd.config.json` under `frozen`. Edits need explicit owner approval.

- `db/migrations/`: applied migrations; add a new file instead of editing one

## Dependency direction

```text
routes -> services -> db
```

- `services/` never imports Fastify or `pg`; it receives plain objects and returns plain objects or throws a typed error from `src/services/errors.js`.
- `routes/` is the only layer that knows HTTP; `db/` is the only layer that knows SQL.
- Project-specific rule: a route handler is at most 20 lines; anything longer moves into a service.

## Naming

- Features: `F-001-short-name`. Tasks: `T-001`. Evidence: `EV-001`. Assumptions: `A-001`. ADRs: `ADR-0001-short-name.md`.
- Files are `kebab-case.js`; exported functions are `camelCase`; SQL identifiers are `snake_case`.
