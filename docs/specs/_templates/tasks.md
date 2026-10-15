---
id: F-XXX
title: ""
type: tasks
status: draft        # draft | review | approved | implementing | verification | implemented | superseded
tier: lite           # lite | full
owner: ""
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
last_verified: YYYY-MM-DD
requirements: []     # FR ids covered
supersedes: null
---

# Tasks: {{FEATURE_NAME}}

This file is the master for task status. `state.yaml`, `BRIEF.md`, and the progress views are rendered from it and never edited by hand.

## Rules

- One task at a time. Read the FR ids and design sections the task references before editing.
- Task status: `planned | in_progress | blocked | review | done | deferred`.
- `done` requires at least one evidence id from `verification.md`.
- A task that needs a product, contract, security, or architecture decision becomes `blocked`; log the unknown in `docs/context/ASSUMPTIONS.md`.
- Task ids stay stable once approved. Discovered work becomes a new task, never a silent extension of an existing one.

## Task block format

Every task uses exactly this shape; the key-value lines are parsed.

```markdown
### T-001 — Short task title
- status: planned
- requirements: [FR-001, FR-002]
- depends_on: []
- evidence: []          # ids from verification.md, e.g. [EV-001]

Free-form context, scope, acceptance criteria (AC-001...), out of scope.
```

## Tasks

### T-001 — {{TASK_TITLE}}
- status: planned
- requirements: [FR-001]
- depends_on: []
- evidence: []

Context: why this task exists and which design section it implements.

Scope: components or paths expected to change, confirmed against the repository.

Acceptance criteria: AC-001, AC-002.

Verification: commands from `docs/steering/tech.md`, plus any runtime or manual scenario.

Stop conditions: stop and report before implementing if this task needs an unapproved change to a public contract, storage or consistency model, trust boundary, dependency set, or production configuration.

Out of scope: nearby work this task does not cover.

### T-002 — Feature integration and verification
- status: planned
- requirements: [FR-001]
- depends_on: [T-001]
- evidence: []

End-to-end check of the feature, `verification.md` complete, handoff updated.

## Deferred

Mark a task `deferred` and state why; do not delete it.
