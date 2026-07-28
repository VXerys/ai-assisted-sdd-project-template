## Specification

- Feature: `F-XXX`
- Tasks: `TASK-XXX`
- Requirements: `FR-XXX`, `AC-XXX.Y`
- Related ADRs: None / `ADR-NNNN`

## Change

### Summary

<!-- Explain the implemented outcome, not only the files changed. -->

### Out of scope

<!-- State what this PR intentionally does not change. -->

## Architecture and contracts

- [ ] No architecture or public-contract change
- [ ] Architecture change is covered by an accepted ADR
- [ ] Database change uses a versioned migration
- [ ] Compatibility and rollback impact are documented
- [ ] New dependency is approved and justified

## Verification

- [ ] Context sync completed
- [ ] `npm run context:validate` or project equivalent
- [ ] Format check
- [ ] Lint/static analysis
- [ ] Unit tests
- [ ] Integration tests
- [ ] Build
- [ ] Critical manual acceptance

Evidence:

```text
Paste concise command results or link to feature verification evidence.
```

## Documentation architecture

- [ ] No raw chat history or giant manual context file added
- [ ] Long documents were reviewed for responsibility-based splitting
- [ ] Modular folders include a `README.md` index
- [ ] One ADR contains one decision
- [ ] Feature scope was split before introducing deep spec nesting
- [ ] No duplicated canonical facts remain

## Context impact

- [ ] `docs/context/state.yaml` updated through the context tooling
- [ ] `PROJECT_STATE.md` regenerated
- [ ] `PROGRESS.md` regenerated
- [ ] `docs/handoff/current.md` updated
- [ ] Feature registry or roadmap updated only when durable intent changed
- [ ] Provider adapter remains non-canonical and portable
- [ ] No context impact, with reason below

Reason or notes:

<!-- Explain unchecked items. -->

## Security and data

- [ ] Authorization remains enforced at a trusted boundary
- [ ] No secret or real sensitive data is included
- [ ] Logging does not expose sensitive values
- [ ] Destructive operations and migration risks are reviewed

## Remaining risks

<!-- Use "None" only when no material residual risk remains. -->

## Reviewer focus

<!-- Identify the highest-risk logic, contract, migration, context, or UX behavior. -->
