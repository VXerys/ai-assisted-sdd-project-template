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
- project architecture alternatives;
- module system architecture alternatives and trade-off analysis;
- feature requirements and implementation design;
- task decomposition;
- ADR proposals;
- documentation modularization.

Its output is a proposal until reviewed and committed. It must not claim current repository facts without repository access.

### Repository-integrated coding agent

Codex, Claude Code, or equivalent may:

- inspect the actual repository;
- validate planned artifacts and architecture assumptions against code, schemas, configuration, and platform capabilities;
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
6. active feature system architecture when present/required
7. active feature implementation design
8. active feature tasks
9. relevant ADRs
10. relevant code and tests

Read `docs/context/PROGRESS.md` only when the compact view is insufficient.

Do not load the full `system-architecture.md` for every tiny task. The task should carry the minimum necessary architecture constraints. Read the full artifact when the task touches data ownership, consistency, communication, caching, scale, security, failure handling, external services, or another architectural boundary.

## 4. Canonical sources

| Question | Canonical source |
|---|---|
| Product purpose and scope | `docs/product/` |
| Shared architecture | `docs/architecture/` |
| Architecture rationale | `docs/adr/` |
| Approved feature behavior | `docs/specs/<feature>/requirements.md` |
| Approved module system architecture | `docs/specs/<feature>/system-architecture.md` |
| Approved repository implementation approach | `docs/specs/<feature>/design.md` |
| Feature work definition | `docs/specs/<feature>/tasks.md` |
| Acceptance and architecture evidence | `docs/specs/<feature>/verification.md` |
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
- keep module system architecture in `docs/specs/<feature>/system-architecture.md`;
- keep repository-specific implementation design in `docs/specs/<feature>/design.md`;
- promote a module-local architecture rule into `docs/architecture/` only after it becomes an approved shared invariant;
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
7. A Level 2/3 module with meaningful system concerns must have an approved `system-architecture.md` before dependent implementation tasks begin.
8. A Level 1 change may omit module architecture when it does not create/change a module-level architectural decision; record the reason instead of creating an empty document.
9. System architecture starts from requirements and quality attributes, not from a preferred technology. Do not introduce caching, sharding, queues, microservices, CDN/edge, circuit breakers, or other distributed mechanisms without a requirement/workload justification.
10. Significant module architecture choices compare credible alternatives and record pros, cons, accepted trade-offs, risks, and review triggers.

Project-specific boundaries:

- `{{BOUNDARY_RULE_1}}`
- `{{BOUNDARY_RULE_2}}`
- `{{BOUNDARY_RULE_3}}`

Module architecture process:

- `docs/architecture/MODULE_ARCHITECTURE_GUIDE.md`
- `docs/specs/_templates/system-architecture.template.md`

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
2. read referenced requirements;
3. read the relevant module system-architecture constraints when the task touches architectural concerns;
4. read the implementation design;
5. sync and validate context;
6. confirm handoff against branch and worktree;
7. inspect implementation and tests;
8. report objective, constraints, expected files, risks, and commands.

During implementation:

1. stay within the task;
2. preserve unrelated behavior;
3. preserve approved module architecture and global architecture boundaries;
4. add tests with behavior changes;
5. avoid opportunistic refactors;
6. stop when an unapproved product, public/data contract, security, or architecture decision appears.

After implementation:

1. run checks;
2. review diff;
3. record requirement evidence and any architecture-sensitive evidence;
4. update task status through the context system;
5. regenerate and validate context;
6. update handoff;
7. report changed files, risks, and exact next task.

## 10. Specification and architecture change protocol

Approved specifications are contracts.

When implementation reveals a problem:

1. stop affected work;
2. state the current requirement, module architecture/design decision, and discovered issue;
3. propose the smallest change;
4. list architecture, design, task, test, migration, compatibility, security, and operational impact as applicable;
5. block affected tasks;
6. obtain required human approval;
7. update the canonical artifact before implementation resumes.

If a module-local decision becomes a shared invariant, evaluate promotion into `docs/architecture/` and create/supersede an ADR when the choice is significant.

## 11. ADR protocol

Create an ADR for cross-feature or expensive-to-reverse decisions. One decision equals one file.

Do not delete accepted ADRs. Supersede them with a new ADR.

A module architecture may reference an ADR but must not copy the ADR's full decision history.

## 12. Definition of Done

A task is complete when:

- requirement references are satisfied;
- approved module architecture constraints are preserved when applicable;
- approved implementation design is followed;
- checks pass;
- errors and security boundaries are handled;
- no unrelated changes exist;
- execution state is updated;
- evidence is recorded;
- generated context is current;
- handoff is current.

A feature is complete when every acceptance criterion has evidence, relevant architecture claims have evidence proportional to risk, and the human accepts it.

## 13. Documentation prohibitions

Do not:

- store raw chat history;
- create one giant manual context file;
- duplicate status across artifacts;
- copy the same architecture decision into requirements, system architecture, design, and ADR;
- copy source code into docs without purpose;
- document every method;
- present plans as implemented facts;
- present assumptions as confirmed facts;
- hardcode one developer's absolute path in canonical tooling;
- make provider memory the only project record;
- add distributed-system mechanisms only because they are common in interview/system-design examples.

## 14. Security

1. Never commit secrets or real credentials.
2. Use synthetic fixture data.
3. Destructive commands require approval.
4. Database changes use versioned migrations.
5. Authorization remains enforced at a trusted boundary.
6. Production configuration does not change as a local-development side effect.
7. Module `system-architecture.md` identifies trust boundaries and authorization ownership when security is relevant.

## 15. Completion report

```markdown
## Completed
- Task:
- Requirements:
- Architecture constraints:
- Result:

## Changed Files
- `path`: reason

## Verification
- Command/procedure:
- Result:
- Architecture-sensitive evidence:

## Context
- State updated:
- Generated views refreshed:
- Handoff updated:

## Remaining Risks
- None / details

## Next Task
- Task ID and reason
```
