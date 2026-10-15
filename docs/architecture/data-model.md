---
id: DATA-MODEL
title: Data Model
status: draft
owner: "{{DATA_OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
---

# Data Model

Domain meaning, relationships, ownership, and invariants shared across features. Versioned migrations, rules files, or schema versions remain authoritative for the physical shape; the store's own rules are in the `database.md` steering file when a database preset was chosen.

## Entity map

```text
Entity A 1 --- * Entity B
Entity B * --- 1 Entity C
```

## Entities

One subsection per entity: purpose; a field table (field, meaning, required, sensitive, rules); invariants as `INV-001` lines that must always hold; who creates, updates, and deletes or archives it.

### Example entity

| Field | Meaning | Required | Sensitive | Rules |
|---|---|---|---|---|
| `id` | stable identifier | yes | no | never reused |

- INV-001: a rule that must always hold.

## Relationships

| Relationship | Cardinality | Delete behavior | Integrity rule |
|---|---|---|---|
| | one-to-many, many-to-many | restrict, cascade, soft delete | |

## Access control summary

| Entity | Read | Create | Update | Delete |
|---|---|---|---|---|
| | | | | |

Detailed policies belong in migrations, rules files, and `docs/architecture/security.md`.

## Lifecycle and retention

Soft delete or hard delete, retention duration or rule, archival rule, personal-data deletion rule.

## Query and index expectations

One line per hot query pattern and the index or structure that serves it.

## Migration rules

1. Every schema change uses a versioned migration.
2. Backfills must be explicit and observable.
3. Destructive changes require compatibility and rollback analysis.
4. Changes made only in a hosted console are prohibited; every change is a versioned file in the repository.
