# Changelog

Format: Keep a Changelog. Versions follow Semantic Versioning.

## [Unreleased]

## [2.0.0] — 2026-10-15

The v2 revamp (ADR-0001): one template family, canonical steering files, rendered context and tool adapters, an enforced traceability validator, Claude Code hooks and slash commands, `init` with stack presets, a filled example project, and a migration guide for v1 projects. Node 22 and the `yaml` dependency are required. v1 projects stay on v1 until migrated with `docs/MIGRATION-v1-to-v2.md`.

### Added

- `docs/steering/` (`product`, `tech`, `structure`, `rules`, `workflow`, plus `database` from a database preset) as the canonical, Kiro-compatible source of project rules, with `inclusion: always | fileMatch | manual` frontmatter and a 120-line cap.
- `sdd.config.json` (schema 2): project, stack, tools, paths, `generated` and `frozen` lists, size limits, `hooks.enabled`, `templateMode`, and the validator's file lists under `validate`.
- Mandatory YAML frontmatter on every template (`id`, `title`, `type`, `status`, `tier`, `owner`, `created`, `last_updated`, `last_verified`, `supersedes`); parseable `T-XXX` task blocks (`status`, `requirements`, `depends_on`, `evidence`, optional `scope`) and `EV-XXX` evidence blocks (`command`, `output`, `date`, `commit`, `covers`); `A-XXX` assumptions in `docs/context/ASSUMPTIONS.md`.
- `npm run context:render`: `state.yaml` (with `source_hash`), `BRIEF.md` (token-budgeted single entry point), `PROJECT_STATE.md`, `PROGRESS.md`; `--check`, `--quiet`; LF output.
- `npm run context:validate`: required files, frontmatter vocabulary, id uniqueness, tiered FR-to-task traceability, evidence completeness, `done` without evidence, `implemented` with open tasks or assumptions, staleness, handoff expiry, size caps, link and path resolution, rendered-view and adapter freshness, generated banners, placeholders after init; `--strict`.
- `npm run adapters:sync`: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/*.mdc`, `.github/copilot-instructions.md` and `.github/instructions/`, `.kiro/steering/`, each with a GENERATED banner and `source_hash`; `--check`, `--all`.
- Claude Code hooks in `scripts/hooks/` wired by `.claude/settings.json`: SessionStart injects the brief, PreToolUse denies edits to generated, frozen, and secret paths and surfaces `fileMatch` steering once per session, PostToolUse re-renders after spec or steering edits, Stop warns when `tasks.md` changed without the handoff. Slash commands `/sdd:task`, `/sdd:bug`, `/sdd:review`, `/sdd:handoff`, `/sdd:render`.
- `npm run init`: interactive or by flags (`--name`, `--description`, `--tier`, `--app`, `--db`, `--tools`, `--owner`, `--lang`, `--yes`, `--dry-run`, `--force`); writes `sdd.config.json`, fills the steering and project documents, creates `database.md`, prunes the full-tier documents on `lite` and relinks references, strips the template-maintainer section of `CONTRIBUTING.md`, removes template-only files, resets the changelog, then renders, syncs, and validates. A fresh template leaves nothing to fill by hand.
- App presets `nextjs`, `react-native`, `flutter`, `kotlin-android`, `node-api`, `python-api`, `generic` and database presets `supabase`, `firebase`, `postgres`, `mysql`, `sqlite-drift`, `mongodb`, `none` in `scripts/init/presets/`, schema-checked.
- `examples/todo-api/`: a filled `lite` project (`node-api` + `postgres`) that is both the reference and a test fixture; `npm run example:validate`.
- `docs/MIGRATION-v1-to-v2.md` and `scripts/migrate/v1-tasks.mjs`, which converts v1 checkbox tasks to v2 blocks and prints what it could not infer.
- `scripts/context/lib/`, `scripts/lib/` (glob, steering loader, guard rules, hook IO) as pure functions; fixture repositories under `scripts/**/__fixtures__/`; 108 `node:test` tests; `.gitattributes` with LF.
- CI (`.github/workflows/context-integrity.yml`): tests, strict validation of the template, validation of the example, and a `template-init` job that initializes a copy and validates it; runs on pull requests and on pushes to `main`.

### Changed

- `AGENTS.md`, `CLAUDE.md`, and every other adapter are generated from steering; hand edits fail validation and are denied by the Claude Code guard.
- `tasks.md` is the only home of task status; `state.yaml`, `PROJECT_STATE.md`, `PROGRESS.md`, and `BRIEF.md` are rendered. Task status vocabulary is `planned | in_progress | blocked | review | done | deferred`; task ids are `T-XXX`.
- One template family: per-feature templates in `docs/specs/_templates/`, project templates in `docs/_templates/`; lite templates within 80 lines, full within 200, system architecture within 300, full-tier sections marked `<!-- full-tier -->`.
- `docs/product/prd.md` is the instantiated form of `docs/_templates/prd.md` (`id: PRD`); `docs/architecture/overview.md` is the lite form of `docs/_templates/architecture-baseline.md` (`id: ARCH`). Project documents under `docs/product/`, `docs/architecture/`, `docs/runbooks/`, and `docs/quality/` use guidance prose instead of body placeholders; `init` fills owner, date, name, and preset values.
- `docs/handoff/current.md` ships as the inactive reset that `context:archive-handoff` writes; `feature_id` and `task_id` replace `active_feature` and `active_task` (still accepted).
- `CONTRIBUTING.md` separates project contribution (commands filled by `init`) from template maintenance (templates, presets, adapters, snapshots).
- README rewritten around the model, the daily workflow, the commands, the tiers, and the tool support matrix.
- Templates, validators, and docs are stack-neutral; stack knowledge lives in `sdd.config.json`, the presets, and `docs/steering/tech.md`. Mobile stacks and non-relational stores are first-class.
- `package.json`: version 2.0.0, `engines.node >=22`, `yaml` dependency.
- ADR-0001 records Node 22 and the implementation in 2.0.0.

### Removed

- Top-level `templates/`, `docs/specs/_templates/*.template.md`, `docs/adr/ADR.template.md`, `CONTEXT_REFRESH_TEMPLATE.md`.
- `context.config.json` (replaced by `sdd.config.json`).
- `scripts/context/refresh-project-state.mjs` and `npm run context:refresh`; git facts are rendered by `context:render`.
- The hand-edited `state.yaml` schema 1, the "coding-agent bootstrap task", and the "available from 2.0.0" markers.
- The v1 default branch name `Queen`; the default branch is `main` from this release.
