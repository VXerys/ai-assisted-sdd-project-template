---
status: draft
owner: "{{PRODUCT_OWNER}}"
created: "{{YYYY-MM-DD}}"
last_updated: "{{YYYY-MM-DD}}"
last_verified_commit: unverified
source_of_truth_for:
  - product-intent
  - product-scope
---

# Product Requirements Document: {{PROJECT_NAME}}

## 1. Executive Summary

{{Explain the product, target user, problem, and intended outcome in one concise paragraph.}}

## 2. Problem

### Current situation

{{Describe what happens today.}}

### User impact

- {{IMPACT}}
- {{IMPACT}}

### Business or operational impact

- {{IMPACT}}
- {{IMPACT}}

## 3. Target Users

### Primary Persona — {{NAME}}

- Role: {{ROLE}}
- Goal: {{GOAL}}
- Main pain: {{PAIN}}
- Usage context: {{CONTEXT}}

### Secondary Persona — {{NAME_OR_NONE}}

{{DESCRIPTION}}

## 4. Product Goals

| ID | Goal | Success signal |
|---|---|---|
| G-001 | {{GOAL}} | {{MEASURABLE_SIGNAL}} |
| G-002 | {{GOAL}} | {{MEASURABLE_SIGNAL}} |

## 5. Non-Goals

- NG-001: {{EXPLICIT_EXCLUSION}}
- NG-002: {{EXPLICIT_EXCLUSION}}

Non-goals must not be implemented opportunistically.

## 6. Critical User Journeys

### Journey J-001 — {{NAME}}

1. {{STEP}}
2. {{STEP}}
3. {{SUCCESS_OUTCOME}}

Failure and recovery behavior:

- {{FAILURE}}
- {{RECOVERY}}

## 7. Product Capabilities

| ID | Capability | Priority | MVP? |
|---|---|---|---|
| CAP-001 | {{CAPABILITY}} | P0 | Yes |
| CAP-002 | {{CAPABILITY}} | P1 | No |

Detailed behavior belongs in feature specifications, not in this table.

## 8. Scope

### MVP scope

- {{IN_SCOPE}}
- {{IN_SCOPE}}

### Later scope

- {{DEFERRED_SCOPE}}

### Explicitly excluded

- {{OUT_OF_SCOPE}}

## 9. Product Rules

- PR-001: {{CROSS_FEATURE_RULE}}
- PR-002: {{CROSS_FEATURE_RULE}}

## 10. Data and Privacy

- Data collected: {{DATA}}
- Sensitive data: {{DATA_OR_NONE}}
- Retention requirement: {{REQUIREMENT}}
- Consent requirement: {{REQUIREMENT}}

## 11. Constraints

- {{TECHNICAL_CONSTRAINT}}
- {{BUSINESS_CONSTRAINT}}
- {{DELIVERY_CONSTRAINT}}

## 12. Dependencies

- {{DEPENDENCY}}
- {{DEPENDENCY}}

## 13. Success Metrics

| Metric | Baseline | Target | Measurement method |
|---|---|---|---|
| {{METRIC}} | {{BASELINE}} | {{TARGET}} | {{METHOD}} |

Avoid vanity metrics that do not change product decisions.

## 14. Risks and Assumptions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| RA-001 | Risk | {{DESCRIPTION}} | {{OWNER}} | Open |
| RA-002 | Assumption | {{DESCRIPTION}} | {{OWNER}} | Unvalidated |

## 15. Open Questions

| ID | Question | Owner | Blocking? | Resolution |
|---|---|---|---|---|
| OQ-001 | {{QUESTION}} | {{OWNER}} | Yes | Pending |

## 16. Approval

- Product owner: {{NAME}}
- Status: {{DRAFT | APPROVED}}
- Approved date: {{DATE_OR_PENDING}}
- Notes: {{NOTES}}
