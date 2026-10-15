---
id: F-001
title: Create todo
type: requirements
status: implementing
tier: lite
owner: maintainer
created: 2026-10-01
last_updated: 2026-10-14
last_verified: 2026-10-14
supersedes: null
---

# Requirements: Create todo

## Functional requirements

### FR-001 — Create a todo

The system shall store a todo with a title.

- AC-001: Given a valid title, when POST /todos is called, then 201 and the todo are returned.
- AC-002: Given an empty title, when POST /todos is called, then 400 is returned.

### FR-002 — List todos

The system shall list todos newest first.

- AC-003: Given two todos, when GET /todos is called, then the newer one comes first.
