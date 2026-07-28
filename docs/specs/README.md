---
id: SPECS-INDEX
title: Feature Specifications
status: template
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
---

# Feature Specifications

## Default package

```text
F-XXX-feature-name/
├── requirements.md
├── design.md
├── tasks.md
└── verification.md
```

Each feature is an independently approvable vertical capability.

## Lifecycle

```text
draft -> review -> approved -> implementing -> verification -> implemented -> superseded
```

Approved requirements and design are contracts. Implementation does not silently rewrite them.

## Split the feature before splitting files

When a feature document becomes very large, first determine whether the feature combines independent user capabilities.

Prefer separate features such as:

```text
F-012-cart-management/
F-013-discount-calculation/
F-014-payment-processing/
F-015-receipt-generation/
```

over one oversized checkout specification.

## Advanced package

Use this only after the feature remains complex despite scope reduction:

```text
F-XXX-feature/
├── README.md
├── requirements/
│   ├── functional.md
│   ├── business-rules.md
│   └── non-functional.md
├── design/
│   ├── overview.md
│   ├── data-flow.md
│   ├── state-management.md
│   ├── error-handling.md
│   └── security.md
├── tasks.md
└── verification/
    ├── acceptance-matrix.md
    ├── automated-tests.md
    └── manual-scenarios.md
```

The feature `README.md` defines reading order and canonical ownership.

## Authoring responsibility

- Conversational AI may draft requirements, design alternatives, tasks, and verification scenarios.
- Human owner approves scope, requirements, design, and acceptance.
- Repository-integrated coding agent validates file paths, existing architecture, commands, and feasibility against the real repo.
- Coding agent updates execution status and evidence during implementation.

## Traceability

Every task references requirement IDs. Every acceptance criterion receives evidence. Architecture-level decisions link to ADRs.

See `docs/documentation/MODULARIZATION_GUIDE.md`.
