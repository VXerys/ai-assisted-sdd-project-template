---
description: Update docs/handoff/current.md from this session, then render and validate
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git rev-parse:*), Bash(npm run context:render:*), Bash(npm run context:validate:*)
---

1. Collect facts: `git status --short`, `git diff --stat`, branch, `HEAD`, the task statuses this session changed in `docs/specs/*/tasks.md`, the commands that ran and their results, open assumptions added to `docs/context/ASSUMPTIONS.md`.
2. Rewrite `docs/handoff/current.md`, keeping its frontmatter keys: `status: active`, `session_date` today, `branch`, `base_commit`, `current_commit`, `feature_id`, `task_id`, `expires_after` seven days out. Fill Session objective, Completed, Changed files, Commands executed, Uncommitted work, Blockers, Decisions made, Context updates, Exact next step (one action, expected files, verification command), Do not do next. Repository-relative paths only; no absolute paths, usernames, or secrets.
3. Run `npm run context:render`, then `npm run context:validate`.
4. Report: handoff path, validation result, the exact next step.

Do not change task statuses or specs here; the handoff records the session, it does not decide.
