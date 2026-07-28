---
id: F-XXX-DESIGN
feature: F-XXX
status: draft
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
last_verified_commit: unverified
related:
  - "requirements.md"
---

# Design: {{FEATURE_NAME}}

## 1. Design Summary

{{Describe the selected implementation approach and why it fits the current architecture.}}

## 2. Existing Context

Relevant modules:

- `{{PATH}}`: {{RESPONSIBILITY}}

Patterns to preserve:

- {{PATTERN}}

Constraints:

- {{CONSTRAINT}}

## 3. Proposed Flow

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

## 4. Component Changes

| Component or path | Change | Responsibility |
|---|---|---|
| `{{PATH}}` | Create / Modify | {{RESPONSIBILITY}} |

Mark uncertain paths explicitly. Do not present speculation as approved structure.

## 5. Data Model

| Field | Type | Required | Rules |
|---|---|---|---|
| `{{FIELD}}` | `{{TYPE}}` | Yes | {{RULE}} |

Invariants:

- INV-001: {{INVARIANT}}

## 6. Database Changes

- Migration required: {{YES_OR_NO}}
- Create or modify: {{DETAILS}}
- Backfill: {{DETAILS_OR_NONE}}
- Destructive operation: {{YES_OR_NO}}
- Rollback: {{STRATEGY}}
- Authorization or RLS impact: {{DETAILS}}

## 7. API Contract

### {{METHOD}} {{ENDPOINT}}

Request:

```json
{
  "field": "example"
}
```

Success response:

```json
{
  "field": "example"
}
```

| Error code | Condition | Client behavior |
|---|---|---|
| `{{CODE}}` | {{CONDITION}} | {{BEHAVIOR}} |

- Backward compatible: {{YES_OR_NO}}
- Affected clients: {{CLIENTS}}

Remove this section when there is no API impact.

## 8. State Management

State owner: `{{CONTROLLER_STORE_VIEWMODEL_SERVER}}`

```text
initial -> loading -> success | empty | error
```

- Side effects must not be triggered from render methods.
- Concurrent requests use {{STRATEGY}}.
- Retry behavior is {{STRATEGY}}.

## 9. UI and UX Behavior

- Loading: {{BEHAVIOR}}
- Empty: {{BEHAVIOR}}
- Success: {{BEHAVIOR}}
- Validation error: {{BEHAVIOR}}
- Server error: {{BEHAVIOR}}
- Permission denied: {{BEHAVIOR}}
- Accessibility: {{REQUIREMENT}}
- Responsive or device constraints: {{REQUIREMENT}}

## 10. Error Handling and Observability

| Failure | Detection | User behavior | Logging or metric |
|---|---|---|---|
| {{FAILURE}} | {{DETECTION}} | {{BEHAVIOR}} | {{EVIDENCE}} |

Sensitive data that must not be logged:

- {{DATA}}

## 11. Testing Strategy

### Unit

- {{RULE_OR_STATE_TRANSITION}}

### Integration

- {{BOUNDARY_OR_POLICY}}

### UI

- {{STATE_OR_INTERACTION}}

### Manual

- {{CRITICAL_FLOW_AND_ENVIRONMENT}}

## 12. Rollout and Rollback

- Feature flag: {{YES_OR_NO}}
- Rollout steps: {{STEPS}}
- Rollback steps: {{STEPS}}
- Data compatibility after rollback: {{DETAILS}}

## 13. Security Review

- Authentication impact: {{DETAIL}}
- Authorization impact: {{DETAIL}}
- Data exposure impact: {{DETAIL}}
- Input and abuse protection: {{DETAIL}}

## 14. Alternatives Considered

### Alternative A — {{NAME}}

{{DESCRIPTION}}

Rejected because: {{REASON}}

## 15. ADR Impact

- ADR required: {{YES_OR_NO}}
- Related ADR: `../../adr/{{ADR_FILE_OR_NONE}}`

## 16. Approval

- Architecture owner: {{NAME}}
- Status: {{DRAFT_OR_APPROVED}}
- Approved date: {{DATE_OR_PENDING}}
- Conditions: {{CONDITIONS_OR_NONE}}
