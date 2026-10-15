---
id: F-XXX
title: ""
type: verification
status: draft        # draft | review | approved | implementing | verification | implemented | superseded
tier: lite           # lite | full
owner: ""
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
last_verified: YYYY-MM-DD
requirements: []     # FR ids covered
supersedes: null
---

# Verification: {{FEATURE_NAME}}

Evidence that acceptance criteria hold at a named commit. A claim without a command and an output excerpt is not evidence. Unrun checks are listed, never omitted.

## Evidence block format

Every evidence block uses exactly this shape; the key-value lines are parsed. `command`, `output`, `date`, `commit`, and `covers` are mandatory.

````markdown
### EV-001 — title
- command: `npm test`
- output:
  ```text
  excerpt of the relevant output lines
  ```
- date: YYYY-MM-DD
- commit: abc1234
- covers: [AC-001]
````

## Evidence

### EV-001 — {{TITLE}}
- command: `{{COMMAND}}`
- output:
  ```text
  ```
- date: YYYY-MM-DD
- commit:
- covers: [AC-001]

## Coverage

| Criterion | Evidence | Result |
|---|---|---|
| AC-001 | EV-001 | pass \| fail \| not_run |

## Manual scenarios <!-- full-tier -->

Steps, expected, actual, result. Record as an EV block when it covers a criterion.

## Architecture-sensitive evidence <!-- full-tier -->

Only for claims in `system-architecture.md` with real risk: authorization denial, ordering, idempotency, replay, cache freshness, failure recovery, load. Record each as an EV block.

## Not run

| Check | Reason | Residual risk |
|---|---|---|
| | | |

## Result

`pass | pass_with_limitations | fail`, with one evidence-based sentence.
