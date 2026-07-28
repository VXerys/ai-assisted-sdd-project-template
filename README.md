# AI-Assisted Spec-Driven Development Template

A reusable repository operating system for building new software projects with AI coding agents while keeping product intent, architecture, execution, verification, and session context traceable.

## What this template solves

This template prevents four recurring problems:

- implementation starts before requirements and design are approved;
- project context becomes stale, duplicated, or mixed with raw chat history;
- AI agents silently make product or architecture decisions;
- completed tasks lack acceptance evidence.

## Core workflow

```text
Idea Intake
  -> PRD
  -> Project Constitution
  -> Architecture Baseline
  -> Feature Map
  -> Feature Specification
  -> Sprint Commitment
  -> Task Execution
  -> Verification
  -> Merge / Release
  -> Context Refresh
```

Each feature uses four canonical artifacts:

```text
docs/specs/F-XXX-feature-name/
├── requirements.md
├── design.md
├── tasks.md
└── verification.md
```

## Authority model

- The human owner controls product scope, requirement approval, architecture approval, acceptance, and release.
- AI agents may analyze, draft, implement approved tasks, run checks, and update execution records.
- Code, tests, schemas, and migrations are authoritative for implemented behavior.
- Specifications are authoritative for approved behavior.
- ADRs are authoritative for architecture rationale.
- `docs/context/PROJECT_STATE.md` is authoritative for current durable state.
- `docs/handoff/current.md` records temporary session state only.

## Start a new project

1. Create a new repository from this template.
2. Replace every `{{PLACEHOLDER}}` used by the active project.
3. Complete `docs/product/idea-brief.md` and `docs/product/prd.md`.
4. Customize `AGENTS.md` with the actual stack, commands, and architectural boundaries.
5. Complete the minimum architecture baseline under `docs/architecture/`.
6. Register the first feature in `docs/specs/_index.md`.
7. Copy the four feature templates into `docs/specs/F-001-feature-name/`.
8. Approve requirements and design before implementation.
9. Run `npm run context:validate` before opening a pull request.

## Core files

| Path | Purpose |
|---|---|
| `AGENTS.md` | Permanent repository contract for AI agents |
| `CLAUDE.md` | Claude Code entry point importing `AGENTS.md` |
| `docs/product/prd.md` | Product intent, scope, outcomes, and constraints |
| `docs/architecture/` | System boundaries and technical baseline |
| `docs/adr/` | Architecture decision records |
| `docs/specs/` | Feature requirements, design, tasks, and evidence |
| `docs/context/CONTEXT_INDEX.md` | Reading order and source-of-truth map |
| `docs/context/PROJECT_STATE.md` | Durable current project snapshot |
| `docs/handoff/current.md` | Temporary session delta for the next chat |
| `docs/quality/definition-of-done.md` | Global completion gates |

## Context validation

The validator uses Node.js built-ins only:

```bash
npm run context:validate
```

It checks required files, duplicate identifiers, valid statuses, active-spec references, unresolved placeholders in active artifacts, and relative Markdown links.

## Operating rules

1. Do not store raw chat history as project context.
2. Do not duplicate task or feature status across multiple files.
3. Do not modify approved requirements silently during implementation.
4. Do not make architecture changes without an ADR when the decision is expensive or cross-cutting.
5. Do not mark a feature complete until every acceptance criterion has evidence and human acceptance.
6. Keep one primary task objective per AI coding session.

## Template maturity

This repository is intentionally stack-agnostic. Add stack-specific commands and boundaries only after the project stack is selected. Remove optional documents that do not support decisions, implementation, verification, or operations.
