# Data Store Change Runbook

Applies to any store: relational, document, key-value, embedded local (for example a mobile app's on-device database), or file-based. "Migration" means any versioned change to schema, indexes, access rules, or stored data shape.

## Rules

1. Every change is a versioned file in the repository, reviewed like code.
2. Append-only: never edit an applied migration; add a new one.
3. Reversible by default. A forward-only change documents the forward-fix path and gets explicit risk acceptance.
4. Existing-data impact is analyzed before the change is applied anywhere shared.
5. Destructive changes (drop, mass delete, type narrowing, rule removal) require explicit owner approval and a compatibility plan.
6. Changes made in a hosted console or admin UI are captured as versioned files before release.
7. Access rules and authorization policies are part of the change and are verified after it.

## Procedure

1. Write the change as a versioned file under `{{PRESET_DB_MIGRATION_PATH}}` ({{PRESET_DB_MIGRATION_TOOL}}).
2. Apply locally or to a disposable environment: `{{PRESET_DB_MIGRATION_COMMAND}}`.
3. Verify: schema or rules match the design; existing data stays valid; access rules still deny what they should; indexes support the expected queries; the application builds and its tests pass against the new shape.
4. For on-device stores, verify an upgrade from the oldest supported installed version.
5. Record the evidence as EV blocks in the feature's `verification.md`.

## Backfill

Strategy, batch size, observability signal, retry behavior, and the point at which the backfill is considered complete. Backfills with unknown impact need approval.

## Rollback

The rollback command of the migration tool, or the manual steps, recorded per change in the feature's `design.md`.

When rollback is unsafe, document the forward-fix strategy and get explicit risk acceptance before applying the change.

## Per-store notes

Filled by the database preset chosen at `npm run init` ({{PRESET_DB}}); extend by hand with how applied versions are tracked and any constraint the preset does not know.

- {{PRESET_DB_NOTES}}
