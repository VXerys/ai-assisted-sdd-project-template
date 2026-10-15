---
id: ARCH
title: "{{PROJECT_NAME}}"
type: architecture-baseline
status: draft
tier: lite
owner: "{{ARCHITECTURE_OWNER}}"
created: "{{YYYY-MM-DD}}"
last_updated: "{{YYYY-MM-DD}}"
last_verified: "{{YYYY-MM-DD}}"
supersedes: null
---

# Architecture Baseline: {{PROJECT_NAME}}

Cross-feature boundaries and invariants every module obeys, in the lite form of `docs/_templates/architecture-baseline.md`. Module-level reasoning lives in `docs/specs/F-XXX/system-architecture.md`; the stack and commands live in `docs/steering/tech.md`; directory responsibilities live in `docs/steering/structure.md`. Do not repeat them here. Full tier: add the remaining sections of `docs/_templates/architecture-baseline.md` (contracts, persistence, external services, errors, performance, observability, testing, constraints and risks).

## System context

One paragraph: what the system does and for whom, and what stays outside its boundary.

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

Rules and documented exceptions. Cycles are not allowed. Infrastructure errors are normalized before reaching the presentation layer; authorization is enforced at a trusted boundary.

## Data flow and classification

One line per flow: input, validation, domain operation, persistence or service call, output.

| Data | Owner | Where stored | Sensitivity |
|---|---|---|---|
| | | | public \| internal \| personal \| secret |

## State ownership

| State | Owner | Source of truth | Mutation path | Invalidation or sync |
|---|---|---|---|---|
| | | | | |

One writable source of truth per state; reconciliation rules are explicit when a second copy exists.

## Security

Identity mechanism, session or token lifecycle, revocation. Authorization decision point, role or permission model, default policy (deny). Secrets, input validation, sensitive-data handling, audit logging, production access.

## Deployment

Environments, build artifact, deployment mechanism, configuration management, migration order, rollback or roll-forward.

## Decisions and open questions

ADR ids with their decision and status. Unknowns go to `docs/context/ASSUMPTIONS.md`; reference A-XXX ids here.

## Approval and change rule

Architecture owner, approved date. A cross-feature or expensive-to-reverse change requires an ADR and owner approval before implementation.
