# Deployment Runbook

## Ownership

- Release owner: {{OWNER}}
- Rollback approver: {{OWNER}}
- Target environment: {{ENVIRONMENT}}

## Preconditions

- [ ] Included feature verification is complete.
- [ ] Required migrations are reviewed.
- [ ] Environment configuration is verified.
- [ ] Rollback strategy is available.
- [ ] Incident contact is available.

## Deployment

```bash
{{DEPLOY_COMMAND}}
```

## Post-Deployment Verification

1. {{SMOKE_CHECK}}
2. {{OBSERVABILITY_CHECK}}
3. {{CRITICAL_FLOW_CHECK}}

## Rollback Trigger

Rollback when:

- {{TRIGGER}}
- {{TRIGGER}}

## Rollback Procedure

```bash
{{ROLLBACK_COMMAND}}
```

Data compatibility considerations:

{{DETAILS}}

## Closeout

- [ ] Record release version and commit.
- [ ] Update `../context/PROJECT_STATE.md`.
- [ ] Update roadmap and feature registry.
- [ ] Record incident or limitation when applicable.
