# Context Automation

Automation protects deterministic facts and structural integrity. It never makes product, architecture, UX, acceptance, or risk decisions.

Read `docs/context/CONTEXT_SYSTEM.md` for the model: hand-edited sources (`docs/steering/`, feature specs, `tasks.md`, `ASSUMPTIONS.md`, handoff) and rendered outputs (`state.yaml`, `BRIEF.md`, `PROJECT_STATE.md`, `PROGRESS.md`, `AGENTS.md`, tool adapters). Rendered files are never edited by hand. The full list of validator checks with their severity is in that file.

## Commands

### Init

```bash
npm run init                      # prompts for every value no flag set
npm run init -- --yes --name "Habit Tracker" --tier lite --app flutter --db supabase --tools claude,kiro
npm run init -- --dry-run --yes   # prints the plan, changes nothing
npm run init -- --force ...       # re-run on a project whose templateMode is already false
```

Flags: `--name`, `--description`, `--tier lite|full`, `--app <preset>`, `--db <preset>`, `--tools <list>`, `--owner`, `--lang`, `--yes`, `--dry-run`, `--force`; the README has the table. Prompts read stdin line by line, so answers can be piped.

The plan, printed before anything changes and executed in this order, each step idempotent:

1. `write sdd.config.json`: `project`, `stack`, `tools`, `templateMode: false`; `validate.requiredFiles` loses pruned files and gains the `database.md` steering file when a database preset is chosen; `generated`, `frozen`, `limits` are kept.
2. `fill`: `docs/steering/*.md`, the project documents under `docs/product/`, `docs/architecture/`, `docs/specs/_index.md`, `docs/quality/`, `docs/runbooks/`, `docs/context/ASSUMPTIONS.md`, and `CONTRIBUTING.md` (the list is `FILL_TARGETS` in `scripts/init/init.mjs`). Values: the answers (`{{PROJECT_NAME}}`, `{{PROJECT_DESCRIPTION}}`, `{{CONTENT_LANGUAGE}}`, `{{OWNER}}` and its variants, `{{YYYY-MM-DD}}` except on an `expires_after` line), the presets (`{{PRESET_*}}`, see `scripts/init/presets/README.md`), and `none` for the four "or none" rule placeholders of a fresh project. A placeholder with no value stays and is listed at the end as `fill manually: path:line`; a fresh template leaves none. `strip`: the `<!-- template-only -->` block of `CONTRIBUTING.md` (how to maintain the template) is removed.
3. `create docs/steering/database.md` (`inclusion: fileMatch`, patterns and rules from the database preset) unless `--db none`.
4. `prune` (lite only): `docs/specs/_templates/system-architecture.md`, `docs/_templates/architecture-baseline.md`, `docs/runbooks/`, `docs/quality/test-strategy.md`, `docs/architecture/MODULE_ARCHITECTURE_GUIDE.md`, `docs/documentation/MODULARIZATION_GUIDE.md`; then `relink` every Markdown file that pointed at a pruned or removed path: a table row or list item is dropped, a prose line loses only that sentence.
5. `remove` template-only files: `scripts/**/__fixtures__/`, `scripts/migrate/`, `examples/`, `docs/adr/ADR-0001-v2-revamp.md`, `docs/MIGRATION-v1-to-v2.md`, the test files that need the fixtures, and `CLAUDE.md` when `claude` is not in `--tools`; `reset CHANGELOG.md` to a fresh `[Unreleased]`.
6. `run` `context:render`, `adapters:sync`, `context:validate`; their summaries are printed and the validate exit code is init's exit code.

### Render context

```bash
npm run context:render           # writes the four views with LF endings
npm run context:render -- --check   # exit 1 when a view would change; CI and the validator use this
npm run context:render -- --quiet
```

Reads `sdd.config.json`, `docs/steering/`, `docs/specs/F-*/`, `docs/context/ASSUMPTIONS.md`, `docs/handoff/current.md`, and git. Writes `docs/context/state.yaml` (with `source_hash`), `BRIEF.md` (within `limits.briefTokens`), `PROJECT_STATE.md`, `PROGRESS.md`.

### Sync adapters

```bash
npm run adapters:sync              # AGENTS.md plus the adapters for the tools in sdd.config.json
npm run adapters:sync -- --check   # exit 1 when any target differs from a clean sync; the validator runs this
npm run adapters:sync -- --all     # every supported tool, ignoring the tools list
npm run adapters:sync -- --quiet
```

Source: `docs/steering/*.md` (frontmatter `inclusion: always | fileMatch | manual`; `fileMatchPattern`, a glob or array of globs, exactly when `fileMatch`) and `sdd.config.json` (`project`, `tools`, `paths`, `generated`, `frozen`). Every target starts with a GENERATED banner carrying `source_hash` (sha256 over steering and config). Staleness is decided by content, so a hand edit anywhere in a target fails `--check`.

| `tools` entry | Target | Content |
|---|---|---|
| always | `AGENTS.md` | identity line (first prose line under `## Vision` in `product.md`), read-first list, source-of-truth table, generated and frozen paths, every `always` steering body under its own H2 (rules, tech, structure, workflow, product, then others alphabetically), `fileMatch` files under "Conditional rules" with their patterns, manual files listed by path, commands pointer. A warning is printed over 400 lines. |
| `claude` | `CLAUDE.md` | `@AGENTS.md`, the adapter lines, and a "Hooks and commands" section read from `.claude/settings.json` and `.claude/commands/sdd/` |
| `cursor` | `.cursor/rules/<name>.mdc` | one per steering file: `description` from its first paragraph, `alwaysApply: true` for always, `globs` for fileMatch, `alwaysApply: false` without globs for manual |
| `copilot` | `.github/copilot-instructions.md`, `.github/instructions/<name>.instructions.md` | a short pointer to `AGENTS.md` (Copilot reads it natively); one `applyTo` file per fileMatch steering file |
| `gemini` | `GEMINI.md` | `@AGENTS.md` plus three adapter lines |
| `kiro` | `.kiro/steering/<name>.md` | the steering file verbatim with the banner after its frontmatter |
| `codex`, `antigravity` | none | both read `AGENTS.md` |

Sync writes and overwrites. It does not delete a target left behind by a removed tool or a renamed steering file; delete those by hand.

### Validate context

```bash
npm run context:validate
npm run context:validate -- --strict   # warnings become errors
```

Output: `path:line  level  message` per finding, then a summary. Exit 1 on any error. A stale rendered view is an error that says `run npm run context:render`; a stale adapter says `run npm run adapters:sync`.

### Archive current handoff

```bash
npm run context:archive-handoff
```

Archives an active handoff to `docs/handoff/archive/<session_date>-<feature_id>-<task_id>.md`, resets `current.md` to `status: inactive`, then renders.

### Tests

```bash
npm test
```

Runs `node --test scripts/**/*.test.mjs`: parser unit tests, the glob matcher, adapter snapshots on `scripts/adapters/__fixtures__/multi-tool/`, every hook driven through stdin JSON, fixture repositories under `scripts/context/__fixtures__/` (`valid-lite`, `missing-evidence`, `implemented-with-open-task`, `stale-render`), the schema of every preset file, `init` end to end on temp copies of this repository (lite and full, dry-run plan snapshot in `scripts/init/__fixtures__/`), `examples/todo-api` validated with 0 errors, and a smoke test against this repository.

## Claude Code hooks

`.claude/settings.json` (committed) wires four scripts from `scripts/hooks/` as `node "${CLAUDE_PROJECT_DIR}/scripts/hooks/<name>.mjs"`. Each hook reads the event JSON from stdin and always exits 0; an internal error becomes one stderr line and nothing else. `hooks.enabled: false` in `sdd.config.json` silences all four. Personal overrides belong in `.claude/settings.local.json` (gitignored).

| Event (matcher) | Script | Behavior |
|---|---|---|
| SessionStart (`startup\|resume\|compact`) | `session-start.mjs` | Emits `docs/context/BRIEF.md` as `additionalContext`, prefixed by `SDD brief (rendered <generated_at>)`. When the brief's `source_hash` no longer matches the sources, a `stale` warning line comes first. Without a brief, the fallback read order. Capped at 10,000 characters. |
| PreToolUse (`Edit\|Write\|MultiEdit`) | `pre-tool-guard.mjs` | Returns `permissionDecision: deny` for `tool_input.file_path` matching `generated` or `frozen` in `sdd.config.json`, or `.env*` (except `.env.example`), `*.pem`, `*.keystore`, `*.jks`, `google-services.json`; the reason names the rule and the command to run instead (`npm run context:render`, `npm run adapters:sync`). Otherwise, when the path matches a `fileMatch` steering pattern not yet surfaced for this `session_id`, emits that steering file as `additionalContext` once; state lives in `.claude/.sdd-session/<session_id>.json` (gitignored). |
| PostToolUse (`Edit\|Write\|MultiEdit`) | `post-tool-render.mjs` | After an edit under `docs/specs/` or `docs/steering/`, or to `ASSUMPTIONS.md`, the handoff, or `sdd.config.json`: runs `context:render --quiet`, and after steering or config also `adapters:sync --quiet`. Prints one line naming what re-rendered, or which command failed. |
| Stop | `stop-handoff-check.mjs` | Reads `git status --porcelain`; when a `docs/specs/F-*/tasks.md` changed but `docs/handoff/current.md` did not, prints a warning naming the handoff. Never blocks; silent when `stop_hook_active` is true or outside a git repository. |

Known uncertainty: `hookSpecificOutput.additionalContext` is documented for SessionStart; for PreToolUse it was not verified against a running Claude Code session. If a version ignores it, the fileMatch steering text is not injected, and `AGENTS.md` ("Conditional rules") remains the fallback the agent already has. Nothing else in the hook depends on it.

Windows: the command string was verified under Git Bash, which expands `${CLAUDE_PROJECT_DIR}` (also with a space in the path); cmd.exe passes `${...}` through literally and node fails to find the script. If a Claude Code build runs hooks through cmd.exe, override the commands with `%CLAUDE_PROJECT_DIR%` in `.claude/settings.local.json`.

## Slash commands

`.claude/commands/sdd/<name>.md` becomes `/sdd:<name>`. Each file is an instruction list the agent follows with its own tools; `allowed-tools` limits what the command may run.

| Command | Does |
|---|---|
| `/sdd:task <T-id>` | finds the task block, reads only the FR, AC, design, and architecture sections it references, prints the filled `docs/_templates/task-prompt.md`, sets the task `in_progress`, implements, records evidence, renders and validates; stops on the stop conditions |
| `/sdd:bug <title>` | creates `docs/quality/bugs/BUG-XXX-<slug>.md` from `bug-investigation.md` with the next free id; symptom only, no fix |
| `/sdd:review [git-ref]` | fills `code-review.md` against `git diff <ref>`; read-only, prints the review |
| `/sdd:handoff` | rewrites `docs/handoff/current.md` from the session, then runs render and validate |
| `/sdd:render` | runs `context:render`, `adapters:sync`, `context:validate` and reports every error line |

## Layout

`scripts/context/` holds `render.mjs`, `validate-context.mjs`, `archive-handoff.mjs` as thin CLIs over `scripts/context/lib/` (parsers, `config`, `hash`, `git`, `model`, `views`, `render`, `checks`). `scripts/adapters/` holds `sync.mjs` over `render.mjs`. `scripts/init/` holds `init.mjs` over `lib/` (`presets`, `fill`, `prune`) and `presets/app/*.json`, `presets/db/*.json`. `scripts/hooks/` holds the four hook entry points. `scripts/migrate/` holds `v1-tasks.mjs`, the v1 task converter used by `docs/MIGRATION-v1-to-v2.md`; init removes it. `scripts/lib/` holds `glob`, `steering`, `guard`, and `hook-io`, shared by adapters, hooks, and the validator. Everything is a function over strings and paths, so tests run on fixtures without the real repository.

## Template mode

`sdd.config.json` starts with `templateMode: true`; `npm run init` sets it to `false`. From then on an unresolved placeholder in a `validate.placeholderSensitiveFiles` entry is an error, or a warning while that file's frontmatter `status` is `draft` or `template`.

## Provider adapters

Adapters are rendered, never hand-edited, and never the only copy of project state. They load the brief, point at steering, and surface validation; they never write semantic decisions and never hardcode one developer's absolute path.
