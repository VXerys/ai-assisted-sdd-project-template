---
id: CONTEXT-INDEX
title: Context Reading Index
status: template
owner: ""
last_updated: 2026-10-15
---

# Context Reading Index

## New coding-agent session

1. `docs/context/BRIEF.md`
2. `docs/steering/rules.md`, `tech.md`, `structure.md`, `workflow.md`, `product.md`
3. `docs/handoff/current.md`
4. The active feature's `tasks.md`
5. The `requirements.md`, `design.md`, and `system-architecture.md` sections the task references
6. Relevant ADRs
7. Relevant code and tests

When `BRIEF.md` is absent or stale, use the fallback read order in `CONTEXT_SYSTEM.md`. Read `PROGRESS.md` only when the brief is insufficient.

Load module architecture progressively: a local UI task carries its constraints in the task block; a task touching data ownership, consistency, communication, caching, security, external services, reliability, scale, or cost reads the relevant `system-architecture.md` sections directly.

## Planning or documentation session

1. `docs/steering/product.md`, then `docs/product/`
2. `docs/architecture/README.md` and the relevant concern
3. Relevant feature `requirements.md`, `system-architecture.md`, `design.md`
4. Relevant ADRs

Rendered views are not substitutes for requirements or architecture.

## Canonical map

| Question | Source |
|---|---|
| Why and for whom? | `docs/steering/product.md`, `docs/product/` |
| Which commands and stack? | `docs/steering/tech.md` |
| Where does code live, which paths are frozen? | `docs/steering/structure.md` |
| Which rules and stop conditions apply? | `docs/steering/rules.md` |
| Shared system rules? | `docs/architecture/` |
| How does one module behave as a system? | `docs/specs/<feature>/system-architecture.md` |
| Why a significant decision? | `docs/adr/` |
| Approved feature behavior? | `docs/specs/<feature>/requirements.md` |
| Approved repository mapping? | `docs/specs/<feature>/design.md` |
| Task status? | `docs/specs/<feature>/tasks.md` |
| What was proven? | `docs/specs/<feature>/verification.md` |
| What is unknown? | `docs/context/ASSUMPTIONS.md` |
| Where to start a session? | `docs/context/BRIEF.md` |
| Current session delta? | `docs/handoff/current.md` |
| Actual implementation? | code, tests, schema, configuration |

## Rendered files

Never edited by hand; listed under `generated` in `sdd.config.json`:

- `docs/context/state.yaml`
- `docs/context/BRIEF.md`
- `docs/context/PROJECT_STATE.md`
- `docs/context/PROGRESS.md`
- `AGENTS.md`, `CLAUDE.md`, and the other tool adapters listed under `generated` (rendered by `npm run adapters:sync`)

## Conflict protocol

Stop the affected work; name each source and its authority; inspect git and implementation; decide whether requirements, architecture, design, or code is stale; propose the smallest correction; require owner approval for product or architecture changes; update the canonical source, then re-render.
