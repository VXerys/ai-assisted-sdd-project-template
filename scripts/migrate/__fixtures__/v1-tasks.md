---
id: F-001-TASKS
feature: F-001
status: approved
owner: "ari"
last_updated: "2026-09-30"
last_verified_commit: unverified
---

# Tasks: Create todo

## Status Legend

- `[ ]` Not started
- `[-]` In progress
- `[x]` Complete
- `[!]` Blocked

## Dependency Map

```text
TASK-001 -> TASK-002 -> TASK-003
```

## Tasks

### [x] TASK-001 — Add the todos table

Objective:

One migration that creates `todos`.

Requirement references:

- FR-001
- AC-001.1

Expected file scope:

- `db/migrations/001_todos.sql`

### [-] TASK-002 — POST /todos route

Requirement references:

- FR-001
- FR-002

### [!] TASK-003 — List todos newest first

Blocked on the cursor decision.

- [ ] TASK-004 Close a todo (FR-003)
- [x] TASK-005 Smoke test the deploy
- [-] TASK-006 Write the runbook
- [!] TASK-007 Rotate the API key
