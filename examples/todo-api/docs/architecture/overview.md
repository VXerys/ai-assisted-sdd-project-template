---
id: ARCH
title: Todo API
type: architecture-baseline
status: approved
tier: lite
owner: ari
created: 2026-09-28
last_updated: 2026-10-12
last_verified: 2026-10-12
supersedes: null
---

# Architecture Baseline: Todo API

Cross-feature boundaries and invariants every module obeys. Module-level reasoning lives in each feature's `design.md` (lite tier); the stack and commands live in `docs/steering/tech.md`; directory responsibilities live in `docs/steering/structure.md`.

## System context

One HTTP API that owns the team's todo list. Clients never touch the database; the API is the only writer and the only reader of the `todos` table. Out of scope: user accounts, notifications, and any client-side persistence beyond the CLI's read cache.

| Actor or external system | Relationship | Trust boundary |
|---|---|---|
| Maintainer (CLI) | creates and closes todos with the team key | untrusted input, bearer key checked on every request |
| Reviewer (web client) | reads the list through the same key | untrusted input, read-only in M1 |
| PostgreSQL 16 (existing team instance) | system of record for the `todos` table | trusted; every write fails when it is down and the CLI serves its cached list marked `stale` |

```text
CLI or web client -> Fastify routes (auth hook) -> services -> db -> PostgreSQL 16
```

## Components

| Component | Responsibility | Owns | Does not own |
|---|---|---|---|
| `src/routes/` | HTTP parsing, JSON schema validation, auth hook, error mapping | status codes, error codes | business rules, SQL |
| `src/services/` | todo rules: title normalization, close semantics, list filtering | the meaning of `open` and `closed` | HTTP or SQL details |
| `src/db/` | queries, migrations, the `pg` pool | SQL, transactions | request handling |

## Boundaries

- B-001: inside `src/services/`, outside HTTP and SQL; services receive repository functions from `src/app.js` and throw typed errors from `src/services/errors.js`; a route never calls `pg` directly; rationale: rules stay testable without a database.
- B-002: the team key is checked by one Fastify `onRequest` hook before any route runs; no route re-implements auth; rationale: one place to rotate or replace the mechanism (M2).

## Dependency direction

```text
routes -> services -> db
```

Driver errors are normalized in `src/db/` before reaching services. Cross-feature shared code lives in `src/services/` only when two routes need the same rule. No cycles.

## Data flow and classification

`POST /todos`: route schema (400 `title_required`), `createTodo` (BR-001), `insertTodo`, 201 or a typed error mapped by the route.

| Data | Owner | Where stored | Sensitivity |
|---|---|---|---|
| todo rows (`id`, `title`, `created_at`, `closed_at`) | `src/db/` | PostgreSQL database `todo` | internal; titles never appear in logs |
| team API key | deployment config | environment of the `api` container | secret |
| CLI read cache | the CLI | per-machine file, marked `stale` when the API is unreachable | internal |

## State ownership

| State | Owner | Source of truth | Mutation path | Invalidation or sync |
|---|---|---|---|---|
| todo list | the API | `todos` table | `POST /todos`, `POST /todos/:id/close` | clients re-read; the CLI cache is best-effort |

## Security

One shared bearer key in M1 (NG-001 in the PRD), enforced by the `onRequest` hook; the API is single-tenant, so there is no per-user authorization and no RLS. Rotation is a manual runbook until M2. Key from the environment, never in the web bundle (served by the API host). Input validated by route JSON schemas. Titles never logged; structured JSON logs carry `request_id` and `request_duration_ms` only.

## Deployment

One container (`docker compose` service `api`) on the team server next to the existing PostgreSQL 16 container, database `todo`; the web client is static files served by the API. Migrations are reviewed SQL files under `db/migrations/` applied by the migration runner, one transaction per file; rollback is a forward fix. No background jobs.

## Decisions and open questions

- ADR-0001 (`../adr/ADR-0001-postgres-over-sqlite.md`): PostgreSQL over SQLite as the system of record, approved.
- A-002 (cursor scope when filtering by status) is open in `docs/context/ASSUMPTIONS.md`.

## Approval and change rule

Architecture owner ari, approved 2026-10-01. A cross-feature or expensive-to-reverse change requires an ADR and owner approval before implementation.
