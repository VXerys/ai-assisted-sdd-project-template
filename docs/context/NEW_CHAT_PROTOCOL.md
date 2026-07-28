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
6. Read that feature's requirements, design, tasks, and relevant ADRs.
7. Inspect Git status, branch, recent commits, and relevant code/tests.

Return:
- current objective and requirement references;
- whether generated context and handoff are still valid;
- repository conflicts or stale information;
- expected change surface;
- constraints and approval gates;
- verification commands;
- a small execution plan.

Do not resolve conflicts silently. Implement only the selected task after context confirmation.
```

## Session close

Before ending:

1. review `git diff` and `git status`;
2. run required checks;
3. record acceptance evidence;
4. update task status through the context system;
5. regenerate and validate context;
6. update `docs/handoff/current.md`;
7. report the exact next task.

## When context tooling is not implemented

The coding agent first completes the bootstrap task in `docs/context/CONTEXT_SYSTEM.md`.

Do not create a manual second progress document as a shortcut.

## Chat-based AI distinction

A ChatGPT or website-based planning chat may help draft the next specification or decision. It is not the session-state mechanism. Final artifacts must be committed into the repository and checked by the coding agent.
