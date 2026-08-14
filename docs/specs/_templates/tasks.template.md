---
id: F-XXX-TASKS
feature: F-XXX
status: draft
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "system-architecture.md"
  - "design.md"
---

# Tasks: {{FEATURE_NAME}}

## Execution Rules

1. Execute one task at a time.
2. Read referenced requirements before editing.
3. Read referenced `system-architecture.md` sections when the task touches data ownership, consistency, communication, caching, reliability, security, scale, external services, observability, or other architecture-sensitive behavior.
4. Read referenced implementation-design sections before editing.
5. Do not introduce product, public/data contract, security, or architecture decisions inside an implementation task.
6. Mark a task blocked when an unresolved decision appears.
7. Preserve task IDs after approval.
8. Record evidence before checking a task as complete.

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

System architecture references:

- Section {{NUMBER}}: {{ARCHITECTURE_CONSTRAINT_OR_DECISION}}
- Architecture claim to preserve/verify: {{CLAIM_OR_NA}}

Use `N/A — no module-architecture impact` only when the task genuinely does not depend on a module-level decision.

Design references:

- Section 4: Component Changes
- Section 12: Testing Strategy

Expected file scope:

- `{{PATH}}`

Constraints:

- {{CONSTRAINT}}
- Do not change approved module architecture inside this task.

Implementation steps:

1. {{STEP}}
2. {{STEP}}

Required tests:

- {{TEST}}

Architecture-sensitive verification:

- {{AUTHZ_TEST / CONSISTENCY_TEST / CACHE_INVALIDATION / REPLAY / FAILURE_HANDLING / LOAD_MEASUREMENT / N_A}}

Verification commands:

```bash
{{COMMAND}}
```

Definition of done:

- [ ] Required behavior exists.
- [ ] Referenced acceptance criteria are satisfied.
- [ ] Referenced architecture constraints are preserved.
- [ ] Required architecture-sensitive evidence is collected when applicable.
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

| ID | Description | Owner | Affected tasks | Canonical artifact to resolve | Resolution |
|---|---|---|---|---|---|
| BLK-001 | {{BLOCKER_OR_NONE}} | {{OWNER}} | TASK-XXX | {{REQUIREMENTS / SYSTEM_ARCHITECTURE / DESIGN / ADR}} | Pending |
