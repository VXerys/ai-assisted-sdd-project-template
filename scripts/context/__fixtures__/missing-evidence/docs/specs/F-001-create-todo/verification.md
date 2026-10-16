---
id: F-001
title: Create todo
type: verification
status: implementing
tier: lite
owner: maintainer
created: 2026-10-01
last_updated: 2026-10-14
last_verified: 2026-10-14
requirements: [FR-001, FR-002]
supersedes: null
---

# Verification: Create todo

## Evidence

### EV-001 — POST handler tests pass
- command: `npm test`
- output:
  ```text
  ok 1 - creates a todo
  ok 2 - rejects an empty title
  ```
- date: 2026-10-14
- commit: a1b2c3d
- covers: [AC-001, AC-002]

## Coverage

| Criterion | Evidence | Result |
|---|---|---|
| AC-001 | EV-001 | pass |
| AC-002 | EV-001 | pass |
| AC-003 | | not_run |
