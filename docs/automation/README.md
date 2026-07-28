# Context Automation

Automation protects deterministic facts and structural integrity. It must not make product, architecture, UX, acceptance, or risk decisions.

## Included commands

### Validate context

```bash
npm run context:validate
```

Checks required artifacts, duplicate IDs, status values, links, active specification references, and unresolved placeholders when template mode is disabled.

### Refresh Git facts

```bash
npm run context:refresh
```

Updates only the generated Git-facts block in `docs/context/PROJECT_STATE.md`.

### Archive current handoff

```bash
npm run context:archive-handoff
```

Archives an active handoff using its session date, feature, and task, then resets `current.md`.

## Template mode

`context.config.json` starts with:

```json
{
  "templateMode": true
}
```

After creating a real project and replacing core placeholders, set it to `false`. Context validation will then reject unresolved placeholders in permanent and active artifacts.

## Recommended local hooks

Pre-commit:

```bash
npm run context:validate
```

Keep full integration and end-to-end suites in CI rather than slowing every commit.

## Optional AI-agent hooks

At session start:

- run context validation;
- show active feature, task, branch, and handoff age.

After file edits:

- format changed files;
- avoid running the entire suite after every edit.

At session end:

- warn when source files changed but `docs/handoff/current.md` did not;
- warn when a task is complete but no verification evidence changed.

Hooks should detect missing updates, not generate semantic decisions automatically.

## Optional scheduled audit

A weekly audit may report:

- specifications stuck in `implementing`;
- handoffs older than their expiration date;
- proposed ADRs unresolved for more than one sprint;
- implemented features with pending verification;
- project state not refreshed after merges.

Prefer a report or GitHub issue over automatic semantic edits.
