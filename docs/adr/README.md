---
id: ADR-INDEX
title: Architecture Decision Records
status: template
owner: ""
last_updated: 2026-10-15
---

# Architecture Decision Records

## Rule

One expensive-to-reverse decision equals one ADR.

```text
ADR-0001-use-managed-backend-as-system-of-record.md
ADR-0002-enforce-tenant-isolation-at-the-data-layer.md
ADR-0003-adopt-offline-first-local-store.md
```

Do not create one `all-architecture-decisions.md`.

## When to create an ADR

- Changes system or trust boundaries.
- Introduces or replaces a framework, provider, data store, or major dependency.
- Changes authentication or authorization.
- Changes persistence, public APIs, or event contracts.
- Creates migration or compatibility obligations.
- Affects multiple features or is expensive to reverse.

## Size

Normally 30 to 80 lines. Review an ADR over 120 lines for multiple decisions.

## Lifecycle

```text
draft -> review -> approved -> superseded
```

Status vocabulary matches the template frontmatter. A proposal that is not taken is closed as `superseded` by the ADR that records what was chosen instead, with a one-line note. Never rewrite approved history; write a new ADR and set `supersedes`.

## Ownership

- Conversational AI may analyze alternatives and draft the ADR.
- The coding agent verifies feasibility and affected code.
- The human owner approves.
- Automation validates numbering, metadata, and links only.

## Index

| ADR | Status | Decision | Superseded by |
|---|---|---|---|
| [ADR-0001](ADR-0001-v2-revamp.md) | approved | Template v2 revamp: single source of truth, rendered context, enforced traceability | |
| [ADR-0002](ADR-0002-v2.1-hardening.md) | approved | v2.1 hardening: trusted evidence, guard coverage, multi-agent locks, hookless parity | amended by ADR-0003, ADR-0004 |
| [ADR-0003](ADR-0003-v2.1-amendments.md) | approved | v2.1 amendments: tooling stays in the template, copier-style upgrade, hook scope, adapter dedupe | |
| [ADR-0004](ADR-0004-dogfood-first-roadmap.md) | approved | Dogfood-first roadmap: release order, structured evidence, file-lease claims, lite cap 120 | |

Use `docs/_templates/adr.md` for new records.
