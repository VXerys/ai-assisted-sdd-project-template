---
id: DOCS-INDEX
title: Documentation System
status: template
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
---

# Documentation System

This directory defines how project knowledge is authored, split, approved, and consumed by humans and AI agents.

## Core principle

Split documentation by **responsibility, authority, and change cadence**, not by arbitrary line count.

A long generated reference can be valid. A shorter manual document should still be split when it mixes product scope, architecture, operations, and temporary execution state.

## Documentation layers

| Layer | Purpose | Canonical location | Typical author |
|---|---|---|---|
| Steering | Canonical product, stack, structure, rules, workflow | `docs/steering/` | Human; `AGENTS.md` and adapters rendered from it (available from 2.0.0) |
| Product intent | Problem, users, outcomes, scope | `docs/product/` | Human + conversational AI |
| Architecture | Cross-feature structure and boundaries | `docs/architecture/` | Human + conversational AI, verified by coding agent |
| Decisions | One expensive-to-reverse decision | `docs/adr/` | Human approves; AI drafts |
| Feature contracts | Requirements, design, tasks, acceptance | `docs/specs/` | Human + conversational AI; coding agent validates against repo |
| Task status | Tasks, dependencies, evidence ids | `docs/specs/<feature>/tasks.md` | Coding agent |
| Unknowns | Assumptions awaiting confirmation | `docs/context/ASSUMPTIONS.md` | Coding agent raises; human resolves |
| Rendered context | State, brief, compact and full views | `docs/context/state.yaml`, `BRIEF.md`, `PROJECT_STATE.md`, `PROGRESS.md` | Renderer only (`npm run context:render`) |
| Session delta | Worktree, commands, partial work, exact next step | `docs/handoff/current.md` | Coding agent |
| Operations | Repeatable procedures | `docs/runbooks/` | Coding agent drafts and verifies |
| Quality | Global gates and review rules | `docs/quality/` | Human approves; AI drafts |

## AI responsibility split

### Conversational AI

Examples: ChatGPT Projects, web-based assistants, planning and research chats.

Use it to:

- frame ideas and product problems;
- draft PRDs and user flows;
- compare architecture alternatives;
- draft feature requirements, designs, tasks, and ADR proposals;
- critique scope and documentation structure.

Chat output is a proposal until reviewed and committed. It must not claim repository facts without repository access.

### Repository-integrated coding agent

Examples: Codex, Claude Code, or another agent with code and terminal access.

Use it to:

- inspect the real repository and existing patterns;
- fill `docs/steering/tech.md` and `structure.md` from repository facts;
- execute approved tasks and run checks;
- update task status in `tasks.md`, evidence in `verification.md`, unknowns in `ASSUMPTIONS.md`, and the handoff;
- detect drift between docs and implementation.

The coding agent does not own product or architecture approval.

## Reading order

1. `docs/context/BRIEF.md` (fallback: `docs/context/CONTEXT_INDEX.md`)
2. `docs/steering/`
3. Relevant product, architecture, ADR, or feature artifact
4. Relevant code and tests
5. Current handoff when implementation is involved

## Supporting guides

- [`MODULARIZATION_GUIDE.md`](MODULARIZATION_GUIDE.md)
- [`AI_COLLABORATION_MODEL.md`](AI_COLLABORATION_MODEL.md)
