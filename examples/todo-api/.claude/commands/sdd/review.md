---
description: Review a diff against the code-review template; read-only
argument-hint: "[git-ref]"
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git status:*)
---

Reference: `$1`, default `HEAD` (working tree against the last commit).

1. Run `git diff $1 --stat` and `git diff $1`. Stop if the diff is empty.
2. Map the changed files to a feature under `docs/specs/` and its task in `tasks.md`; read the FR and AC ids that task references. When no task owns the change, say so under Scope discipline.
3. Fill every section of `docs/_templates/code-review.md` from the diff: Summary, Correctness, Architecture, Security and data, Testing and verification, Maintainability, Scope discipline, Findings (`CR-001` ...; each with severity, `path:line`, problem, impact, recommendation), Unverified, Recommendation.
4. Check generated and frozen paths from `sdd.config.json`: an edit to one is a blocker finding.
5. Print the filled review in the conversation. Write nothing to disk.

Read-only: no edits, no git commands beyond diff, log, and status.
