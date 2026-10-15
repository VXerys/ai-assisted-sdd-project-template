---
id: F-002
title: Close a todo
type: verification
status: implementing
tier: lite
owner: ari
created: 2026-10-13
last_updated: 2026-10-14
last_verified: 2026-10-14
requirements: [FR-001, FR-002]
supersedes: null
---

# Verification: Close a todo

Evidence that acceptance criteria hold at a named commit. A claim without a command and an output excerpt is not evidence. Unrun checks are listed, never omitted.

## Evidence

### EV-001 — Close handler tests pass
- command: `npm test -- test/todos-close.test.js`
- output:
  ```text
  ✔ closes an open todo and returns 200 with status closed and closed_at
  ✔ returns 404 todo_not_found for an unknown id
  ✔ second close returns 200 and keeps the original closed_at
  ✔ two parallel closes share closed_at
  ℹ tests 4  ℹ pass 4  ℹ fail 0
  ```
- date: 2026-10-13
- commit: 9a2d5f0
- covers: [AC-001, AC-002, AC-003]

## Coverage

| Criterion | Evidence | Result |
|---|---|---|
| AC-001 | EV-001 | pass |
| AC-002 | EV-001 | pass |
| AC-003 | EV-001 | pass |
| AC-004 | | not_run |
| AC-005 | | not_run |

## Not run

| Check | Reason | Residual risk |
|---|---|---|
| `test/todos-list.test.js` status filter cases | T-002 in progress | none yet; the default list still hides nothing until T-002 lands |
| full suite and lint at the final commit | T-003 planned | covered per task so far |

## Result

Pending: FR-001 verified at `9a2d5f0`; FR-002 not yet implemented.
