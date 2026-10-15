---
id: F-002
title: Close a todo
type: requirements
status: implementing
tier: lite
owner: ari
created: 2026-10-11
last_updated: 2026-10-14
last_verified: 2026-10-14
supersedes: null
---

# Requirements: Close a todo

Observable behavior only. Repository mapping is in `design.md`.

## Problem

Finished chores stay in the list forever, so the default list grows and the CLI output becomes noise. Closing must be visible from every client on the next read.

## Goal

A todo closed from any client leaves the default list of every client on the next read, and stays retrievable with a filter.

## Non-goals

- Reopening a closed todo.
- Deleting a todo.

## Actors

- ACTOR-001: Maintainer, closes todos from the CLI.
- ACTOR-002: Reviewer, filters the web client by status.

## Functional requirements

### FR-001 — Close a todo

The system shall mark a todo closed and record when.

- AC-001: Given an open todo, when `PATCH /todos/:id/close` is called, then the response is 200 with `status: "closed"` and a `closed_at` timestamp.
- AC-002: Given an unknown id, when `PATCH /todos/:id/close` is called, then the response is 404 with `{error: "todo_not_found"}`.
- AC-003: Given an already closed todo, when `PATCH /todos/:id/close` is called again, then the response is 200 and `closed_at` is unchanged (BR-002 in the PRD).

### FR-002 — Closed todos leave the default list

The system shall exclude closed todos from `GET /todos` unless a status filter asks for them.

- AC-004: Given one open and one closed todo, when `GET /todos` is called, then only the open one is returned.
- AC-005: Given the same data, when `GET /todos?status=closed` is called, then only the closed one is returned; `?status=all` returns both, newest first.

## Business and validation rules

- BR-001: `status` accepts `open` (default), `closed`, `all`; anything else is 400 `{error: "bad_status"}`.

## Dependencies and constraints

- F-001 `implemented`: the list endpoint and cursor exist.
- No schema change: `status` and `closed_at` already exist on `todos`.

## Out of scope

- Bulk close.

## Open questions

- A-002: whether a cursor from one status filter stays valid under another, blocking: no (T-002 proceeds with a shared cursor).
