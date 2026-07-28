---
id: QUALITY-REVIEW
title: Review Checklist
status: approved
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
---

# Review Checklist

## Scope and traceability

- [ ] Change references feature, task, and requirement IDs.
- [ ] Out-of-scope behavior is explicit.
- [ ] Approved requirements were not silently rewritten.
- [ ] Architecture changes have an ADR.

## Implementation

- [ ] Diff is limited to intended scope.
- [ ] Existing project patterns are preserved.
- [ ] Error, concurrency, and security paths are handled.
- [ ] Database and public-contract changes are compatible or intentionally migrated.

## Verification

- [ ] Required format, lint, tests, and build checks ran.
- [ ] Acceptance evidence is recorded.
- [ ] Manual verification covers critical UX or operational paths.
- [ ] Residual risks are stated.

## Documentation modularity

- [ ] No manual document became a mixed-responsibility knowledge dump.
- [ ] Files are split by responsibility, authority, and change cadence.
- [ ] No `part-1` / `part-2` naming was introduced.
- [ ] Modular folders have a `README.md` index.
- [ ] One ADR records one decision.
- [ ] Oversized features were considered for vertical capability splitting.

## Context integrity

- [ ] `docs/context/state.yaml` owns mutable execution status.
- [ ] `PROJECT_STATE.md` and `PROGRESS.md` were generated, not edited manually.
- [ ] Generated views are current.
- [ ] Feature registry and strategic roadmap do not duplicate task progress.
- [ ] Handoff matches branch, worktree, feature, and task.
- [ ] Provider memory or hooks are adapters, not canonical state.
- [ ] No hardcoded developer-specific absolute path was committed.

## AI ownership

- [ ] Conversational AI output was reviewed before becoming authoritative.
- [ ] Repository-dependent claims were checked by a coding agent or human against the real repo.
- [ ] Automation did not make semantic approval decisions.
