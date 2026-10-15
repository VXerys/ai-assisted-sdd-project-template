---
id: PRD
title: Todo API
type: prd
status: approved
tier: lite
owner: ari
created: 2026-09-26
last_updated: 2026-10-12
last_verified: 2026-10-12
supersedes: null
---

# Product Requirements: Todo API

Product intent and scope. Feature-level behavior lives in `docs/specs/F-XXX/requirements.md`; the short version of vision and personas lives in `docs/steering/product.md` and agrees with this file.

## Context

A four-person team tracks operational chores (key rotations, dependency bumps, on-call notes) in a `todo.json` file synced through a shared drive. Two people edited it within the same minute twice in September 2026 and one lost their entries both times. The team already runs a small server with Docker and PostgreSQL for other tools, so hosting a tiny API costs nothing new.

## Problem

- Current state: each client holds its own copy of the list and the last writer wins.
- Pain or opportunity: lost todos, and nobody trusts the list enough to stop keeping a private copy.
- Desired outcome: one list, one writer (the API), and every client sees the same open items.

## Goals and non-goals

- G-001: a todo created from any client is visible from every client on the next read.
- G-002: a closed todo leaves the default list on every client on the next read.
- NG-001: authentication per person; the team shares one API key in M1.
- NG-002: due dates, assignees, recurrence, comments, attachments.
- NG-003: editing from the web client; it is read-only in M1.

## Actors and use cases

- ACTOR-001: Maintainer; creates and closes todos from the CLI; holds the API key.
- ACTOR-002: Reviewer; reads the list in the browser; holds the same key through the deployed web client.
- UC-001: Maintainer creates a todo; the CLI prints the id; failure: an empty title is rejected before the request is sent and again by the API.
- UC-002: Reviewer lists open todos newest first; failure: the API is unreachable and the client shows its cached list marked `stale`.
- UC-003: Maintainer closes a todo by id; failure: an unknown id returns 404 and the CLI says so.

## Functional requirements

Product-level only.

- FR-001: the system shall store a todo with a title and return its id.
- FR-002: the system shall list todos newest first, 50 per page.
- FR-003: the system shall close a todo and exclude closed todos from the default list.
- BR-001: a title is 1 to 200 characters after trimming; a violation is a 400 with a stable error code.
- BR-002: closing an already closed todo is not an error and does not change `closed_at`.

## Constraints

- Runs as one container next to the existing PostgreSQL on the team server; no managed services.
- No personal data beyond free-text titles; titles never appear in logs.
- M1 ships before the end of October 2026 so the shared file can be retired.

## Success criteria

| Signal | Target or interpretation | Measurement source |
|---|---|---|
| lost-todo reports | zero in the two weeks after M1 | team retro notes |
| `GET /todos` p95 latency | under 200 ms with 500 todos | `request_duration_ms` log field |

## Risks and assumptions

- R-001: the shared API key leaks through a client config; likelihood low, impact medium; mitigation: key rotation runbook in M2 and no key in the web bundle (served by the API host).
- Assumptions are logged in `docs/context/ASSUMPTIONS.md`: A-001 (page size, confirmed), A-002 (cursor scope when filtering by status, open).

## Milestones

- M1: create, list, close through the API; CLI switched over; exit criteria: F-001 and F-002 `implemented`, shared file retired.
- M2: key rotation, web client edits.

## Feature map

| Feature | Capability | Outcome | Depends on | Status |
|---|---|---|---|---|
| F-001 | create and list todos | one shared list readable from every client | ADR-0001 | implemented |
| F-002 | close a todo | closed items leave the default list everywhere | F-001 | implementing |

## Approval

Decision owner: ari, 2026-10-01. Notes: NG-003 reconsidered for M2 once the read-only client is in daily use.
