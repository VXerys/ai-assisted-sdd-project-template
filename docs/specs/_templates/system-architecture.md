---
id: F-XXX
title: ""
type: system-architecture
status: draft        # draft | review | approved | implementing | verification | implemented | superseded
tier: full           # full only; a lite-tier feature does not create this file
owner: ""
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
last_verified: YYYY-MM-DD
supersedes: null
---

# System Architecture: {{FEATURE_NAME}}

Module-level architectural reasoning for one bounded capability, written before `design.md`. Create it only when the capability has a real system concern: shared or persistent state, realtime or async communication, external integration, consistency, security boundary, scale, or material cost.

Remove sections that do not apply. Never invent scale, mechanisms, or numeric targets to make the document look complete. File paths, framework wiring, and UI detail belong in `design.md`.

## 1. Intent

- Capability: what this module provides.
- Objective: what the architecture must make possible within project constraints.
- In scope: responsibilities and boundaries owned here.
- Out of scope: responsibilities explicitly owned elsewhere.
- Why a separate architecture document: the concern that makes a lighter process insufficient.

## 2. Drivers

Referenced requirements: FR ids, NFR ids, business rules, constraints.

| Driver | Requirement or assumption | Priority | Architectural consequence |
|---|---|---|---|
| Example: offline-first | NFR-002, mobile users lose connectivity | high | local store is source of truth; sync is eventually consistent |

Hard constraints: platform, compatibility, team, budget.

Unknowns that could change the architecture go to `docs/context/ASSUMPTIONS.md`; list the A-XXX ids here with `blocking: yes | no`.

## 3. Workload assumptions

Use observed values where available; otherwise ranges or `TBD` with a validation plan.

| Dimension | Current | Expected growth | Source or confidence |
|---|---|---|---|
| Actors, concurrency, request or event rate, read:write ratio, data growth, payload size, burst, hotspot risk | | | |

Redesign triggers: the measurable signals that justify revisiting this architecture instead of overbuilding now.

## 4. Context and boundaries

```text
actor or client -> entry boundary -> module -> persistence or external system -> downstream consumer
```

| Boundary or component | Owns | Does not own | Trust level |
|---|---|---|---|
| | | | trusted \| untrusted \| mixed |

Upstream callers, downstream dependencies, external providers, shared platform services. Boundary invariants that every later change must keep.

## 5. Components and dependency direction

| Component | Responsibility | May depend on | Must not depend on |
|---|---|---|---|
| | | | |

```text
ui -> application -> domain <- data
```

## 6. Critical flows

For each flow that carries the architectural risk (primary write, primary read, realtime or async): steps, the guarantee each step provides, and the failure branch.

```text
step -> step -> step
```

## 7. Data ownership and storage

- Canonical data and its single writable owner.
- Derived or ephemeral data, and how it is rebuilt.
- Storage approach selected (relational, document, key-value, local embedded store, file) and the access patterns that justify it.
- Query, indexing, and partitioning implications when they are real constraints.

## 8. Consistency, concurrency, ordering, idempotency

- Consistency model and where eventual consistency is accepted.
- Concurrent-write handling.
- Ordering guarantee and its scope.
- Duplicate request or event handling.

## 9. Communication model

Synchronous, asynchronous, event-driven, or realtime, with delivery semantics (at-most-once, at-least-once, exactly-once by idempotency), timeout and retry ownership.

## 10. Caching

Only when a driver demands it: what is cached, who owns invalidation, behavior when the cache is wrong or unavailable.

## 11. Scalability and performance

Critical path, performance constraint from requirements, scaling model (vertical, horizontal, partitioned), hotspots. Load balancing, sharding, and edge delivery appear only with a workload justification.

## 12. Reliability and resilience

Failure model (which dependency can fail and how), retry policy, degraded mode, recovery and replay, data recovery expectations.

## 13. Security, privacy, abuse

Trust boundaries, where authentication and authorization are enforced, sensitive data and its handling, abuse and threat considerations relevant to this module.

## 14. Observability

Signals that show the module is healthy, critical events to log, sensitive-logging constraints, post-release failure signals.

## 15. Cost and operations

Infrastructure and provider cost drivers, operational burden added, who operates it.

## 16. Compatibility, migration, rollout

Current state, target state, coexistence window, migration or rollout sequence, rollback or roll-forward reality.

## 17. Alternatives and decision

Compare credible options only.

| Criterion | Weight | Option A | Option B |
|---|---|---|---|
| Requirement fit, complexity, reliability, performance, security, cost, reversibility, team familiarity | | | |

Selected option and the reason the others were not chosen now.

## 18. Accepted trade-offs

| Trade-off | Benefit | Cost accepted | Why acceptable now | Review trigger |
|---|---|---|---|---|
| | | | | |

## 19. Risks

| Risk | Likelihood | Impact | Mitigation or verification |
|---|---|---|---|
| | | | |

## 20. Verification plan

Architecture claims need evidence proportional to risk; design intent is not proof. Each row becomes an EV block in `verification.md`.

| Claim | Evidence method | Environment | Pass condition |
|---|---|---|---|
| Example: cross-tenant read is denied | integration test with two tenants | CI | denied for every endpoint in scope |

## 21. Impact on global architecture and ADRs

- Global boundary used, and whether shared architecture changes.
- New reusable rule introduced: no | yes, with description.
- ADR required: no | yes, with link or pending.

If the requirements cannot be met without violating `docs/architecture/`, stop and resolve the change deliberately; do not encode the exception only in code.

## 22. Design handoff

`design.md` maps this document onto the repository: concrete components after inspection, interfaces implementing the boundaries, exact schema, API, and state changes, tests and commands, rollout detail. It must not silently replace what is selected here.

## Open questions

Unknowns go to `docs/context/ASSUMPTIONS.md`; reference A-XXX ids here.
