---
status: draft
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
last_verified_commit: unverified
branch: "{{DEFAULT_BRANCH}}"
---

# Project State

## Product

- Project: {{PROJECT_NAME}}
- Lifecycle stage: {{DISCOVERY | MVP | BETA | PRODUCTION}}
- Current release or milestone: {{MILESTONE}}
- Production status: {{NOT_DEPLOYED | STABLE | DEGRADED | INCIDENT}}
- Canonical PRD: `../product/prd.md`

## Active Work

- Active sprint: {{SPRINT_OR_NONE}}
- Sprint goal: {{ONE_SENTENCE_GOAL}}
- Active feature: {{FEATURE_ID_AND_NAME_OR_NONE}}
- Active spec: `{{RELATIVE_PATH_OR_NONE}}`
- Current task: {{TASK_ID_OR_NONE}}
- Current branch: `{{BRANCH}}`

## Feature Status Summary

| Feature | Status | Next gate |
|---|---|---|
| F-001 | Draft | Requirements review |

The canonical registry is `../specs/_index.md`.

## Architecture Baseline

- Client: {{CLIENT_STACK}}
- Backend: {{BACKEND_STACK}}
- Database: {{DATABASE}}
- Authentication: {{AUTH_PROVIDER}}
- Deployment: {{DEPLOYMENT}}
- State management: {{STATE_MANAGEMENT}}

Architecture details belong under `../architecture/`.

## Current Constraints

- {{CONSTRAINT}}
- {{CONSTRAINT}}

## High-Priority Issues

| ID | Issue | Severity | Owner | Status |
|---|---|---|---|---|
| ISSUE-001 | {{DESCRIPTION_OR_NONE}} | P1 | {{OWNER}} | Open |

## Blocking Decisions

| Decision | Required by | Owner | Reference |
|---|---|---|---|
| {{DECISION_OR_NONE}} | {{TASK_OR_DATE}} | {{OWNER}} | {{LINK}} |

## Recent Accepted Decisions

- `../adr/{{ADR_FILE_OR_NONE}}`: {{SUMMARY}}

## Next Project-Level Milestone

{{Describe one measurable milestone. Do not duplicate task details.}}

## State Verification

- Commit: {{COMMIT_HASH}}
- Branch: {{BRANCH}}
- Date: {{DATE}}

When repository state differs materially from this snapshot, verify the active specification, Git history, and handoff before relying on it.
