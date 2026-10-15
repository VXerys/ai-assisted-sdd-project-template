# Examples

`todo-api/` is a fully filled `lite` project, the docs set a team would have after `npm run init --app node-api --db postgres` and two features of work: F-001 `implemented` with evidence for every acceptance criterion, F-002 `implementing` with one task in progress, one confirmed and one open assumption, an active handoff, and the rendered context views and adapters.

It serves two purposes:

- A few-shot reference for agents and humans. When a template leaves you unsure how filled a section should be, open the same file here: `todo-api/docs/specs/F-001-create-todo/verification.md` shows EV blocks, `todo-api/docs/context/ASSUMPTIONS.md` shows a resolved and an open entry, `todo-api/docs/handoff/current.md` shows an exact next step.
- A test fixture. `npm test` validates it with 0 errors (`scripts/context/validate-context.test.mjs`), so a change to the parsers or the validator that breaks a realistic project fails the suite.

Validate it on its own:

```bash
npm run example:validate       # cd examples/todo-api && node ../../scripts/context/validate-context.mjs
```

The example ships documentation only. No application code, no `scripts/`, no `docs/_templates/`, so the validator prints warnings for the hook scripts and template paths that `.claude/` and `AGENTS.md` mention; those files exist in a real project. `npm run init` removes this directory from a new project.

Everything in it is fictional: the commits, outputs, and dates are illustrative values that satisfy the evidence format, not records of a real run.
