# Context Index

This file defines how humans and AI agents load repository context. It is an index, not a project summary.

## Required Reading Order

### Starting or resuming implementation

1. `/AGENTS.md`
2. `/docs/context/PROJECT_STATE.md`
3. `/docs/handoff/current.md`
4. active feature `requirements.md`
5. active feature `design.md`
6. active feature `tasks.md`
7. relevant ADRs
8. relevant implementation and tests

### Product or scope work

1. `/docs/product/idea-brief.md`
2. `/docs/product/prd.md`
3. `/docs/product/roadmap.md`
4. `/docs/specs/_index.md`

### Architecture work

1. `/docs/product/prd.md`
2. `/docs/architecture/overview.md`
3. relevant architecture document
4. `/docs/adr/README.md`
5. related feature design

### Verification work

1. feature `requirements.md`
2. feature `verification.md`
3. feature `design.md`
4. implementation, tests, migrations, and runtime evidence

## Source-of-Truth Map

| Information | Authoritative artifact |
|---|---|
| Product intent and scope | `docs/product/prd.md` |
| Roadmap sequence | `docs/product/roadmap.md` |
| Architecture baseline | `docs/architecture/` |
| Decision rationale | `docs/adr/` |
| Feature behavior | `docs/specs/<feature>/requirements.md` |
| Approved technical approach | `docs/specs/<feature>/design.md` |
| Task progress | `docs/specs/<feature>/tasks.md` |
| Acceptance evidence | `docs/specs/<feature>/verification.md` |
| Feature registry | `docs/specs/_index.md` |
| Durable current state | `docs/context/PROJECT_STATE.md` |
| Temporary session state | `docs/handoff/current.md` |
| Implemented runtime behavior | Code, tests, schemas, migrations |

## Conflict Policy

When two sources disagree:

1. stop affected work;
2. identify both sources and their last update;
3. determine whether the conflict concerns intent, design, state, or implementation;
4. propose the smallest correction;
5. obtain owner approval when product behavior or architecture changes.

Never resolve a conflict by copying the newer text into every file.

## Context Loading Limits

Do not load by default:

- raw chat transcripts;
- all archived handoffs;
- every ADR;
- every feature specification;
- generated build output;
- unrelated source directories.

Load the smallest context set that can safely support the current task.
