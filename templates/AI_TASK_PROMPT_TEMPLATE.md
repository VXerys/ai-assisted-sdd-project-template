# AI Coding Agent Task Prompt Template

> Use this template to prepare a **minimum sufficient context package** for a repository-integrated coding agent. Delete irrelevant sections. Do not paste entire documents when a precise path/section is enough and the agent can read the repository.

## ROLE

You are acting as `{{ROLE, e.g. repository-integrated senior software engineer}}` in `{{PROJECT_NAME}}`.

Operate as an engineering collaborator inside the repository's approved specifications, architecture, security rules, and Definition of Done. Do not treat generic framework preferences as more authoritative than repository conventions.

## OBJECTIVE

`{{One precise, outcome-oriented objective.}}`

Success means: `{{ONE_SENTENCE_SUCCESS_CONDITION}}`.

## RELEVANT CONTEXT

Read only the context relevant to this task, in this order unless repository instructions say otherwise:

1. `{{ROOT_AGENTS_PATH}}`
2. `{{NESTED_AGENT_INSTRUCTION_OR_NONE}}`
3. `{{FEATURE_REQUIREMENTS_PATH + EXACT IDs/SECTIONS}}`
4. `{{FEATURE_DESIGN_PATH + EXACT SECTIONS_OR_NONE}}`
5. `{{TASK_PATH / TASK ID}}`
6. `{{RELEVANT_ADR_OR_ARCHITECTURE_PATHS_ONLY}}`
7. inspect the actual relevant code/tests/schema before editing.

Do **not** load unrelated completed features, the full backlog, all ADRs, or raw chat history unless a concrete uncertainty requires them.

## SOURCE OF TRUTH

For this task:

- Intended behavior: `{{REQUIREMENTS_SOURCE}}`
- Technical approach / constraints: `{{DESIGN_OR_ARCHITECTURE_SOURCE}}`
- API/data contract: `{{CONTRACT_SOURCE_OR_NA}}`
- Current implementation: repository code/tests/schema/migrations/configuration
- Verification commands: `{{AGENTS_OR_BUILD_CONFIG_SOURCE}}`

If these sources conflict, stop the affected work and report the conflict. Do not silently choose the easiest source to implement.

## CURRENT STATE

Known current facts:

- `{{FACT_GROUNDED_IN_REPOSITORY_OR_SPEC}}`
- `{{FACT}}`

Unknowns that must be inspected rather than assumed:

- `{{UNKNOWN}}`

Do not fabricate file paths, APIs, schema fields, commands, package behavior, or existing abstractions.

## TASK

Implement `{{TASK_ID_AND_TITLE}}`.

Required behavior:

1. `{{BEHAVIOR}}`
2. `{{BEHAVIOR}}`
3. `{{ERROR/EDGE_BEHAVIOR}}`

## SCOPE

### In Scope

- `{{AREA_OR_COMPONENT}}`
- `{{AREA_OR_COMPONENT}}`

### Expected Affected Areas

These are expectations, not permission to invent files. Confirm against the repository:

- `{{PATH_OR_COMPONENT_IF_KNOWN}}`
- `{{PATH_OR_COMPONENT_IF_KNOWN}}`

### Out of Scope

- `{{EXCLUDED_WORK}}`
- `{{EXCLUDED_WORK}}`

If you discover out-of-scope work that is genuinely required, stop or report it as a dependency instead of silently expanding the implementation.

## CONSTRAINTS

- Preserve `{{PUBLIC_API / SCHEMA / BEHAVIOR}}`.
- Follow `{{ARCHITECTURE_BOUNDARY_OR_PATTERN}}`.
- Do not add a dependency unless `{{APPROVAL_RULE}}`.
- Do not perform unrelated refactoring.
- Do not weaken/disable tests to pass verification.
- Do not perform destructive Git/database/production operations.
- `{{SECURITY_OR_COMPATIBILITY_CONSTRAINT}}`
- `{{OTHER_TASK_CONSTRAINT}}`

### Stop Conditions

Stop and report before implementation if the task requires:

- unapproved requirement change;
- public API break;
- database destructive migration;
- architecture boundary change;
- security/authorization policy change;
- major dependency replacement;
- production infrastructure/credential change;
- other high-impact decision not already approved.

## IMPLEMENTATION EXPECTATION

Before editing:

1. inspect relevant code and tests;
2. identify the existing pattern;
3. confirm the smallest safe change;
4. note any source conflict or blocking ambiguity.

During editing:

- make the minimum complete change;
- reuse existing patterns;
- keep behavior changes explicit;
- add/update tests for the changed contract;
- keep unrelated files untouched.

## ACCEPTANCE CRITERIA

- [ ] `{{AC_OR_TASK_CRITERION}}`
- [ ] `{{AC_OR_TASK_CRITERION}}`
- [ ] `{{ERROR/SECURITY/EDGE_CRITERION}}`
- [ ] No unrelated behavior changes.

Reference requirement IDs where available: `{{AC_IDS}}`.

## VERIFICATION

Run the project's real applicable checks.

### Required

```bash
{{STATIC_OR_LINT_COMMAND}}
{{TARGETED_TEST_COMMAND}}
{{BUILD_OR_COMPILE_COMMAND_IF_APPLICABLE}}
```

### Runtime / Manual

`{{SCENARIO_OR_NA}}`

### Regression

`{{NEIGHBORING_FLOW_OR_NA}}`

If a required check cannot run, do not claim success. Report:

- the exact unrun check;
- why it could not run;
- any alternative evidence;
- residual risk.

## OUTPUT

Return a concise completion report with:

1. **Result** — what changed and whether the task is complete.
2. **Changed Files/Areas** — each path/component and reason.
3. **Acceptance Criteria** — satisfied/not satisfied/not verified with evidence.
4. **Verification** — exact commands/procedures and results.
5. **Documentation** — docs updated, or why none were needed.
6. **Limitations / Residual Risk** — explicit unresolved items.
7. **Follow-Up** — only necessary discovered work; do not expand current scope automatically.

## CONTEXT EFFICIENCY RULE

Do not request or ingest additional context unless it resolves a concrete uncertainty. Prefer targeted repository inspection and authoritative paths over copying large histories into the prompt.
