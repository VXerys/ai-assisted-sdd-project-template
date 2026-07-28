# Database Migration Runbook

## Rules

1. All schema changes use versioned migration files.
2. Migrations must be deterministic and reviewable.
3. Existing data impact must be analyzed before deployment.
4. Destructive changes require explicit approval and a compatibility plan.
5. Dashboard or SQL-editor changes must be captured as migrations before release.

## Create Migration

```bash
{{CREATE_MIGRATION_COMMAND}}
```

## Apply Locally

```bash
{{LOCAL_APPLY_COMMAND}}
```

## Verification

- [ ] Schema matches the intended design.
- [ ] Existing data remains valid.
- [ ] Authorization policies remain enforced.
- [ ] Required indexes support expected queries.
- [ ] Application compatibility is tested.

## Backfill

- Strategy: {{STRATEGY}}
- Batch size: {{SIZE_OR_NONE}}
- Observability: {{LOGGING_OR_METRIC}}
- Retry behavior: {{BEHAVIOR}}

## Rollback

```bash
{{ROLLBACK_COMMAND_OR_MANUAL_STEPS}}
```

When rollback is unsafe, document the forward-fix strategy and obtain explicit risk acceptance.
