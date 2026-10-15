---
id: ADR-0001
title: Template v2 revamp — single source of truth, rendered context, enforced traceability
type: adr
status: approved
tier: full
owner: VXerys
created: 2026-10-15
last_updated: 2026-10-15
last_verified: 2026-10-15
supersedes: null
---

# ADR-0001: Template v2 revamp

## Context

Three derived projects (bookmeet, klinik-cikidang-medika, visualkain-financial-analytics) use v1 of this template. An audit on 2026-10-14 found:

- Two incompatible template families (`templates/` without frontmatter, `docs/specs/_templates/` with frontmatter) and conflicting "canonical" pointers.
- The context system is described but not built: `state.yaml` is never parsed, `PROJECT_STATE.md`/`PROGRESS.md` are stubs, hooks and commands mentioned in docs do not exist.
- Task status has three homes (`state.yaml`, `tasks.md` checkboxes, v2 vocabulary) with no sync rule.
- 2,100+ `{{...}}` placeholders, no init script, 10 templates over 200 lines.
- Supabase/SQL assumptions leaked into stack-agnostic docs.

Observed failure mode in real use: handoff and state go stale, placeholders stay unfilled, and agents fill the gaps by inventing facts.

## Decision

v2 is a fresh design for new projects. v1 projects stay on v1 until migrated manually.

**Goal.** A project that uses this template is understandable to any human or agent from its docs alone, and agents never need to invent facts to proceed.

**Source of truth.**
- `docs/steering/{product,tech,structure,rules,workflow}.md` is canonical (Kiro-style, ≤120 lines each, `inclusion: always|fileMatch|manual`).
- One template family with mandatory YAML frontmatter; `templates/` is removed.
- `tasks.md` is the master for task status (`### T-001 — title` + key-value block: `status`, `requirements`, `depends_on`, `evidence`).
- Everything else is rendered, never hand-edited: `state.yaml`, `PROJECT_STATE.md`, `PROGRESS.md`, `BRIEF.md`, `AGENTS.md`, and all tool adapters.

**Tooling** (Node 22, dependency `yaml` only, tests with `node:test`):
- `context:render` → `state.yaml` (with `source_hash`), `BRIEF.md` (token-budgeted single entry point), views.
- `context:validate` → parses YAML; tiered traceability (FR↔task warning while drafting, error from `implementing`; `done` without evidence and `implemented` with open tasks are always errors); evidence format (command, output excerpt, date, commit); open-assumption gate; `last_verified` staleness; `source_hash` freshness; size caps (lite ≤80, full ≤200, system-architecture ≤300).
- `adapters:sync` → AGENTS.md, CLAUDE.md, `.cursor/rules`, `.github/copilot-instructions.md`, `GEMINI.md`, `.kiro/steering/` from steering + `sdd.config.json`.
- `init` (interactive + flags) → tier `lite|full`, app preset (`nextjs`, `react-native`, `flutter`, `kotlin-android`, `node-api`, `python-api`, `generic`), database preset (`supabase`, `firebase`, `postgres`, `mysql`, `sqlite-drift`, `mongodb`, `none`), tools. Presets live in `scripts/init/presets/`.
- `docs/context/ASSUMPTIONS.md` (`A-001`, `open|confirmed|rejected`): agents log unknowns instead of guessing; a feature cannot become `implemented` with open assumptions.

**Claude Code integration**, implemented as Node scripts callable by any tool: SessionStart injects BRIEF; PreToolUse blocks edits to generated files, `.env*`, and frozen paths; Stop warns when tasks changed but handoff did not; PostToolUse re-renders after `tasks.md` edits. Slash commands `/sdd:task`, `/sdd:bug`, `/sdd:review`.

**Rules that bind every later change.**
1. No document describes tooling that does not exist in the repo.
2. Templates and validators are stack-agnostic; stack knowledge lives only in `sdd.config.json` and `steering/tech.md`.
3. Framework text is English; project content may be any language.
4. A fully filled `examples/todo-api` (node-api + postgres, lite) ships with the template and doubles as the test fixture.

## Consequences

- Positive: deterministic context per session, "done" is verifiable, one source per fact, works across six agent tools from one source.
- Cost: a `yaml` dependency; render step required before commit (enforced by validator, automated by hook); v1 projects need a manual migration (`docs/MIGRATION-v1-to-v2.md`).
- Release as `2.0.0` with CHANGELOG. Default branch renamed `Queen` → `main` at release.

## Execution

Five phases, one PR each, each green on `npm test` and `npm run context:validate`:
1. Foundation: single template family, steering, `sdd.config.json`, size cuts, stack neutrality.
2. Tooling: render, validate v2, archive-handoff.
3. Adapters, hooks, slash commands, conditional steering.
4. Init with presets, `examples/todo-api`.
5. Release: README, CHANGELOG, MIGRATION, CI, branch cleanup and rename.

## Status

Implemented in 2.0.0 (2026-10-15): the five phases above shipped; the branch rename and the tag are release actions recorded in `CHANGELOG.md`.

## Revisit when

- A derived project needs a status or evidence shape the vocabulary cannot express.
- A target tool gains native support that makes an adapter redundant.
