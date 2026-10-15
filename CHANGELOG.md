# Changelog

Format: Keep a Changelog. Versions follow Semantic Versioning.

## [Unreleased] — 2.0.0

Phase 1 of the v2 revamp (ADR-0001): foundation. Tooling phases follow.

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
