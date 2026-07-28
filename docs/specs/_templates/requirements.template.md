---
id: F-XXX
title: "{{FEATURE_NAME}}"
status: draft
owner: "{{OWNER}}"
created: "{{YYYY-MM-DD}}"
last_updated: "{{YYYY-MM-DD}}"
last_verified_commit: unverified
source_of_truth_for:
  - "{{FEATURE_NAME}} behavior"
related:
  - "../../product/prd.md"
supersedes: null
superseded_by: null
---

# Requirements: {{FEATURE_NAME}}

## 1. Summary

{{Describe the user capability without prescribing implementation.}}

## 2. Problem

Current behavior:

- {{CURRENT_BEHAVIOR}}

Expected outcome:

- {{EXPECTED_OUTCOME}}

## 3. Goals

- G-001: {{VERIFIABLE_GOAL}}
- G-002: {{VERIFIABLE_GOAL}}

## 4. Non-Goals

- NG-001: {{EXCLUDED_BEHAVIOR}}
- NG-002: {{FUTURE_CAPABILITY}}

## 5. Actors

### ACTOR-001 — {{ACTOR}}

{{DESCRIPTION_AND_PERMISSION_CONTEXT}}

## 6. Preconditions

- PRE-001: {{PRECONDITION}}
- PRE-002: {{PRECONDITION}}

## 7. Functional Requirements

### FR-001 — {{REQUIREMENT_TITLE}}

The system shall {{PRECISE_OBSERVABLE_BEHAVIOR}}.

Acceptance criteria:

- AC-001.1: Given {{STATE}}, when {{ACTION}}, then {{RESULT}}.
- AC-001.2: Given {{EDGE_CASE}}, when {{ACTION}}, then {{RESULT}}.
- AC-001.3: Given {{FAILURE}}, when {{ACTION}}, then {{SAFE_ERROR_OR_RECOVERY}}.

### FR-002 — {{REQUIREMENT_TITLE}}

The system shall {{PRECISE_OBSERVABLE_BEHAVIOR}}.

Acceptance criteria:

- AC-002.1: Given {{STATE}}, when {{ACTION}}, then {{RESULT}}.
- AC-002.2: Given {{PERMISSION_OR_VALIDATION_FAILURE}}, when {{ACTION}}, then {{DENIAL_BEHAVIOR}}.

## 8. Business Rules

- BR-001: {{RULE}}
- BR-002: {{RULE}}

## 9. Validation Rules

| ID | Input | Rule | Error behavior |
|---|---|---|---|
| VAL-001 | {{FIELD}} | {{RULE}} | {{ERROR}} |

## 10. States and Transitions

| State | Meaning | Allowed transitions |
|---|---|---|
| `{{STATE}}` | {{MEANING}} | `{{NEXT_STATE}}` |

Invalid transitions must be rejected explicitly.

## 11. Error and Empty States

- ERR-001: When {{CONDITION}}, the system shall {{BEHAVIOR}}.
- ERR-002: When no data exists, the system shall {{EMPTY_BEHAVIOR}}.
- ERR-003: When connectivity fails, the system shall {{RETRY_OR_OFFLINE_BEHAVIOR}}.

## 12. Non-Functional Requirements

- NFR-PERF-001: {{PERFORMANCE_EXPECTATION}}
- NFR-SEC-001: {{SECURITY_EXPECTATION}}
- NFR-REL-001: {{RELIABILITY_EXPECTATION}}
- NFR-A11Y-001: {{ACCESSIBILITY_EXPECTATION}}

## 13. Dependencies

- DEP-001: {{DEPENDENCY}}

## 14. Assumptions

- ASM-001: {{ASSUMPTION}}

## 15. Open Questions

| ID | Question | Owner | Blocking? | Resolution |
|---|---|---|---|---|
| OQ-001 | {{QUESTION}} | {{OWNER}} | Yes | Pending |

Implementation must not begin while a blocking question remains unresolved.

## 16. Approval

- Product owner: {{NAME}}
- Status: {{DRAFT_OR_APPROVED}}
- Approved date: {{DATE_OR_PENDING}}
- Notes: {{NOTES}}
