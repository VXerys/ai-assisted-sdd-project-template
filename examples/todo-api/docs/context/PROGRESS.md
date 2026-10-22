<!-- GENERATED FILE — DO NOT EDIT. Rendered by `npm run context:render`.
Source: sdd.config.json, docs/steering/, docs/specs/F-*/, docs/context/ASSUMPTIONS.md, docs/handoff/current.md.
source_hash: ac7a4080a419ba2de56c7869c48293a37000caa5a2df20c7f8279aa8d2af95c0 -->

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
