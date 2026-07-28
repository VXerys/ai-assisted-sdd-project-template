---
id: F-XXX-TASKS
feature: F-XXX
status: draft
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "design.md"
---

# Tasks: {{FEATURE_NAME}}

## Execution Rules

1. Execute one task at a time.
2. Read referenced requirements and design sections before editing.
3. Do not introduce contract or architecture decisions inside an implementation task.
4. Mark a task blocked when an unresolved decision appears.
5. Preserve task IDs after approval.
6. Record evidence before checking a task as complete.

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

### [ ] TASK-001 — {{TASK_TITLE}}

Objective:

{{ONE_CONCRETE_IMPLEMENTATION_OUTCOME}}

Requirement references:

- FR-001
- AC-001.1

Design references:

- Section 4: Component Changes
- Section 11: Testing Strategy

Expected file scope:

- `{{PATH}}`

Implementation steps:

1. {{STEP}}
2. {{STEP}}

Required tests:

- {{TEST}}

Verification commands:

```bash
{{COMMAND}}
```

Definition of done:

- [ ] Required behavior exists.
- [ ] Referenced acceptance criteria are satisfied.
- [ ] Required checks pass.
- [ ] Documentation impact is handled.
- [ ] No unrelated changes exist.

Dependencies:

- None

Evidence:

- Pending

Notes:

- {{NOTES_OR_NONE}}

## Deferred Work

- {{DEFERRED_ITEM_AND_REASON}}

## Blockers

| ID | Description | Owner | Affected tasks | Resolution |
|---|---|---|---|---|
| BLK-001 | {{BLOCKER_OR_NONE}} | {{OWNER}} | TASK-XXX | Pending |
