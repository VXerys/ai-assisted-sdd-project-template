---
id: DOCS-AI-COLLABORATION
title: AI Collaboration Model
status: template
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
---

# AI Collaboration Model

## 1. Objective

Use the best AI surface for each artifact while keeping the repository as the final source of truth.

```text
Conversation and research
    -> reviewed documentation
    -> repository-integrated implementation
    -> deterministic verification
    -> committed context refresh
```

## 2. Authority model

| Actor | Owns | May draft | Must not decide silently |
|---|---|---|---|
| Human owner | Scope, priority, architecture approval, acceptance | All artifacts | N/A |
| Conversational AI | Analysis, PRD, specs, alternatives, critique | Product and design documents | Repository state, approval, implementation truth |
| Coding agent | Repo inspection, implementation, validation, context tooling | Technical updates grounded in code | Product scope, architecture exceptions |
| Automation | Format, render, validate, compare | Generated views only | Semantic decisions |

## 3. Conversational AI workflow

Use a chat-based AI before implementation for:

1. idea intake;
2. problem framing;
3. PRD drafting;
4. user-flow and UX analysis;
5. architecture option comparison;
6. feature requirements;
7. preliminary design;
8. task decomposition;
9. ADR proposal;
10. documentation modularization review.

Required output discipline:

- label assumptions;
- use stable IDs;
- name target repository paths;
- separate approved facts from proposals;
- do not store raw chat transcripts in the repo;
- convert the final result into repository artifacts.

A chat output is a proposal until the human reviews it and a coding agent checks it against the actual repository where necessary.

## 4. Repository-integrated coding-agent workflow

Codex, Claude Code, or a comparable local/repository agent handles work that depends on actual code or environment:

1. read `AGENTS.md`;
2. inspect project commands and architecture;
3. validate proposed docs against current code;
4. implement `docs/context/state.yaml` tooling and provider adapters;
5. create hooks or slash commands for the installed agent;
6. implement approved tasks;
7. run checks;
8. update verification evidence;
9. update execution state through the context CLI or canonical state file;
10. update `docs/handoff/current.md`.

The coding agent must not copy conversational assumptions into approved artifacts without validation.

## 5. Context-system bootstrap ownership

The context system is repository infrastructure. It must be created or adapted **inside the real project repository** by a coding agent with terminal access.

Give the coding agent this objective:

```text
Implement the repository context system described in
docs/context/CONTEXT_SYSTEM.md.

Preserve repository-native canonical data:
- docs/context/state.yaml for execution state;
- feature specs and ADRs for contracts and decisions;
- docs/handoff/current.md for session delta.

Generate PROJECT_STATE.md and PROGRESS.md one way from state.yaml.
Add deterministic validation.
Add only the provider adapter that matches the active coding agent.
Do not make provider memory the source of truth.
```

## 6. Provider adapters

Provider-specific memory, commands, and hooks are adapters:

```text
Repository context
    -> Claude Code adapter
    -> Codex adapter
    -> another coding-agent adapter
```

Adapters may:

- run context sync on session start;
- expose commands such as `context next`;
- point the agent to generated snapshots;
- warn when handoff or generated context is stale.

Adapters must not own state. Deleting an adapter must not delete project knowledge.

## 7. Handoff between chat AI and coding agent

A chat AI delivers:

- target paths;
- artifact status;
- decisions requiring approval;
- unresolved assumptions;
- a concise implementation brief.

The coding agent responds with:

- repository conflicts;
- affected files;
- implementation plan;
- verification commands;
- documentation updates required.

## 8. Completion rule

No AI-generated artifact is complete merely because it is well written.

Completion requires the applicable gate:

- product artifact: human approval;
- architecture artifact: human approval and repository feasibility check;
- implementation: tests and review;
- generated context: renderer and validation pass;
- feature: acceptance evidence and human acceptance.
