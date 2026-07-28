---
status: draft
owner: "{{DATA_OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
last_verified_commit: unverified
source_of_truth_for:
  - semantic-data-model
---

# Data Model

This document explains domain meaning, relationships, ownership, and invariants. Versioned migrations remain authoritative for physical schema.

## Entity Map

```text
{{ENTITY_A}} 1 --- * {{ENTITY_B}}
{{ENTITY_B}} * --- 1 {{ENTITY_C}}
```

## Entities

### {{ENTITY_NAME}}

Purpose:

{{DOMAIN_PURPOSE}}

| Field | Meaning | Required | Sensitive? | Rules |
|---|---|---|---|---|
| `{{FIELD}}` | {{MEANING}} | Yes | No | {{RULE}} |

Invariants:

- INV-001: {{RULE_THAT_MUST_ALWAYS_HOLD}}
- INV-002: {{RULE_THAT_MUST_ALWAYS_HOLD}}

Ownership:

- Created by: {{ACTOR_OR_SERVICE}}
- Updated by: {{ACTOR_OR_SERVICE}}
- Deleted or archived by: {{ACTOR_OR_SERVICE}}

## Relationships

| Relationship | Cardinality | Delete behavior | Integrity rule |
|---|---|---|---|
| {{A_TO_B}} | {{ONE_TO_MANY}} | {{RESTRICT_CASCADE_SOFT_DELETE}} | {{RULE}} |

## Access Control Summary

| Entity | Read | Create | Update | Delete |
|---|---|---|---|---|
| {{ENTITY}} | {{POLICY}} | {{POLICY}} | {{POLICY}} | {{POLICY}} |

Detailed policies belong in migrations or policy definitions and security documentation.

## Lifecycle and Retention

- Soft delete: {{YES_OR_NO}}
- Retention: {{DURATION_OR_RULE}}
- Archival: {{RULE}}
- Personal-data deletion: {{RULE}}

## Query and Index Expectations

- {{QUERY_PATTERN_AND_INDEX}}

## Migration Rules

1. Every schema change uses a versioned migration.
2. Backfills must be explicit and observable.
3. Destructive changes require compatibility and rollback analysis.
4. Dashboard-only schema changes are prohibited.
