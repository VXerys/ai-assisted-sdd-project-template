# Context Automation

Automation protects deterministic facts and structural integrity. It never makes product, architecture, UX, acceptance, or risk decisions.

Read `docs/context/CONTEXT_SYSTEM.md` for the model: hand-edited sources (`docs/steering/`, feature specs, `tasks.md`, `ASSUMPTIONS.md`, handoff) and rendered views (`state.yaml`, `BRIEF.md`, `PROJECT_STATE.md`, `PROGRESS.md`). Rendered files are never edited by hand.

## Included commands

### Validate context

```bash
npm run context:validate
```

Checks required files, duplicate ids, status values, relative links, generated-file banners, and unresolved placeholders once `templateMode` in `sdd.config.json` is `false`.

### Refresh git facts

```bash
npm run context:refresh
```

Updates only the generated git-facts block in `docs/context/PROJECT_STATE.md`.

### Archive current handoff

```bash
npm run context:archive-handoff
```

Archives an active handoff by session date, feature, and task, then resets `current.md`.

### Tests

```bash
npm test
```

Runs `node --test scripts/**/*.test.mjs`.

## Shipping with 2.0.0

`context:render` (state, brief, views), `adapters:sync` (AGENTS.md and tool adapters from steering), hooks, and slash commands are available from 2.0.0. Nothing in this repository describes them beyond that.

## Template mode

`sdd.config.json` starts with `templateMode: true`. After filling the steering files and core placeholders, set it to `false` so validation rejects unresolved placeholders in active artifacts and unrendered context views.

## Provider adapters

An adapter (Claude Code, Codex, Cursor, Gemini, Kiro) may load the brief at session start, run validation, and surface stale handoff or context. It never becomes the only copy of project state, never writes semantic decisions, and never hardcodes one developer's absolute path.
