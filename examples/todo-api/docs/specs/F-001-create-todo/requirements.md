---
id: F-001
title: Create and list todos
type: requirements
status: implemented
tier: lite
owner: ari
created: 2026-09-28
last_updated: 2026-10-10
last_verified: 2026-10-10
supersedes: null
---

# Requirements: Create and list todos

Observable behavior only. Repository mapping is in `design.md`.

## Problem

Todos live in a synced file that drops entries on concurrent edits. The CLI and the web client need one place to create a todo and one place to read the list.

## Goal

A todo created from any client is visible from every client on the next read, newest first.

## Non-goals

- Closing, editing, or deleting a todo (F-002 covers closing).
- Any filter other than paging.

## Actors

- ACTOR-001: Maintainer, calls the API from the CLI with the team key.
- ACTOR-002: Reviewer, reads the list from the web client with the same key.

## Functional requirements

### FR-001 — Create a todo

The system shall store a todo with a title and return the stored todo.

- AC-001: Given a valid title, when `POST /todos` is called, then the response is 201 with `{id, title, status: "open", created_at}` and the todo is in the next list.
- AC-002: Given an empty or whitespace-only title, when `POST /todos` is called, then the response is 400 with `{error: "title_required"}` and nothing is stored.

### FR-002 — List todos

The system shall list open todos newest first, 50 per page, with an opaque cursor for the next page.

- AC-003: Given two todos created in sequence, when `GET /todos` is called, then the newer one comes first.
- AC-004: Given 51 open todos, when `GET /todos` is called without a cursor, then 50 are returned and `next_cursor` is set; calling again with that cursor returns the remaining one and `next_cursor: null`.

### FR-003 — Title rules

The system shall trim titles and limit them to 200 characters.

- AC-005: Given the title `"  Rotate the key  "`, when `POST /todos` is called, then the stored title is `"Rotate the key"`.
- AC-006: Given a title of 201 characters after trimming, when `POST /todos` is called, then the response is 400 with `{error: "title_too_long"}`.

## Business and validation rules

- BR-001: a title is 1 to 200 characters after trimming; the error code names the violated rule.
- BR-002: the page size is fixed at 50 (A-001); no `limit` parameter in M1.

## Dependencies and constraints

- ADR-0001: PostgreSQL is the only store; the CLI cache is read-only.
- Every request carries the team key; an unauthorized request is a 401 handled by the shared hook, outside this feature.

## Out of scope

- Updating a title after creation.

## Open questions

- A-001: default page size, blocking: no (confirmed 2026-10-03).
