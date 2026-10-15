---
id: FEATURE-REGISTRY
title: Feature Registry
status: active
owner: ari
last_updated: 2026-10-14
---

# Feature Registry

Durable navigation registry for feature specifications. Task status belongs in each feature's `tasks.md`; `docs/context/state.yaml` and the context views are rendered from it.

| Feature ID | Feature | Spec path | Product priority | Lifecycle gate | Related milestone |
|---|---|---|---|---|---|
| `F-001` | Create and list todos | `docs/specs/F-001-create-todo/` | P0 | implemented | M1 |
| `F-002` | Close a todo | `docs/specs/F-002-close-todo/` | P0 | implementing | M1 |

## Lifecycle gate meaning

- `draft`: specification is being written;
- `review`: awaiting product or architecture review;
- `approved`: contract is approved and may enter execution planning;
- `implementing`: tasks are being executed;
- `implemented`: accepted implementation exists;
- `superseded`: replaced by another feature contract.

Do not update this file for every task transition. The context system owns mutable progress.
