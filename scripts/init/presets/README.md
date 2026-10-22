# Init presets

One JSON file per stack; adding a stack is adding a file. `npm run init --app <name> --db <name>` loads `app/<name>.json` and `db/<name>.json`, validates them against the schema below (`scripts/init/lib/presets.mjs`, tested for every file in `scripts/init/presets.test.mjs`), and fills the `{{PRESET_*}}` placeholders in `docs/steering/tech.md`, `docs/steering/structure.md`, and `CONTRIBUTING.md`. In the `full` tier it also fills `docs/runbooks/database-migrations.md`.

## `app/<name>.json`

| Key | Type | Fills |
|---|---|---|
| `label` | string | `{{PRESET_APP}}`, the default project description |
| `language` | string | `{{PRESET_LANGUAGE}}` |
| `commands` | object with exactly `install`, `dev`, `format`, `lint`, `typecheck`, `test`, `build`; each a string or `null` | `{{PRESET_INSTALL}}` and so on; `null` renders as `none` |
| `structure` | 3 to 6 rows of `{path, responsibility, rule}` | the `{{PRESET_STRUCTURE_ROWS}}` row of `structure.md` |
| `fileMatch` | 1 or more globs for source and test paths | `{{PRESET_FILE_MATCH}}` |
| `notes` | up to 5 one-line rules | the `{{PRESET_APP_NOTES}}` bullets under "Stack rules" in `tech.md` |
| `generatedPaths` | globs of generated code (`[]` when none) | merged into `generated` in `sdd.config.json` and `{{GENERATED_CODE_PATHS_OR_NONE}}` in `structure.md` |
| `gitignore` | `.gitignore` lines (`[]` when none) | appended to `.gitignore` under the `# sdd preset` marker, skipping lines already present |
| `ci` | `{setup, run}`: `setup` lists GitHub Actions steps `{name, uses, version, with?}` that install the toolchain, with `uses` pinned to a full commit SHA and `version` naming its release (rendered as a comment Dependabot reads); `run` lists, in order, the command keys CI runs, each with a non-`null` command, never `dev` | `.github/workflows/context-integrity.yml`, which init writes in place of the template CI |

Commands are real commands of that ecosystem, not project-specific npm scripts the preset cannot know, and never contain `reset`, `drop`, or `--force` (`rules.md` forbids them without approval). `generic` sets every command to `null`.

The workflow always sets up Node 22 and ends with `npm ci`, `npm test`, and `npm run context:validate -- --strict` for the SDD tooling; when the preset's own install or test is `npm ci` or `npm test`, it runs once. `react-native` leaves `build` out of `ci.run` because `npx expo run:android` installs on a device or emulator, which a CI runner does not have.

## `db/<name>.json`

| Key | Type | Fills |
|---|---|---|
| `label` | string | `{{PRESET_DB}}` |
| `migrationTool` | string or `null` | `{{PRESET_DB_MIGRATION_TOOL}}` |
| `migrationCommand` | string or `null` | `{{PRESET_DB_MIGRATION_COMMAND}}` (also the "Data store change check" row) |
| `migrationPath` | string or `null` | `{{PRESET_DB_MIGRATION_PATH}}` |
| `notes` | one-line rules: append-only rule, how destructive changes are reviewed, the authorization mechanism (RLS, Security Rules, drift migrations, schema validation) | the `{{PRESET_DB_NOTES}}` bullets of the runbook and the Rules section of the generated `database.md` steering file |
| `fileMatch` | globs | `fileMatchPattern` of the `database.md` steering file, created with `inclusion: fileMatch` when the preset is not `none` |
| `gitignore` | `.gitignore` lines (`[]` when none) | appended to `.gitignore` under the `# sdd preset` marker, after the app preset's lines |

`none` has `null` for the three migration keys and empty `notes`, `fileMatch`, and `gitignore`; init then writes `none` in `tech.md` and creates no `database.md`.

## Adding a preset

1. Copy the closest file, rename it, edit every key.
2. `npm test` runs the schema check for the new file and `npm run init -- --dry-run --yes --app <name>` shows what it fills.
3. Keep notes to facts an agent cannot infer from the repository: the rule, the trap, the command that proves it.
