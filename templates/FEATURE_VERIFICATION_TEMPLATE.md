# Feature Verification — `{{FEATURE_ID}}: {{FEATURE_NAME}}`

**Verification Status:** `{{NOT_STARTED | IN_PROGRESS | PASS | PASS_WITH_LIMITATIONS | FAIL}}`  
**Implementation Ref:** `{{COMMIT / PR / RELEASE REF}}`  
**Environment:** `{{LOCAL | CI | STAGING | PRODUCTION | OTHER}}`  
**Verified By:** `{{PERSON_OR_AGENT}}`  
**Date:** `{{YYYY-MM-DD}}`

## 1. Verification Scope

Requirements: `{{REQUIREMENTS_PATH}}`  
Design: `{{DESIGN_PATH}}`  
Tasks: `{{TASKS_PATH}}`

This verification covers: `{{IN_SCOPE}}`.

Not covered / intentionally deferred: `{{OUT_OF_SCOPE_OR_NONE}}`.

## 2. Requirement Coverage

Map each in-scope acceptance criterion to concrete evidence.

| Requirement | Acceptance Criterion | Evidence | Result | Notes |
|---|---|---|---|---|
| FR-001 | AC-001.1 | `{{TEST / COMMAND / SCREENSHOT / MANUAL SCENARIO}}` | `PASS/FAIL/NOT_RUN` | `{{NOTES}}` |
| FR-001 | AC-001.2 | `{{EVIDENCE}}` | `{{RESULT}}` | `{{NOTES}}` |

Rules:

- `PASS` requires actual evidence.
- `NOT_RUN` must include reason and residual risk.
- Do not mark the feature fully verified while blocking acceptance criteria remain unverified.

## 3. Static Verification

| Check | Command / Procedure | Result | Evidence / Notes |
|---|---|---|---|
| Format | `{{COMMAND}}` | `{{PASS/FAIL/NOT_RUN}}` | `{{NOTES}}` |
| Lint/static analysis | `{{COMMAND}}` | `{{RESULT}}` | `{{NOTES}}` |
| Type check/compiler diagnostics | `{{COMMAND_OR_NA}}` | `{{RESULT}}` | `{{NOTES}}` |
| Schema/codegen consistency | `{{COMMAND_OR_NA}}` | `{{RESULT}}` | `{{NOTES}}` |

## 4. Automated Test Results

### Unit

- Command: `{{COMMAND_OR_NA}}`
- Result: `{{PASS/FAIL/NOT_RUN}}`
- Relevant tests: `{{TEST_NAMES_OR_SCOPE}}`
- Notes: `{{NOTES}}`

### Integration / Contract

- Command: `{{COMMAND_OR_NA}}`
- Result: `{{RESULT}}`
- Scope: `{{SCOPE}}`
- Notes: `{{NOTES}}`

### Component / Widget / E2E

- Command: `{{COMMAND_OR_NA}}`
- Result: `{{RESULT}}`
- Scope: `{{SCOPE}}`
- Notes: `{{NOTES}}`

## 5. Build / Compile Results

| Target | Command | Result | Notes |
|---|---|---|---|
| `{{TARGET}}` | `{{COMMAND}}` | `{{PASS/FAIL/NOT_RUN}}` | `{{NOTES}}` |

## 6. Manual / Runtime Verification

### Scenario MV-001 — `{{SCENARIO_NAME}}`

- Preconditions: `{{PRECONDITIONS}}`
- Steps:
  1. `{{STEP}}`
  2. `{{STEP}}`
  3. `{{STEP}}`
- Expected: `{{EXPECTED}}`
- Actual: `{{ACTUAL}}`
- Result: `{{PASS/FAIL}}`
- Evidence: `{{SCREENSHOT / LOG / RESPONSE / NONE}}`

### Scenario MV-002 — `{{ERROR_OR_EDGE_SCENARIO}}`

- Preconditions: `{{PRECONDITIONS}}`
- Steps: `{{STEPS}}`
- Expected: `{{EXPECTED}}`
- Actual: `{{ACTUAL}}`
- Result: `{{RESULT}}`

## 7. Security / Authorization Verification

Remove if not applicable.

| Scenario | Expected | Evidence | Result |
|---|---|---|---|
| allowed actor | `{{EXPECTED}}` | `{{TEST}}` | `{{RESULT}}` |
| unauthorized actor | denied | `{{TEST}}` | `{{RESULT}}` |
| cross-resource/tenant access | denied | `{{TEST}}` | `{{RESULT}}` |
| invalid input | rejected safely | `{{TEST}}` | `{{RESULT}}` |

## 8. Database / Migration Verification

Remove if not applicable.

- Migration version/ref: `{{REF}}`
- Migration applied in: `{{ENVIRONMENT}}`
- Existing data impact checked: `{{YES/NO + EVIDENCE}}`
- Backfill verified: `{{YES/NO/NA}}`
- Constraint/index verification: `{{EVIDENCE}}`
- Old/new compatibility verified: `{{EVIDENCE}}`
- Rollback/roll-forward consideration: `{{NOTES}}`

## 9. Regression Check

Identify neighboring behavior selected by risk.

| Flow / Contract | Why At Risk | Verification | Result |
|---|---|---|---|
| `{{FLOW}}` | `{{COUPLING}}` | `{{TEST / MANUAL}}` | `{{RESULT}}` |

## 10. Performance / Operational Verification

Remove if not applicable.

- Performance target/measurement: `{{EVIDENCE}}`
- Logs/metrics expected: `{{SIGNAL}}`
- Error reporting/monitoring: `{{EVIDENCE}}`
- Release/feature-flag configuration: `{{EVIDENCE}}`

## 11. Known Issues / Limitations

| ID | Issue / Limitation | Severity | Impact | Follow-Up |
|---|---|---|---|---|
| KI-001 | `{{ISSUE}}` | `{{BLOCKER/MAJOR/MINOR}}` | `{{IMPACT}}` | `{{TASK/LINK}}` |

If none: `None known within verified scope.`

## 12. Unrun Checks and Residual Risk

| Check Not Run | Reason | Residual Risk | Required Before Release? |
|---|---|---|---|
| `{{CHECK}}` | `{{REASON}}` | `{{RISK}}` | `{{YES/NO}}` |

## 13. Final Status

**Result:** `{{PASS | PASS_WITH_LIMITATIONS | FAIL}}`

### Summary

`{{Concise evidence-based conclusion. Do not use "should work" as verification.}}`

### Release / Merge Recommendation

`{{READY | NOT_READY | READY_WITH_EXPLICIT_ACCEPTED_RISK}}`

### Required Follow-Up

- `{{FOLLOW_UP_OR_NONE}}`
