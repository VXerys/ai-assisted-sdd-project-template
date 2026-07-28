@AGENTS.md

# Claude Code Adapter

Claude Code is a repository-integrated coding agent in this project.

- Treat repository artifacts as canonical project memory.
- On first use in a derived project, implement or verify the context system described in `docs/context/CONTEXT_SYSTEM.md`.
- Create a `SessionStart` hook only after discovering the real repository path and available commands.
- The hook may sync and validate context, but must not write semantic decisions.
- Expose concise project commands for context status and task transitions when useful.
- Never make Claude's local memory directory the only source of project state.
- Update `docs/handoff/current.md` before ending implementation work.
- Do not place temporary session details in this file.
