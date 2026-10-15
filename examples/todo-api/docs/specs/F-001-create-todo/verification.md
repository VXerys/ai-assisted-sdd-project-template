---
id: F-001
title: Create and list todos
type: verification
status: implemented
tier: lite
owner: ari
created: 2026-10-02
last_updated: 2026-10-10
last_verified: 2026-10-10
requirements: [FR-001, FR-002, FR-003]
supersedes: null
---

# Verification: Create and list todos

## Evidence

### EV-001 — Create handler tests pass
- command: `npm test -- test/todos-create.test.js`
- output:
  ```text
  ✔ creates a todo and returns 201 with id, title, status, created_at
  ✔ rejects an empty or whitespace-only title with 400 title_required
  ℹ tests 3  ℹ pass 3  ℹ fail 0
  ```
- date: 2026-10-02
- commit: 3f9c2a1
- covers: [AC-001, AC-002]

### EV-002 — Title normalization tests pass
- command: `npm test -- test/todos-create.test.js`
- output:
  ```text
  ✔ trims surrounding whitespace before storing the title
  ✔ rejects 201 characters after trimming with 400 title_too_long
  ℹ tests 6  ℹ pass 6  ℹ fail 0
  ```
- date: 2026-10-03
- commit: 8be41d7
- covers: [AC-005, AC-006]

### EV-003 — List ordering and paging tests pass
- command: `npm test -- test/todos-list.test.js`
- output:
  ```text
  ✔ returns the newer todo first
  ✔ returns 50 of 51 open todos with next_cursor, then the last one with next_cursor null
  ℹ tests 3  ℹ pass 3  ℹ fail 0
  ```
- date: 2026-10-07
- commit: c17e9a4
- covers: [AC-003, AC-004]

### EV-004 — Full suite and lint at the final commit
- command: `npx eslint . && npm test`
- output:
  ```text
  (eslint: no output, exit 0)
  ℹ tests 14  ℹ pass 14  ℹ fail 0  ℹ duration_ms 2841.3
  ```
- date: 2026-10-10
- commit: 7d41c0e
- covers: [AC-001, AC-002, AC-003, AC-004, AC-005, AC-006]

## Coverage

| Criterion | Evidence | Result |
|---|---|---|
| AC-001 | EV-001, EV-004 | pass |
| AC-002 | EV-001, EV-004 | pass |
| AC-003 | EV-003, EV-004 | pass |
| AC-004 | EV-003, EV-004 | pass |
| AC-005 | EV-002, EV-004 | pass |
| AC-006 | EV-002, EV-004 | pass |

## Result

`pass_with_limitations`: every criterion has passing evidence at `7d41c0e`. Not run: p95 latency with 500 todos (`test/list-perf.test.js` lands with F-002; the T-002 index covers the query plan).
