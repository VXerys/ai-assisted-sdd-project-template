# Contributing Workflow

## 1. Choose the correct AI surface

Use conversational AI for product and documentation planning. Use a repository-integrated coding agent for repository inspection, context tooling, implementation, and verification.

Read `docs/documentation/AI_COLLABORATION_MODEL.md`.

## 2. Select the delivery path

| Change | Required artifacts |
|---|---|
| New project | PRD, constitution, architecture baseline, roadmap, first feature spec |
| Normal feature | Requirements, design, tasks, verification |
| Small feature without architecture impact | Compact feature spec, tasks, verification |
| Complex bug | Investigation/root cause, design impact, task, regression evidence |
| Internal refactor | Design-first specification and safety tests |
| Architecture change | ADR, architecture update, feature-design impact |
| Production hotfix | Minimal approved scope, regression evidence, post-stabilization docs |

## 3. Before implementation

- Choose one feature and task ID.
- Confirm requirements and design are approved.
- Run context sync and validation when implemented.
- Read the order in `docs/context/CONTEXT_INDEX.md`.
- Verify branch and worktree against `docs/handoff/current.md`.
- Create a purpose-specific branch.

## 4. During implementation

- Keep the diff within the selected task.
- Add tests with behavior changes.
- Stop when an unapproved product or architecture decision appears.
- Record architecture decisions as ADRs.
- Use migrations for database changes.
- Update execution status through `docs/context/state.yaml` tooling, not generated Markdown.

## 5. Before pull request

Run the project-equivalent commands:

```bash
{{CONTEXT_SYNC_COMMAND}}
{{CONTEXT_VALIDATE_COMMAND}}
{{FORMAT_COMMAND}}
{{LINT_COMMAND}}
{{TEST_COMMAND}}
{{BUILD_COMMAND}}
```

Update:

- feature verification evidence;
- `docs/context/state.yaml` through the context tooling;
- generated `PROJECT_STATE.md` and `PROGRESS.md`;
- `docs/handoff/current.md`;
- architecture or ADR artifacts when contracts changed.

## 6. Documentation review

Check:

- no raw chat history was committed;
- no giant manual context file was introduced;
- each fact has one canonical owner;
- generated files were not edited directly;
- long documents were reviewed using `docs/documentation/MODULARIZATION_GUIDE.md`;
- one ADR contains one decision;
- oversized features were split by capability before adding deep subfolders.

## 7. Pull request

The PR identifies:

- feature, task, and requirement IDs;
- intended behavior and out-of-scope work;
- changed boundaries;
- verification evidence;
- migration and compatibility impact;
- context and documentation impact;
- remaining risks.

Default to draft until deterministic checks pass.

## 8. Merge and closeout

After merge:

1. refresh execution state against the merged commit;
2. regenerate context views;
3. archive a meaningful handoff when work continues later;
4. update roadmap or release state;
5. do not delete accepted specifications or ADRs.
