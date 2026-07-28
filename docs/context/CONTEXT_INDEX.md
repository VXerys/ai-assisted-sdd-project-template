---
id: CONTEXT-INDEX
title: Context Reading Index
status: template
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
---

# Context Reading Index

## New coding-agent session

Read in order:

1. `AGENTS.md`
2. `docs/context/PROJECT_STATE.md`
3. `docs/handoff/current.md`
4. active feature requirements
5. active feature design
6. active feature tasks
7. relevant ADRs
8. relevant code and tests

Read `docs/context/PROGRESS.md` only when the compact state is insufficient.

## Planning or documentation session

Read only the relevant durable artifacts:

1. `docs/product/`
2. `docs/architecture/README.md`
3. relevant architecture concern
4. relevant ADRs
5. relevant feature specs

Generated execution views are not substitutes for requirements or architecture.

## Canonical map

| Question | Source |
|---|---|
| Why and for whom? | `docs/product/` |
| Shared system rules? | `docs/architecture/` |
| Why a decision? | `docs/adr/` |
| Approved feature behavior? | `docs/specs/<feature>/requirements.md` |
| Approved feature approach? | `docs/specs/<feature>/design.md` |
| Execution status? | `docs/context/state.yaml` |
| Compact execution view? | `docs/context/PROJECT_STATE.md` |
| Full execution board? | `docs/context/PROGRESS.md` |
| Current session delta? | `docs/handoff/current.md` |
| Actual implementation? | Code, tests, schemas, migrations |

## Generated files

These files are generated and must not be edited:

- `docs/context/PROJECT_STATE.md`
- `docs/context/PROGRESS.md`

## Context-system implementation

Read `docs/context/CONTEXT_SYSTEM.md`.

The repository-integrated coding agent owns implementation and provider adapters. A conversational AI may draft the design but cannot determine real local commands or hooks without repository access.

## Conflict protocol

When two sources conflict:

1. stop affected work;
2. identify each source and its authority;
3. inspect Git and implementation;
4. propose the smallest correction;
5. require human approval for product or architecture changes;
6. update the canonical source, then regenerate derived views.
