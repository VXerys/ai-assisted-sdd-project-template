---
description: Compare the code with a feature's acceptance criteria and append a task for every gap
argument-hint: "[F-id]"
allowed-tools: Read, Grep, Glob, Edit, Bash
disable-model-invocation: true
---

Feature: `$1`, default the feature with an `in_progress` or `review` task in `docs/context/BRIEF.md`. Stop if none.

1. Read the feature's `requirements.md` (every FR and AC, `targets`, `[test: ...]` links), `tasks.md`, `verification.md`, and `design.md`. Read the code under `targets` and under each task's `scope`.
2. For every AC decide one verdict, with a file and line as evidence:
   - `met`: code implements it and a test or an EV block proves it.
   - `partial`: implemented without proof, or proved for only part of the criterion.
   - `missing`: no code path implements it.
   - `contradicts`: code does something the criterion rules out.
   Also list `unrequested` behavior: code under `targets` that no AC asks for. Report it; never turn it into a task.
3. Run the test command from `docs/steering/tech.md` only when a verdict depends on it, and quote the result.
4. Every AC `met`: change nothing, report "converged" with the table. `tasks.md` stays byte-identical.
5. Otherwise append to `tasks.md` a section `## Convergence YYYY-MM-DD` and one task block per gap, numbered after the highest existing T-id:
   - `status: planned`, `requirements:` the FR of the AC, `depends_on: []`, `evidence: []`.
   - Body: the verdict, the AC id, the evidence (file:line), and what done means for this gap.
   Never edit, renumber, or change the status of an existing task, and never mark anything done.
6. Run `npm run context:render`, then `npm run context:validate`.
7. Report the verdict table (AC, verdict, evidence), the new T-ids, and the unrequested behavior.
