# Migrating a project from template v1 to v2

For a project created from v1 of this template (the `templates/` plus `docs/specs/_templates/*.template.md` shape, `TASK-001` checkbox tasks, a hand-edited `state.yaml`, `context.config.json`). v2 is a fresh design (ADR-0001); nothing migrates automatically except the task files. Budget half a day for a project with a handful of features. Work on a branch; the validator tells you what is left at every step.

## 0. Prepare

1. Clone this template next to the project (the migration script and the new templates come from it): `git clone <template-url> sdd-template && cd sdd-template && npm install`.
2. In the project, commit or stash everything, then create `chore/sdd-v2` from the main branch.
3. Read the project's `docs/handoff/current.md` and note the active feature and task; the v2 handoff needs them.

## 1. Copy the tooling

From the template into the project, overwriting the v1 files:

- `package.json` scripts `init`, `context:render`, `context:validate`, `context:archive-handoff`, `adapters:sync`, `test`; the `yaml` dependency; `engines.node >=22`. Then `npm install`.
- `scripts/` (`context/`, `adapters/`, `hooks/`, `init/`, `lib/`), without `__fixtures__/` and `scripts/migrate/`.
- `sdd.config.json`, `.claude/settings.json`, `.claude/commands/sdd/`, `.gitattributes`, `.github/workflows/context-integrity.yml`.
- `docs/_templates/`, `docs/specs/_templates/`, `docs/steering/`, `docs/context/CONTEXT_SYSTEM.md`, `CONTEXT_INDEX.md`, `NEW_CHAT_PROTOCOL.md`, `ASSUMPTIONS.md`, `docs/automation/README.md`.

Delete the v1 files they replace: `templates/`, `docs/specs/_templates/*.template.md`, `docs/adr/ADR.template.md`, `context.config.json`, `scripts/context/refresh-project-state.mjs`, `templates/CONTEXT_REFRESH_TEMPLATE.md`.

## 2. Map the templates

| v1 | v2 | Change |
|---|---|---|
| `templates/PRD_TEMPLATE.md`, `docs/product/prd.md` | `docs/_templates/prd.md`, `docs/product/prd.md` | frontmatter `id: PRD`, `type: prd`, `tier`; sections Context, Problem, Goals and non-goals, Actors and use cases, Functional requirements, Constraints, Success criteria, Risks and assumptions, Milestones, Feature map, Approval |
| `templates/PROJECT_CONSTITUTION_TEMPLATE.md` | `docs/_templates/constitution.md` | principles only; the rules moved to `docs/steering/rules.md` |
| `templates/ARCHITECTURE_BASELINE_TEMPLATE.md`, `docs/architecture/overview.md` | `docs/_templates/architecture-baseline.md`, `docs/architecture/overview.md` | `id: ARCH`; the overview is the lite form (system context, components, boundaries, dependency direction, data, state, security, deployment, decisions) |
| `templates/ADR_TEMPLATE.md`, `docs/adr/ADR.template.md` | `docs/_templates/adr.md` | frontmatter with `id: ADR-0001`, `type: adr`; existing ADRs get the frontmatter added, never rewritten |
| `docs/specs/_templates/requirements.template.md` | `docs/specs/_templates/requirements.md` | `id: F-XXX`, `type: requirements`; `FR-001` headings, `AC-001` lines (v1 `AC-001.1` becomes `AC-001`, `AC-002` ...) |
| `docs/specs/_templates/system-architecture.template.md` | `docs/specs/_templates/system-architecture.md` | full tier only; within 300 lines |
| `docs/specs/_templates/design.template.md` | `docs/specs/_templates/design.md` | `type: design` |
| `docs/specs/_templates/tasks.template.md` | `docs/specs/_templates/tasks.md` | parseable `### T-001 — title` blocks (step 3) |
| `docs/specs/_templates/verification.template.md` | `docs/specs/_templates/verification.md` | parseable `### EV-001 — title` blocks with `command`, `output`, `date`, `commit`, `covers` |
| `templates/AI_TASK_PROMPT_TEMPLATE.md`, `BUG_INVESTIGATION_TEMPLATE.md`, `CODE_REVIEW_TEMPLATE.md` | `docs/_templates/task-prompt.md`, `bug-investigation.md`, `code-review.md` | frontmatter added; `/sdd:task`, `/sdd:bug`, `/sdd:review` fill them in Claude Code |
| `templates/AGENTS_TEMPLATE.md`, hand-written `AGENTS.md` | rendered by `npm run adapters:sync` | content moves into `docs/steering/` (step 5) |

For every feature folder: rename the files, add the v2 frontmatter (`id` is the folder's `F-XXX`, `type` is the file name, `status` from the v1 `status`, `tier: lite` unless the feature has a system architecture, `created`, `last_updated`, `last_verified`, `requirements: [FR ids]`, `supersedes: null`), and trim to the size cap (lite 80, full 200, system architecture 300). Move content, do not rewrite it; a section the v2 template does not have is deleted or moved to design.

## 3. Convert the task files

v1 tasks are checkboxes, as `### [x] TASK-001 — title` headings or `- [x] TASK-001 title` list items, with `[ ]`, `[-]`, `[x]`, `[!]`. v2 tasks are blocks:

```markdown
### T-001 — title
- status: planned          # [ ] planned, [-] in_progress, [x] done, [!] blocked
- requirements: [FR-001]
- depends_on: []
- evidence: []             # EV ids from verification.md; done requires one
```

By hand: for each task, write the heading with `T-` and the three-digit number, the four key-value lines, then the v1 body. `requirements` are the FR ids the v1 "Requirement references" list named; `depends_on` comes from the v1 Dependency Map; `evidence` stays empty until an EV block exists, so a v1 `[x]` task becomes `status: review` unless you also write its EV block from the v1 verification notes.

With the script, from the template clone:

```bash
node scripts/migrate/v1-tasks.mjs ../project/docs/specs/F-001-name/tasks.md            # prints the converted file
node scripts/migrate/v1-tasks.mjs ../project/docs/specs/F-001-name/tasks.md --write    # replaces it
```

It maps the four checkbox states, infers `requirements` from FR ids in the task title and body, infers `depends_on` from `TASK-001 -> TASK-002` chains, rewrites the frontmatter to the v2 keys, and drops the v1 legend and dependency map. It prints what it could not infer on stderr: tasks without an FR id, `done` tasks without evidence (add an EV id or set `review`), blocked tasks (log the reason in `ASSUMPTIONS.md`), tasks absent from the dependency map. Fix those lines by hand; the validator catches the rest.

## 4. Replace the context files

- `docs/context/state.yaml`: delete the v1 file; `npm run context:render` writes the v2 one. Task status now lives only in `tasks.md`; v1 `pending`, `in_progress`, `done`, `blocked` values map to `planned`, `in_progress`, `done` (with evidence) or `review`, `blocked`.
- `docs/context/PROJECT_STATE.md`, `PROGRESS.md`: delete; rendered.
- `docs/context/BRIEF.md`: rendered; new.
- `docs/context/ASSUMPTIONS.md`: new; move every "assumption" or "open question" from the PRD, designs, and handoff into `A-XXX` blocks with `status: open` and the feature id.
- `docs/handoff/current.md`: keep the content; rename `active_feature` and `active_task` to `feature_id` and `task_id`, add `session_date` and `expires_after`, keep `status: active | inactive`. Archive old handoffs with `npm run context:archive-handoff`.
- `context.config.json` becomes `sdd.config.json`: `requiredFiles`, `generatedFiles`, and `placeholderSensitiveFiles` move under `validate`; add `project`, `stack`, `tools`, `paths`, `generated`, `frozen`, `limits`, `templateMode: false`. Frozen paths (ADR-protected folders) go under `frozen`.

## 5. Split AGENTS.md into steering

`docs/steering/` is now canonical and `AGENTS.md` is rendered from it. Move each v1 section:

| v1 `AGENTS.md` section | v2 steering file |
|---|---|
| Project identity, product summary | `product.md` (`## Vision`: first prose line is the identity line of `AGENTS.md` and `BRIEF.md`) |
| Technology stack, commands, dependency policy, environment | `tech.md` (Stack and Commands tables; every command must run) |
| Repository structure, generated and frozen paths, dependency direction, naming | `structure.md` |
| Engineering rules, evidence rule, prohibited actions, stop conditions, security | `rules.md` |
| Workflow, status vocabulary, session start and close, ADR trigger, tiers | `workflow.md` |
| Stack-specific rules (RLS, Security Rules, drift, `flutter analyze` at 0) | `database.md` (`inclusion: fileMatch`) or the Stack rules section of `tech.md` |

Each file stays under 120 lines with `inclusion: always` (or `fileMatch` plus `fileMatchPattern`). Delete the hand-written `AGENTS.md`, `CLAUDE.md`, `.cursor/rules`, `.kiro/steering`, and `copilot-instructions.md`; `npm run adapters:sync` rewrites them for the tools listed in `sdd.config.json`. Tool-specific text that is not a project rule (memory notes, personal paths) is dropped.

## 6. Render, sync, validate

```bash
npm run context:render
npm run adapters:sync
npm run context:validate
npm test
```

Expected on a first pass:

- errors for missing `id`, `type`, `tier`, `created`, `last_verified` in feature frontmatter; for `done` tasks without an evidence id; for an EV block without `commit` or `covers`; for an `implemented` feature with a task that is not `done` or `deferred`, or with an open assumption;
- warnings for FR ids no task references (an error once the feature is `implementing`), for spec files over the tier cap, for a backtick path that no longer exists (v1 paths renamed in step 2), and for `last_verified` older than 30 days on an `implementing` feature;
- `unresolved placeholder` errors in `AGENTS.md`, the steering files, the PRD, the overview, or `state.yaml` until every value is filled.

Fix the source, never the rendered file, and re-run until `0 error(s)`. Warnings about ids and evidence are the migration's real work: a v1 "complete" task without recorded evidence is `review`, not `done`.

## Checklist

- [ ] Tooling copied; `npm install` and `npm test` pass in the project.
- [ ] `templates/`, `*.template.md`, `context.config.json`, `refresh-project-state.mjs` deleted.
- [ ] `sdd.config.json` filled: `project`, `stack`, `tools`, `generated`, `frozen`, `templateMode: false`.
- [ ] Every feature folder has the five v2 file names, frontmatter, and sizes within the cap.
- [ ] Every `tasks.md` uses `T-XXX` blocks; `done` tasks have an EV id; the rest are `review`, `planned`, `in_progress`, `blocked`, or `deferred`.
- [ ] Every `verification.md` uses EV blocks with `command`, `output`, `date`, `commit`, `covers`.
- [ ] Assumptions and open questions moved to `ASSUMPTIONS.md`; no `implemented` feature has an open one.
- [ ] `docs/steering/` written; the hand-written `AGENTS.md` and adapters deleted; `npm run adapters:sync` run.
- [ ] `state.yaml`, `PROJECT_STATE.md`, `PROGRESS.md`, `BRIEF.md` rendered, not edited.
- [ ] `docs/handoff/current.md` uses `feature_id`, `task_id`, `session_date`, `expires_after`.
- [ ] `npm run context:validate` reports `0 error(s)`; remaining warnings are listed in the PR with a reason.
- [ ] `.github/workflows/context-integrity.yml` runs on the project's default branch.
- [ ] One PR: `chore(sdd): migrate to template v2`.
