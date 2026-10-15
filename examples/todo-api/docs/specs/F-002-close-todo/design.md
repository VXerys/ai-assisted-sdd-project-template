---
id: F-002
title: Close a todo
type: design
status: implementing
tier: lite
owner: ari
created: 2026-10-12
last_updated: 2026-10-14
last_verified: 2026-10-14
requirements: [FR-001, FR-002]
supersedes: null
---

# Design: Close a todo

Maps the approved requirements onto this repository. Paths below were checked against the code at commit `7d41c0e`.

## Summary

One new route and one changed query. `closeTodo` in the service sets `closed_at` only when the row is still open, which makes the second call idempotent without a read-then-write race. `listTodos` gains a `status` argument that the repository turns into a `WHERE` clause; the cursor format from F-001 is reused unchanged (A-002).

## Current state

`src/routes/todos.js` has `POST` and `GET`; `src/services/todos.js` has `createTodo`, `listTodos`, `normalizeTitle`; `src/db/todos.js` has `insertTodo`, `selectOpenTodos`. The `todos` table already has `status` and `closed_at`.

## Component changes

| Component or path | Change | Responsibility after change |
|---|---|---|
| `src/routes/todos.js` | add `PATCH /todos/:id/close`; add `status` query schema to `GET /todos` | HTTP shape, 404 and 400 mapping |
| `src/services/todos.js` | add `closeTodo(id)`; `listTodos({status, cursor})` | BR-001, idempotent close |
| `src/db/todos.js` | add `closeTodoIfOpen(id)`; rename `selectOpenTodos` to `selectTodos(status, after, limit)` | SQL only |
| `test/todos-close.test.js` | new | AC-001 to AC-003 |
| `test/todos-list.test.js` | extend | AC-004, AC-005 |

## Flow

```text
PATCH /todos/:id/close -> routes (id schema) -> services closeTodo
  -> db closeTodoIfOpen: UPDATE ... SET status='closed', closed_at=now() WHERE id=$1 AND status='open' RETURNING *
  -> 0 rows: SELECT by id -> missing: 404 todo_not_found; present: 200 unchanged row
GET /todos?status=closed -> routes -> services listTodos({status}) -> db selectTodos('closed', after, 51)
```

## Data and state

- No schema change. `closed_at` is written by `closeTodoIfOpen` only (rules.md).
- State transitions: `open -> closed`; no transition back in M1.
- Concurrency: two simultaneous close calls both return 200 with the same `closed_at` because the `UPDATE ... WHERE status='open'` wins once and the loser re-reads the row.

## Error handling and security

| Failure | Detection | Handling | User or system result |
|---|---|---|---|
| unknown id | `UPDATE` affects 0 rows and `SELECT` finds none | 404 | `{error: "todo_not_found"}` |
| bad status filter | route query schema | 400 | `{error: "bad_status"}` |
| non-numeric id | route params schema | 400 | `{error: "bad_id"}` |

The auth hook applies unchanged.

## Testing

| Requirement or risk | Test | Layer |
|---|---|---|
| AC-001, AC-002, AC-003 | `todos-close.test.js: closes an open todo`, `404 for unknown id`, `second close keeps closed_at` | HTTP |
| AC-004, AC-005 | `todos-list.test.js: hides closed by default`, `status=closed and status=all` | HTTP |
| concurrent close | `todos-close.test.js: two parallel closes share closed_at` | HTTP |

Commands come from `docs/steering/tech.md`.

## Out of scope

- Reopen (would need a `closed -> open` transition and a decision on `closed_at`).

## Open questions

- A-002: cursor scope across status filters.
