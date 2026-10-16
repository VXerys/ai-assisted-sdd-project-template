<!-- GENERATED FILE — DO NOT EDIT. Rendered by `npm run context:render`.
Source: sdd.config.json, docs/steering/, docs/specs/F-*/, docs/context/ASSUMPTIONS.md, docs/handoff/current.md.
source_hash: 4a9022d3a4a763c48681ca18c2649d034d4b2ba8e6da7e9b4699b568539330f6 -->

# Brief

Todo API is a JSON API for small teams that keeps one shared todo list consistent across a CLI and a web client.

Project `Todo API`, tier `lite`. Rendered from sdd.config.json, docs/steering/, docs/specs/F-*/, docs/context/ASSUMPTIONS.md, docs/handoff/current.md.

## Active
Feature F-002 — Close a todo (`implementing`, docs/specs/F-002-close-todo/)
Task T-002 — Status filter on GET /todos (`in_progress`); requirements: FR-002; depends on: T-001

Context: implements the list changes from the design: `status` query parameter with BR-001, `selectTodos(status, after, limit)` replacing `selectOpenTodos`.

Acceptance criteria: AC-004, AC-005.

Verification: `npm test -- test/todos-list.test.js`; then the full suite for T-003.

Stop conditions: stop if A-002 is rejected (the cursor would become status-scoped and the F-001 cursor format would change, a contract change).

Out of scope: `limit` parameter; reopen.

Acceptance criteria:
- AC-004: Given one open and one closed todo, when `GET /todos` is called, then only the open one is returned.
- AC-005: Given the same data, when `GET /todos?status=closed` is called, then only the closed one is returned; `?status=all` returns both, newest first.

Files you may touch:
- `src/routes/todos.js`
- `src/services/todos.js`
- `src/db/todos.js`
- `test/todos-list.test.js`

## Rules
Stop conditions:

Stop and report, instead of implementing, when the task would require any prohibited action above, when two sources of truth conflict, when a blocking assumption is open, or when a required command is unavailable.

Prohibited without explicit owner approval:

- Changing the shape of a `/todos` response or error code.
- Destructive data operations: drop, mass delete, reset, backfill with unknown impact, editing an applied migration.
- Adding a dependency outside the policy in `tech.md`.
- Importing `pg` or Fastify outside the layer that owns it (`structure.md`).
- Changing the production compose file, credentials, or configuration.
- Force push, history rewrite, or any git operation that can destroy work.
- Editing a generated or frozen path.
- Deploying or sending messages on the owner's behalf.

## Read-only paths
Generated: `docs/context/state.yaml`, `docs/context/PROJECT_STATE.md`, `docs/context/PROGRESS.md`, `docs/context/BRIEF.md`, `AGENTS.md`, `CLAUDE.md`
Frozen: `db/migrations/`

## Open assumptions
- A-002 — A cursor stays valid across status filters (F-002)

## Handoff
Next step:

Make the failing AC-004 test pass: switch listTodos to selectTodos(status) with status defaulting to 'open', add the status query schema (BR-001) to GET /todos in src/routes/todos.js, then add the AC-005 tests.

Expected files:

- `src/services/todos.js`
- `src/routes/todos.js`
- `test/todos-list.test.js`

Required verification:

npx eslint . && npm test -- test/todos-list.test.js

## Other open tasks
- T-003 — Feature integration and verification (`planned`)

## Features
| Feature | Status | Phase | Done/Total |
|---|---|---|---|
| F-001 Create and list todos | implemented | complete | 3/3 |
| F-002 Close a todo | implementing | in_progress | 1/3 |
