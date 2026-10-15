---
id: PRD
title: ""
type: prd
status: draft        # draft | review | approved | implementing | verification | implemented | superseded
tier: lite           # lite | full
owner: ""
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
last_verified: YYYY-MM-DD
supersedes: null
---

# Product Requirements: {{PROJECT_NAME}}

Product intent and scope. Feature-level behavior lives in `docs/specs/F-XXX/requirements.md`; the short version of vision and personas lives in `docs/steering/product.md` and must agree with this file.

## Context

Domain, current environment, and why this initiative exists now. Technology only when it is a fixed constraint.

## Problem

- Current state: what happens today and who is affected.
- Pain or opportunity: the cost, friction, or risk.
- Desired outcome: what becomes possible.

## Goals and non-goals

- G-001: observable outcome.
- NG-001: nearby work explicitly excluded from this product or milestone.

## Actors and use cases

- ACTOR-001: who they are, primary need, permissions or constraints.
- UC-001: actor, trigger, outcome, important failure.

## Functional requirements

Product-level only. One observable behavior per id, written as "the system shall".

- FR-001: the system shall store, show, or reject one thing a user can observe.
- BR-001: business rule and its consequence.

## Non-functional requirements <!-- full-tier -->

- NFR-001: category (performance, reliability, security, privacy, accessibility, compatibility, operations) and a measurable expectation.

## Constraints

Product, platform, schedule, compliance. One line each.

## Success criteria

| Signal | Target or interpretation | Measurement source |
|---|---|---|
| Example: weekly active check-ins | rises after release | app analytics event `check_in` |

## Risks and assumptions

- R-001: risk, likelihood, impact, mitigation or discovery plan.
- Assumptions are logged in `docs/context/ASSUMPTIONS.md`; list the A-XXX ids here. An assumption is never presented as a fact.

## Milestones

- M1: outcome, included capabilities, exit criteria.

## Feature map

| Feature | Capability | Outcome | Depends on | Status |
|---|---|---|---|---|
| F-001 | | | | draft |

## Approval

Decision owner, date, notes.
