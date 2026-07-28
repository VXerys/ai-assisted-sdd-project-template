# Definition of Done

## Task Done

A task is done only when:

- [ ] Every referenced requirement and acceptance criterion is addressed.
- [ ] Implementation follows the approved design and repository boundaries.
- [ ] Relevant format, lint, test, and build checks pass.
- [ ] Success, empty, error, validation, and authorization paths are handled where relevant.
- [ ] No secrets, personal production data, or unrelated changes are included.
- [ ] Database changes use versioned migrations.
- [ ] Public API or schema changes include compatibility analysis.
- [ ] Task status and implementation notes are updated.
- [ ] Verification evidence is recorded.
- [ ] Session handoff reflects the actual worktree.

## Feature Done

A feature is done only when:

- [ ] Every requirement has acceptance evidence.
- [ ] Automated tests cover critical business rules and regressions.
- [ ] Critical manual scenarios pass in the target environment.
- [ ] Security and authorization behavior is verified.
- [ ] Migration and rollback behavior is verified when applicable.
- [ ] Observability is sufficient for production support when applicable.
- [ ] Documentation and runbooks are current.
- [ ] No unresolved P0 or P1 defect remains.
- [ ] The human product owner accepts the feature.

## Release Done

A release is done only when:

- [ ] Included features are accepted.
- [ ] Release notes describe user-visible and operational changes.
- [ ] Deployment and rollback steps are confirmed.
- [ ] Environment configuration is verified without exposing secrets.
- [ ] Monitoring and incident ownership are clear.
- [ ] `PROJECT_STATE.md`, roadmap, and feature registry are refreshed.

A checked task is not evidence by itself. Completion requires reproducible checks or documented manual evidence.
