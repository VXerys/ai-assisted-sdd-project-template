---
inclusion: always          # always | fileMatch | manual
---

# Tech

Stack and commands. Stack-agnostic by default; an app or database preset (available from 2.0.0) fills the placeholders. Until then, fill them from the real repository: a command listed here must exist and run.

## Stack

| Concern | Technology | Version | Reason or constraint |
|---|---|---|---|
| Language and runtime | {{LANGUAGE_RUNTIME}} | | |
| Application framework | {{APP_FRAMEWORK}} | | |
| Backend or API | {{BACKEND_OR_NONE}} | | |
| Data store | {{DATA_STORE_OR_NONE}} | | relational, document, key-value, embedded local, or file |
| Auth | {{AUTH_OR_NONE}} | | |
| State management | {{STATE_MANAGEMENT_OR_NA}} | | |
| Package and build tooling | {{BUILD_TOOLING}} | | |
| Test framework | {{TEST_FRAMEWORK}} | | |
| Deployment target | {{DEPLOYMENT_TARGET}} | | web, mobile store, server, desktop |

Mobile (Flutter, Kotlin, React Native) and non-relational stores are first-class here. A row that does not apply says `none`, not an invented value.

## Commands

Run these before claiming any task done. Report a command that cannot run; never claim its success.

| Purpose | Command |
|---|---|
| Install | `{{INSTALL_COMMAND}}` |
| Analyze or lint | `{{ANALYZE_COMMAND}}` |
| Typecheck | `{{TYPECHECK_COMMAND_OR_NONE}}` |
| Format check | `{{FORMAT_COMMAND_OR_NONE}}` |
| Test | `{{TEST_COMMAND}}` |
| Build | `{{BUILD_COMMAND}}` |
| Run locally | `{{DEV_COMMAND}}` |
| Data store change check | `{{DATA_CHANGE_CHECK_COMMAND_OR_NONE}}` |
| Context validation | `npm run context:validate` |

## Environment and secrets

- Secrets come from the environment or a secret manager; `.env*`, key files, and store credentials are never read, printed, or committed by an agent.
- Example-config files (`.env.example` or equivalent) document required variables without values.

## Dependency policy

Before adding or replacing a dependency, state the problem it solves, the native alternative considered, maintenance health, runtime or bundle impact, and license. Approval rule: {{DEPENDENCY_APPROVAL_RULE}}.

## Data store changes

Schema, rules, index, or migration changes are versioned files in the repository, reviewed like code. Append-only; destructive changes need explicit approval. Per-store procedure: `docs/runbooks/database-migrations.md`.
