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
5. active feature system architecture when present/required
6. active feature implementation design
7. active feature tasks
8. relevant ADRs
9. relevant code and tests

Read `docs/context/PROGRESS.md` only when the compact state is insufficient.

Use progressive disclosure for module architecture. A task that only changes local UI may need only the architecture constraints already referenced by the task/design. A task that touches data ownership, consistency, realtime/async communication, caching, security, external services, reliability, scale, or cost-sensitive behavior should read the relevant `system-architecture.md` sections directly.

## Planning or documentation session

Read only the relevant durable artifacts:

1. `docs/product/`
2. `docs/architecture/README.md`
3. relevant global architecture concern
4. relevant feature requirements
5. relevant module `system-architecture.md`
6. relevant feature implementation design
7. relevant ADRs

Generated execution views are not substitutes for requirements or architecture.

## Canonical map

| Question | Source |
|---|---|
| Why and for whom? | `docs/product/` |
| Shared system rules? | `docs/architecture/` |
| How does one module behave as a system? | `docs/specs/<feature>/system-architecture.md` |
| Why a significant decision? | `docs/adr/` |
| Approved feature behavior? | `docs/specs/<feature>/requirements.md` |
| Approved repository implementation approach? | `docs/specs/<feature>/design.md` |
| Execution status? | `docs/context/state.yaml` |
| Compact execution view? | `docs/context/PROJECT_STATE.md` |
| Full execution board? | `docs/context/PROGRESS.md` |
| Current session delta? | `docs/handoff/current.md` |
| Actual implementation? | Code, tests, schemas, migrations |

## Architecture relationship

```text
project architecture
  -> feature requirements
  -> module system architecture
  -> implementation design
  -> tasks
```

If a module-local architecture decision becomes cross-feature, evaluate promotion into `docs/architecture/` and an ADR rather than copying the same rule into multiple places.

Read `docs/architecture/MODULE_ARCHITECTURE_GUIDE.md` for the boundary between module architecture and implementation design.

## Generated files

These files are generated and must not be edited:

- `docs/context/PROJECT_STATE.md`
- `docs/context/PROGRESS.md`

## Context-system implementation

Read `docs/context/CONTEXT_SYSTEM.md`.

The repository-integrated coding agent owns implementation and provider adapters. A conversational AI may draft requirements, architecture alternatives, and design but cannot determine real local commands, schemas, provider configuration, or hooks without repository access.

## Conflict protocol

When two sources conflict:

1. stop affected work;
2. identify each source and its authority;
3. inspect Git and implementation;
4. determine whether requirements, module architecture, implementation design, or code is stale/incorrect;
5. propose the smallest correction;
6. require human approval for product or architecture changes;
7. update the canonical source, then regenerate derived views.
