# Incident Recovery Runbook

## Incident classification

| Severity | Definition | Response expectation |
|---|---|---|
| P0 | Critical outage, security breach, or irreversible data loss | Immediate owner escalation |
| P1 | Major user flow unavailable or data integrity at risk | Prioritize before normal feature work |
| P2 | Degraded or limited behavior with workaround | Schedule corrective work |

## First response

1. Confirm impact and affected environment.
2. Preserve evidence and correlation identifiers.
3. Stop destructive or amplifying operations.
4. Decide rollback, disablement, or forward fix.
5. Communicate current facts without speculation.

## Evidence

Record start time, how it was detected, the affected release, the observed symptoms, and the log or metric references. Facts only.

## Recovery

The rollback or recovery command from `deployment.md`, or the forward-fix steps.

## Verification

Critical health check, data integrity check, and the user flow that failed.

## Follow-up

Root cause, corrective action, regression test, ADR or architecture impact, owner and due date. A complex incident gets a bug investigation from `docs/_templates/bug-investigation.md`.
