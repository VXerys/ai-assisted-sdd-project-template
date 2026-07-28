# Architecture Boundaries

## Purpose

Define ownership and allowed dependencies between modules. Customize this file to match the selected stack and repository structure.

## Boundary Matrix

| From | May depend on | Must not depend on |
|---|---|---|
| Presentation | Application interfaces, UI models | Database clients, infrastructure SDKs |
| Application | Domain rules, repository contracts | Framework UI, concrete infrastructure |
| Domain | Domain types and pure policies | Network, database, framework APIs |
| Infrastructure | Repository contracts, external SDKs | Presentation state |

## Data Ownership

| Data or rule | Canonical owner | Consumers |
|---|---|---|
| {{ENTITY_OR_RULE}} | {{MODULE}} | {{CONSUMERS}} |

## Cross-Feature Rules

1. A feature may expose explicit public interfaces; consumers must not import its internal implementation.
2. Shared modules must represent stable cross-feature concepts, not convenience dumping grounds.
3. Circular dependencies are prohibited.
4. New boundary exceptions require an ADR.

## Enforcement

- Static analysis rule: `{{COMMAND_OR_TOOL}}`
- Import boundary test: `{{COMMAND_OR_TOOL}}`
- Manual review owner: `{{OWNER}}`
