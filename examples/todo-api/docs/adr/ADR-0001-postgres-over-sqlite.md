---
id: ADR-0001
title: PostgreSQL over SQLite as the system of record
type: adr
status: approved
tier: lite
owner: ari
created: 2026-09-27
last_updated: 2026-09-28
last_verified: 2026-10-12
supersedes: null
---

# ADR-0001: PostgreSQL over SQLite as the system of record

## Context

The list is edited from two machines in two time zones. The failure we are fixing is "last writer wins" on a shared file, so the store must accept concurrent writes from one process that every client talks to. The team server already runs PostgreSQL 16 for other tools; nobody wants a second database engine to operate.

## Decision drivers

- One writer, consistent reads for every client.
- No new infrastructure to operate.
- Schema changes reviewable as files.

## Options

### Option A — SQLite file inside the API container

- Advantages: zero setup, one file to back up, fast for this data size.
- Disadvantages: the file lives in the container's volume, so a redeploy or host move needs a copy step; backups become one more thing the team has to remember; moving to a second API instance later means migrating anyway.
- Risks: the volume is lost on a careless `docker compose down -v`; it has happened on this host.

### Option B — PostgreSQL 16, the existing team instance

- Advantages: already backed up nightly with the other databases; concurrent writers are the normal case; `psql` is on every team machine.
- Disadvantages: tests need a reachable database (`docker compose up -d db`); one more database and role to create.
- Risks: a migration run by hand against the wrong database; mitigated by `DATABASE_URL` per environment and the `todo_migrator` role.

## Decision

We will use PostgreSQL 16 on the existing team instance as the only system of record, with schema changes as versioned SQL files under `db/migrations/`.

Applies to: the todos table and every future table of this API. Does not apply to: the CLI's local read cache, which stays a JSON file and is never written back.

## Rationale

Option B costs one database and one role on infrastructure that is already operated and backed up, and it removes the backup and volume risks of Option A instead of documenting them. The test-time dependency is acceptable: the compose file already exists for the other tools.

## Consequences

- Positive: nightly backups for free; concurrent writes handled by the database, not by the API.
- Negative or cost: `npm test` needs a running database; contributors run `docker compose up -d db` first.
- Operational: a `todo` database and the `todo_app` and `todo_migrator` roles exist per environment; the connection string is injected as `DATABASE_URL`.

## Revisit when

- The API gets a second instance or a second tenant (then review connection pooling and RLS).
- The team retires the shared PostgreSQL instance.
