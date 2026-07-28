# Context Automation

Automation protects deterministic facts and structural integrity. It must not make product, architecture, UX, acceptance, or risk decisions.

## Ownership

The base template provides structural starter scripts. In every derived project, a repository-integrated coding agent—Codex, Claude Code, or equivalent—must inspect the actual runtime and adapt the context implementation.

A conversational AI may propose the design but must not invent local paths, hooks, or commands.

Read `docs/context/CONTEXT_SYSTEM.md`.

## Canonical flow

```text
docs/context/state.yaml
  -> one-way renderer
  -> docs/context/PROJECT_STATE.md
  -> docs/context/PROGRESS.md
```

Generated files are never edited manually.

## Required commands in a derived project

The coding agent should provide equivalent commands using the repository's existing toolchain:

```text
context:sync       render generated views
context:validate   validate schema, IDs, links, and stale output
context:next       show active work and next tasks
context:task       start/done/block a task where useful
```

Command names may follow the project's package manager or language conventions.

## Included starter commands

### Validate context

```bash
npm run context:validate
```

Checks required artifacts, duplicate IDs, status values, links, active specification references, and unresolved placeholders when template mode is disabled.

### Refresh Git facts

```bash
npm run context:refresh
```

Updates only the generated Git-facts block in `docs/context/PROJECT_STATE.md`. It is a starter utility, not the complete `state.yaml` renderer.

### Archive current handoff

```bash
npm run context:archive-handoff
```

Archives an active handoff using its session date, feature, and task, then resets `current.md`.

## Coding-agent bootstrap checklist

1. Choose a scripting language already supported by the project.
2. Parse `docs/context/state.yaml` with a maintained library rather than a fragile ad-hoc parser.
3. Render compact and full views from the same model.
4. Write files only when content changed.
5. Validate duplicate feature/task IDs and allowed statuses.
6. Verify spec paths and commit references.
7. Detect generated output that differs from a clean render.
8. Add tests for renderer and validator.
9. Add CI validation.
10. Add only the provider adapter actually used.

## Provider adapters

### Claude Code

A local adapter may add:

- a `SessionStart` hook that runs sync/validation;
- a slash command for context status or task transitions;
- memory pointers to generated compact views.

Do not hardcode one developer's absolute path, and do not make Claude memory canonical.

### Codex

Use `AGENTS.md` as the permanent repository contract. Add repository-local commands or scripts for sync, validation, and status. Any external session metadata remains an adapter and must be reproducible from repository files.

## Template mode

`context.config.json` starts with `templateMode: true`. After filling core placeholders, set it to `false` so validation rejects unresolved placeholders in permanent and active artifacts.

## Local and CI hooks

Pre-commit should run fast structural validation. Keep full integration and end-to-end suites in CI.

At session start, an agent hook may:

- sync generated context;
- validate context;
- display active feature, task, branch, and handoff age.

At session end, it may warn when:

- source files changed but handoff did not;
- task status changed without verification evidence;
- generated context is stale.

Hooks detect missing updates. They do not make semantic decisions.
