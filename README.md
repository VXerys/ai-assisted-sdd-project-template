# AI-Assisted SDD Project Template

A repository operating system for spec-driven development, modular project knowledge, system-architecture reasoning, and AI-assisted implementation.

## Core workflow

```text
Idea
  -> PRD
  -> architecture baseline
  -> roadmap
  -> feature requirements
  -> module system architecture
  -> feature implementation design
  -> tasks
  -> implementation
  -> verification
  -> release
  -> context refresh
```

The architecture baseline defines shared project boundaries. Each meaningful Level 2/3 module then receives its own `system-architecture.md` so local decisions about data, consistency, communication, caching, scale, resilience, security, observability, cost, and trade-offs are explicit before implementation.

## Two AI surfaces

### Conversational AI

Use ChatGPT Projects or another planning/research assistant for:

- idea and problem framing;
- PRD;
- UX and flow exploration;
- architecture alternatives;
- module system-architecture analysis;
- feature requirements and preliminary implementation design;
- ADR proposals;
- documentation review.

Its result becomes authoritative only after review and commit.

### Repository-integrated coding agent

Use Codex, Claude Code, or another agent with code and terminal access for:

- repository inspection;
- project command discovery;
- validation of architecture assumptions against the actual repository/platform;
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

## System architecture per module

For a normal Level 2/3 capability, the default specification package is:

```text
docs/specs/F-XXX-feature-name/
├── requirements.md
├── system-architecture.md
├── design.md
├── tasks.md
└── verification.md
```

The responsibilities are intentionally separated:

- `requirements.md` defines what must be true;
- `system-architecture.md` decides how the capability should behave as a system and records alternatives/pros/cons/trade-offs;
- `design.md` maps the approved architecture into concrete repository components and contracts;
- `tasks.md` defines executable work;
- `verification.md` records evidence.

Do not force distributed-system mechanisms into every module. Caching, sharding, queues, microservices, CDN/edge, load balancing, circuit breakers, or other techniques are evaluated only when the requirements and workload justify them.

Read:

- [`docs/architecture/MODULE_ARCHITECTURE_GUIDE.md`](docs/architecture/MODULE_ARCHITECTURE_GUIDE.md)
- [`docs/specs/_templates/system-architecture.template.md`](docs/specs/_templates/system-architecture.template.md)
- [`docs/specs/README.md`](docs/specs/README.md)

## Start a derived project

### 1. Create the repository

Use this repository as a GitHub template.

### 2. Planning session

With a conversational AI:

1. complete `docs/product/idea-brief.md`;
2. complete `docs/product/prd.md`;
3. draft the project architecture baseline;
4. create the first feature requirements;
5. create the first module `system-architecture.md` when the feature is Level 2/3;
6. draft the feature implementation design from the approved architecture;
7. record unresolved assumptions and architecture questions.

### 3. Coding-agent bootstrap

Open the real repository with Codex or Claude Code and instruct it to:

1. read `AGENTS.md`;
2. validate planned architecture against actual project files, schemas, platform configuration, and available tooling;
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
  product + global architecture + ADR + feature requirements
  + module system architecture + implementation design

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
