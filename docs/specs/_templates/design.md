---
id: F-XXX
title: ""
type: design
status: draft        # draft | review | approved | implementing | verification | implemented | superseded
tier: lite           # lite | full
owner: ""
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
last_verified: YYYY-MM-DD
requirements: []     # FR ids covered
supersedes: null
---

# Design: {{FEATURE_NAME}}

Maps approved requirements, and `system-architecture.md` when it exists, onto this repository. Inspect code before filling a section; paths, APIs, and schema fields come from the repository, not from memory. If implementation needs a change to an approved architecture decision, stop and update the architecture or ADR first.

## Summary

Implementation approach in one paragraph, and why it fits existing patterns.

## Current state

Components, data flow, and constraints that matter to this change, as found in the repository.

## Component changes

| Component or path | Change | Responsibility after change |
|---|---|---|
| Example: `lib/features/streak/streak_repository.dart` | add `markCheckIn()` | owns check-in writes |

## Flow

```text
trigger -> component -> component -> store or service -> result
```

## Data and state

- Entities or fields changed, with invariants. Storage change: additive | transformative | destructive, with existing-data impact.
- Access rule enforced at the trusted boundary.
- State owner, source of truth, transitions, loading/empty/error states, concurrent-update handling.

## Contracts <!-- full-tier -->

For each API, event, or channel changed: consumer, request, response, validation, auth, errors, idempotency, compatibility.

## Error handling and security

| Failure | Detection | Handling | User or system result |
|---|---|---|---|
| Example: network timeout on check-in | repository throws | retry once, then surface | message shown, streak unchanged |

Trust boundary, input validation, sensitive-data handling.

## Performance and observability <!-- full-tier -->

Critical path, expected load, how it is measured; the logs or metrics that reveal failure after release.

## Testing

| Requirement or risk | Test | Layer |
|---|---|---|
| AC-001 | `streak_repository_test: marks check-in once per day` | unit |

Commands come from `docs/steering/tech.md`.

## Alternatives considered <!-- full-tier -->

Implementation-level alternatives only. Architecture alternatives belong in `system-architecture.md` or an ADR.

## Out of scope

- Nearby work this design deliberately excludes.

## Open questions

Unknowns go to `docs/context/ASSUMPTIONS.md`; reference A-XXX ids here.
