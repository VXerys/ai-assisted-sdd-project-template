---
id: F-001
title: Create and list todos
type: design
status: implemented
tier: lite
owner: ari
created: 2026-09-29
last_updated: 2026-10-10
last_verified: 2026-10-10
requirements: [FR-001, FR-002, FR-003]
supersedes: null
---

# Design: Create and list todos

Maps the approved requirements onto this repository. Paths and schema fields below were checked against the code at commit `3f9c2a1`.

## Summary

Two route handlers in `src/routes/todos.js` delegate to `createTodo` and `listTodos` in `src/services/todos.js`, which call the repository functions in `src/db/todos.js`. Validation of shape happens in the Fastify route schema; validation of meaning (trim, length) happens in the service so the CLI can reuse the same rule offline later.

## Current state

Before this feature the repository had the Fastify app skeleton (`src/app.js`), the auth hook, the migration runner, and an empty `todos` table from `db/migrations/202609281200_create_todos.sql`.

## Component changes

| Component or path | Change | Responsibility after change |
|---|---|---|
| `src/routes/todos.js` | add `POST /todos` and `GET /todos` with JSON schemas | HTTP shape, status codes, error mapping |
| `src/services/todos.js` | add `createTodo`, `listTodos`, `normalizeTitle` | BR-001, ordering, cursor encoding |
| `src/db/todos.js` | add `insertTodo`, `selectOpenTodos(afterCursor, limit)` | SQL only |
| `db/migrations/202610021030_todos_created_at_index.sql` | add index on `(created_at DESC, id DESC)` | keyset paging stays fast |
| `test/todos-create.test.js`, `test/todos-list.test.js` | HTTP tests through `supertest` | AC-001 to AC-006 |

## Flow

```text
POST /todos -> routes/todos.js (schema) -> services/todos.js createTodo (normalizeTitle, BR-001)
  -> db/todos.js insertTodo -> row -> 201 body
GET /todos?cursor= -> routes/todos.js -> services/todos.js listTodos (decode cursor)
  -> db/todos.js selectOpenTodos(after, 51) -> 50 rows + next_cursor
```

## Data and state

- `todos(id bigserial, title text not null, status text not null default 'open', created_at timestamptz not null default now(), closed_at timestamptz null)`. Storage change: additive (index only); existing rows unaffected.
- The cursor is `base64url(created_at.toISOString() + ":" + id)`; the service fetches 51 rows to decide whether `next_cursor` exists.
- Access rule: the shared bearer-key hook; no per-row rules.

## Error handling and security

| Failure | Detection | Handling | User or system result |
|---|---|---|---|
| empty or long title | `normalizeTitle` throws `ValidationError(code)` | route maps to 400 | `{error: "title_required" \| "title_too_long"}` |
| malformed cursor | base64url decode fails | 400 `{error: "bad_cursor"}` | client restarts from the first page |
| database unreachable | `pg` throws | 503 `{error: "store_unavailable"}`, no body details | CLI shows its cached list marked `stale` |

Titles are never logged; the request log carries only `request_id`, method, path, status, and duration.

## Testing

| Requirement or risk | Test | Layer |
|---|---|---|
| AC-001, AC-002 | `todos-create.test.js: creates a todo`, `rejects an empty title` | HTTP |
| AC-005, AC-006 | `todos-create.test.js: trims the title`, `rejects 201 characters` | HTTP |
| AC-003, AC-004 | `todos-list.test.js: newest first`, `pages at 50 with a cursor` | HTTP |

Commands come from `docs/steering/tech.md`.

## Out of scope

- A `limit` query parameter (BR-002).

## Open questions

- A-001 (confirmed).
