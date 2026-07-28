---
status: inactive
owner: "{{SESSION_OWNER}}"
session_date: "{{YYYY-MM-DD}}"
branch: "{{BRANCH}}"
base_commit: "{{COMMIT_BEFORE_SESSION}}"
current_commit: "{{CURRENT_COMMIT_OR_UNCOMMITTED}}"
active_feature: "{{FEATURE_ID_OR_NONE}}"
active_task: "{{TASK_ID_OR_NONE}}"
expires_after: "{{YYYY-MM-DD}}"
---

# Session Handoff

This file records temporary session state. It is not a permanent requirement, decision, or project-history document.

## Session Objective

{{ONE_SESSION_OBJECTIVE_OR_NONE}}

## Context Used

- `../../AGENTS.md`
- `../context/PROJECT_STATE.md`
- `../specs/{{ACTIVE_FEATURE}}/requirements.md`
- `../specs/{{ACTIVE_FEATURE}}/design.md`
- `../specs/{{ACTIVE_FEATURE}}/tasks.md`
- relevant ADRs

## Completed

- {{COMPLETED_ITEM_OR_NONE}}

## Requirement Coverage

- {{REQUIREMENT_ID}}: {{HOW_ADDRESSED}}

## Changed Files

| File | Change | Status |
|---|---|---|
| `{{PATH}}` | {{DESCRIPTION}} | Complete / Partial |

## Commands Executed

```bash
{{COMMAND_OR_NONE}}
```

Result:

```text
{{RESULT_SUMMARY}}
```

## Current Implementation State

{{Describe observable working and incomplete behavior.}}

## Worktree State

```text
{{GIT_STATUS_SUMMARY}}
```

## Blockers

- {{BLOCKER_OR_NONE}}

For each blocker, record cause, affected task, required decision, and safe next action.

## Decisions Made During Session

- {{DECISION_OR_NONE}}

Permanent architecture decisions must also be recorded as ADRs.

## Specification Impact

- Requirements changed: {{YES_OR_NO}}
- Design changed: {{YES_OR_NO}}
- Tasks changed: {{YES_OR_NO}}
- Verification changed: {{YES_OR_NO}}

## Exact Next Step

```text
{{ONE_EXACT_NEXT_ACTION}}
```

Expected files:

- `{{PATH}}`

Required verification:

```bash
{{COMMAND}}
```

## Do Not Do Next

- Do not {{OUT_OF_SCOPE_ACTION}}.
- Do not mark {{TASK_OR_FEATURE}} complete before {{REQUIRED_CHECK}}.

## Validity

This handoff is valid only for the recorded branch, worktree, active feature, and task. Revalidate it after a merge, branch change, specification change, or expiration date.
