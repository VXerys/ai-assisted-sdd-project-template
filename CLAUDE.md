@AGENTS.md

# Claude Code adapter

Claude Code is a repository-integrated coding agent for this template and derived projects.

- Follow `AGENTS.md` and the canonical rules in `docs/steering/`.
- Start every session from `docs/context/BRIEF.md`; when it is absent, follow `docs/context/NEW_CHAT_PROTOCOL.md`.
- Repository artifacts are the durable context; provider memory is an adapter, never a source of truth.
- Inspect code, tests, schema, and commands before asserting repository facts.
- Hooks and slash commands (available from 2.0.0) may surface or validate deterministic repository state; they never make product, architecture, security, or acceptance decisions.
- Keep provider-specific local paths and session details out of canonical documentation.
