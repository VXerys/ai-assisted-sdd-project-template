# Feature Registry

This is the canonical feature-level status registry. Detailed task status remains only in each feature's `tasks.md`.

| ID | Feature | Status | Priority | Owner | Spec | Active sprint | Release |
|---|---|---|---|---|---|---|---|
| F-001 | {{FEATURE_NAME}} | Draft | P0 | {{OWNER}} | `F-001-feature-name/` | — | — |

## Allowed Statuses

- Draft
- Review
- Approved
- Implementing
- Verification
- Implemented
- Superseded

## Registry Rules

1. Every feature folder has exactly one registry row.
2. A feature can be `Approved` only when requirements and design are approved.
3. A feature can be `Implemented` only when verification and human acceptance are complete.
4. Do not put task-level progress in this file.
5. Superseded features remain listed with a link to their replacement.
