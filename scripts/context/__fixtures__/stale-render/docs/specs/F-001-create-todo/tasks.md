---
id: F-001
title: Create todo
type: tasks
status: implementing
tier: lite
owner: maintainer
created: 2026-10-01
last_updated: 2026-10-14
last_verified: 2026-10-14
requirements: [FR-001, FR-002]
supersedes: null
---

# Tasks: Create todo

## Task block format

```markdown
### T-001 — Example inside a fence, never parsed
- status: done
```

## Tasks

### T-001 — POST /todos handler
- status: done
- requirements: [FR-001]
- depends_on: []
- evidence: [EV-001]

Acceptance criteria: AC-001, AC-002.

### T-002 — GET /todos handler
- status: in_progress
- requirements: [FR-002]
- depends_on: [T-001]
- evidence: []
- scope: [src/todos/router.js, test/todos.test.js]

Context: implements the list endpoint from FR-002.

Acceptance criteria: AC-003.

### T-003 — Feature integration, verification, and handoff
- status: planned
- requirements: [FR-001, FR-002]
- depends_on: [T-002]
- evidence: []

End-to-end check, `verification.md` complete, handoff updated.
