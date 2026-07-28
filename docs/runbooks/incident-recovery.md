# Incident Recovery Runbook

## Incident Classification

| Severity | Definition | Response expectation |
|---|---|---|
| P0 | Critical outage, security breach, or irreversible data loss | Immediate owner escalation |
| P1 | Major user flow unavailable or data integrity at risk | Prioritize before normal feature work |
| P2 | Degraded or limited behavior with workaround | Schedule corrective work |

## First Response

1. Confirm impact and affected environment.
2. Preserve evidence and correlation identifiers.
3. Stop destructive or amplifying operations.
4. Decide rollback, disablement, or forward fix.
5. Communicate current facts without speculation.

## Evidence

- Start time: {{TIME}}
- Detected by: {{SOURCE}}
- Affected release: {{VERSION}}
- Symptoms: {{FACTS}}
- Logs or metrics: {{REFERENCES}}

## Recovery

```bash
{{RECOVERY_OR_ROLLBACK_COMMAND}}
```

## Verification

- {{CRITICAL_HEALTH_CHECK}}
- {{DATA_INTEGRITY_CHECK}}
- {{USER_FLOW_CHECK}}

## Follow-Up

- Root cause: {{CAUSE}}
- Corrective action: {{ACTION}}
- Regression test: {{TEST}}
- ADR or architecture impact: {{IMPACT}}
- Owner and due date: {{OWNER_AND_DATE}}
