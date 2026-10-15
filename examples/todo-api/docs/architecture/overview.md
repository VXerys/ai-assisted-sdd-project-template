---
status: approved
owner: ari
last_updated: 2026-10-12
last_verified_commit: 7d41c0e
source_of_truth_for:
  - system-boundaries
  - dependency-direction
---

# Architecture Overview

## 1. System Purpose

One HTTP API that owns the team's todo list. Clients never touch the database; the API is the only writer and the only reader of the `todos` table. Out of scope: user accounts, notifications, and any client-side persistence beyond the CLI's read cache.

## 2. Architecture Drivers

- A single consistent list across machines (the reason the project exists, see ADR-0001).
- Low operational surface: one container, one database the team already runs.
- Change safety: every schema change is a reviewed SQL file.

## 3. System Context

```text
Maintainer (CLI) / Reviewer (web client)
  -> Todo API (Fastify, one container)
  -> PostgreSQL 16 (existing team instance)
```

External systems:

| System | Purpose | Data exchanged | Failure impact |
|---|---|---|---|
| PostgreSQL 16 | system of record for todos | rows of the `todos` table | every write fails; the CLI serves its cached list marked `stale` |

## 4. Major Components

| Component | Responsibility | Owns | Must not own |
|---|---|---|---|
| `src/routes/` | HTTP parsing, JSON schema validation, auth hook, error mapping | status codes, error codes | business rules, SQL |
| `src/services/` | todo rules: title normalization, close semantics, list filtering | the meaning of `open` and `closed` | HTTP or SQL details |
| `src/db/` | queries, migrations, the `pg` pool | SQL, transactions | request handling |

## 5. Dependency Direction

```text
routes -> services -> db
```

Rules:

1. `services/` imports nothing from `routes/` or `db/` drivers; it calls repository functions passed in by `src/app.js`.
2. Driver errors are normalized in `src/db/` before reaching services; services throw typed errors from `src/services/errors.js`.
3. Authorization (the team key) is enforced by one Fastify `onRequest` hook, before any route runs.
4. Cross-feature shared code lives in `src/services/` only when two routes need the same rule.

## 6. Data Flow

### Flow AF-001 — Create a todo

1. `POST /todos` enters `src/routes/todos.js`; the auth hook has already checked the bearer key.
2. The route schema rejects a missing or non-string `title` with 400 `title_required`.
3. `createTodo(input)` in `src/services/todos.js` trims the title and applies BR-001.
4. `insertTodo(row)` in `src/db/todos.js` writes one row and returns it.
5. The route maps the row to the response body and replies 201; a typed `ValidationError` becomes 400 with its code.

## 7. Deployment Topology

- Client runtime: the CLI (Node 22) on each machine; the web client served as static files by the API container.
- Application hosting: one container on the team server, `docker compose` service `api`.
- Database: the existing PostgreSQL 16 container on the same host, database `todo`.
- Storage: none beyond the database.
- Background jobs: none.
- Observability: structured JSON logs to stdout with `request_id` and `request_duration_ms`; no titles in logs.

## 8. Quality Attributes

| Attribute | Required behavior | Verification |
|---|---|---|
| Security | every route requires the team key; titles never logged | `test/auth.test.js`; log assertion in `test/logging.test.js` |
| Reliability | a failed write never leaves a half-created todo | single-statement inserts; migration runner uses one transaction per file |
| Performance | `GET /todos` p95 under 200 ms with 500 rows | `test/list-perf.test.js` against a seeded database |
| Maintainability | a route handler is at most 20 lines | review checklist |

## 9. Known Constraints

- One shared API key in M1 (NG-001 in the PRD); rotation is a manual runbook until M2.
- No RLS: the API is single-tenant, so authorization is the bearer key, not the database.

## 10. Related Decisions

- `../adr/ADR-0001-postgres-over-sqlite.md`

Feature-specific implementation details live in each feature's `design.md`.
