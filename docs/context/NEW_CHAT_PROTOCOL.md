# New Chat Protocol

Use this protocol whenever an AI coding session starts without reliable conversational memory.

## Before opening the agent

Run:

```bash
git branch --show-current
git status --short
git log -5 --oneline
npm run context:validate
```

Select exactly one primary task, for example:

```text
F-004 / TASK-006 — Add reading-insight repository contract
```

Do not start with a vague instruction such as "continue the project".

## Context loading order

```text
Permanent repository instructions
  -> durable project state
  -> temporary session handoff
  -> active requirements
  -> approved design
  -> active tasks
  -> relevant ADRs
  -> relevant implementation and tests
```

## Reusable opening prompt

```text
You are continuing work on this repository. Do not begin implementation immediately.

Read the following context in order:

1. AGENTS.md
2. docs/context/CONTEXT_INDEX.md
3. docs/context/PROJECT_STATE.md
4. docs/handoff/current.md
5. docs/specs/{{ACTIVE_FEATURE}}/requirements.md
6. docs/specs/{{ACTIVE_FEATURE}}/design.md
7. docs/specs/{{ACTIVE_FEATURE}}/tasks.md
8. docs/specs/{{ACTIVE_FEATURE}}/verification.md
9. ADRs referenced by the active design
10. Git status, current branch, recent commits, and files related to {{TASK_ID}}

The target for this session is:

{{TASK_ID}} — {{TASK_TITLE}}

Before editing, return these sections:

1. Current Objective
   - selected task and requirement references;
2. Verified Project State
   - branch, worktree, active feature and task;
   - whether the handoff matches the repository;
   - stale or conflicting context;
3. Constraints
   - architecture rules, scope exclusions, protected behavior;
   - decisions requiring human approval;
4. Expected Change Surface
   - likely code, test, migration, and documentation files;
5. Execution Plan
   - ordered steps, verification commands, and main risks.

Do not silently resolve conflicts between code, requirements, design, ADRs, project state, or handoff.

After confirmation, implement only the selected task unless a blocking conflict is found.

At the end:

- run required checks;
- review the diff;
- update tasks.md;
- update verification.md;
- update docs/handoff/current.md;
- report changed files, evidence, residual risk, and the exact next task.
```

## Session close prompt

```text
Before ending this session:

1. Inspect git diff and git status.
2. Mark only work that is actually complete.
3. Record reproducible evidence in verification.md.
4. Update docs/handoff/current.md to match the worktree.
5. Do not mark the feature complete without full acceptance evidence.
6. State one exact next action for the next session.
```

## Session size guidance

A session should normally contain one implementation objective. Multiple tasks may share one session only when they are small, sequential, use the same context, and require no new product or architecture decision.
