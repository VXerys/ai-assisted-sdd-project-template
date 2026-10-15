---
status: approved
owner: ari
created: 2026-09-22
last_updated: 2026-09-26
last_verified_commit: 1a0e7b2
---

# Idea Brief: Todo API

## Problem Statement

The team's shared chore list is a JSON file on a synced drive. Concurrent edits silently drop entries, and people have started keeping private copies, which defeats the purpose of a shared list.

## Affected Users

- Primary user: the on-call maintainer who adds and closes chores several times a day from a terminal.
- Context: four people, two time zones, edits clustered around the daily sync call.
- Current workaround: a private copy per person plus a weekly "merge" by hand.

## Evidence

- Two confirmed data-loss incidents on 2026-09-09 and 2026-09-17 (drive version history shows the overwritten entries).
- Request from the team lead on 2026-09-18 to "just put it behind an API".

Separate confirmed evidence from assumptions: the latency expectation (under 200 ms) is a preference voiced in the sync call, not a measured need.

## Desired Outcome

No lost entries for two weeks after the switch, and the private copies disappear because the shared list is trusted again.

## Constraints

- Time: ship before the end of October 2026.
- Budget: no new hosting; reuse the team server and its PostgreSQL.
- Technology: Node 22 is already installed on the server and known to everyone on the team.
- Compliance or policy: no personal data beyond free-text titles.

## Assumptions to Validate

| ID | Assumption | Validation method | Status |
|---|---|---|---|
| ASM-001 | one shared API key is acceptable for M1 | ask the team lead | Validated 2026-09-24 |
| ASM-002 | 50 todos per page is enough for the CLI | count the current list (31 open) | Validated, see A-001 |

## Risks

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| RISK-001 | the CLI switch happens before the API is stable and people go back to the file | Medium | keep the file read-only for one week, then delete it |

## Open Questions

- OQ-001: should closed todos stay visible with a filter, or disappear? Answered 2026-10-11: visible with `?status=closed`, see F-002.

## Go / No-Go Decision

- Decision: GO
- Owner: ari
- Date: 2026-09-26
- Reason: two data-loss incidents in one month, and the fix fits on infrastructure the team already runs.
