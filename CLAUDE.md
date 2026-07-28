@AGENTS.md

# Claude Code Addendum

- Use planning mode before changes that span more than one architectural layer.
- Treat repository artifacts as project memory; do not rely on cross-session chat memory for project facts.
- Update `docs/handoff/current.md` before ending an implementation session.
- Prefer deterministic hooks or scripts for formatting and validation.
- Do not place temporary session details in this file.
