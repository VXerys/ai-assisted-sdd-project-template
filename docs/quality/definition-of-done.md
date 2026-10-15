---
id: QUALITY-DOD
title: Definition of Done
status: approved
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
---

# Definition of Done

## Task

A task is done only when:

- referenced requirements and acceptance criteria are addressed;
- implementation follows approved design and ADRs;
- relevant format, lint, tests, and build checks pass;
- error and security paths are handled;
- no unrelated change is included;
- verification evidence is recorded;
- task status is updated in `tasks.md` with evidence ids;
- rendered context views are current (`npm run context:render`, checked by `npm run context:validate`);
- `docs/handoff/current.md` reflects partial or continuing work.

## Feature

A feature is done only when:

- all committed tasks are complete or explicitly deferred;
- every acceptance criterion has evidence;
- migrations and compatibility obligations are verified;
- critical manual flows are accepted;
- documentation and ADR impact is resolved;
- no unresolved P0/P1 defect remains;
- human product acceptance is recorded;
- feature lifecycle gate and execution state are synchronized.

## Documentation

A documentation change is done only when:

- one canonical owner exists for each fact;
- links and IDs validate;
- generated files were not edited directly;
- long files were reviewed for modularization by responsibility;
- no raw chat history or duplicated status was introduced;
- assumptions and approved facts are distinguished.

## Context system

The context system is done only when:

- `tasks.md` is canonical for task status; `state.yaml` is rendered from it;
- generated views match a clean render;
- repeated sync is idempotent;
- invalid IDs and statuses fail validation;
- provider adapters are reproducible and non-canonical;
- the repository works after moving to another machine.
