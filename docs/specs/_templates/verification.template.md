---
id: F-XXX-VERIFICATION
feature: F-XXX
status: pending
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "system-architecture.md"
  - "design.md"
  - "tasks.md"
---

# Verification: {{FEATURE_NAME}}

## Verification Summary

- Feature status: {{PENDING_PARTIAL_VERIFIED_REJECTED}}
- Tested commit: {{COMMIT}}
- Tested environment: {{ENVIRONMENT}}
- Verified by: {{NAME}}
- Verification date: {{DATE}}

## Acceptance Matrix

| Acceptance criterion | Evidence type | Evidence | Status |
|---|---|---|---|
| AC-001.1 | Automated test | `{{TEST_PATH_OR_COMMAND}}` | Pending |
| AC-001.2 | Manual test | {{STEPS_OR_REFERENCE}} | Pending |

Allowed status: Pending, Passed, Failed, Not applicable.

## Architecture Evidence Matrix

Map only architecture claims that materially affect correctness, security, reliability, performance, data integrity, or operations. Do not create verification theater for low-risk statements.

| Architecture claim / risk | Architecture section | Evidence type | Evidence | Status |
|---|---|---|---|---|
| {{CLAIM}} | `system-architecture.md#{{SECTION}}` | {{INTEGRATION / CONTRACT / LOAD / FAILURE / AUTHZ / QUERY / MANUAL}} | {{EVIDENCE}} | Pending |

Examples:

- authorization allowed/denied behavior;
- idempotent duplicate request/event handling;
- message/event replay after reconnect;
- cache invalidation/freshness behavior;
- bounded query/index behavior;
- migration compatibility;
- retry/failure/degradation behavior;
- latency/load measurement when an explicit performance target exists;
- operational metric/log signal in staging/production when required.

## Automated Checks

### Formatting

```bash
{{FORMAT_CHECK_COMMAND}}
```

Result: {{RESULT}}

### Static analysis or lint

```bash
{{LINT_COMMAND}}
```

Result: {{RESULT}}

### Tests

```bash
{{TEST_COMMAND}}
```

Result: {{RESULT}}

### Build

```bash
{{BUILD_COMMAND}}
```

Result: {{RESULT}}

## Architecture-Sensitive Verification

### Data / consistency

- [ ] Source-of-truth and persistence behavior match approved architecture where applicable.
- [ ] Transaction/concurrency/idempotency behavior is verified where applicable.
- [ ] Query/index/partition behavior is verified when it is a documented risk or requirement.

Evidence:

- {{EVIDENCE_OR_NA}}

### Communication / realtime / async

- [ ] Delivery/reconnect/replay/ordering behavior is verified where applicable.
- [ ] Timeout/retry ownership matches the approved architecture.
- [ ] Duplicate or missed-event behavior is covered where applicable.

Evidence:

- {{EVIDENCE_OR_NA}}

### Cache / performance / scale

- [ ] Cache freshness and invalidation are verified where caching is used.
- [ ] Performance/capacity claims are measured when requirements define a target or a material architecture risk exists.
- [ ] Bounded work/pagination/backpressure is verified where applicable.

Evidence:

- {{EVIDENCE_OR_NA}}

### Security

- [ ] Authentication/authorization enforcement occurs at the approved trusted boundary.
- [ ] Allowed and denied paths are verified.
- [ ] Tenant/resource isolation and sensitive-data handling are verified where applicable.

Evidence:

- {{EVIDENCE_OR_NA}}

### Failure / recovery / observability

- [ ] Important failure/degraded paths behave as designed.
- [ ] Retry/circuit-breaker/compensation behavior is verified only when those mechanisms are present.
- [ ] Required logs/metrics/traces/audit signals exist without leaking sensitive data.

Evidence:

- {{EVIDENCE_OR_NA}}

## Manual Scenarios

### MV-001 — {{SCENARIO}}

Steps:

1. {{STEP}}
2. {{STEP}}

Expected: {{EXPECTED}}

Actual: {{ACTUAL}}

Status: {{PENDING_PASSED_FAILED}}

## Regression Checks

- [ ] Existing critical flows remain functional.
- [ ] Existing data remains readable.
- [ ] API/events/clients remain compatible.
- [ ] Permission boundaries remain enforced.
- [ ] Empty and error states remain functional.
- [ ] Shared architecture invariants remain intact.

## Migration Verification

- Migration required: {{YES_OR_NO}}
- [ ] Migration applies successfully.
- [ ] Existing data remains valid.
- [ ] Backfill is verified.
- [ ] Old/new compatibility is verified when required.
- [ ] Rollback/roll-forward is verified or residual risk is explicitly accepted.

## Architecture Deviations

- Approved module architecture still matches implementation: {{YES_OR_NO}}
- Deviations discovered: {{NONE_OR_DETAILS}}
- Canonical update / approval: {{LINK_OR_PENDING}}

Do not mark the feature fully verified when implementation materially diverges from approved architecture without an intentional approved update.

## Known Limitations

- {{LIMITATION_OR_NONE}}

## Remaining Risks

| Risk | Severity | Mitigation | Accepted by |
|---|---|---|---|
| {{RISK}} | {{LOW_MEDIUM_HIGH}} | {{MITIGATION}} | {{NAME_OR_PENDING}} |

## Final Acceptance

- Requirements verification: {{PASSED_FAILED_PENDING}}
- Architecture verification: {{PASSED_FAILED_NOT_APPLICABLE_PENDING}}
- Engineering verification: {{PASSED_FAILED_PENDING}}
- Product acceptance: {{ACCEPTED_REJECTED_PENDING}}
- Accepted by: {{NAME}}
- Accepted date: {{DATE}}
- Notes: {{NOTES}}
