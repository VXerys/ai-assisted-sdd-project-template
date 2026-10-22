<!-- GENERATED FILE — DO NOT EDIT. Rendered by `npm run context:render`.
Source: sdd.config.json, docs/steering/, docs/specs/F-*/, docs/context/ASSUMPTIONS.md, docs/handoff/current.md.
source_hash: 19fbc88587da230478c261888e2ab2aef70862261730004f7abff2f3ee3c2d56 -->

# Brief

Todo API is a JSON API for small teams that keeps a shared todo list consistent across clients.

Project `Todo API`, tier `lite`. Rendered from sdd.config.json, docs/steering/, docs/specs/F-*/, docs/context/ASSUMPTIONS.md, docs/handoff/current.md.

## Active
Feature F-001 — Create todo (`implementing`, docs/specs/F-001-create-todo/)
Task T-002 — GET /todos handler (`in_progress`); requirements: FR-002; depends on: T-001

Context: implements the list endpoint from FR-002.

Acceptance criteria: AC-003.

Acceptance criteria:
- AC-003: Given two todos, when GET /todos is called, then the newer one comes first.

Files you may touch:
- `src/todos/router.js`
- `test/todos.test.js`

## Rules
Stop conditions:

Stop and report when the task needs a prohibited action, when two sources conflict, or when a blocking assumption is open.

Prohibited without explicit owner approval:

- Changing a public API or data contract.
- Force push or history rewrite.

## Read-only paths
Generated: `docs/context/state.yaml`, `docs/context/PROJECT_STATE.md`, `docs/context/PROGRESS.md`, `docs/context/BRIEF.md`
Frozen: `src/legacy/`

## Open assumptions
- A-002 — Default page size for GET /todos (F-001)

## Handoff
Next step:

Add the newest-first ordering test in test/todos.test.js, then implement the handler.

## Other open tasks
- T-003 — Feature integration and verification (`planned`)

## Features
| Feature | Status | Phase | Done/Total |
|---|---|---|---|
| F-001 Create todo | implementing | in_progress | 1/3 |
| F-002 Close todo | draft | not_started | 0/0 |
