---
id: ARCH-INDEX
title: Architecture Documentation
status: template
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
---

# Architecture Documentation

Architecture files define cross-feature structure, boundaries, and invariants.

## Reading order

1. [`overview.md`](overview.md)
2. [`boundaries.md`](boundaries.md)
3. Read only the relevant concern:
   - data and persistence;
   - integrations and public contracts;
   - security and trust boundaries;
   - deployment and environments.

The base template intentionally starts with a small flat structure. Promote a concern into a folder only when it develops independent subconcerns.

## Canonical ownership

| Question | Canonical path |
|---|---|
| System shape and runtime flow | `overview.md` |
| Component, trust, and dependency boundaries | `boundaries.md` |
| Shared domain model and persistence | `data-model.md` or `data/` after promotion |
| APIs, events, and external services | `api-contracts.md` or `integration/` after promotion |
| Authentication, authorization, protection | `security.md` or `security/` after promotion |
| Runtime topology and environments | `deployment/` when needed |
| Why a major choice was selected | `docs/adr/` |
| Feature-local implementation design | `docs/specs/<feature>/design.md` |

## File-to-folder promotion

Example:

```text
security.md
```

becomes:

```text
security/
├── README.md
├── authentication.md
├── authorization.md
├── data-protection.md
└── threat-model.md
```

After promotion, remove the old complete source file and update links. Do not keep two authoritative versions.

## Scope rule

Only document a rule here when it affects multiple features or defines a shared boundary.

Keep feature-local details in the feature design. Promote them into architecture only after they become an approved reusable rule.

## Suggested complex structure

```text
docs/architecture/
├── README.md
├── overview.md
├── boundaries.md
├── data/
│   ├── README.md
│   ├── domain-model.md
│   ├── persistence.md
│   └── migration-strategy.md
├── integration/
│   ├── README.md
│   ├── api-boundaries.md
│   ├── external-services.md
│   └── event-contracts.md
├── security/
│   ├── README.md
│   ├── authentication.md
│   ├── authorization.md
│   ├── data-protection.md
│   └── threat-model.md
└── deployment/
    ├── README.md
    ├── topology.md
    └── environments.md
```

Follow `docs/documentation/MODULARIZATION_GUIDE.md`.
