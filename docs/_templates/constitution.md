---
id: CONST
title: ""
type: constitution
status: draft        # draft | review | approved | implementing | verification | implemented | superseded
tier: lite           # lite | full
owner: ""
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
last_verified: YYYY-MM-DD
supersedes: null
---

# Constitution: {{PROJECT_NAME}}

Durable principles and governance: why the project is engineered this way and which decisions need stronger control. Day-to-day rules an agent applies live in `docs/steering/rules.md`; this document explains the principles behind them and changes rarely.

## Context

Purpose, lifecycle stage, expected scale and criticality, primary constraints. One line each.

## Engineering principles

- Specification before non-trivial implementation; documentation depth scales with risk.
- Smallest design that satisfies known requirements; no speculative abstraction.
- Completion claims carry verification evidence; unrun checks are reported with residual risk.
- Prefer reversible, additive changes when uncertainty or data risk is high.
- Project-specific principle: {{PRINCIPLE}}

## Architecture principles

- Architecture defines boundaries, ownership, and dependency direction; feature work does not redefine them silently.
- External services sit behind project-owned boundaries when replacement or coupling risk justifies it.
- Distributed mechanisms (queues, caches, sharding, edge) require a requirement or workload justification.
- ADR threshold: a decision that is expensive to reverse, cross-feature, security-significant, or likely to be questioned later.

## Quality standards

Correctness, maintainability, performance, reliability, accessibility, observability: state the expectation only where it is meaningful for this project. Cheap deterministic checks run always; expensive verification is risk-based.

## Dependency policy

Before adding or replacing a significant dependency, record the problem solved, the native alternative, maintenance health, security history, runtime or bundle impact, license, and exit cost. Approval rule: {{DEPENDENCY_APPROVAL_RULE}}.

## Testing policy

Risk-based, not coverage theater. Critical business, security, and data contracts get automated regression protection. Integration boundaries get integration or contract evidence when mocks are insufficient. No test is disabled to make a check pass.

## Security policy

No secrets in the repository. Authorization enforced at a trusted boundary. Sensitive data handled explicitly. Destructive production or data operations need explicit approval. Production access rule: {{PRODUCTION_ACCESS_RULE}}.

## Documentation policy

Repository artifacts are the durable truth; chat history is not. Each fact has one canonical owner; other documents link to it. Unknowns are logged in `docs/context/ASSUMPTIONS.md`, never guessed.

## AI usage policy

AI may analyze, draft specifications, propose alternatives, inspect the repository, implement approved tasks, write tests, run checks, and draft evidence-grounded documentation.

AI never decides silently: product direction, breaking architecture change, security exception, destructive data change, production infrastructure, major dependency replacement, public contract break. Project-specific boundary: {{AI_APPROVAL_BOUNDARY}}.

## Compatibility policy <!-- full-tier -->

Public contract compatibility rule, supported version window, migration principle, deprecation policy.

## Governance

A constitution change records reason, impact, owner approval, and the steering or template updates it requires. A temporary exception records the rule bypassed, reason, risk, owner, and expiry.

## Review triggers

Product criticality, platform, team or release model, compliance obligations change materially; repeated friction shows a rule is disproportionate; an incident reveals a missing principle.
