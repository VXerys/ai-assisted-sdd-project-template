<!-- GENERATED FILE — DO NOT EDIT. Rendered by `npm run context:render`.
Source: sdd.config.json, docs/steering/, docs/specs/F-*/, docs/context/ASSUMPTIONS.md, docs/handoff/current.md.
source_hash: 44badd2ab8820330e0c1b30add98eca89e1988fd5d6260691a9749c88644bf24 -->

# Project Progress

## F-001 — Create and list todos (`implemented`, complete)

| Task | Status | Requirements | Depends on | Evidence |
|---|---|---|---|---|
| T-001 POST /todos with title rules | done | FR-001, FR-003 |  | EV-001, EV-002 |
| T-002 GET /todos with keyset paging | done | FR-002 | T-001 | EV-003 |
| T-003 Feature integration and verification | done | FR-001, FR-002, FR-003 | T-002 | EV-004 |

## F-002 — Close a todo (`implementing`, in_progress)

| Task | Status | Requirements | Depends on | Evidence |
|---|---|---|---|---|
| T-001 PATCH /todos/:id/close | done | FR-001 |  | EV-001 |
| T-002 Status filter on GET /todos | in_progress | FR-002 | T-001 |  |
| T-003 Feature integration and verification | planned | FR-001, FR-002 | T-002 |  |
