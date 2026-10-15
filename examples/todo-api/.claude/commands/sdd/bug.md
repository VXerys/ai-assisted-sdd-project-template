---
description: Open a bug investigation file from the template with the next free BUG id
argument-hint: <title>
allowed-tools: Read, Grep, Glob, Write, Bash(git rev-parse:*), Bash(git log:*)
---

Title: `$ARGUMENTS`. Stop if empty.

1. List `docs/quality/bugs/BUG-*.md`; the next id is the highest number plus one, `BUG-001` when the folder is empty or absent.
2. Slug: the title in lowercase, non-alphanumerics collapsed to `-`, at most 40 characters.
3. Create `docs/quality/bugs/BUG-XXX-<slug>.md` from `docs/_templates/bug-investigation.md`. Fill `id`, `title`, `owner` (from git config or `""`), `created`, `last_updated`, `last_verified` with today's date, `status: draft`, and the commit under Environment from `git rev-parse --short HEAD`.
4. Fill Symptom with only what was observed in this conversation. Leave Hypotheses, Root cause, and Fix empty: evidence before fixes.
5. Report the path and the next step: reproduce, then record evidence.

Never write a fix in this command.
