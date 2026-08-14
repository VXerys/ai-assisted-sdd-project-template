# AI-Assisted Engineering / SDD Project Template

A reusable repository template for **spec-driven, context-efficient, evidence-based AI-assisted software engineering**.

This repository is being evolved from the original AI-Assisted SDD template into the broader **AI-Assisted Engineering** operating model. The goal is to make AI coding agents useful across real production projects without requiring every repository to adopt the same amount of process or context automation.

## Core operating model

```text
IDEA
  → REQUIREMENTS
  → SPECIFICATION
  → ARCHITECTURE
  → PLAN
  → TASK
  → IMPLEMENTATION
  → VERIFICATION
  → REVIEW
  → RELEASE
  → CONTEXT REFRESH
```

The sequence is a default, not bureaucracy. Documentation and verification depth scale with risk.

## Core principles

- **Specification before non-trivial implementation.** Resolve behavior, constraints, and acceptance before generating broad code.
- **Repository artifacts are durable truth.** Chat history and provider memory are temporary context, not the only source of truth.
- **Minimum sufficient context.** Load the relevant contract, feature, task, implementation, and evidence—not the whole repository by default.
- **Small, verifiable changesets.** Prefer bounded tasks that can be reviewed and proven independently.
- **Evidence over confidence.** Tests, builds, runtime checks, schema/data evidence, and diff inspection outrank an agent saying “done”.
- **Architecture is a constraint.** Existing repository boundaries and contracts outrank generic framework preferences.
- **Human control of high-impact decisions.** Security policy, destructive data changes, public contract breaks, major architecture changes, production infrastructure, and major dependency replacement require deliberate approval.
- **Context automation is optional.** Generated state, handoff tooling, hooks, and provider adapters are extensions adopted only when they solve a demonstrated coordination problem.

## Complexity scaling

### Level 1 — Small change

```text
Task → Implement → Verify
```

Use for isolated, low-risk, reversible changes.

### Level 2 — Normal feature

```text
Requirements → Lightweight Design → Tasks → Implement → Verify → Review
```

Use for normal feature development with bounded behavioral and architectural impact.

### Level 3 — Complex / high-risk

```text
Requirements
  → Design
  → ADR when needed
  → Tasks
  → Implementation
  → Multi-level Verification
  → Review
  → Release Controls
  → Context Refresh
```

Use for authentication/authorization, payments, migrations, public contracts, destructive data work, security-sensitive changes, cross-module architecture, or difficult-to-reverse decisions.

## Reusable templates

The canonical reusable starter templates are stored in [`templates/`](templates/). Keeping them in GitHub avoids consuming ChatGPT Project source slots for artifacts that are mainly instantiated on demand.

| Template | Purpose |
|---|---|
| [`AGENTS_TEMPLATE.md`](templates/AGENTS_TEMPLATE.md) | High-signal repository operating contract for developers and AI agents |
| [`PROJECT_CONSTITUTION_TEMPLATE.md`](templates/PROJECT_CONSTITUTION_TEMPLATE.md) | Durable engineering governance and human/AI decision boundaries |
| [`PRD_TEMPLATE.md`](templates/PRD_TEMPLATE.md) | Product context, goals, requirements, constraints, risks, and milestones |
| [`ARCHITECTURE_BASELINE_TEMPLATE.md`](templates/ARCHITECTURE_BASELINE_TEMPLATE.md) | Shared system boundaries, ownership, data flow, security, testing, and deployment |
| [`FEATURE_REQUIREMENTS_TEMPLATE.md`](templates/FEATURE_REQUIREMENTS_TEMPLATE.md) | Observable feature behavior, rules, constraints, edge cases, and acceptance criteria |
| [`FEATURE_DESIGN_TEMPLATE.md`](templates/FEATURE_DESIGN_TEMPLATE.md) | Feature-local technical approach, contracts, failure handling, security, and trade-offs |
| [`FEATURE_TASKS_TEMPLATE.md`](templates/FEATURE_TASKS_TEMPLATE.md) | Bounded executable task contracts and dependency ordering |
| [`FEATURE_VERIFICATION_TEMPLATE.md`](templates/FEATURE_VERIFICATION_TEMPLATE.md) | Requirement-to-evidence mapping and verification results |
| [`ADR_TEMPLATE.md`](templates/ADR_TEMPLATE.md) | Significant architecture/engineering decision record |
| [`BUG_INVESTIGATION_TEMPLATE.md`](templates/BUG_INVESTIGATION_TEMPLATE.md) | Evidence-driven debugging and root-cause investigation |
| [`AI_TASK_PROMPT_TEMPLATE.md`](templates/AI_TASK_PROMPT_TEMPLATE.md) | Minimum-sufficient-context package for repository coding agents |
| [`CODE_REVIEW_TEMPLATE.md`](templates/CODE_REVIEW_TEMPLATE.md) | Correctness-, architecture-, security-, and risk-oriented review |
| [`CONTEXT_REFRESH_TEMPLATE.md`](templates/CONTEXT_REFRESH_TEMPLATE.md) | Substantial truth-maintenance/context-refresh audit record |

A template is **not project truth by itself**. Copy or instantiate only the artifact needed by the project, replace placeholders with verified repository facts, review it, then commit it in the appropriate canonical location.

## Recommended derived-project documentation model

```text
repository/
├── README.md
├── AGENTS.md
├── CLAUDE.md                 # optional thin provider adapter
└── docs/
    ├── product/
    ├── architecture/
    ├── features/
    ├── decisions/
    ├── operations/
    └── references/
```

Typical ownership:

- `README.md` — human repository entrypoint;
- `AGENTS.md` — frequently relevant repository rules, commands, boundaries, prohibited actions, and Definition of Done;
- `docs/product/` — product intent and scope;
- `docs/architecture/` — cross-feature technical structure and invariants;
- `docs/features/` — feature requirements/design/tasks/verification;
- `docs/decisions/` — ADRs and durable technical rationale;
- `docs/operations/` — deploy, migration, recovery, and operational procedures;
- `docs/references/` — useful non-canonical supporting material.

## AI collaboration model

### Conversational AI

Best used for:

- idea/problem framing;
- PRD and requirements;
- UX/flow analysis;
- architecture alternatives;
- feature design;
- task decomposition;
- ADR proposals;
- review and context-maintenance analysis.

Its output is a proposal until reviewed and stored in the project’s canonical system.

### Repository-integrated coding agent

Best used for work that depends on repository reality:

- inspecting actual code, tests, schemas, migrations, and commands;
- validating planned artifacts against current implementation;
- implementing approved tasks;
- running verification;
- inspecting diffs;
- updating evidence and durable documentation when truth changed.

A coding agent must not invent paths, APIs, schema fields, commands, or repository patterns it has not inspected.

## Context automation: optional extension

The original template includes a repository context subsystem under `docs/context/`, `docs/handoff/`, automation scripts, and validation workflow. Those files are retained during the v2 transition for compatibility and as a reference implementation.

They are **not a universal requirement** of the new operating model.

Adopt machine-readable execution state, generated snapshots, handoff files, hooks, or provider commands only when a project demonstrates repeated needs such as:

- multi-agent or multi-developer handoffs;
- repeated context-recovery cost;
- complex parallel execution state;
- stale status views that deterministic generation can prevent.

When such automation is used, repository-native state remains canonical, generated views are one-way, repeated generation is deterministic/idempotent, and provider memory remains an adapter.

## Starting a new project

1. Define the product problem and desired outcome.
2. Instantiate `templates/PRD_TEMPLATE.md`.
3. Instantiate `templates/PROJECT_CONSTITUTION_TEMPLATE.md` for durable governance when the project warrants it.
4. Select technology deliberately and record expensive-to-reverse decisions with ADRs.
5. Instantiate `templates/ARCHITECTURE_BASELINE_TEMPLATE.md`.
6. Establish real repository structure and development commands.
7. Instantiate `templates/AGENTS_TEMPLATE.md` as the project’s repository contract.
8. Select the first vertical slice.
9. Create proportional feature requirements/design/tasks.
10. Implement one bounded task at a time and verify against evidence.
11. Refresh durable context after meaningful truth changes.

Do not create every possible document or automation subsystem before the first useful vertical slice.

## Migration from the original template

This update intentionally does **not** delete the original `docs/context/`, `docs/specs/_templates/`, handoff, automation, or validation files. Existing projects may already depend on them.

Treat those artifacts as legacy/reference until the project explicitly calibrates which v2 protocols replace, retain, or simplify them. Migration should be deliberate rather than a mass rewrite.

## Repository template philosophy

This repository should make good engineering behavior easy to adopt while avoiding a second failure mode: a framework so heavy that developers bypass it.

The target is:

```text
clear requirements
+ minimum sufficient context
+ explicit architecture
+ bounded tasks
+ small changes
+ evidence-based verification
+ current durable documentation
+ human control of high-impact decisions
```

—not maximum document count or maximum AI autonomy.
