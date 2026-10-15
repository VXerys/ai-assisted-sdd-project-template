---
status: active
owner: ari
session_date: 2026-10-14
branch: feat/F-002-close-todo
base_commit: 9a2d5f0
current_commit: uncommitted
feature_id: F-002
task_id: T-002
expires_after: 2027-01-31
---

# Session Handoff

Current coding session delta. It does not replace product docs, architecture, ADRs, feature specs, or `tasks.md`.

## Session objective

Implement the `status` filter on `GET /todos` (T-002).

## Context used

- `docs/context/BRIEF.md`
- `docs/steering/rules.md`, `docs/steering/tech.md`
- `docs/specs/F-002-close-todo/tasks.md`
- `docs/specs/F-002-close-todo/requirements.md`
- `docs/specs/F-002-close-todo/design.md`

## Completed

- `selectTodos(status, after, limit)` added to `src/db/todos.js`; `selectOpenTodos` kept as a one-line wrapper until the route switches over.
- A-002 logged after noticing the cursor question while writing the `closed` query.

## Requirement coverage

- AC-004: test written in `test/todos-list.test.js` (`hides closed by default`), failing as expected; route not switched yet.
- AC-005: not started.

## Changed files

| File | Change | State |
|---|---|---|
| `src/db/todos.js` | `selectTodos` with status clause | Complete |
| `test/todos-list.test.js` | failing test for AC-004 | Partial |

## Commands executed

### Command

```bash
npm test -- test/todos-list.test.js
```

Result:

```text
✔ returns the newer todo first
✔ returns 50 of 51 open todos with next_cursor, then the last one with next_cursor null
✔ rejects a malformed cursor with 400 bad_cursor
✖ hides closed todos by default (route still calls selectOpenTodos)
ℹ tests 4  ℹ pass 3  ℹ fail 1
```

## Current implementation state

The repository layer supports the filter; the service and route do not use it yet, so the API behavior is unchanged from `9a2d5f0`.

## Uncommitted work

- `src/db/todos.js`, `test/todos-list.test.js`

Expected Git status:

```text
 M src/db/todos.js
 M test/todos-list.test.js
```

## Blockers

- None. A-002 is open but does not block T-002 (shared cursor is the assumed answer).

## Decisions made during session

- Keep `selectOpenTodos` as a wrapper for one commit so the diff stays reviewable; delete it in the same task once the route switches.

## Context updates

- `tasks.md` status and evidence ids updated: yes (T-002 `in_progress`)
- `verification.md` EV blocks added: no
- `docs/context/ASSUMPTIONS.md` entries added or resolved: yes (A-002 added)
- specification or ADR changed: no
- `npm run context:render` run and `npm run context:validate` passed: yes

## Exact next step

```text
Make the failing AC-004 test pass: switch listTodos to selectTodos(status) with status defaulting to 'open', add the status query schema (BR-001) to GET /todos in src/routes/todos.js, then add the AC-005 tests.
```

Expected files:

- `src/services/todos.js`
- `src/routes/todos.js`
- `test/todos-list.test.js`

Required verification:

```bash
npx eslint . && npm test -- test/todos-list.test.js
```

## Do not do next

- Do not change the cursor format (A-002 is open; a change is a contract change).
- Do not modify `db/migrations/` (frozen; no schema change in this feature).
- Do not mark T-002 done before EV blocks for AC-004 and AC-005 exist.

## Validity

Valid only for branch `feat/F-002-close-todo` on top of `9a2d5f0`, feature F-002, task T-002.
