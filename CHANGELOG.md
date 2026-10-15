# Changelog

Format: Keep a Changelog. Versions follow Semantic Versioning.

## [Unreleased] — 2.0.0

Phases 1 and 2 of the v2 revamp (ADR-0001): foundation and tooling. Adapters, hooks, slash commands, and init follow.

### Phase 2 — tooling

#### Added

- `npm run context:render` (`scripts/context/render.mjs`): renders `docs/context/state.yaml` (schema 2, `source_hash`, derived `active` pair, `assumptions_open`, `blockers`), `BRIEF.md` (token-budgeted by `limits.briefTokens`, sections cut from the bottom with a note), `PROJECT_STATE.md` (feature table plus a git block outside the hash), and `PROGRESS.md` (full task board). `--check` exits 1 when a view would change; `--quiet`. Output is always LF.
- `scripts/context/lib/`: `config`, `frontmatter`, `markdown`, `specs` (features, task blocks, evidence blocks, FR and AC ids), `assumptions`, `handoff`, `hash`, `git`, `model`, `views`, `render`, `checks`, as pure functions over strings and paths.
- Validator checks (see the table in `docs/context/CONTEXT_SYSTEM.md`): per-type frontmatter keys and vocabulary, id uniqueness, tiered FR-to-task traceability, evidence completeness, `done` without evidence, `implemented` with open tasks or open assumptions, staleness, handoff expiry, size caps, backtick path resolution, rendered-view freshness, generated banners. `--strict` promotes warnings. Output is `path:line  level  message`.
- Fixture repositories under `scripts/context/__fixtures__/` (`valid-lite`, `missing-evidence`, `implemented-with-open-task`, `stale-render`) and 22 `node:test` tests, including a smoke test against this repository.
- `.gitattributes` with `* text=auto eol=lf`.
- `limits.briefTokens` (3000) in `sdd.config.json`; `feature_id` and `task_id` keys in `docs/handoff/current.md` (`active_feature` and `active_task` stay as fallbacks).

#### Changed

- `scripts/context/validate-context.mjs` rewritten on the shared library; `archive-handoff.mjs` reads the handoff path from `sdd.config.json`, uses the parsed frontmatter, and renders after archiving.
- Docs no longer mark `context:render`, `context:validate`, or `context:archive-handoff` as "available from 2.0.0"; `README.md`, `docs/automation/README.md`, `CONTEXT_SYSTEM.md`, `NEW_CHAT_PROTOCOL.md`, `steering/workflow.md`, and the definition of done describe the shipped commands. Remaining "Level 1/2/3" wording replaced by the `lite`/`full` tiers.

#### Removed

- `scripts/context/refresh-project-state.mjs` and `npm run context:refresh`; git facts are rendered into `PROJECT_STATE.md` by `context:render`.

### Phase 1 — foundation

### Added

- `docs/steering/` with `product.md`, `tech.md`, `structure.md`, `rules.md`, `workflow.md` as the canonical, Kiro-compatible source of project rules.
- `sdd.config.json` (schema version 2) with project, stack, tools, paths, generated and frozen lists, size limits, and the validator's file lists under `validate`.
- `docs/context/ASSUMPTIONS.md`: `A-XXX` log for unknowns with `open | confirmed | rejected`.
- `docs/context/BRIEF.md` stub, the single session entry point once rendering ships.
- Mandatory YAML frontmatter on every template (`id`, `title`, `type`, `status`, `tier`, `owner`, `created`, `last_updated`, `last_verified`, `requirements`, `supersedes`).
- Parseable task blocks in `tasks.md` (`status`, `requirements`, `depends_on`, `evidence`) and evidence blocks in `verification.md` (`command`, `output`, `date`, `commit`, `covers`).
- `yaml` dependency and a lockfile; `npm test` running `node --test scripts/**/*.test.mjs`; a test that runs the validator against the repository.
- This changelog.

### Changed

- One template family: per-feature templates in `docs/specs/_templates/` (`requirements`, `design`, `tasks`, `verification`, `system-architecture`), project-level templates in `docs/_templates/` (`prd`, `constitution`, `architecture-baseline`, `adr`, `task-prompt`, `bug-investigation`, `code-review`). Structure from the v2 `templates/` family, frontmatter and id vocabulary from the v1 family.
- Size caps: lite templates within 80 lines, full within 200, system architecture within 300. Full-tier sections are marked `<!-- full-tier -->` in the same file.
- Placeholders are bare `{{SNAKE_CASE}}`; total `{{` count across the repository reduced from 2,267 to 419.
- `AGENTS.md` rewritten by hand as a short contract pointing to steering, with a banner noting it is generated from 2.0.0.
- `CLAUDE.md` no longer tells agents not to bootstrap the context system; it points to `BRIEF.md` and `NEW_CHAT_PROTOCOL.md`.
- `docs/context/CONTEXT_SYSTEM.md`, `NEW_CHAT_PROTOCOL.md`, and `CONTEXT_INDEX.md` describe the v2 model: `tasks.md` is the task master; `state.yaml`, `BRIEF.md`, `PROJECT_STATE.md`, and `PROGRESS.md` are rendered; a fallback read order applies when the brief is absent.
- `docs/context/state.yaml` moved to `schema_version: 2` with the ADR-0001 field list and empty values.
- `scripts/context/validate-context.mjs` reads `sdd.config.json`, requires the steering files, `ASSUMPTIONS.md`, and `BRIEF.md`, accepts the task and assumption status words, and tolerates trailing vocabulary comments in frontmatter.
- `.github/workflows/context-integrity.yml` installs dependencies, runs tests, and watches `docs/**`, `scripts/**`, `README.md`, `sdd.config.json`, `AGENTS.md`, `CLAUDE.md`.
- `docs/adr/README.md`, `docs/documentation/MODULARIZATION_GUIDE.md`, `docs/runbooks/database-migrations.md`, and related docs are stack-neutral; mobile stacks and non-relational stores are first-class.
- `README.md` layout section matches the real `docs/` tree and the single template family.
- Feature status vocabulary unchanged; task status is now `planned | in_progress | blocked | review | done | deferred`; task ids are `T-XXX`.

### Removed

- Top-level `templates/` directory and `docs/adr/ADR.template.md` (merged into the single family).
- `CONTEXT_REFRESH_TEMPLATE.md`: rendering plus validation replaces the manual context-refresh record.
- `context.config.json` (replaced by `sdd.config.json`).
- The "coding-agent bootstrap task" from the context docs and `AI_COLLABORATION_MODEL.md`; the renderer ships with 2.0.0 instead of being rebuilt per project.
