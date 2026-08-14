@AGENTS.md

# Claude Code Adapter

Claude Code is a repository-integrated coding agent for this template and derived projects.

- Read and follow the applicable `AGENTS.md` contract first.
- Treat repository artifacts as durable project context; provider memory is an adapter, never the only source of truth.
- Inspect actual code, tests, schemas, migrations, and project commands before asserting repository facts.
- Do not duplicate the full repository contract in this file.
- Context hooks, generated project-state views, handoff files, or task-transition commands are optional extensions. Use them only when the derived repository has explicitly adopted that subsystem.
- Do not automatically bootstrap `docs/context/CONTEXT_SYSTEM.md` merely because the legacy template contains it.
- Hooks may validate or surface deterministic repository state, but must not make semantic product, architecture, security, or acceptance decisions.
- Keep provider-specific local paths and session details out of canonical project documentation.
