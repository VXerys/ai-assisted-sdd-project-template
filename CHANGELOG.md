# Changelog

Format: Keep a Changelog. Versions follow Semantic Versioning.

## [Unreleased]

## [2.1.2] — 2026-10-24

### Fixed

- An assumption with `feature: none`, the convention derived projects use for a project-wide assumption (license, platform, team rule), was an error ("references unknown feature none"); the first pilot upgrade failed validation on it alone. `none` is accepted now; a project-wide assumption that is still `open` is a warning, since it gates no task. The brief lists it as project-wide.
- A `done` task whose evidence is all `legacy: true` and covers no acceptance criterion of one of its FRs is reported as `info`, like the legacy evidence checks, instead of an error (the second pilot, loopday-app, had four such tasks and nothing else). A task with any post-upgrade evidence keeps the error.

### Added

- Migration `scripts/sdd/migrations/2.1.2.mjs` appends the Claude Code entries a project's `.gitignore` lacks (`.claude/settings.local.json`, `.claude/.sdd-session/`, `.claude/worktrees/`, `.claude/agent-memory/`), since `.gitignore` is never managed and a project with worktree sessions would otherwise commit them.

## [2.1.1] — 2026-10-24

### Fixed

- `sdd upgrade` rebuilt the 2.0.0 base by running that version's `init` with `--date`, a flag it does not accept, so every pre-2.1 project failed before the first file was compared (found by the first pilot upgrade). Only the flags the target `init` lists in its usage are passed now.

### Added

- `sdd upgrade` on a project without a `template` record (initialized before 2.1.0) infers the init answers instead of needing `--answers`: name, tier, app, db, and tools from `sdd.config.json`, owner and date from `docs/product/prd.md`, description and language from `docs/steering/product.md`, git for what is left, init's defaults last; it prints the source of every answer. `--infer-answers` ignores a recorded set; `--answers` still wins. The base defaults to `v2.0.0` for such a project, and `sdd check` exits 1 for it instead of 0.
- Migration `scripts/sdd/migrations/2.1.1.mjs`: every evidence block dated before the upgrade gets `legacy: true`. The validator reports the two trust checks (command in the `tech.md` table, commit in `git log`) on a legacy block at a new `info` level, which `--strict` does not promote, so a derived project's strict CI stays green after the upgrade while new evidence must satisfy both rules (ADR-0004 named these warnings; `info` is the same intent made compatible with strict CI). The summary line shows `N info` when any exist.

## [2.1.0] — 2026-10-23

### Fixed

- `npm run init` no longer leaves the template CI in a new project. That workflow validated `examples/` (removed by init) and ran the `template-init` job, so the first CI run of every derived project failed. Init now replaces `.github/workflows/context-integrity.yml` with a `verify` job built from the app preset: Node 22 for the SDD tooling, the preset's toolchain setup, its `ci.run` commands (install, lint, typecheck, test, build where the preset has them), `npm test`, and `npm run context:validate -- --strict`. The dry-run plan shows the replacement.
- The PreToolUse guard resolved the project root from `CLAUDE_PROJECT_DIR`, which stays on the main checkout when a session works in a git worktree, so an edit to `.claude/worktrees/<name>/docs/context/state.yaml` did not match the `generated` globs. The root is now the git top level of the event's `cwd`, or of the target file inside a nested worktree.
- The guard covered Edit and Write only. It now also checks Bash and PowerShell commands (writes into generated, frozen, or protected paths; any access to secrets), NotebookEdit, and Read of secret files.
- The shell guard read heredoc bodies as arguments and expanded a bare `**` against the secret patterns, so `git commit -F - <<EOF` or `grep -r x **` was refused. A heredoc body now counts only as code fed to an interpreter, and reads never expand wildcards.

### Added

- ADR-0004 (dogfood-first roadmap) settles the order after the 2026-10-23 audit of ten derived projects: release 2.1.0, then upgrade inference and legacy-evidence migration, then pilot upgrades, and only then distribution work; structured EV keys, file-lease task claims with a `Task: T-XXX` commit trailer, and a lite cap of 120 lines are decided for 2.1.x and 2.2. The audit and the repository benchmark behind it are `docs/research/2026-10-23-upgrade-recommendations.md` (template-only).
- ADR-0003 amends ADR-0002 after the 2026-10-22 benchmark: tooling stays in the template with one CLI until extraction, copier-style upgrades, hook scope for cloud sessions, adapters without duplicated rules, and `/sdd:*` commands kept.
- `npm run sdd -- <command>` (`scripts/sdd/cli.mjs`, also `bin: sdd`): `brief`, `validate`, `render`, `sync`, `guard --check`, `status`, `check`, `upgrade`.
- `sdd upgrade --from <template checkout>`: rebuilds the old and new template output from the answers recorded at init, updates unedited managed files, 3-way merges edited ones with `git merge-file`, leaves conflict markers or `.rej` files, runs version-keyed migrations from `scripts/sdd/migrations/`, then renders, syncs, and validates. `--dry-run`, `--to`, `--base-ref`, `--answers`, `--conflict inline|rej`; a dirty tree is refused.
- `init` records `template: {version, commit, answers}` in `sdd.config.json`, writes `.sdd/manifest.json` with the hash of every managed file, and accepts `--date`. `managed` in `sdd.config.json` replaces the default managed list.
- `sdd guard --check` runs in the derived CI workflow and the template CI (checkout with full history), so sessions and tools without hooks hit the same gate.
- Claude Code adapter `.claude/rules/<name>.md`: `always` steering files not inlined in `AGENTS.md` load at launch, `fileMatch` files load through `paths:` when a matching file is read or edited.
- In a cloud session (`CLAUDE_CODE_REMOTE=true`) without `node_modules`, SessionStart runs `npm ci` before loading the brief.
- `/sdd:converge [F-id]`: a verdict per acceptance criterion (`met`, `partial`, `missing`, `contradicts`) with file and line evidence, and a `## Convergence` task per gap appended to `tasks.md`; a converged feature leaves the file byte-identical.
- Optional trace links, checked by the validator: `targets` globs in `requirements.md` frontmatter and `[test: path#name]` on an acceptance criterion must name existing files (warning until `implementing`, error from then on).
- Bug investigations carry `## Unchanged behavior` (`UB-XXX ... SHALL CONTINUE TO ...`), each needing its own regression evidence; `/sdd:bug` lists the neighboring behaviors.
- `sdd next [--json]` and a `## Ready tasks` section in `BRIEF.md`: planned tasks whose dependencies are done, and which of them are parallel-safe (a `scope` disjoint from every `in_progress` or `review` task).
- `sdd adopt --into <repository>` (run from the template): initializes a temp copy and adds the SDD files to an existing codebase without overwriting or deleting anything; merges the `package.json` scripts (`test:sdd` when the project has its own `test`) and `yaml`, and `.gitignore`; leaves `package.json` and `.gitattributes` out of the managed list. `/sdd:adopt` then fills steering from the real code, with commands proven by running them and a pitfalls list.
- `LICENSE` (MIT), `SECURITY.md` (private reporting, scope, response time), and `.github/CODEOWNERS`; all template-only, and the derived `package.json` drops `license`.
- `.github/workflows/release.yml`: release-please (pinned 4.4.1, `release-type: node`, `skip-changelog`, manifest at 2.0.0) keeps a release pull request and tags `vX.Y.Z` on merge; a `publish-npm` job with OIDC provenance runs only when the repository variable `NPM_PUBLISH` is `true`, which stays off until the tooling is extracted. `CONTRIBUTING.md` lists the GitHub settings the owner keeps (ruleset on `main`, required checks, code-owner review, private vulnerability reporting).
- `docs/automation/README.md` documents cloud sessions and scheduled tasks: which load hooks, that a routine prompt is not owner approval, the hourly limit, and taking only parallel-safe tasks.

- App presets carry a `ci` key (`setup` steps and the `run` command keys), checked by the preset schema. `flutter`, `kotlin-android`, and `python-api` set up Flutter stable, Temurin 17, and Python 3.12; `react-native` leaves out `build`, which needs a device or emulator.
- `protected` guard rule: in a derived project (`templateMode: false`), an edit to `sdd.config.json`, `.claude/settings.json`, `.claude/commands/`, `.claude/skills/sdd-*`, `.github/workflows/`, or the `scripts/` tooling returns `permissionDecision: ask`, so the owner approves every change to the gate itself.
- `scripts/lib/shell-targets.mjs`: best-effort extraction of the paths a Bash or PowerShell command writes or reads.
- `npm run test:unit` and `npm run test:e2e` in the template. The init end-to-end tests moved to `scripts/init/e2e/`, one file per scenario, so `node --test` runs them in parallel; the full suite went from about 419 s to about 107 s on the maintainer's Windows machine.
- `.github/dependabot.yml` for GitHub Actions and npm.

### Changed

- The PreToolUse guard hook sets `onFailure: "block"` (Claude Code 2.1.295+; 2.1.309+ recommended for PowerShell), so a guard that cannot start denies the tool call instead of letting it through. The other hooks keep the default.
- `.gitignore` covers `.claude/worktrees/` and `.claude/agent-memory/`; `rules.md` names subagent memory as never a source of truth.
- Every GitHub Action in the template CI, the derived workflow, and the presets is pinned to a full commit SHA with its release as a comment (latest release within the major already in use: checkout 4.4.0, setup-node 4.4.0, setup-java 4.9.1, setup-python 5.6.0, flutter-action 2.23.0). Preset `ci.setup` steps require `version`.
- Actions moved to their current majors after review of each release's breaking changes (only the node24 runtime and caching defaults, which the pinned inputs already cover): checkout 7.0.1, setup-node 7.1.0, and release-please-action 5.0.0 in the template workflows (Dependabot PR #7); the same checkout and setup-node in the derived workflow (`PINNED_ACTIONS`); setup-java 6.1.0 and setup-python 7.1.0 in the presets. A test fails when a checkout or setup-node pin in the template workflows drifts from `PINNED_ACTIONS`, since Dependabot only updates `.github/workflows/`.
- Template CI runs on `ubuntu-latest` and `windows-latest`, and initializes five preset combinations (one on Windows), each validated strictly and running the derived project's `npm test`. `rsync` is replaced by `scripts/ci/copy-template.mjs`.
- `scripts/init/init.test.mjs`, `scripts/init/e2e/`, `scripts/ci/`, `docs/research/`, and ADR-0003 are template-only; init removes them, and the derived `package.json` drops `test:e2e`.
- `AGENTS.md` inlines only `rules.md` and `tech.md` (281 to 148 lines in the template; warning cap 150, was 400). Other `always` files are pointers in its Source of truth table, `fileMatch` files are one line each. Cursor, Kiro, and Copilot adapters carry only the steering files `AGENTS.md` does not inline (Copilot gets `applyTo: "**"` for `always` files), and a sync removes generated adapter files whose source is gone; `--check` reports them.
- PreToolUse no longer injects `fileMatch` steering as `additionalContext`; `.claude/rules/` replaces it, and `.claude/.sdd-session/` is no longer written.
- `/sdd:task`, `/sdd:handoff`, `/sdd:bug`, and `/sdd:render` set `disable-model-invocation: true`, so only the owner starts them.
- `.sdd/` joins the protected paths.

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
