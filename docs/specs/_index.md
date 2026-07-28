---
id: FEATURE-REGISTRY
title: Feature Registry
status: template
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
---

# Feature Registry

This file is the durable navigation registry for feature specifications.

Mutable execution status, active task, blockers, and commits belong in `docs/context/state.yaml`.

| Feature ID | Feature | Spec path | Product priority | Lifecycle gate | Related milestone |
|---|---|---|---|---|---|
| `F-XXX` | {{FEATURE_NAME}} | `docs/specs/F-XXX-feature-name/` | P0 | draft | {{MILESTONE}} |

## Lifecycle gate meaning

- `draft`: specification is being written;
- `review`: awaiting product or architecture review;
- `approved`: contract is approved and may enter execution planning;
- `implemented`: accepted implementation exists;
- `superseded`: replaced by another feature contract.

Do not update this file for every task transition. The context system owns mutable progress.
