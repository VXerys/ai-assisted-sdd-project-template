---
inclusion: always
---

# Product

Short, always-loaded product context. The full product requirements live in `docs/product/prd.md`; this file agrees with it.

## Vision

Todo API is a JSON API for small teams that keeps one shared todo list consistent across a CLI and a web client.

Two people editing the same list from different machines currently overwrite each other's `todo.json`. Working means: every client reads and writes the same list through the API, and a todo closed on one machine disappears from the other within one refresh. Project content (specs, product docs, API messages) is written in English; the framework text stays English.

## Personas

- Maintainer: runs the team list from a terminal; creates and closes todos several times a day; expects a request to finish in under 200 ms.
- Reviewer: opens the web client once a day to see what is still open; never edits from the browser in this milestone.

## Core use cases

- UC-001: Maintainer, runs `todo add "Rotate the staging key"`, the CLI calls `POST /todos` and prints the new id.
- UC-002: Reviewer, opens the web client, `GET /todos` returns open todos newest first.
- UC-003: Maintainer, runs `todo close 42`, the CLI calls `PATCH /todos/42/close`; the todo leaves every client's default list.

## Non-goals

- Authentication and per-user lists: one team, one list, one API key held by both clients.
- Recurring todos, due dates, assignees, comments.
- A web client that edits; the browser is read-only in M1.

## Success signals

| Signal | What it tells us | Source |
|---|---|---|
| zero reports of a lost todo after two weeks of team use | the shared store replaced the overwritten file | team retro notes |
| p95 latency of `GET /todos` under 200 ms with 500 todos | the list stays usable from the CLI | `request_duration_ms` log field |

## Constraints that shape product decisions

- The CLI must keep working offline for reads: it caches the last list locally and shows it with a `stale` marker.
- No personal data beyond free-text titles; titles are never logged.
