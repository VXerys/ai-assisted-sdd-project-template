---
id: CONTEXT-NEW-CHAT
title: New Coding-Agent Session Protocol
status: template
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
---

# New Coding-Agent Session Protocol

This protocol is for Codex, Claude Code, or another repository-integrated coding agent.

## Opening prompt

```text
Continue work in this repository. Do not implement immediately.

1. Read AGENTS.md.
2. Run the repository context sync and validation commands when available.
3. Read docs/context/PROJECT_STATE.md.
4. Read docs/handoff/current.md.
5. Identify the active feature and task from docs/context/state.yaml.
6. Read that feature's requirements.
7. Read its system-architecture.md when present/required, prioritizing the sections relevant to the selected task.
8. Read its design.md, tasks.md, and relevant ADRs.
9. Inspect Git status, branch, recent commits, and relevant code/tests.

Return:
- current objective and requirement references;
- relevant module architecture constraints and trade-offs;
- whether generated context and handoff are still valid;
- repository conflicts or stale information;
- expected change surface;
- constraints and approval gates;
- verification commands;
- a small execution plan.

Do not resolve conflicts silently. Do not replace approved module architecture with a preferred generic pattern. Implement only the selected task after context confirmation.
```

## Architecture-sensitive task rule

Read the relevant module system architecture directly when the selected task touches any of these concerns:

- data ownership/storage/indexing/partitioning;
- consistency, ordering, transactions, or idempotency;
- realtime, asynchronous communication, events, queues, or external services;
- caching or invalidation;
- scale/capacity/load distribution;
- reliability, retries, circuit breaking, recovery, or degradation;
- authentication, authorization, tenant isolation, PII, or trust boundaries;
- observability or material operational cost.

For a small UI/local implementation task, prefer the minimum sufficient architecture context carried by the task/design instead of loading unrelated system-design sections.

## Session close

Before ending:

1. review `git diff` and `git status`;
2. run required checks;
3. record acceptance evidence and architecture-sensitive evidence when applicable;
4. update task status through the context system;
5. regenerate and validate context;
6. update `docs/handoff/current.md`;
7. report the exact next task.

If implementation exposed a new architectural constraint, do not silently update code and continue. Record the conflict and follow the specification/architecture change protocol.

## When context tooling is not implemented

The coding agent first completes the bootstrap task in `docs/context/CONTEXT_SYSTEM.md`.

Do not create a manual second progress document as a shortcut.

## Chat-based AI distinction

A ChatGPT or website-based planning chat may help draft the next requirements, module architecture, implementation design, or decision. It is not the session-state mechanism. Final artifacts must be committed into the repository and checked by the coding agent against repository/platform reality where necessary.
