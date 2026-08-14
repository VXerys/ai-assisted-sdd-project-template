---
id: F-XXX-DESIGN
feature: F-XXX
status: draft
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "system-architecture.md"
---

# Design: {{FEATURE_NAME}}

> This document maps the approved requirements and module system architecture into the real repository. Do not repeat architecture analysis already owned by `system-architecture.md`. If implementation requires changing storage strategy, consistency semantics, communication model, trust boundaries, scale strategy, or another approved architecture decision, update the architecture through the specification-change protocol first.

## 1. Design Summary

{{Describe the selected implementation approach and why it fits the approved module architecture and current repository patterns.}}

Architecture inputs:

- `system-architecture.md` sections: {{SECTIONS_OR_DECISIONS}}
- relevant global architecture: {{PATHS}}
- related ADRs: {{ADRS_OR_NONE}}

## 2. Existing Context

Relevant modules:

- `{{PATH}}`: {{RESPONSIBILITY}}

Patterns to preserve:

- {{PATTERN}}

Constraints:

- {{CONSTRAINT}}

Architecture invariants that implementation must preserve:

- {{INVARIANT_FROM_SYSTEM_ARCHITECTURE}}

## 3. Proposed Implementation Flow

```text
{{TRIGGER}}
  -> {{ENTRY_POINT}}
  -> {{APPLICATION_LAYER}}
  -> {{DOMAIN_OR_SERVICE}}
  -> {{REPOSITORY}}
  -> {{DATA_SOURCE}}
```

Sequence:

1. {{STEP}}
2. {{STEP}}
3. {{ERROR_OR_RECOVERY_STEP}}

This flow should implement, not redefine, the critical flow semantics in `system-architecture.md`.

## 4. Component Changes

| Component or path | Change | Responsibility |
|---|---|---|
| `{{PATH}}` | Create / Modify | {{RESPONSIBILITY}} |

Mark uncertain paths explicitly. Do not present speculation as approved structure.

## 5. Data Model Implementation

Architecture source: `system-architecture.md#data-architecture`.

| Field | Type | Required | Rules |
|---|---|---|---|
| `{{FIELD}}` | `{{TYPE}}` | Yes | {{RULE}} |

Invariants:

- INV-001: {{INVARIANT}}

Do not change the selected storage model, source-of-truth ownership, partitioning strategy, or consistency requirement here without an approved architecture update.

## 6. Database Changes

- Migration required: {{YES_OR_NO}}
- Create or modify: {{DETAILS}}
- Backfill: {{DETAILS_OR_NONE}}
- Destructive operation: {{YES_OR_NO}}
- Rollback / roll-forward: {{STRATEGY}}
- Authorization or RLS impact: {{DETAILS}}
- Index/query implementation: {{DETAILS}}

## 7. API / Integration Contract

### {{METHOD_OR_OPERATION}} {{ENDPOINT_OR_CHANNEL}}

Request / input:

```json
{
  "field": "example"
}
```

Success response / output:

```json
{
  "field": "example"
}
```

| Error code / event failure | Condition | Client / consumer behavior |
|---|---|---|
| `{{CODE}}` | {{CONDITION}} | {{BEHAVIOR}} |

- Backward compatible: {{YES_OR_NO}}
- Affected clients/consumers: {{CLIENTS}}
- Timeout/retry implementation owner: {{OWNER_OR_NA}}
- Idempotency implementation: {{DETAIL_OR_NA}}
- Realtime/replay implementation: {{DETAIL_OR_NA}}

Remove this section when there is no API/integration impact.

## 8. State Management

State owner: `{{CONTROLLER_STORE_VIEWMODEL_SERVER}}`

```text
initial -> loading -> success | empty | error
```

- Side effects must not be triggered from render methods.
- Concurrent requests use {{STRATEGY}}.
- Retry behavior implements {{ARCHITECTURE_POLICY_OR_NA}}.
- Cache interaction implements {{ARCHITECTURE_CACHE_RULE_OR_NA}}.
- Local/remote source-of-truth rule: {{RULE}}.

## 9. UI and UX Behavior

- Loading: {{BEHAVIOR}}
- Empty: {{BEHAVIOR}}
- Success: {{BEHAVIOR}}
- Validation error: {{BEHAVIOR}}
- Server error: {{BEHAVIOR}}
- Permission denied: {{BEHAVIOR}}
- Degraded/offline state: {{BEHAVIOR_OR_NA}}
- Accessibility: {{REQUIREMENT}}
- Responsive or device constraints: {{REQUIREMENT}}

## 10. Error Handling and Observability Implementation

Architecture source: `system-architecture.md#reliability-and-failure-handling` and `#observability-and-operational-signals`.

| Failure | Detection | User behavior | Logging / metric / trace |
|---|---|---|---|
| {{FAILURE}} | {{DETECTION}} | {{BEHAVIOR}} | {{EVIDENCE}} |

Sensitive data that must not be logged:

- {{DATA}}

Concrete instrumentation changes:

- {{INSTRUMENTATION}}

## 11. Security Implementation

Architecture source: `system-architecture.md#security-and-privacy-architecture`.

- Authentication integration: {{DETAIL}}
- Authorization enforcement point: {{DETAIL}}
- Data isolation / RLS / policy: {{DETAIL}}
- Input validation implementation: {{DETAIL}}
- Sensitive-data handling: {{DETAIL}}
- Rate-limit / abuse control implementation: {{DETAIL_OR_NA}}
- File/media validation: {{DETAIL_OR_NA}}

## 12. Testing Strategy

### Unit

- {{RULE_OR_STATE_TRANSITION}}

### Integration / contract

- {{BOUNDARY_OR_POLICY}}

### Architecture-sensitive tests

- {{IDEMPOTENCY / CONSISTENCY / REPLAY / AUTHZ / CACHE_INVALIDATION / FAILURE_HANDLING}}

### UI

- {{STATE_OR_INTERACTION}}

### Manual / runtime

- {{CRITICAL_FLOW_AND_ENVIRONMENT}}

Architecture claims requiring measurement or runtime evidence are recorded in `system-architecture.md` and mapped into `verification.md`.

## 13. Rollout and Rollback

- Feature flag: {{YES_OR_NO}}
- Rollout steps: {{STEPS}}
- Rollback / roll-forward steps: {{STEPS}}
- Data compatibility after rollback: {{DETAILS}}
- Operational signals to watch: {{SIGNALS}}

## 14. Local Implementation Alternatives

Use this section only for implementation choices that do not reopen approved module architecture.

### Alternative A — {{NAME}}

{{DESCRIPTION}}

Advantages:

- {{ADVANTAGE}}

Disadvantages:

- {{DISADVANTAGE}}

Selected / rejected because: {{REASON}}

System-level alternatives such as SQL vs. NoSQL, sync vs. async, caching strategy, sharding, realtime transport, or service topology belong in `system-architecture.md`.

## 15. Architecture / ADR Impact Check

- System architecture still valid: {{YES_OR_NO}}
- Architecture update required: {{NO_OR_REASON}}
- Global architecture impact: {{NONE_OR_DESCRIPTION}}
- ADR required: {{YES_OR_NO}}
- Related ADR: `../../adr/{{ADR_FILE_OR_NONE}}`

If this design needs an architecture change, stop dependent implementation until the canonical architecture is updated and approved.

## 16. Approval

- Technical owner: {{NAME}}
- Status: {{DRAFT_OR_APPROVED}}
- Approved date: {{DATE_OR_PENDING}}
- Conditions: {{CONDITIONS_OR_NONE}}
