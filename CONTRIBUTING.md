# Contributing

The first part applies to every project built from this template; `npm run init` fills the commands from the chosen presets. The second part applies to the template repository itself and is removed by `init`.

## Working in a project

### Pick the surface

Use conversational AI for product and documentation planning. Use a repository-integrated coding agent for repository inspection, context tooling, implementation, and verification. See `docs/documentation/AI_COLLABORATION_MODEL.md`.

### Delivery path

| Change | Required artifacts |
|---|---|
| New project | PRD, constitution, architecture baseline, roadmap, first feature spec |
| Feature | Requirements, design, tasks, verification (`full` tier adds system architecture) |
| Complex bug | Bug investigation from `docs/_templates/bug-investigation.md`, task, regression evidence |
| Internal refactor | Design-first specification and safety tests |
| Architecture change | ADR, architecture update, feature-design impact |
| Production hotfix | Minimal approved scope, regression evidence, documentation after stabilization |

### Before implementation

1. Read `docs/context/BRIEF.md`; choose one feature and task id.
2. Confirm requirements and design are approved.
3. Verify branch and worktree against `docs/handoff/current.md`; create a purpose-specific branch.
4. Run `npm run context:validate`.

### During implementation

- Keep the diff inside the selected task; discovered work becomes a new task in `tasks.md`.
- Add tests with behavior changes.
- Stop when an unapproved product, contract, security, or architecture decision appears; log unknowns in `docs/context/ASSUMPTIONS.md`.
- Record architecture decisions as ADRs; use versioned migrations for data store changes.
- Update task status in `tasks.md`, never in rendered views.

### Before a pull request

Run the project commands (from `docs/steering/tech.md`) and the context commands:

```bash
{{PRESET_FORMAT}}
{{PRESET_LINT}}
{{PRESET_TEST}}
{{PRESET_BUILD}}
npm run context:render
npm run context:validate
```

Then update: evidence in the feature's `verification.md`; `tasks.md` status and evidence ids; `docs/handoff/current.md`; architecture or ADR artifacts when a contract changed. After a steering or `sdd.config.json` change, `npm run adapters:sync`.

### Pull request

The PR template asks for feature, task, and requirement ids; intended behavior and out-of-scope work; changed boundaries; verification evidence; migration and compatibility impact; context and documentation impact; remaining risks. Keep it a draft until the deterministic checks pass. A documentation change is reviewed against `docs/quality/review-checklist.md`.

### After merge

1. Update task status against the merged commit; run `npm run context:render`.
2. Archive the handoff with `npm run context:archive-handoff` when work continues later.
3. Update the roadmap or release state; never delete accepted specifications or ADRs.

<!-- template-only:start -->
## Working on the template

Everything below is about `ai-assisted-sdd-project-template` itself. Node 22, ESM, the `yaml` dependency only, tests with `node:test`.

### Change a template

1. Edit the file under `docs/_templates/` or `docs/specs/_templates/`. Keep the frontmatter keys, the id vocabulary, and the size cap (lite 80, full 200, system architecture 300 lines).
2. Update the instantiated form when one exists: `docs/product/prd.md` mirrors `docs/_templates/prd.md`; `docs/architecture/overview.md` is the lite form of `docs/_templates/architecture-baseline.md`.
3. Update the fixtures that carry the shape: `scripts/context/__fixtures__/*` (validator cases) and `examples/todo-api/` (the filled project). Re-render the example from its own directory: `cd examples/todo-api && node ../../scripts/context/render.mjs && node ../../scripts/adapters/sync.mjs`.
4. Update snapshots with `UPDATE_SNAPSHOTS=1 npm test` (the init dry-run plan in `scripts/init/__fixtures__/dry-run-plan.txt` and the adapter outputs in `scripts/adapters/__fixtures__/`), then review the snapshot diff before committing it.
5. `npm test`, `npm run context:validate -- --strict`, `npm run example:validate`. While iterating, `npm run test:unit` skips the init end-to-end runs in `scripts/init/e2e/` (one file per scenario, so `node --test` runs them in parallel); `npm run test:e2e` runs only those.

### Add a preset

1. Add `scripts/init/presets/app/<name>.json` or `scripts/init/presets/db/<name>.json` with the keys in `scripts/init/presets/README.md`; `scripts/init/presets.test.mjs` validates every file against the schema.
2. Commands must exist for that stack; `null` renders as `none`. Notes are one-line rules an agent can apply.
3. Run `node scripts/init/init.mjs --dry-run --yes --app <name>` on a temp copy and read the plan, then `npm test`.
4. List the preset in `README.md`.

### Add a tool adapter

1. Add the tool name to `TOOLS` in `scripts/context/lib/config.mjs` and a renderer in `scripts/adapters/render.mjs`; wire it in `scripts/adapters/sync.mjs`.
2. Every target starts with the GENERATED banner carrying `source_hash`; add the target path to `generated` in `sdd.config.json` and to the guard rules if it is a directory.
3. Add the expected output to `scripts/adapters/__fixtures__/multi-tool/` and a case in `scripts/adapters/sync.test.mjs`.
4. Document the target in the tool support table of `README.md` and in `docs/automation/README.md`.

### Release

`.github/workflows/release.yml` runs release-please on every push to `main`: it keeps a release pull request that bumps `package.json` from the conventional commits since the last `v*` tag (`.release-please-manifest.json` starts at 2.0.0). In that pull request, move `[Unreleased]` in `CHANGELOG.md` to the new dated version by hand (`skip-changelog` keeps release-please out of it). Merging it tags `vX.Y.Z` and creates the GitHub release; the owner merges, since a release is an outward action. Every release must be tagged, because `sdd upgrade` rebuilds a project's base from the template commit or the `v<version>` tag.

The `publish-npm` job stays off until the tooling is extracted to `@vxerys/sdd` (ADR-0003). To turn it on: create the npm package, link it to this workflow as a trusted publisher, make the package public (`private` removed), and set the repository variable `NPM_PUBLISH` to `true`.

### Action updates

Dependabot updates the pins in `.github/workflows/` only. When it bumps `actions/checkout` or `actions/setup-node`, carry the same SHA and version into `PINNED_ACTIONS` in `scripts/init/lib/project.mjs` in that pull request (a test in `scripts/init/init.test.mjs` fails until you do), and check the preset `ci.setup` actions in `scripts/init/presets/app/` against their latest releases by hand. Read each major's release notes for breaking changes before merging.

### Repository settings

Kept by the owner in GitHub, not in files: a ruleset on `main` that requires a pull request, the `validate-context` and `template-init` checks, and a review from code owners (`.github/CODEOWNERS`); private vulnerability reporting on (`SECURITY.md`); and "Allow GitHub Actions to create and approve pull requests" for the release pull request.
<!-- template-only:end -->
