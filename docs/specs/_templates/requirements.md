---
id: F-XXX
title: ""
type: requirements
status: draft        # draft | review | approved | implementing | verification | implemented | superseded
tier: lite           # lite | full
owner: ""
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
last_verified: YYYY-MM-DD
supersedes: null
---

# Requirements: {{FEATURE_NAME}}

Observable behavior only. Architecture goes in `system-architecture.md`, repository mapping in `design.md`.

## Problem

What happens today, who is affected, why it matters now. Two to five sentences.

## Goal

One observable outcome, then the signals that show it was reached.

- Example: a signed-in user sees today's check-in state within one second of opening Home.

## Non-goals

- Example: streak history older than 90 days.

## Actors

- ACTOR-001: name, role, relevant permission.

## Functional requirements

Number acceptance criteria once per feature (AC-001, AC-002, ...); `tasks.md` and `verification.md` reference these ids.

### FR-001 — Short title

The system shall {{OBSERVABLE_BEHAVIOR}}.

- AC-001: Given {{STATE}}, when {{ACTION}}, then {{RESULT}}.
- AC-002: Given the failure or edge state, when the same action, then {{RESULT}}.

## Business and validation rules

- BR-001: the rule, and what happens when it is violated.

## Edge cases and failure states <!-- full-tier -->

- EC-001: condition, required behavior. Cover only relevant categories: empty, duplicate, stale, concurrent, offline, unauthorized, missing resource, partial failure, timeout.

## Non-functional requirements <!-- full-tier -->

- NFR-001: category (performance, security, reliability, accessibility, compatibility) and a measurable expectation.

## Dependencies and constraints

- Example: no new dependency; preserve the current storage format; support the current client version.

## Out of scope

- Nearby behavior this feature deliberately excludes.

## Open questions

Log unknowns in `docs/context/ASSUMPTIONS.md` and reference them here. Implementation never decides a blocking question silently.

- A-XXX: short summary, blocking: yes | no
