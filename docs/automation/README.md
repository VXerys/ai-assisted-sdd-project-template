# Context Automation

Automation protects deterministic facts and structural integrity. It never makes product, architecture, UX, acceptance, or risk decisions.

Read `docs/context/CONTEXT_SYSTEM.md` for the model: hand-edited sources (`docs/steering/`, feature specs, `tasks.md`, `ASSUMPTIONS.md`, handoff) and rendered views (`state.yaml`, `BRIEF.md`, `PROJECT_STATE.md`, `PROGRESS.md`). Rendered files are never edited by hand. The full list of validator checks with their severity is in that file.

## Included commands

### Render context

```bash
npm run context:render           # writes the four views with LF endings
npm run context:render -- --check   # exit 1 when a view would change; CI and the validator use this
npm run context:render -- --quiet
```

Reads `sdd.config.json`, `docs/steering/`, `docs/specs/F-*/`, `docs/context/ASSUMPTIONS.md`, `docs/handoff/current.md`, and git. Writes `docs/context/state.yaml` (with `source_hash`), `BRIEF.md` (within `limits.briefTokens`), `PROJECT_STATE.md`, `PROGRESS.md`.

### Validate context

```bash
npm run context:validate
npm run context:validate -- --strict   # warnings become errors
```

Output: `path:line  level  message` per finding, then a summary. Exit 1 on any error. A stale rendered view is an error that says `run npm run context:render`.

### Archive current handoff

```bash
npm run context:archive-handoff
```

Archives an active handoff to `docs/handoff/archive/<session_date>-<feature_id>-<task_id>.md`, resets `current.md` to `status: inactive`, then renders.

### Tests

```bash
npm test
```

Runs `node --test scripts/**/*.test.mjs`: parser unit tests, fixture repositories under `scripts/context/__fixtures__/` (`valid-lite`, `missing-evidence`, `implemented-with-open-task`, `stale-render`), and a smoke test against this repository.

## Layout

`scripts/context/render.mjs`, `validate-context.mjs`, and `archive-handoff.mjs` are thin CLIs; `scripts/context/lib/` holds the parsers (`frontmatter`, `specs`, `assumptions`, `handoff`, `markdown`), `config`, `hash`, `git`, `model`, `views`, `render`, and `checks` as functions over strings and paths, so tests run on fixtures without the real repository.

## Shipping with 2.0.0

`adapters:sync` (AGENTS.md and tool adapters from steering), hooks, slash commands, and `init` with presets are available from 2.0.0. Nothing in this repository describes them beyond that.

## Template mode

`sdd.config.json` starts with `templateMode: true`. After filling the steering files and core placeholders, set it to `false` so validation rejects unresolved placeholders in active artifacts.

## Provider adapters

An adapter (Claude Code, Codex, Cursor, Gemini, Kiro) may load the brief at session start, run validation, and surface stale handoff or context. It never becomes the only copy of project state, never writes semantic decisions, and never hardcodes one developer's absolute path.
