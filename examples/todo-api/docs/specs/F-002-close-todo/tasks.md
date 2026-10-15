---
id: F-002
title: Close a todo
type: tasks
status: implementing
tier: lite
owner: ari
created: 2026-10-12
last_updated: 2026-10-14
last_verified: 2026-10-14
requirements: [FR-001, FR-002]
supersedes: null
---

# Tasks: Close a todo

This file is the master for task status. `state.yaml`, `BRIEF.md`, and the progress views are rendered from it and never edited by hand.

## Rules

- One task at a time. Read the FR ids and design sections the task references before editing.
- Task status: `planned | in_progress | blocked | review | done | deferred`.
- `done` requires at least one evidence id from `verification.md`.

## Tasks

### T-001 — PATCH /todos/:id/close
- status: done
- requirements: [FR-001]
- depends_on: []
- evidence: [EV-001]
- scope: [src/routes/todos.js, src/services/todos.js, src/db/todos.js, test/todos-close.test.js]

Context: implements the close flow from the design; idempotency comes from the conditional `UPDATE`, not from a read first.

Acceptance criteria: AC-001, AC-002, AC-003.

Verification: `npx eslint .`, `npm test -- test/todos-close.test.js`.

Stop conditions: stop if the close needs any write outside `closeTodoIfOpen` (rules.md).

Out of scope: list filtering.

### T-002 — Status filter on GET /todos
- status: in_progress
- requirements: [FR-002]
- depends_on: [T-001]
- evidence: []
- scope: [src/routes/todos.js, src/services/todos.js, src/db/todos.js, test/todos-list.test.js]

Context: implements the list changes from the design: `status` query parameter with BR-001, `selectTodos(status, after, limit)` replacing `selectOpenTodos`.

Acceptance criteria: AC-004, AC-005.

Verification: `npm test -- test/todos-list.test.js`; then the full suite for T-003.

Stop conditions: stop if A-002 is rejected (the cursor would become status-scoped and the F-001 cursor format would change, a contract change).

Out of scope: `limit` parameter; reopen.

### T-003 — Feature integration and verification
- status: planned
- requirements: [FR-001, FR-002]
- depends_on: [T-002]
- evidence: []

Full suite and lint, `test/list-perf.test.js` for the F-001 latency gap, `verification.md` coverage complete, handoff updated, A-002 resolved before the feature becomes `implemented`.

## Deferred

None.
