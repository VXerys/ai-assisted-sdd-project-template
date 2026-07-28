# Repository Operating Contract

## 1. Repository Purpose

This repository contains `{{PROJECT_NAME}}`, a `{{APPLICATION_TYPE}}` used by `{{TARGET_USERS}}` to `{{PRIMARY_OUTCOME}}`.

- Lifecycle stage: `{{DISCOVERY | MVP | BETA | PRODUCTION}}`
- Current milestone: `{{MILESTONE}}`
- Primary owner: `{{OWNER}}`

Do not infer approved product behavior from unfinished UI, partial code, raw chat logs, or issue descriptions. Approved feature behavior lives under `docs/specs/`.

## 2. Mandatory Reading Order

Before planning or modifying code, read:

1. `AGENTS.md`
2. `docs/context/CONTEXT_INDEX.md`
3. `docs/context/PROJECT_STATE.md`
4. `docs/handoff/current.md`
5. the active feature's `requirements.md`
6. the active feature's `design.md`
7. the active feature's `tasks.md`
8. relevant ADRs
9. implementation files directly related to the selected task

Do not load every historical handoff, specification, ADR, or source file unless required.

## 3. Canonical Sources

| Question | Canonical source |
|---|---|
| Why does the product exist? | `docs/product/prd.md` |
| What is planned? | `docs/product/roadmap.md` |
| How is the system structured? | `docs/architecture/` |
| Why was an architecture choice made? | `docs/adr/` |
| What behavior is approved? | `docs/specs/<feature>/requirements.md` |
| How should the feature be implemented? | `docs/specs/<feature>/design.md` |
| What work remains? | `docs/specs/<feature>/tasks.md` |
| What acceptance evidence exists? | `docs/specs/<feature>/verification.md` |
| What is the current durable state? | `docs/context/PROJECT_STATE.md` |
| What changed in the last session? | `docs/handoff/current.md` |
| What is actually implemented? | Code, tests, schemas, and migrations |

When sources conflict, do not silently choose one. Report the conflict, affected artifacts, likely authority, and smallest correction.

## 4. Human and Agent Authority

The human owner controls:

- product scope and priority;
- requirement approval;
- architecture approval;
- database and public API contract changes;
- dependency additions;
- security exceptions;
- acceptance and release decisions.

The AI agent may:

- inspect the repository;
- identify ambiguity and risk;
- draft artifacts;
- implement approved tasks;
- add or update tests;
- run deterministic checks;
- update task, verification, and handoff records.

The agent must not silently:

- expand scope;
- rewrite approved requirements;
- replace an established architecture pattern;
- add a dependency;
- change database schema or public API behavior;
- remove backward compatibility;
- edit unrelated modules;
- weaken authorization or validation to make tests pass.

## 5. Architecture Contract

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

Project-specific boundaries:

- `{{BOUNDARY_RULE_1}}`
- `{{BOUNDARY_RULE_2}}`
- `{{BOUNDARY_RULE_3}}`

General rules:

1. UI must not directly access database or infrastructure clients.
2. Business rules must not exist only in UI components.
3. External-service details must remain behind repository or service boundaries.
4. Existing project conventions take precedence over generic framework conventions.
5. Generated files must not be edited manually.
6. Cross-cutting or expensive-to-reverse decisions require an ADR.

## 6. Project Commands

Install:

```bash
{{INSTALL_COMMAND}}
```

Run development:

```bash
{{DEV_COMMAND}}
```

Format:

```bash
{{FORMAT_COMMAND}}
```

Lint or static analysis:

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

Do not report a task as verified when required commands were not run. State the exact reason and residual risk when a command cannot run.

## 7. Task Execution Protocol

Before implementation:

1. Select one task ID from the active `tasks.md`.
2. Read every requirement and design section referenced by the task.
3. Inspect the current implementation and tests.
4. Confirm the handoff still matches the branch and worktree.
5. Report objective, constraints, expected files, risks, and verification commands.

During implementation:

1. Stay within the selected task.
2. Preserve unrelated behavior.
3. Add tests with behavior changes.
4. Avoid opportunistic refactors.
5. Stop and report when a product or architecture decision is required.

After implementation:

1. Run relevant format, lint, test, and build commands.
2. Review the diff for unrelated changes.
3. Update `tasks.md`.
4. Record evidence in `verification.md`.
5. Update `docs/handoff/current.md`.
6. Report changed files, checks, risks, and exact next task.

## 8. Specification Change Protocol

Approved specifications are contracts. When implementation reveals a specification problem:

1. stop the affected work;
2. describe the current requirement and discovered issue;
3. propose the smallest change;
4. list design, task, test, migration, and compatibility impact;
5. mark affected tasks blocked;
6. continue only after owner approval.

Clarifications that do not change accepted behavior may be recorded directly with a note.

## 9. ADR Protocol

Create an ADR when a decision:

- changes a system boundary;
- introduces a framework, provider, database, or major dependency;
- changes authentication or authorization strategy;
- changes persistence or public API contracts;
- creates migration or compatibility obligations;
- affects multiple features;
- is expensive to reverse.

Do not delete accepted ADRs. Supersede them with a new ADR.

## 10. Definition of Done

A task is complete only when:

- referenced requirements are satisfied;
- implementation follows approved design;
- relevant checks pass;
- error paths are handled;
- security boundaries remain intact;
- no unrelated changes exist;
- task status is updated;
- verification evidence is recorded;
- handoff is current.

A feature is complete only when every acceptance criterion has evidence and the human owner accepts the result.

## 11. Documentation Rules

Documentation must explain intent, contracts, constraints, decisions, evidence, or operations.

Do not:

- copy entire source files into documentation;
- document every function or component;
- store raw chat history;
- duplicate the same status in multiple files;
- present plans as implemented facts;
- present assumptions as confirmed facts.

Prefer links to canonical files over copied content.

## 12. Security Rules

1. Never commit secrets, tokens, private keys, service-role keys, or production credentials.
2. Do not use real personal data in examples or fixtures.
3. Destructive commands require explicit approval.
4. Database changes must use reviewable migrations.
5. Production configuration must not change as a side effect of local development.

## 13. Agent Completion Report

Use this structure after implementation:

```markdown
## Completed
- Task:
- Requirement references:
- Result:

## Changed Files
- `path`: reason

## Verification
- Command:
- Result:

## Documentation Updated
- Files:

## Remaining Risks
- None / details

## Next Recommended Task
- Task ID and reason
```
