---
id: DOCS-MODULARIZATION
title: Documentation Modularization Guide
status: template
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
---

# Documentation Modularization Guide

## 1. Decision rule

Split a document when at least one condition is true:

1. Sections have different canonical owners.
2. Sections change at materially different frequencies.
3. A normal task needs only one section and should not load the rest.
4. A section has its own approval or Definition of Done.
5. The file mixes durable contracts with temporary execution state.
6. Two sections can conflict independently.
7. The file is becoming a merge-conflict hotspot.

Do not split only because a file crosses a precise line count.

## 2. Operational size signals

| Size | Guidance |
|---|---|
| Under 200 lines | Usually safe |
| 200–400 lines | Normal for a focused specification |
| 400–600 lines | Review concern boundaries |
| 600–800 lines | Modularization is usually justified |
| Over 800 lines | Treat as a mandatory architecture review |

Exceptions include generated references, database dictionaries, API references, changelogs, and exhaustive test reports.

## 3. Never use meaningless parts

Avoid:

```text
architecture-part-1.md
architecture-part-2.md
architecture-part-3.md
```

Use responsibility-based names:

```text
architecture/
├── overview.md
├── boundaries.md
├── data/
├── integration/
├── security/
└── deployment/
```

A filename must answer: **what question is this file authoritative for?**

## 4. File-to-folder promotion

Start simple:

```text
docs/architecture/
├── overview.md
├── boundaries.md
├── data-model.md
├── api-contracts.md
└── security.md
```

When a concern grows, promote the file into a folder:

```text
docs/architecture/security/
├── README.md
├── authentication.md
├── authorization.md
├── data-protection.md
└── threat-model.md
```

After promotion:

- remove the old complete source file;
- make the folder `README.md` the index;
- update links and canonical-source tables;
- do not keep two complete versions.

## 5. Architecture split rules

Global architecture contains cross-feature invariants:

- dependency direction;
- system and trust boundaries;
- shared persistence strategy;
- global authentication and authorization;
- deployment topology;
- integration principles.

Feature-specific decisions remain in:

```text
docs/specs/F-XXX-feature/design.md
```

Promote a local design into global architecture only after it becomes an approved reusable rule.

## 6. ADR split rules

One decision equals one ADR.

Good:

```text
0001-use-supabase-as-direct-backend.md
0002-enforce-rls-for-tenant-isolation.md
0003-use-supabase-auth.md
0004-avoid-edge-functions-for-mvp.md
```

Bad:

```text
0001-all-backend-decisions.md
```

An ADR normally stays between 30 and 120 lines. Review any ADR beyond 200 lines for multiple decisions.

Keep ADRs in one flat numbered directory until navigation genuinely becomes difficult.

## 7. Feature specification split rules

Default structure:

```text
docs/specs/F-XXX-feature/
├── requirements.md
├── design.md
├── tasks.md
└── verification.md
```

When a feature produces a 1,000-line design, first ask whether it combines independent vertical capabilities.

Prefer:

```text
F-012-cart-management/
F-013-discount-calculation/
F-014-payment-processing/
F-015-receipt-generation/
```

over one oversized checkout specification.

Only use advanced subfolders after scope reduction:

```text
F-014-payment-processing/
├── README.md
├── requirements/
│   ├── functional.md
│   ├── business-rules.md
│   └── non-functional.md
├── design/
│   ├── overview.md
│   ├── data-flow.md
│   ├── state-management.md
│   ├── error-handling.md
│   └── security.md
├── tasks.md
└── verification/
    ├── acceptance-matrix.md
    ├── automated-tests.md
    └── manual-scenarios.md
```

## 8. Context size limits

| Artifact | Target |
|---|---|
| `CONTEXT_INDEX.md` | 40–120 lines |
| `PROJECT_STATE.md` | 60–180 generated lines |
| `handoff/current.md` | 60–180 lines |
| `PROGRESS.md` | May be longer; loaded only on demand |

If `PROJECT_STATE.md` contains full backlog history, architecture prose, or all completed tasks, move that material to its canonical artifact.

## 9. Index requirement

Every modular folder has a `README.md` containing:

- purpose;
- canonical ownership;
- reading order;
- child-file table;
- extension rules;
- related artifacts.

## 10. Safe modularization procedure

1. Identify the distinct questions answered by the original file.
2. Assign one canonical destination per question.
3. Create the folder index and child files.
4. Move content without changing meaning.
5. Replace copied text with links.
6. Update references and validation configuration.
7. Verify no second source of truth remains.
8. Commit the move separately from semantic changes when practical.
