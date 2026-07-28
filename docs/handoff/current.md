---
status: inactive
owner: "{{SESSION_OWNER}}"
session_date: "{{YYYY-MM-DD}}"
branch: "{{BRANCH}}"
base_commit: "{{COMMIT_BEFORE_SESSION}}"
current_commit: "{{CURRENT_COMMIT_OR_UNCOMMITTED}}"
active_feature: "{{FEATURE_ID}}"
active_task: "{{TASK_ID}}"
expires_after: "{{YYYY-MM-DD}}"
---

# Session Handoff

This file stores the current coding session delta. It does not replace product docs, architecture, ADRs, feature specs, or `docs/context/state.yaml`.

The repository-integrated coding agent updates this file before ending implementation work.

## Session objective

{{ONE_CONCRETE_OBJECTIVE}}

## Context used

- `AGENTS.md`
- `docs/context/PROJECT_STATE.md`
- `docs/context/state.yaml`
- `docs/specs/{{FEATURE_PATH}}/requirements.md`
- `docs/specs/{{FEATURE_PATH}}/design.md`
- `docs/specs/{{FEATURE_PATH}}/tasks.md`
- `docs/adr/{{RELEVANT_ADR_OR_NONE}}`

## Completed

- {{COMPLETED_ITEM}}

## Requirement coverage

- {{REQUIREMENT_OR_ACCEPTANCE_ID}}: {{STATUS_AND_EVIDENCE}}

## Changed files

| File | Change | State |
|---|---|---|
| `{{PATH}}` | {{DESCRIPTION}} | Complete/Partial |

## Commands executed

### Command

```bash
{{COMMAND}}
```

Result:

```text
{{RESULT_SUMMARY}}
```

## Current implementation state

{{OBSERVABLE_FACTS_ABOUT_WHAT_WORKS_AND_WHAT_IS_PARTIAL}}

## Uncommitted work

- {{UNCOMMITTED_CHANGE_OR_NONE}}

Expected Git status:

```text
{{GIT_STATUS_SUMMARY}}
```

## Blockers

- {{BLOCKER_OR_NONE}}

For each blocker, include cause, affected task, required decision/dependency, and safe next action.

## Decisions made during session

- {{DECISION_OR_NONE}}

Permanent architecture decisions must be recorded as ADRs. Product decisions must update the approved specification. This handoff is not the permanent decision record.

## Context updates

- `state.yaml` updated: {{YES_OR_NO}}
- generated views refreshed: {{YES_OR_NO}}
- verification updated: {{YES_OR_NO}}
- specification or ADR changed: {{YES_OR_NO}}

## Exact next step

```text
{{ONE_EXACT_NEXT_ACTION}}
```

Expected files:

- `{{PATH}}`

Required verification:

```bash
{{COMMAND}}
```

## Do not do next

- Do not {{OUT_OF_SCOPE_ACTION}}.
- Do not modify {{PROTECTED_AREA}}.
- Do not mark {{TASK_OR_FEATURE}} complete before {{REQUIRED_CHECK}}.

## Validity

This handoff is valid only for the recorded branch, commit/worktree, feature, and task. Revalidate it when any of them changes.
