# Repository Operating Contract

## 1. Repository purpose

This repository contains `{{PROJECT_NAME}}`, a `{{APPLICATION_TYPE}}` used by `{{TARGET_USERS}}` to `{{PRIMARY_OUTCOME}}`.

- Lifecycle stage: `{{DISCOVERY | MVP | BETA | PRODUCTION}}`
- Current milestone: `{{MILESTONE}}`
- Primary owner: `{{OWNER}}`

Approved product behavior lives under `docs/specs/`. Do not infer it from unfinished UI, raw chat, issue descriptions, or generated progress views.

## 2. AI surface and authority

### Human owner

Controls product scope, priority, requirement and architecture approval, dependencies, database/public contracts, security exceptions, acceptance, and release.

### Conversational AI

May draft:

- idea brief and PRD;
- UX flows;
- architecture alternatives;
- feature requirements and design;
- task decomposition;
- ADR proposals;
- documentation modularization.

Its output is a proposal until reviewed and committed. It must not claim current repository facts without repository access.

### Repository-integrated coding agent

Codex, Claude Code, or equivalent may:

- inspect the actual repository;
- validate planned artifacts against code;
- implement the context system and provider adapter;
- execute approved tasks;
- run deterministic checks;
- update execution state, verification, and handoff.

It must not silently approve product or architecture decisions.

### Automation

May format, render, validate, and compare. It must not make semantic decisions.

Read `docs/documentation/AI_COLLABORATION_MODEL.md`.

## 3. Mandatory coding-session reading order

1. `AGENTS.md`
2. `docs/context/CONTEXT_INDEX.md`
3. `docs/context/PROJECT_STATE.md`
4. `docs/handoff/current.md`
5. active feature requirements
6. active feature design
7. active feature tasks
8. relevant ADRs
9. relevant code and tests

Read `docs/context/PROGRESS.md` only when the compact view is insufficient.

## 4. Canonical sources

| Question | Canonical source |
|---|---|
| Product purpose and scope | `docs/product/` |
| Shared architecture | `docs/architecture/` |
| Architecture rationale | `docs/adr/` |
| Approved feature behavior | `docs/specs/<feature>/requirements.md` |
| Approved feature approach | `docs/specs/<feature>/design.md` |
| Feature work definition | `docs/specs/<feature>/tasks.md` |
| Acceptance evidence | `docs/specs/<feature>/verification.md` |
| Execution state | `docs/context/state.yaml` |
| Compact generated status | `docs/context/PROJECT_STATE.md` |
| Full generated progress | `docs/context/PROGRESS.md` |
| Current session delta | `docs/handoff/current.md` |
| Implemented behavior | Code, tests, schemas, migrations |

Generated context files are never edited manually.

When sources conflict, stop affected work and report the conflict, authority, implementation evidence, and smallest correction.

## 5. Context-system bootstrap

A derived project must have its repository context system implemented or adapted by the repository-integrated coding agent.

Follow `docs/context/CONTEXT_SYSTEM.md`.

Requirements:

1. `docs/context/state.yaml` remains canonical for mutable execution state.
2. `PROJECT_STATE.md` and `PROGRESS.md` are one-way generated views.
3. Repeated sync is idempotent.
4. IDs, statuses, links, and stale output are validated.
5. Provider-specific hooks or memory are adapters only.
6. Paths are repository-relative and portable.
7. `docs/handoff/current.md` remains a separate session delta.

Do not replace this with a manually maintained giant chat-context file.

## 6. Documentation modularity

Follow `docs/documentation/MODULARIZATION_GUIDE.md`.

Rules:

- split by responsibility, authority, and change cadence;
- do not split into meaningless `part-1` files;
- every modular folder has a `README.md` index;
- promote a file into a folder when its subconcerns change independently;
- remove the superseded complete source to prevent duplication;
- keep global architecture cross-feature;
- keep feature-local design in the feature spec;
- one decision equals one ADR;
- split oversized features before creating deeply nested spec files.

## 7. Architecture contract

Primary stack:

- Client: `{{CLIENT_STACK}}`
- Language: `{{LANGUAGE}}`
- Backend: `{{BACKEND}}`
- Database: `{{DATABASE}}`
- State management: `{{STATE_MANAGEMENT}}`
- Testing: `{{TEST_FRAMEWORKS}}`

Required dependency direction:

```text
Presentation
  -> Application / Controller
  -> Use Case / Service
  -> Repository
  -> Data Source / External Service
```

General rules:

1. UI does not directly access infrastructure clients.
2. Business rules do not exist only in UI.
3. External providers remain behind internal boundaries.
4. Existing project conventions beat generic framework preferences.
5. Generated files are not edited manually.
6. Cross-feature or expensive-to-reverse choices require ADRs.

Project-specific boundaries:

- `{{BOUNDARY_RULE_1}}`
- `{{BOUNDARY_RULE_2}}`
- `{{BOUNDARY_RULE_3}}`

## 8. Project commands

Install:

```bash
{{INSTALL_COMMAND}}
```

Development:

```bash
{{DEV_COMMAND}}
```

Format:

```bash
{{FORMAT_COMMAND}}
```

Lint/static analysis:

```bash
{{LINT_COMMAND}}
```

Unit tests:

```bash
{{UNIT_TEST_COMMAND}}
```

Integration tests:

```bash
{{INTEGRATION_TEST_COMMAND}}
```

Build:

```bash
{{BUILD_COMMAND}}
```

Context sync and validation:

```bash
{{CONTEXT_SYNC_COMMAND}}
{{CONTEXT_VALIDATE_COMMAND}}
```

Do not report verification when required commands were not run. State the exact reason and residual risk.

## 9. Task execution protocol

Before implementation:

1. select one task;
2. read referenced requirements and design;
3. sync and validate context;
4. confirm handoff against branch and worktree;
5. inspect implementation and tests;
6. report objective, constraints, expected files, risks, and commands.

During implementation:

1. stay within the task;
2. preserve unrelated behavior;
3. add tests with behavior changes;
4. avoid opportunistic refactors;
5. stop when an unapproved contract or architecture decision appears.

After implementation:

1. run checks;
2. review diff;
3. record evidence;
4. update task status through the context system;
5. regenerate and validate context;
6. update handoff;
7. report changed files, risks, and exact next task.

## 10. Specification change protocol

Approved specifications are contracts.

When implementation reveals a problem:

1. stop affected work;
2. state current requirement and discovered issue;
3. propose the smallest change;
4. list design, task, test, migration, and compatibility impact;
5. block affected tasks;
6. continue after human approval.

## 11. ADR protocol

Create an ADR for cross-feature or expensive-to-reverse decisions. One decision equals one file.

Do not delete accepted ADRs. Supersede them with a new ADR.

## 12. Definition of Done

A task is complete when:

- requirement references are satisfied;
- approved design is followed;
- checks pass;
- errors and security boundaries are handled;
- no unrelated changes exist;
- execution state is updated;
- evidence is recorded;
- generated context is current;
- handoff is current.

A feature is complete when every acceptance criterion has evidence and the human accepts it.

## 13. Documentation prohibitions

Do not:

- store raw chat history;
- create one giant manual context file;
- duplicate status across artifacts;
- copy source code into docs without purpose;
- document every method;
- present plans as implemented facts;
- present assumptions as confirmed facts;
- hardcode one developer's absolute path in canonical tooling;
- make provider memory the only project record.

## 14. Security

1. Never commit secrets or real credentials.
2. Use synthetic fixture data.
3. Destructive commands require approval.
4. Database changes use versioned migrations.
5. Authorization remains enforced at a trusted boundary.
6. Production configuration does not change as a local-development side effect.

## 15. Completion report

```markdown
## Completed
- Task:
- Requirements:
- Result:

## Changed Files
- `path`: reason

## Verification
- Command:
- Result:

## Context
- State updated:
- Generated views refreshed:
- Handoff updated:

## Remaining Risks
- None / details

## Next Task
- Task ID and reason
```
