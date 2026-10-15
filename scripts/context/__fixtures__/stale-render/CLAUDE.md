<!-- GENERATED FILE — DO NOT EDIT. Rendered by `npm run adapters:sync`.
Source: docs/steering/, sdd.config.json.
source_hash: 9298244495368c0424766c38d9dde8a4efedfff0f72590ee6600ee56158352c8 -->

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

No hooks configured.

No slash commands configured.
