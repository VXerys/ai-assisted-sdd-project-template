---
id: F-002
title: Close todo
type: requirements
status: draft
tier: lite
owner: maintainer
created: 2026-10-14
last_updated: 2026-10-14
last_verified: 2026-10-14
supersedes: null
---

# Requirements: Close todo

## Functional requirements

### FR-001 — Close a todo

The system shall mark a todo as closed.

- AC-001: Given an open todo, when PATCH /todos/:id/close is called, then its state is closed.
