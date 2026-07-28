---
id: F-XXX-VERIFICATION
feature: F-XXX
status: pending
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
last_verified_commit: unverified
related:
  - "requirements.md"
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
- [ ] API clients remain compatible.
- [ ] Permission boundaries remain enforced.
- [ ] Empty and error states remain functional.

## Migration Verification

- Migration required: {{YES_OR_NO}}
- [ ] Migration applies successfully.
- [ ] Existing data remains valid.
- [ ] Backfill is verified.
- [ ] Rollback is verified or residual risk is accepted.

## Known Limitations

- {{LIMITATION_OR_NONE}}

## Remaining Risks

| Risk | Severity | Mitigation | Accepted by |
|---|---|---|---|
| {{RISK}} | {{LOW_MEDIUM_HIGH}} | {{MITIGATION}} | {{NAME_OR_PENDING}} |

## Final Acceptance

- Engineering verification: {{PASSED_FAILED_PENDING}}
- Product acceptance: {{ACCEPTED_REJECTED_PENDING}}
- Accepted by: {{NAME}}
- Accepted date: {{DATE}}
- Notes: {{NOTES}}
