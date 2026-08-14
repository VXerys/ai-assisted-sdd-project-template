# Repository Operating Contract — `{{PROJECT_NAME}}`

> Replace all placeholders with verified repository facts before treating this file as authoritative. Remove sections that do not apply. Keep this file concise and link to detailed documentation instead of duplicating it.

## 1. Project Identity

`{{PROJECT_NAME}}` is a `{{APPLICATION_OR_SYSTEM_TYPE}}` for `{{TARGET_USERS_OR_SYSTEMS}}` that `{{PRIMARY_OUTCOME}}`.

- Lifecycle stage: `{{DISCOVERY | MVP | BETA | PRODUCTION | OTHER}}`
- Primary repository purpose: `{{PURPOSE}}`
- Production sensitivity: `{{LOW | MEDIUM | HIGH}}`
- Primary owner/team: `{{OWNER_OR_TEAM}}`

## 2. Source of Truth

Use these sources in priority according to the question being answered:

| Question | Canonical source |
|---|---|
| Product goals/scope | `{{PATH_TO_PRD_OR_PRODUCT_DOCS}}` |
| Engineering governance | `{{PATH_TO_CONSTITUTION}}` |
| Shared architecture | `{{PATH_TO_ARCHITECTURE}}` |
| Significant technical decisions | `{{PATH_TO_ADRS}}` |
| Feature behavior | `{{PATH_TO_FEATURE_REQUIREMENTS}}` |
| Feature implementation design | `{{PATH_TO_FEATURE_DESIGNS}}` |
| API/data contracts | `{{PATH_TO_CONTRACT_DOCS_OR_SCHEMA}}` |
| Database schema/migrations | `{{PATH_TO_SCHEMA_AND_MIGRATIONS}}` |
| Current implemented behavior | code, tests, schemas, migrations, configuration |
| Execution/task state | `{{ISSUE_TRACKER_OR_TASK_PATH}}` |
| Operations/runbooks | `{{PATH_TO_OPERATIONS}}` |

### Conflict Rule

If authoritative documentation and implementation disagree:

1. stop the affected work;
2. identify the exact conflicting sources;
3. determine which artifact owns the question;
4. inspect code/tests/schema/Git evidence;
5. do not silently rewrite requirements or architecture to match convenient implementation;
6. obtain required approval for product/architecture/security/data changes;
7. update the canonical source before continuing affected work.

Conversation history and provider memory are never the sole source of truth.

## 3. Technology Stack

- Language/runtime: `{{LANGUAGE_RUNTIME}}`
- Client/application framework: `{{FRAMEWORK}}`
- Backend/API: `{{BACKEND}}`
- Database/persistence: `{{DATABASE}}`
- Auth: `{{AUTH}}`
- State management: `{{STATE_MANAGEMENT}}`
- Package/build tooling: `{{TOOLING}}`
- Testing: `{{TEST_FRAMEWORKS}}`
- Deployment/runtime: `{{DEPLOYMENT_TARGET}}`

Do not add or replace major dependencies without following the dependency policy and obtaining approval where required.

## 4. Architecture

### System Shape

`{{ONE_PARAGRAPH_ARCHITECTURE_SUMMARY}}`

### Primary Components / Modules

| Component | Responsibility | May depend on | Must not depend on |
|---|---|---|---|
| `{{COMPONENT_A}}` | `{{RESPONSIBILITY}}` | `{{ALLOWED}}` | `{{PROHIBITED}}` |
| `{{COMPONENT_B}}` | `{{RESPONSIBILITY}}` | `{{ALLOWED}}` | `{{PROHIBITED}}` |

### Dependency Direction

```text
{{DEPENDENCY_DIRECTION_DIAGRAM}}
```

### Permanent Architecture Rules

1. `{{ARCH_RULE_1}}`
2. `{{ARCH_RULE_2}}`
3. `{{ARCH_RULE_3}}`

Detailed architecture: `{{ARCHITECTURE_REFERENCE}}`.

## 5. Directory Responsibilities

Document only non-obvious or important repository responsibilities.

| Path | Responsibility | Rules |
|---|---|---|
| `{{PATH}}` | `{{RESPONSIBILITY}}` | `{{IMPORTANT_RULE}}` |
| `{{PATH}}` | `{{RESPONSIBILITY}}` | `{{IMPORTANT_RULE}}` |
| `{{GENERATED_PATH}}` | generated artifacts | do not edit manually |

### Directory Rules

- `{{RULE}}`
- `{{RULE}}`

## 6. Engineering Rules

### General

- Follow existing project patterns before introducing new abstractions.
- Keep changes scoped to the approved task.
- Do not perform unrelated refactors.
- Do not fabricate files, APIs, schema, commands, or framework behavior; inspect the repository.
- Preserve backward compatibility unless the approved specification explicitly changes it.
- Treat generated files according to their generator workflow.
- `{{PROJECT_SPECIFIC_RULE}}`

### Error Handling

- `{{ERROR_CONTRACT}}`
- Do not swallow errors merely to make flows appear successful.
- Preserve domain/API error semantics unless an approved change says otherwise.

### Dependency Policy

Before adding a dependency, document when applicable:

- problem it solves;
- existing/native alternatives;
- maintenance health;
- runtime/bundle impact;
- security/license impact;
- reason existing dependencies are insufficient.

Project rule: `{{DEPENDENCY_APPROVAL_RULE}}`.

## 7. State and Data Rules

- Primary state owners: `{{STATE_OWNERS}}`
- Server/persistent state source of truth: `{{SERVER_STATE_RULE}}`
- Cache invalidation/synchronization: `{{CACHE_RULE}}`
- Serialization/validation boundary: `{{VALIDATION_BOUNDARY}}`
- Concurrency/idempotency rule: `{{CONCURRENCY_RULE_OR_NA}}`
- `{{OTHER_DATA_RULE}}`

Do not introduce a second writable source of truth without explicit reconciliation rules.

## 8. API Rules

Remove this section if the project has no meaningful API boundary.

- API ownership: `{{API_OWNER}}`
- Request validation: `{{API_VALIDATION_RULE}}`
- Authentication: `{{API_AUTH_RULE}}`
- Authorization: `{{API_AUTHZ_RULE}}`
- Error contract: `{{API_ERROR_RULE}}`
- Versioning/backward compatibility: `{{API_COMPATIBILITY_RULE}}`
- Retry/timeout ownership: `{{RETRY_TIMEOUT_RULE}}`
- Generated clients/contracts: `{{CODEGEN_RULE_OR_NA}}`

Public or external contract changes require: `{{APPROVAL_RULE}}`.

## 9. Database Rules

Remove or simplify if not applicable.

- Schema source: `{{SCHEMA_SOURCE}}`
- Migration path: `{{MIGRATION_PATH}}`
- Migration command: `{{MIGRATION_COMMAND}}`
- Access boundary: `{{DB_ACCESS_RULE}}`
- Authorization/RLS/policy rule: `{{RLS_OR_AUTHZ_RULE}}`
- Transaction rule: `{{TRANSACTION_RULE}}`
- Seed/fixture rule: `{{SEED_RULE}}`

### Prohibited Data Operations Without Explicit Approval

- destructive production migration;
- dropping/removing production data structures;
- database reset on non-disposable environments;
- mass delete/backfill with unknown impact;
- bypassing authorization policies;
- editing already-applied migrations when unsafe for project tooling.

## 10. Security Rules

- Never commit secrets or real credentials.
- Use least privilege for service credentials.
- Enforce authorization at a trusted boundary; UI hiding is not authorization.
- Validate untrusted input.
- Do not log secrets, auth headers, tokens, or unnecessary PII.
- Security-sensitive changes require explicit verification.
- Project-specific security constraints: `{{SECURITY_RULES}}`.

Detailed security architecture: `{{SECURITY_REFERENCE}}`.

## 11. Project Commands

Use actual commands. If a command is unavailable in the current environment, report that fact rather than inventing success.

### Install / Bootstrap

```bash
{{INSTALL_COMMAND}}
```

### Development

```bash
{{DEV_COMMAND}}
```

### Format

```bash
{{FORMAT_COMMAND}}
```

### Lint / Static Analysis

```bash
{{LINT_COMMAND}}
```

### Type Check

```bash
{{TYPECHECK_COMMAND_OR_NA}}
```

### Unit Tests

```bash
{{UNIT_TEST_COMMAND}}
```

### Integration / Component / E2E Tests

```bash
{{INTEGRATION_TEST_COMMAND_OR_NA}}
```

### Build / Compile

```bash
{{BUILD_COMMAND}}
```

### Database / Migration Checks

```bash
{{DATABASE_CHECK_COMMAND_OR_NA}}
```

## 12. Task Execution Protocol

### Before Coding

1. Read this file and applicable nested instructions.
2. Read the exact task and relevant requirements/design.
3. Inspect relevant code, tests, schema, and call sites.
4. Confirm the objective, scope, constraints, and verification.
5. Identify blocking ambiguity or source conflicts.
6. Create a concise plan for non-trivial work.

### During Coding

1. Make the smallest complete change.
2. Follow existing architecture and patterns.
3. Do not introduce unrelated refactors/features.
4. Add/update tests for changed behavior.
5. Stop if a new product/architecture/security/data decision is required.

### After Coding

1. Inspect the complete diff.
2. Run applicable verification.
3. Map acceptance criteria to evidence.
4. Report unrun checks and residual risk.
5. Update durable docs only when truth changed.
6. Perform context refresh when a significant shared truth changed.

## 13. Git Rules

- Keep commits/PRs coherent and scoped.
- Inspect diffs before commit/merge.
- Do not commit secrets, generated junk, debug artifacts, or unrelated changes.
- `{{COMMIT_OR_BRANCH_POLICY}}`
- `{{PR_POLICY}}`

### Destructive Git Operations

Do not perform force push, history rewrite, `reset --hard` that can destroy work, or mass deletion without explicit approval.

## 14. Prohibited Actions

Without the required explicit approval, do not:

- change public API/data contracts;
- perform destructive schema/data operations;
- replace major framework/provider/dependency;
- make a breaking architecture change;
- change production infrastructure or credentials;
- bypass authentication/authorization;
- disable tests to make CI pass;
- modify unrelated code for cleanup;
- edit generated files manually when a generator owns them;
- rewrite Git history.

Project-specific prohibitions:

- `{{PROHIBITION_1}}`
- `{{PROHIBITION_2}}`

## 15. Definition of Done

A task is complete when applicable:

- requirements/acceptance criteria are satisfied;
- implementation follows approved architecture/design;
- required format/lint/typecheck/tests/build pass;
- runtime/regression verification is complete for changed risk;
- security/data constraints are satisfied;
- no unrelated changes remain;
- diff is reviewed;
- documentation is current when durable truth changed;
- known limitations/residual risk are recorded.

Project-specific additional gates:

- `{{DOD_GATE}}`

## 16. Important References

- Product: `{{PRODUCT_DOC}}`
- Constitution: `{{CONSTITUTION_DOC}}`
- Architecture: `{{ARCHITECTURE_DOC}}`
- Feature index: `{{FEATURE_INDEX}}`
- Decisions: `{{ADR_INDEX}}`
- Operations: `{{OPERATIONS_INDEX}}`
- Security: `{{SECURITY_DOC}}`

## 17. Maintenance Note

Update this contract only when a permanent, frequently relevant repository rule changes. Feature-local behavior, transient task status, debugging notes, and raw chat do not belong here.
