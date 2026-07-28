---
status: draft
owner: "{{ARCHITECTURE_OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
last_verified_commit: unverified
source_of_truth_for:
  - system-boundaries
  - dependency-direction
---

# Architecture Overview

## 1. System Purpose

{{Describe the system responsibility and what remains outside its boundary.}}

## 2. Architecture Drivers

- {{BUSINESS_DRIVER}}
- {{QUALITY_ATTRIBUTE}}
- {{DELIVERY_CONSTRAINT}}

## 3. System Context

```text
{{ACTOR_OR_EXTERNAL_SYSTEM}}
  -> {{CLIENT}}
  -> {{APPLICATION_BACKEND}}
  -> {{DATABASE_OR_EXTERNAL_SERVICE}}
```

External systems:

| System | Purpose | Data exchanged | Failure impact |
|---|---|---|---|
| {{SYSTEM}} | {{PURPOSE}} | {{DATA}} | {{IMPACT}} |

## 4. Major Components

| Component | Responsibility | Owns | Must not own |
|---|---|---|---|
| {{COMPONENT}} | {{RESPONSIBILITY}} | {{DATA_OR_RULES}} | {{EXCLUSION}} |

## 5. Dependency Direction

```text
Presentation
  -> Application / Controller
  -> Domain / Use Case
  -> Repository Contract
  -> Infrastructure Adapter
```

Rules:

1. Inner layers must not import framework-specific outer layers.
2. Infrastructure errors must be normalized before reaching presentation.
3. Authorization must be enforced at a trusted boundary.
4. Cross-feature shared code requires a stable, domain-neutral contract.

## 6. Data Flow

### Flow AF-001 — {{FLOW_NAME}}

1. {{ENTRY_POINT}}
2. {{VALIDATION}}
3. {{BUSINESS_OPERATION}}
4. {{PERSISTENCE_OR_EXTERNAL_CALL}}
5. {{RESULT_AND_ERROR_MAPPING}}

## 7. Deployment Topology

- Client runtime: {{RUNTIME}}
- Application hosting: {{HOSTING}}
- Database region: {{REGION}}
- Storage: {{STORAGE}}
- Background jobs: {{JOBS_OR_NONE}}
- Observability: {{LOGGING_MONITORING}}

## 8. Quality Attributes

| Attribute | Required behavior | Verification |
|---|---|---|
| Security | {{REQUIREMENT}} | {{CHECK}} |
| Reliability | {{REQUIREMENT}} | {{CHECK}} |
| Performance | {{REQUIREMENT}} | {{CHECK}} |
| Maintainability | {{REQUIREMENT}} | {{CHECK}} |

## 9. Known Constraints

- {{CONSTRAINT}}
- {{CONSTRAINT}}

## 10. Related Decisions

- `../adr/{{ADR_FILE_OR_NONE}}`

Do not place feature-specific implementation details here. Put them in the feature `design.md`.
