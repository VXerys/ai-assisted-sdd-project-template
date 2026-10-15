---
id: CONTEXT-NEW-CHAT
title: New Coding-Agent Session Protocol
status: template
owner: ""
last_updated: 2026-10-15
---

# New Coding-Agent Session Protocol

For Codex, Claude Code, Cursor, Gemini, Kiro, or any repository-integrated coding agent.

## Opening prompt

```text
Continue work in this repository. Do not implement yet.

1. Read docs/context/BRIEF.md. If it is absent or marked not rendered, follow the
   fallback read order in docs/context/CONTEXT_SYSTEM.md.
2. Read docs/steering/rules.md and docs/steering/tech.md.
3. Read docs/handoff/current.md and confirm branch and worktree match it.
4. Open the active feature's tasks.md and select the task the brief names, or the
   first planned task whose dependencies are done.
5. Read only the requirements, design, and system-architecture sections that task
   references, plus the code and tests it touches.
6. Read open entries in docs/context/ASSUMPTIONS.md.

Return: the task and its acceptance criteria; the constraints that apply; whether the
brief and handoff are still valid; any conflict between sources; the expected change
surface; the verification commands; a short plan.

Do not resolve conflicts silently. Do not replace approved architecture with a
preferred pattern. Log unknowns as A-XXX entries instead of guessing. Implement only
the selected task after this confirmation.
```

## Architecture-sensitive tasks

Read the relevant `system-architecture.md` sections directly when the task touches data ownership, storage, or indexing; consistency, ordering, transactions, or idempotency; realtime, async, events, queues, or external services; caching; scale or load; retries, recovery, or degradation; authentication, authorization, tenant isolation, personal data, or trust boundaries; observability or material cost. A local UI task carries its constraints in the task block and does not load the whole document.

## Session close

1. Review `git diff` and `git status`.
2. Run the commands in `docs/steering/tech.md`.
3. Record evidence as EV blocks in `verification.md`; attach the ids to the task.
4. Update task status in `tasks.md`; run `npm run context:render`, then `npm run context:validate`.
5. Update `docs/handoff/current.md` with the exact next step.
6. Report the next task.

A new architectural constraint discovered during implementation is recorded as a blocked task plus an assumption or ADR, never patched into code and carried on.

## When BRIEF.md is absent

Run `npm run context:render`. If the renderer is unavailable, use the fallback read order in `docs/context/CONTEXT_SYSTEM.md`. Do not create a second manual progress document.

## Planning chats

A conversational AI may draft requirements, architecture alternatives, design, or a decision. It is not the session-state mechanism. Its output is a proposal until committed to the repository and checked against repository reality by the coding agent.
