---
inclusion: always
---

# Rules

Engineering rules every agent and contributor applies. The lifecycle is in `workflow.md`.

## Engineering

- Follow existing project patterns before introducing a new abstraction.
- Keep the change inside the selected task. Discovered work becomes a new task in `tasks.md`, not a silent extension.
- Inspect the repository before asserting a path, API, schema field, command, or framework behavior. Never invent one.
- Preserve existing behavior and contracts unless the referenced spec changes them.
- Add or update tests for changed behavior. Never weaken or disable a test to make a check pass.
- Comments explain why, not what. No decorative banners or separator comments.
- Treat generated and frozen paths from `sdd.config.json` as read-only.

## Evidence before claims

- "Done" means: lint and test commands from `tech.md` ran, and their output is recorded as EV blocks in the feature's `verification.md`.
- A check that could not run is reported with the reason and residual risk. It is never reported as passed.
- A task reaches `done` only with at least one evidence id. A feature reaches `implemented` only with every task `done` or `deferred` and no `open` assumption.

## Unknowns

Log an unknown in `docs/context/ASSUMPTIONS.md` as `A-XXX` with `status: open` instead of guessing. Continue only on work the assumption does not affect; mark the affected task `blocked`.

## Prohibited without explicit owner approval

- Changing the shape of a `/todos` response or error code.
- Destructive data operations: drop, mass delete, reset, backfill with unknown impact, editing an applied migration.
- Adding a dependency outside the policy in `tech.md`.
- Importing `pg` or Fastify outside the layer that owns it (`structure.md`).
- Changing the production compose file, credentials, or configuration.
- Force push, history rewrite, or any git operation that can destroy work.
- Editing a generated or frozen path.
- Deploying or sending messages on the owner's behalf.

## Stop conditions

Stop and report, instead of implementing, when the task would require any prohibited action above, when two sources of truth conflict, when a blocking assumption is open, or when a required command is unavailable.

## Data and security

- No secrets in the repository. Never read, print, or commit `.env*` or store credentials.
- Every request carries the team `API_KEY` in `Authorization: Bearer`; the check lives in one Fastify hook, never per route.
- Validate untrusted input at the boundary with the route's JSON schema. Titles are never logged.
- Data store changes are versioned, append-only, reviewed, and reversible or explicitly accepted as forward-only.
- Project-specific rule: `closed_at` is set only by the close service; no other code path writes it.

## Source of truth and conflicts

Requirements own behavior, design owns the repository mapping, `tasks.md` owns task status, code and tests own current behavior, `tech.md` owns commands. Chat history and provider memory are never a source of truth.

When sources conflict: stop the affected work, name both sources, inspect code and git, propose the smallest correction, get approval for product, architecture, security, or data changes, update the canonical source, then continue.
