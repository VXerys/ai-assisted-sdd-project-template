---
id: F-001
title: Create and list todos
type: tasks
status: implemented
tier: lite
owner: ari
created: 2026-09-29
last_updated: 2026-10-10
last_verified: 2026-10-10
requirements: [FR-001, FR-002, FR-003]
supersedes: null
---

# Tasks: Create and list todos

This file is the master for task status. `state.yaml`, `BRIEF.md`, and the progress views are rendered from it and never edited by hand.

## Rules

- One task at a time. Read the FR ids and design sections the task references before editing.
- Task status: `planned | in_progress | blocked | review | done | deferred`.
- `done` requires at least one evidence id from `verification.md`.

## Tasks

### T-001 — POST /todos with title rules
- status: done
- requirements: [FR-001, FR-003]
- depends_on: []
- evidence: [EV-001, EV-002]
- scope: [src/routes/todos.js, src/services/todos.js, src/db/todos.js, test/todos-create.test.js]

Context: implements the create flow from the design's Flow section; `normalizeTitle` lives in the service so the CLI can reuse it later.

Acceptance criteria: AC-001, AC-002, AC-005, AC-006.

Verification: `npx eslint .`, `npm test -- test/todos-create.test.js`.

Stop conditions: stop if the route needs a response shape other than `{id, title, status, created_at}`.

Out of scope: listing.

### T-002 — GET /todos with keyset paging
- status: done
- requirements: [FR-002]
- depends_on: [T-001]
- evidence: [EV-003]
- scope: [src/routes/todos.js, src/services/todos.js, src/db/todos.js, db/migrations/202610021030_todos_created_at_index.sql, test/todos-list.test.js]

Context: implements the list flow; the index migration is a new file, never an edit (frozen path).

Acceptance criteria: AC-003, AC-004.

Verification: `npm test -- test/todos-list.test.js` against a seeded database with 51 todos.

Stop conditions: stop if paging needs a `limit` parameter (BR-002 says no).

### T-003 — Feature integration and verification
- status: done
- requirements: [FR-001, FR-002, FR-003]
- depends_on: [T-002]
- evidence: [EV-004]

Full suite and lint at the feature's final commit; `verification.md` coverage table complete; handoff updated; CLI switched to the API on 2026-10-10.

## Deferred

None.
