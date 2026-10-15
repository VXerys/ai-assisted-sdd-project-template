# Architecture Boundaries

## Purpose

Ownership and allowed dependencies between modules. Adjust the matrix to the selected stack and repository structure; the dependency direction itself is set in `docs/steering/structure.md`.

## Boundary matrix

| From | May depend on | Must not depend on |
|---|---|---|
| Presentation | Application interfaces, UI models | Database clients, infrastructure SDKs |
| Application | Domain rules, repository contracts | Framework UI, concrete infrastructure |
| Domain | Domain types and pure policies | Network, database, framework APIs |
| Infrastructure | Repository contracts, external SDKs | Presentation state |

## Data ownership

| Data or rule | Canonical owner | Consumers |
|---|---|---|
| | module or feature | |

## Cross-feature rules

1. A feature may expose explicit public interfaces; consumers must not import its internal implementation.
2. Shared modules must represent stable cross-feature concepts, not convenience dumping grounds.
3. Circular dependencies are prohibited.
4. New boundary exceptions require an ADR.

## Enforcement

- Static analysis rule or import boundary test: the lint command in `docs/steering/tech.md`, or `none` until one exists.
- Manual review owner: {{OWNER}}
