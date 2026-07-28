# Contributing Workflow

## 1. Select the correct delivery path

| Change | Required artifacts |
|---|---|
| New project | PRD, constitution, architecture baseline, roadmap, feature specs |
| Normal feature | Requirements, design, tasks, verification |
| Small feature without architecture impact | Compact feature spec, tasks, verification |
| Complex bug | Investigation or root cause, design impact, task, regression evidence |
| Internal refactor | Design-first specification and safety tests |
| Architecture change | ADR, architecture update, feature design impact |
| Production hotfix | Minimal approved scope, regression evidence, post-stabilization documentation |

## 2. Before implementation

- Choose one feature and task ID.
- Confirm requirements and design are approved.
- Read the mandatory context order in `docs/context/CONTEXT_INDEX.md`.
- Verify branch and worktree against `docs/handoff/current.md`.
- Create a branch using a concise purpose, for example `feature/F-004-reading-insight`.

## 3. During implementation

- Keep the diff within the selected task.
- Add tests with behavior changes.
- Stop when an unapproved product or architecture decision appears.
- Record architecture decisions as ADRs.
- Use migrations for database changes.

## 4. Before pull request

```bash
npm run context:validate
{{FORMAT_COMMAND}}
{{LINT_COMMAND}}
{{TEST_COMMAND}}
{{BUILD_COMMAND}}
```

Update:

- feature `tasks.md`;
- feature `verification.md`;
- `docs/handoff/current.md`;
- `docs/context/PROJECT_STATE.md` when durable state changed;
- `docs/specs/_index.md` when feature-level status changed.

## 5. Pull request

The PR must identify:

- feature, task, and requirement IDs;
- intended behavior;
- changed boundaries;
- verification evidence;
- migration and compatibility impact;
- remaining risks;
- documentation impact.

Default to a draft pull request until deterministic checks pass and the change is ready for human review.

## 6. Merge and closeout

After merge:

1. refresh project state against the merged commit;
2. archive a meaningful handoff when work continues later;
3. update feature registry and roadmap;
4. record release or deployment state;
5. do not delete accepted specifications or ADRs.
