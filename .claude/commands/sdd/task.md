---
description: Build the task prompt for one T-id from the brief and the spec, then implement it
argument-hint: <T-id>
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

Task id: `$1`. Empty means the task named in `docs/context/BRIEF.md`.

1. Read `docs/context/BRIEF.md`. Find the feature folder under `docs/specs/` whose `tasks.md` has a `### $1 —` block. Stop if none.
2. From that block read `status`, `requirements`, `depends_on`, `evidence`, `scope`, and the body. Stop and report if `depends_on` lists a task that is not `done`, or if `status` is `blocked` or `done`.
3. Read only the FR and AC ids the block references in `requirements.md`, the `design.md` sections it names, and (full tier) the `system-architecture.md` sections it names.
4. Fill `docs/_templates/task-prompt.md` in memory, not on disk: objective, read-first list with real paths and ids, known facts and unknowns, task behavior, scope, acceptance criteria, verification commands from `docs/steering/tech.md`. Print the filled prompt.
5. Set `- status: in_progress` in `tasks.md` (one task in progress per session), then implement by following the printed prompt.
6. Run the commands in `docs/steering/tech.md`. Record each result as an EV block in `verification.md`, add the id to the task's `evidence`, set the task to `review`, then run `npm run context:render` and `npm run context:validate`.

Stop and report instead of implementing when the task needs a prohibited action from `docs/steering/rules.md`, two sources conflict, a blocking assumption is `open` in `docs/context/ASSUMPTIONS.md`, or a required command is unavailable.
