# Feature Design — `{{FEATURE_ID}}: {{FEATURE_NAME}}`

**Status:** `{{DRAFT | REVIEW | APPROVED | SUPERSEDED}}`  
**Owner:** `{{OWNER}}`  
**Requirements:** `{{REQUIREMENTS_PATH}}`  
**Last Updated:** `{{YYYY-MM-DD}}`

> Scale this document to complexity. Remove sections that do not apply. A small/normal feature should not be forced to fill a high-risk design template with empty prose.

## 1. Design Summary

`{{One-paragraph implementation approach and why it fits the existing architecture.}}`

## 2. Requirements Covered

- `{{FR_IDS}}`
- `{{NFR_IDS}}`
- `{{BUSINESS_RULE_IDS}}`

## 3. Current State

Describe repository reality that matters to the change.

- Current components: `{{COMPONENTS}}`
- Current data flow: `{{FLOW}}`
- Existing constraints/patterns: `{{CONSTRAINTS}}`
- Existing limitations: `{{LIMITATIONS}}`

Do not invent current state; validate against the repository.

## 4. Proposed State

### Overview

`{{PROPOSED_APPROACH}}`

### Component Changes

| Component / Area | Change | Responsibility After Change |
|---|---|---|
| `{{COMPONENT}}` | `{{CHANGE}}` | `{{RESPONSIBILITY}}` |

## 5. Flow

```text
{{ACTOR_OR_TRIGGER}}
  → {{COMPONENT}}
  → {{COMPONENT}}
  → {{DATA_OR_SERVICE}}
  → {{RESULT}}
```

Describe error/alternative branches where important.

## 6. Architecture Impact

- Existing boundary used: `{{BOUNDARY}}`
- New boundary introduced: `{{NONE_OR_DESCRIPTION}}`
- Dependency direction change: `{{NONE_OR_DESCRIPTION}}`
- Shared architecture impact: `{{NONE_OR_DESCRIPTION}}`
- ADR required: `{{NO | YES: LINK}}`

If architecture changes, explain why a feature-local solution is insufficient.

## 7. Domain / Data Model

### Entities / Values

| Concept | Change | Invariant |
|---|---|---|
| `{{CONCEPT}}` | `{{CHANGE}}` | `{{INVARIANT}}` |

### Identity / Lifecycle

`{{IDENTIFIER_STATE_TRANSITION_NOTES_OR_NA}}`

## 8. API / Contract Changes

Remove if not applicable.

### Endpoint / Operation `{{NAME}}`

- Consumer: `{{CONSUMER}}`
- Request: `{{REQUEST_CONTRACT}}`
- Response: `{{RESPONSE_CONTRACT}}`
- Validation: `{{VALIDATION}}`
- Auth/authz: `{{SECURITY}}`
- Errors: `{{ERRORS}}`
- Idempotency/retry: `{{RULE}}`
- Backward compatibility: `{{COMPATIBILITY}}`

If a public contract changes, reference the approval/ADR/migration plan.

## 9. Database / Persistence Changes

Remove if not applicable.

- Schema change: `{{CHANGE}}`
- Migration type: `{{ADDITIVE | TRANSFORMATIVE | DESTRUCTIVE}}`
- Existing data impact: `{{IMPACT}}`
- Access/RLS/policy impact: `{{AUTHZ_IMPACT}}`
- Index/query impact: `{{QUERY_IMPACT}}`
- Transaction requirements: `{{TRANSACTION}}`
- Backfill: `{{BACKFILL_OR_NA}}`
- Compatibility window: `{{WINDOW}}`
- Rollback/roll-forward: `{{PLAN}}`

## 10. State Management

- State owner: `{{OWNER}}`
- Source of truth: `{{SOURCE}}`
- Mutable transitions: `{{TRANSITIONS}}`
- Cache/sync strategy: `{{STRATEGY}}`
- Loading/empty/success/error states: `{{UI_OR_APP_STATES}}`
- Concurrent update handling: `{{RULE_OR_NA}}`

## 11. Error and Failure Handling

| Failure | Detection | Handling | User/System Result | Retry/Recovery |
|---|---|---|---|---|
| `{{FAILURE}}` | `{{DETECTION}}` | `{{HANDLING}}` | `{{RESULT}}` | `{{RECOVERY}}` |

Do not use generic catch-all behavior that hides meaningful errors.

## 12. Security

- Trust boundary: `{{BOUNDARY}}`
- Authentication: `{{RULE}}`
- Authorization: `{{RULE}}`
- Input validation: `{{RULE}}`
- Sensitive data/PII: `{{DATA_AND_HANDLING}}`
- Secrets: `{{RULE_OR_NA}}`
- Abuse/replay/file risks: `{{RISK_OR_NA}}`
- Security tests: `{{TESTS}}`

## 13. Performance and Resource Impact

- Critical path: `{{PATH}}`
- Expected data/load: `{{LOAD}}`
- Network/query changes: `{{CHANGE}}`
- Caching: `{{CACHE_OR_NA}}`
- Memory/storage/bundle impact: `{{IMPACT_OR_NA}}`
- Measurement/target: `{{MEASUREMENT_OR_NA}}`

Do not optimize without a relevant requirement or observed bottleneck.

## 14. Compatibility and Migration

- Old client/data behavior: `{{OLD_STATE}}`
- New behavior: `{{NEW_STATE}}`
- Coexistence requirement: `{{REQUIREMENT}}`
- Rollout sequence: `{{SEQUENCE}}`
- Rollback constraint: `{{CONSTRAINT}}`
- Deprecation/removal later: `{{FOLLOW_UP_OR_NA}}`

## 15. Observability

- Logs: `{{EVENTS_OR_NA}}`
- Metrics: `{{METRICS_OR_NA}}`
- Trace/audit: `{{TRACE_OR_NA}}`
- What indicates failure after release: `{{SIGNAL}}`

## 16. Testing and Verification Design

Map risk to test level.

| Requirement / Risk | Test / Verification | Layer | Notes |
|---|---|---|---|
| `{{FR_OR_RISK}}` | `{{TEST}}` | `{{UNIT/INTEGRATION/E2E/MANUAL}}` | `{{NOTES}}` |

Required static/build checks: `{{COMMANDS_OR_REFERENCE}}`.

## 17. Alternatives Considered

### Option A — `{{OPTION}}`

- Advantages: `{{ADVANTAGES}}`
- Disadvantages: `{{DISADVANTAGES}}`
- Why not selected: `{{REASON}}`

### Option B — `{{OPTION}}`

- Advantages: `{{ADVANTAGES}}`
- Disadvantages: `{{DISADVANTAGES}}`
- Why selected/rejected: `{{REASON}}`

## 18. Trade-Offs

State intentional costs accepted by the chosen design.

- `{{TRADE_OFF}}`
- `{{TRADE_OFF}}`

## 19. Risks and Mitigations

| Risk | Impact | Mitigation / Verification |
|---|---|---|
| `{{RISK}}` | `{{IMPACT}}` | `{{MITIGATION}}` |

## 20. Open Technical Questions

| ID | Question | Blocking? | Owner | Resolution |
|---|---|---|---|---|
| TQ-001 | `{{QUESTION}}` | `{{YES/NO}}` | `{{OWNER}}` | Pending |

## 21. Approval

- Technical owner: `{{NAME}}`
- Status: `{{STATUS}}`
- Approved date: `{{DATE_OR_PENDING}}`
- Related ADRs: `{{LINKS_OR_NONE}}`
