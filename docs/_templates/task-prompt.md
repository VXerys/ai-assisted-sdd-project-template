---
id: TP-XXX
title: ""
type: task-prompt
status: draft        # draft | review | approved | implementing | verification | implemented | superseded
tier: lite           # lite | full
owner: ""
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
last_verified: YYYY-MM-DD
supersedes: null
---

# Task prompt: {{TASK_ID}} {{TASK_TITLE}}

A minimum-sufficient context package for a repository-integrated coding agent. Point at paths and ids; do not paste documents the agent can read.

## Objective

One outcome-oriented sentence. Success means: one checkable condition.

## Read first, in this order

1. `docs/context/BRIEF.md`
2. `docs/steering/rules.md` and `docs/steering/tech.md`
3. `docs/specs/{{FEATURE_DIR}}/requirements.md`, FR and AC ids: {{IDS}}
4. `docs/specs/{{FEATURE_DIR}}/system-architecture.md`, sections: {{SECTIONS_OR_NONE}}
5. `docs/specs/{{FEATURE_DIR}}/design.md`, sections: {{SECTIONS}}
6. `docs/specs/{{FEATURE_DIR}}/tasks.md`, task {{TASK_ID}}
7. Relevant ADRs: {{ADR_IDS_OR_NONE}}
8. The actual code, tests, and schema the task touches.

Load nothing else unless a concrete uncertainty requires it.

## Source of truth

Requirements own behavior; system architecture owns module decisions; design owns the repository mapping; code, tests, and schema own current behavior; `docs/steering/tech.md` owns commands. When sources conflict, stop and report; do not pick the easiest one.

## Known facts and unknowns

- Fact, grounded in the repository or a spec.
- Unknown to inspect, not assume. Record it in `docs/context/ASSUMPTIONS.md` if it stays unresolved.

## Task

Required behavior, numbered, including the error or edge behavior. Architecture constraints this task must preserve.

## Scope

- In scope: areas or components.
- Expected affected paths, to confirm against the repository: {{PATHS}}
- Out of scope: excluded work. Discovered required work is reported as a dependency, never absorbed.

## Constraints and stop conditions

Preserve public contracts, schema, and existing behavior unless the referenced spec changes them. No unrelated refactor. No dependency without approval. No weakened tests. No destructive git, data, or production operation.

Stop and report before implementing if the task requires an unapproved requirement change, contract break, destructive data change, boundary change, storage or consistency or communication decision, security policy change, dependency replacement, or production configuration change.

## Acceptance criteria

- AC ids from `requirements.md`: {{AC_IDS}}
- Referenced architecture constraints preserved.
- No unrelated behavior change.

## Verification

Run the real commands from `docs/steering/tech.md`. Record results as EV blocks in `verification.md`. A check that cannot run is reported with the reason and residual risk, never claimed.

## Output

Result; changed files with reasons; acceptance criteria with evidence ids; architecture conformance; commands run and results; docs updated; limitations; follow-up tasks (reported, not implemented).
