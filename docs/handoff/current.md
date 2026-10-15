---
status: inactive
owner: ""
session_date: ""
branch: ""
base_commit: ""
current_commit: ""
feature_id: ""
task_id: ""
expires_after: ""
---

# Session Handoff

No active handoff. The session that starts work sets `status: active`, fills the frontmatter (owner, `session_date`, branch, `base_commit`, `current_commit`, `feature_id`, `task_id`, `expires_after`), and writes these sections: Session objective, Context used, Completed, Requirement coverage, Changed files, Commands executed, Current implementation state, Uncommitted work, Blockers, Decisions made during session, Context updates, Exact next step (one action, expected files, verification command), Do not do next, Validity. Repository-relative paths only; no secrets. In Claude Code, `/sdd:handoff` writes it; `npm run context:archive-handoff` archives it and restores this file.
