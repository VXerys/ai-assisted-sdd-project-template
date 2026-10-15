---
inclusion: always          # always | fileMatch | manual
---

# Tech

Stack and commands. `npm run init` fills every `PRESET_` placeholder from the chosen app and database presets (`scripts/init/presets/`); everything else is filled from the real repository. A command listed here must exist and run.

## Stack

| Concern | Technology | Reason or constraint |
|---|---|---|
| Language and runtime | {{PRESET_LANGUAGE}} | |
| Application framework | {{PRESET_APP}} | |
| Data store | {{PRESET_DB}} | relational, document, key-value, embedded local, file, or none |
| Source and test paths | {{PRESET_FILE_MATCH}} | globs used by `fileMatch` steering rules |

Add rows for the backend or API, auth, state management, build tooling, test framework, and deployment target once they are decided. A row that does not apply says `none`, not an invented value. Mobile (Flutter, Kotlin, React Native) and non-relational stores are first-class here.

## Commands

Run these before claiming any task done. Report a command that cannot run; never claim its success. `none` means the preset has no command for that purpose; replace it when the project gains one.

| Purpose | Command |
|---|---|
| Install | `{{PRESET_INSTALL}}` |
| Analyze or lint | `{{PRESET_LINT}}` |
| Typecheck | `{{PRESET_TYPECHECK}}` |
| Format check | `{{PRESET_FORMAT}}` |
| Test | `{{PRESET_TEST}}` |
| Build | `{{PRESET_BUILD}}` |
| Run locally | `{{PRESET_DEV}}` |
| Data store change check | `{{PRESET_DB_MIGRATION_COMMAND}}` |
| Context validation | `npm run context:validate` |

## Stack rules

- {{PRESET_APP_NOTES}}

## Environment and secrets

- Secrets come from the environment or a secret manager; `.env*`, key files, and store credentials are never read, printed, or committed by an agent.
- Example-config files (`.env.example` or equivalent) document required variables without values.

## Dependency policy

Before adding or replacing a dependency, state the problem it solves, the native alternative considered, maintenance health, runtime or bundle impact, and license. Approval rule: the owner approves every new or replaced dependency; record the approval in the task that adds it.

## Data store changes

Schema, rules, index, or migration changes are versioned files in the repository, reviewed like code. Append-only; destructive changes need explicit approval. The store's own rules are in the `database.md` steering file when a database preset was chosen. The full procedure is `docs/runbooks/database-migrations.md` (full tier).
