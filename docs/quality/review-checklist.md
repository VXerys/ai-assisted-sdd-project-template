# Review Checklist

## Scope and Traceability

- [ ] The pull request references feature, task, and requirement IDs.
- [ ] The diff matches the approved task scope.
- [ ] Out-of-scope changes are absent or explicitly justified.

## Architecture

- [ ] Dependency direction is preserved.
- [ ] Existing repository patterns are reused.
- [ ] Cross-cutting decisions have an ADR.
- [ ] New dependencies are approved and justified.

## Correctness

- [ ] Happy path and failure paths are handled.
- [ ] State transitions and concurrency behavior are deterministic.
- [ ] Data validation exists at the correct boundary.
- [ ] Compatibility and migration impact are addressed.

## Security

- [ ] Authentication and authorization are enforced server-side or at the trusted boundary.
- [ ] Secrets and sensitive data are not committed or logged.
- [ ] Destructive operations require appropriate confirmation and permission.

## Verification

- [ ] Relevant checks pass.
- [ ] Regression tests accompany bug fixes.
- [ ] Acceptance evidence is recorded.
- [ ] Remaining risks are explicit.

## Context Integrity

- [ ] Task status is updated only in the canonical `tasks.md`.
- [ ] Project state is updated when durable state changed.
- [ ] Handoff matches the final worktree.
- [ ] No raw chat transcript was added as project documentation.
