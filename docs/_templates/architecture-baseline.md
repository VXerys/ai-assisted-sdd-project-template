---
id: ARCH
title: ""
type: architecture-baseline
status: draft        # draft | review | approved | implementing | verification | implemented | superseded
tier: full           # lite | full
owner: ""
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
last_verified: YYYY-MM-DD
supersedes: null
---

# Architecture Baseline: {{PROJECT_NAME}}

Cross-feature boundaries and invariants every module obeys. Module-level reasoning lives in `docs/specs/F-XXX/system-architecture.md`; the stack and commands live in `docs/steering/tech.md`; directory responsibilities live in `docs/steering/structure.md`. Do not repeat them here.

## System context

One paragraph: what the system does and for whom.

| Actor or external system | Relationship | Trust boundary |
|---|---|---|
| Example: payment provider | receives order totals, returns payment status | untrusted input, signed callbacks |

```text
client -> entry boundary -> application -> persistence or external services
```

## Components

| Component | Responsibility | Owns | Does not own |
|---|---|---|---|
| | | | |

## Boundaries

For each boundary future features must respect:

- B-001: inside, outside, allowed communication, prohibited shortcut, rationale.

## Dependency direction

```text
ui -> application -> domain <- data
```

Rules and documented exceptions. Cycles are not allowed.

## Data flow and classification

```text
input -> validation -> domain -> persistence or service -> output
```

| Data | Owner | Where stored | Sensitivity |
|---|---|---|---|
| | | | public \| internal \| personal \| secret |

## State ownership

| State | Owner | Source of truth | Mutation path | Invalidation or sync |
|---|---|---|---|---|
| | | | | |

One writable source of truth per state; reconciliation rules are explicit when a second copy exists.

## Contracts

API or event style, contract source, validation boundary, error model, compatibility rule, idempotency and retry ownership, public consumers. Omit when the project has no contract boundary.

## Persistence

Primary store (relational, document, key-value, embedded local store, file), schema source, change mechanism (migrations, rules files, schema versions), access boundary, transaction model, backup and recovery assumptions. Core invariants:

- Example: an order total always equals the sum of its line items.

## External services

| Service | Purpose | Data sent | Auth | Failure strategy |
|---|---|---|---|---|
| | | | | |

## Authentication and authorization

Identity mechanism, session or token lifecycle, client storage rule, revocation. Authorization decision point, role or permission model, resource or tenant ownership rule, default policy (deny), verification strategy.

## Errors and failure handling

How errors are represented and propagated. For validation, authorization, transient dependency, and internal failures: handling, retry, user or system signal, logging.

## Security baseline

Secrets, input validation, sensitive-data handling, file and storage rules, audit logging, production access, threat model location.

## Performance and scalability

Known constraints only: expected load and data volume, critical latency path, caching strategy or none, scaling constraint, how performance is measured.

## Observability

Logs, metrics, tracing, error reporting, audit events.

## Testing strategy

Scope of unit, integration, contract, UI, end-to-end, and migration or security testing. Commands are in `docs/steering/tech.md`.

## Deployment

Environments, build artifact, deployment mechanism, configuration management, migration order, rollback or roll-forward.

## Constraints and risks

- C-001: constraint.

| Risk | Impact | Mitigation or evidence needed |
|---|---|---|
| | | |

## Decisions

| ADR | Decision | Status |
|---|---|---|
| | | |

## Open questions

Unknowns go to `docs/context/ASSUMPTIONS.md`; reference A-XXX ids here.

## Approval and change rule

Architecture owner, approved date. A cross-feature or expensive-to-reverse change requires an ADR and owner approval before implementation.
