# Feature Specifications

Each independently deliverable feature owns one folder:

```text
F-001-feature-name/
├── requirements.md
├── design.md
├── tasks.md
└── verification.md
```

## Lifecycle

```text
draft -> review -> approved -> implementing -> verification -> implemented -> superseded
```

## Gate Rules

- Requirements must be approved before design approval.
- Design must be approved before sprint commitment.
- Tasks must reference requirement IDs and approved design sections.
- Verification must map every acceptance criterion to evidence.
- An implemented feature requires human acceptance.

## Feature Naming

- Stable ID: `F-XXX`
- Folder: `F-XXX-short-kebab-case-name`
- Requirement: `FR-XXX`
- Acceptance criterion: `AC-XXX.Y`
- Task: `TASK-XXX`
- Blocker: `BLK-XXX`

IDs remain stable after approval. Do not renumber completed requirements or tasks to make files look tidy.

## Change Control

Approved behavior must not be silently rewritten during implementation. Create a change-impact note covering requirements, design, tasks, tests, migration, compatibility, and current work.
