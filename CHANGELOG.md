# Changelog

Format: Keep a Changelog. Versions follow Semantic Versioning.

## [Unreleased] — 2.0.0

Phases 1 to 4 of the v2 revamp (ADR-0001): foundation, tooling, adapters and hooks, init with presets and the example project. Phase 5 (release, migration guide, CI, branch rename) follows.

### Phase 4 — init with presets, example project

#### Added

- `npm run init` (`scripts/init/init.mjs`): interactive (`node:readline`, answers can be piped) and non-interactive (`--name`, `--description`, `--tier`, `--app`, `--db`, `--tools`, `--owner`, `--lang`, `--yes`, `--dry-run`, `--force`). Prints the plan, then: writes `sdd.config.json` (`templateMode: false`), fills steering, product, architecture, handoff, assumptions, runbook, and CONTRIBUTING placeholders from the answers and presets, creates `docs/steering/database.md` (`fileMatch`) for a database preset, prunes the full-tier documents on `lite` and relinks every reference to them, removes template-only files (`__fixtures__`, `examples/`, the template's ADR-0001, fixture-bound tests, `CLAUDE.md` when Claude is not a tool), resets `CHANGELOG.md`, runs `context:render`, `adapters:sync`, `context:validate`, and lists every placeholder left as `fill manually: path:line`. Refuses to run on an initialized project without `--force`.
- Presets in `scripts/init/presets/`: app `nextjs`, `react-native`, `flutter`, `kotlin-android`, `node-api`, `python-api`, `generic` (`label`, `language`, `commands`, `structure`, `fileMatch`, `notes`); database `supabase`, `firebase`, `postgres`, `mysql`, `sqlite-drift`, `mongodb`, `none` (`label`, `migrationTool`, `migrationCommand`, `migrationPath`, `notes`, `fileMatch`). Schema in `scripts/init/presets/README.md`, enforced by `scripts/init/lib/presets.mjs` and a test per file.
- `examples/todo-api/`: a fully filled `lite` project (`node-api` + `postgres`), F-001 `implemented` with evidence, F-002 `implementing` with an open assumption and an active handoff, rendered views and synced adapters. `npm run example:validate`; validated by `npm test`.
- Tests: 38 new (`presets.test.mjs`, `init.test.mjs` with a dry-run plan snapshot and lite and full end-to-end runs on temp copies, draft-placeholder and nested-project validator cases, the example).

#### Changed

- `docs/steering/tech.md`: the Stack and Commands tables use `{{PRESET_*}}` placeholders; rows presets cannot know (auth, state management, deployment) are added by hand; new "Stack rules" section from the app preset's notes; the dependency approval rule has a conservative default instead of a placeholder. `structure.md`: the source and test rows come from the preset's `structure`. `product.md`: `{{PROJECT_DESCRIPTION}}` identity line and `{{CONTENT_LANGUAGE}}`. `docs/runbooks/database-migrations.md`: procedure and per-store notes from the database preset (`{{PRESET_DB_*}}`). `CONTRIBUTING.md`: command placeholders from the preset. `docs/context/ASSUMPTIONS.md`: owner and date placeholders.
- Validator: an unresolved placeholder is a warning while the file's `status` is `draft` or `template`, an error otherwise; `walk` skips a nested directory with its own `sdd.config.json`, so `examples/` validates on its own and never collides with the root.
- README: quick start (`Use this template`, `npm install`, `npm run init`), flag table, tier table with what `lite` prunes, "After init", "Example". `docs/automation/README.md`: init section, presets in the layout. Every "available from 2.0.0" marker is gone.

### Phase 3 — adapters, hooks, slash commands, conditional steering

#### Added

- `npm run adapters:sync` (`scripts/adapters/sync.mjs`, `render.mjs`): renders `AGENTS.md` from `docs/steering/` and `sdd.config.json` (identity line, read-first list, source-of-truth table, generated and frozen paths, every `always` steering body, `fileMatch` files under "Conditional rules", manual files listed, commands pointer; warning over 400 lines), plus per tool in `tools`: `CLAUDE.md` (`@AGENTS.md`, adapter lines, hooks and commands table read from `.claude/`), `GEMINI.md` (`@AGENTS.md` plus three lines), `.cursor/rules/<name>.mdc` (`description`, `globs`, `alwaysApply`), `.github/copilot-instructions.md` and `.github/instructions/<name>.instructions.md` (`applyTo`), `.kiro/steering/<name>.md` (verbatim). Every target carries a GENERATED banner with `source_hash`. `--check`, `--all`, `--quiet`.
- Claude Code hooks in `scripts/hooks/`, wired by the committed `.claude/settings.json`: `session-start` (injects `BRIEF.md` with its render time, warns when stale, prints the fallback read order when absent), `pre-tool-guard` (denies edits to `generated`, `frozen`, and secret paths with the command to use instead; surfaces a matching `fileMatch` steering file once per session via `.claude/.sdd-session/`), `post-tool-render` (re-renders after spec, steering, assumptions, handoff, or config edits; syncs adapters after steering or config), `stop-handoff-check` (warns, never blocks, when `tasks.md` changed without the handoff). `hooks.enabled` in `sdd.config.json` turns them off.
- Slash commands in `.claude/commands/sdd/`: `/sdd:task <T-id>`, `/sdd:bug <title>`, `/sdd:review [git-ref]`, `/sdd:handoff`, `/sdd:render`.
- `scripts/lib/`: `glob` (`**`, `*`, `?`, basename and directory-prefix semantics), `steering` (loader, `fileMatch` lookup), `guard` (deny rules), `hook-io` (fail-open stdin JSON, project root, path normalization).
- Validator: `fileMatchPattern` required exactly when `inclusion: fileMatch`; stale adapters are errors while `tools` is non-empty; `generated` directories are checked for banners. `sdd.config.json` validates `tools` against `claude | codex | cursor | copilot | gemini | kiro | antigravity` and accepts `hooks.enabled`.
- Fixture `scripts/adapters/__fixtures__/multi-tool` with snapshots; the context fixtures carry synced `AGENTS.md` and `CLAUDE.md`. 39 new `node:test` tests (glob, adapters, hooks, validator).
- `.gitignore`: `.claude/settings.local.json`, `.claude/.sdd-session/`.

#### Changed

- `AGENTS.md` and `CLAUDE.md` are generated; `sdd.config.json` `generated` lists every adapter target and `hooks.enabled` is set.
- Docs no longer mark adapters, hooks, or slash commands as "available from 2.0.0" (`init` and presets keep the marker): `README.md`, `docs/automation/README.md`, `CONTEXT_SYSTEM.md`, `CONTEXT_INDEX.md`, `docs/documentation/README.md`, `steering/workflow.md`, `steering/structure.md`.

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
