# AI-Assisted SDD Project Template

A repository operating system for spec-driven development, modular project knowledge, and AI-assisted implementation.

## Core workflow

```text
Idea
  -> PRD
  -> architecture baseline
  -> roadmap
  -> feature requirements
  -> feature design
  -> tasks
  -> implementation
  -> verification
  -> release
  -> context refresh
```

## Two AI surfaces

### Conversational AI

Use ChatGPT Projects or another planning/research assistant for:

- idea and problem framing;
- PRD;
- UX and flow exploration;
- architecture alternatives;
- feature requirements and preliminary design;
- ADR proposals;
- documentation review.

Its result becomes authoritative only after review and commit.

### Repository-integrated coding agent

Use Codex, Claude Code, or another agent with code and terminal access for:

- repository inspection;
- project command discovery;
- context-system bootstrap;
- provider hooks and commands;
- implementation;
- tests, build, migration, and validation;
- task status, verification evidence, and handoff updates.

See [`docs/documentation/AI_COLLABORATION_MODEL.md`](docs/documentation/AI_COLLABORATION_MODEL.md).

## Repository structure

```text
/
├── AGENTS.md
├── CLAUDE.md
├── docs/
│   ├── documentation/
│   ├── product/
│   ├── architecture/
│   ├── adr/
│   ├── specs/
│   ├── context/
│   ├── handoff/
│   ├── quality/
│   └── runbooks/
├── scripts/context/
└── .github/
```

## Start a derived project

### 1. Create the repository

Use this repository as a GitHub template.

### 2. Planning session

With a conversational AI:

1. complete `docs/product/idea-brief.md`;
2. complete `docs/product/prd.md`;
3. draft the architecture baseline;
4. create the first feature specification;
5. record unresolved assumptions.

### 3. Coding-agent bootstrap

Open the real repository with Codex or Claude Code and instruct it to:

1. read `AGENTS.md`;
2. validate planned architecture against actual project files;
3. fill project commands and stack details;
4. implement the context system in `docs/context/CONTEXT_SYSTEM.md`;
5. create only the provider adapter needed for the active coding agent;
6. run context validation.

### 4. Disable template mode

After core placeholders are filled, set:

```json
{
  "templateMode": false
}
```

in `context.config.json`.

## Documentation modularity

Do not build 1,000-line manual context files.

Split by responsibility, authority, and change cadence. Start flat, then promote a concern into a folder when it gains independent subconcerns.

Read:

- [`docs/documentation/MODULARIZATION_GUIDE.md`](docs/documentation/MODULARIZATION_GUIDE.md)
- [`docs/architecture/README.md`](docs/architecture/README.md)
- [`docs/specs/README.md`](docs/specs/README.md)

## Context model

```text
Durable contracts:
  product + architecture + ADR + feature specs

Mutable execution state:
  docs/context/state.yaml

Generated views:
  docs/context/PROJECT_STATE.md
  docs/context/PROGRESS.md

Temporary session delta:
  docs/handoff/current.md
```

Provider memory is an adapter, never the source of truth.

## Validation

The base template includes structural context validation and handoff tooling. A derived project's coding agent adapts the renderer and commands to the project's runtime and CI.

```bash
npm run context:validate
```

## Existing projects

This template is intended for new projects. Do not retrofit it into established repositories without a separate migration plan.
