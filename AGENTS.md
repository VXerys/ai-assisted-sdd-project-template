<!-- Will be generated from docs/steering by adapters:sync in 2.0.0 -->

# Repository contract: {{PROJECT_NAME}}

Short contract for humans and coding agents. The canonical rules live in `docs/steering/`; this file points to them and adds nothing they do not say.

## Identity

{{PROJECT_NAME}} is a {{APPLICATION_TYPE}} for {{TARGET_USERS}} that {{PRIMARY_OUTCOME}}. Lifecycle stage: {{STAGE}}. Production sensitivity: {{LOW_MEDIUM_HIGH}}.

## Read first

1. `docs/context/BRIEF.md` (single entry point; rendered, never hand-edited)
2. `docs/steering/rules.md`, `tech.md`, `structure.md`, `workflow.md`, `product.md`
3. The active feature under `docs/specs/`: `tasks.md`, then the sections it references

Fallback when `BRIEF.md` is absent: `docs/context/NEW_CHAT_PROTOCOL.md`.

## Source of truth

| Question | Source |
|---|---|
| Product intent | `docs/steering/product.md`, `docs/product/prd.md` |
| Stack and commands | `docs/steering/tech.md` |
| Directory and dependency rules | `docs/steering/structure.md` |
| Engineering and security rules | `docs/steering/rules.md` |
| Lifecycle and status vocabulary | `docs/steering/workflow.md` |
| Shared architecture | `docs/architecture/` |
| Decisions | `docs/adr/` |
| Feature behavior, design, tasks, evidence | `docs/specs/F-XXX-name/` |
| Task status | `docs/specs/F-XXX-name/tasks.md` (master) |
| Unknowns | `docs/context/ASSUMPTIONS.md` |
| Session delta | `docs/handoff/current.md` |
| Current behavior | code, tests, schema, configuration |

Chat history and provider memory are never a source of truth. When sources conflict, stop and follow the conflict rule in `docs/steering/rules.md`.

## Non-negotiables

- Inspect before asserting; never invent a path, API, schema field, or command.
- Evidence before claims: run the commands in `docs/steering/tech.md` and record EV blocks in `verification.md`.
- Log unknowns in `docs/context/ASSUMPTIONS.md` instead of guessing.
- No secrets read, printed, or committed. No destructive data, git, or production action without explicit approval.
- Generated and frozen paths in `sdd.config.json` are read-only.
- One task at a time, inside its scope. Stop and report on any stop condition in `docs/steering/rules.md`.

## Commands

See the Commands table in `docs/steering/tech.md`. Context validation: `npm run context:validate`.

## Definition of done

A task is done when its acceptance criteria have EV evidence, the commands in `tech.md` pass, the diff contains only the task's scope, `tasks.md` is updated, and `docs/handoff/current.md` reflects the session. A feature is implemented when every task is `done` or `deferred` and no assumption is `open`.

## Project-specific rules

- {{PROJECT_RULE_OR_NONE}}

## Maintenance

Edit `docs/steering/`, not this file. Until 2.0.0 regenerates it, keep this file in sync by hand and under 120 lines.
