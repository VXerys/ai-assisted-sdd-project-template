<!-- GENERATED FILE — DO NOT EDIT. Rendered by `npm run adapters:sync`.
Source: docs/steering/, sdd.config.json.
source_hash: 87bdd1be694dcdc5919d5a8fa23a9383e8d2de2b87564945185bf3b06a6570ce -->
# Structure

Where things live and which direction dependencies point. Document only what an agent cannot infer by listing the tree.

## Directory responsibilities

| Path | Responsibility | Rule |
|---|---|---|
| `docs/steering/` | canonical project rules, product, stack, structure, workflow | edit by hand; `AGENTS.md` and tool adapters are rendered from it by `npm run adapters:sync` |
| `docs/specs/F-XXX-name/` | one feature: requirements, system-architecture, design, tasks, verification | `tasks.md` is the master for task status |
| `docs/adr/` | one decision per record | approved ADRs are never rewritten |
| `docs/architecture/` | cross-feature boundaries and invariants | module reasoning stays in the feature |
| `docs/context/` | rendered state, brief, assumptions log | only `ASSUMPTIONS.md` is hand-edited |
| `docs/handoff/current.md` | session delta | updated at the end of every implementation session |
| {{PRESET_STRUCTURE_ROWS}} | | |

## Generated paths

Never hand-edit. Listed in `sdd.config.json` under `generated`:

- `docs/context/state.yaml`
- `docs/context/PROJECT_STATE.md`
- `docs/context/PROGRESS.md`
- `docs/context/BRIEF.md`
- `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.claude/rules/`, `.cursor/rules/`, `.github/copilot-instructions.md`, `.github/instructions/`, `.kiro/steering/` (only the tools in `sdd.config.json` are written)
- `.sdd/manifest.json` (written by `init` and `sdd upgrade`)
- Project-specific generated code (example: `*.g.dart`, `*.freezed.dart`, generated API clients): {{GENERATED_CODE_PATHS_OR_NONE}}

## Frozen paths

Listed in `sdd.config.json` under `frozen`. Edits need explicit owner approval and an ADR when the freeze is architectural.

- {{FROZEN_PATHS_OR_NONE}}

## Dependency direction

```text
ui -> application -> domain <- data
```

- Inner layers never import outer layers.
- Framework and provider SDKs stay behind a project-owned boundary.
- Project-specific rule: {{DEPENDENCY_RULE}}

## Naming

- Features: `F-001-short-name`. Tasks: `T-001`. Evidence: `EV-001`. Assumptions: `A-001`. ADRs: `ADR-0001-short-name.md`.
- Code naming follows the language's standard style guide unless `docs/steering/rules.md` says otherwise.
