<!-- GENERATED FILE — DO NOT EDIT. Rendered by `npm run adapters:sync`.
Source: docs/steering/, sdd.config.json.
source_hash: 51a2736e950b94a68f38009d909a86131feb013dd7416fa1566307ff21a8976b -->

@AGENTS.md

# Claude Code adapter

Claude Code is a repository-integrated coding agent for this project.

- Follow `AGENTS.md` and the canonical rules in `docs/steering/`.
- Start every session from `docs/context/BRIEF.md`; when it is absent, follow `docs/context/NEW_CHAT_PROTOCOL.md`.
- Repository artifacts are the durable context; provider memory is an adapter, never a source of truth.
- Inspect code, tests, schema, and commands before asserting repository facts.
- Hooks and slash commands surface or validate deterministic repository state; they never make product, architecture, security, or acceptance decisions.
- Keep provider-specific local paths and session details out of canonical documentation.

## Hooks and commands

Rendered from `.claude/settings.json` and `.claude/commands/sdd/`.

| Event | Matcher | Script |
|---|---|---|
| SessionStart | `startup\|resume\|compact` | `scripts/hooks/session-start.mjs` |
| PreToolUse | `Edit\|Write\|MultiEdit\|NotebookEdit\|Read\|Bash\|PowerShell` | `scripts/hooks/pre-tool-guard.mjs` |
| PostToolUse | `Edit\|Write\|MultiEdit\|NotebookEdit` | `scripts/hooks/post-tool-render.mjs` |
| Stop | all | `scripts/hooks/stop-handoff-check.mjs` |

| Command | Description |
|---|---|
| `/sdd:adopt` | Onboard an existing codebase - fill steering from the real repository, log pitfalls, propose one bounded first feature |
| `/sdd:bug <title>` | Open a bug investigation file from the template with the next free BUG id |
| `/sdd:converge [F-id]` | Compare the code with a feature's acceptance criteria and append a task for every gap |
| `/sdd:handoff` | Update docs/handoff/current.md from this session, then render and validate |
| `/sdd:render` | Render context views, sync tool adapters, and validate the repository |
| `/sdd:review [git-ref]` | Review a diff against the code-review template; read-only |
| `/sdd:task <T-id>` | Build the task prompt for one T-id from the brief and the spec, then implement it |
