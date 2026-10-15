---
inclusion: always
---

# Tech

Stack and commands. Filled by `npm run init` from the `node-api` and `postgres` presets, then checked against the repository. A command listed here exists and runs.

## Stack

| Concern | Technology | Reason or constraint |
|---|---|---|
| Language and runtime | JavaScript (ESM) on Node 22 | no TypeScript in M1; JSDoc types only |
| Application framework | Node.js API on Fastify 5 | schema validation at the route boundary |
| Data store | PostgreSQL 16 | shared state across machines, see ADR-0001 |
| Source and test paths | `src/**`, `test/**` | globs used by `fileMatch` steering rules |
| Test framework | `node:test` with `supertest` | no extra runner |
| Deployment target | one container on the team server | `docker compose up` in production and locally |

## Commands

Run these before claiming any task done. Report a command that cannot run; never claim its success.

| Purpose | Command |
|---|---|
| Install | `npm ci` |
| Analyze or lint | `npx eslint .` |
| Typecheck | `none` |
| Format check | `npx prettier --check .` |
| Test | `npm test` |
| Build | `none` |
| Run locally | `npm run dev` |
| Data store change check | `psql "$DATABASE_URL" -f db/migrations/<file>.sql` |
| Context validation | `npm run context:validate` |

`npm test` needs a reachable PostgreSQL at `DATABASE_URL`; `docker compose up -d db` provides one locally.

## Stack rules

- Every request body and query is validated at the route boundary; services receive typed input only.
- Errors map to HTTP status codes in one place (`src/routes/errors.js`); handlers never leak stack traces or driver messages.
- Configuration comes from the environment; the process fails fast on a missing `DATABASE_URL`.
- `npx eslint .` clean and `npm test` green before a task is done.

## Environment and secrets

- `DATABASE_URL` and `API_KEY` come from the environment; `.env` is gitignored and `.env.example` lists the names without values.
- Agents never read, print, or commit `.env*`.

## Dependency policy

Before adding or replacing a dependency, state the problem it solves, the native alternative considered, maintenance health, runtime impact, and license. Approval rule: the owner approves every new or replaced dependency; record the approval in the task that adds it. Current runtime dependencies: `fastify`, `pg`.

## Data store changes

Schema changes are versioned SQL files under `db/migrations/`, reviewed like code. Append-only; destructive changes need explicit approval. The store's own rules are in the `database.md` steering file.
