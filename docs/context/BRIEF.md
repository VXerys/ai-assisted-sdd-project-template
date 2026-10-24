<!-- GENERATED FILE — DO NOT EDIT. Rendered by `npm run context:render`.
Source: sdd.config.json, docs/steering/, docs/specs/F-*/, docs/context/ASSUMPTIONS.md, docs/handoff/current.md.
source_hash: 95ce1e1f0a2017e66f16b29fc303c97b0e8422774c4fe00c5ac3ac09b1dc21ee -->

# Brief

{{PROJECT_DESCRIPTION}}

Project `{{PROJECT_NAME}}`, tier `lite`. Rendered from sdd.config.json, docs/steering/, docs/specs/F-*/, docs/context/ASSUMPTIONS.md, docs/handoff/current.md.

## Active
No active feature. Pick the first `planned` task whose `depends_on` are all `done`, or create `docs/specs/F-XXX-name/` from the templates.

## Rules
Stop conditions:

Stop and report, instead of implementing, when the task would require any prohibited action above, when two sources of truth conflict, when a blocking assumption is open, or when a required command is unavailable.

Prohibited without explicit owner approval:

- Changing a public API, event, or data contract.
- Destructive data operations: drop, mass delete, reset, backfill with unknown impact, editing an applied migration.
- Replacing a major framework, provider, or dependency; adding a dependency outside the policy in `tech.md`.
- Breaking an architecture boundary or dependency direction.
- Changing production infrastructure, credentials, or configuration.
- Bypassing authentication or authorization.
- Force push, history rewrite, or any git operation that can destroy work.
- Editing a generated or frozen path.
- Publishing, deploying, or sending messages on the owner's behalf.

## Read-only paths
Generated: `docs/context/state.yaml`, `docs/context/PROJECT_STATE.md`, `docs/context/PROGRESS.md`, `docs/context/BRIEF.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.claude/rules/`, `.cursor/rules/`, `.github/copilot-instructions.md`, `.github/instructions/`, `.kiro/steering/`
Frozen: none

## Open assumptions
None.

## Handoff
Handoff is `inactive`.

## Features
| Feature | Status | Phase | Done/Total |
|---|---|---|---|
| none yet | | | |
