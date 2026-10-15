import { parseFrontmatter, scalar } from './frontmatter.mjs';
import { section } from './markdown.mjs';

// The shape of docs/handoff/current.md between sessions: written by archive-handoff and shipped by the template.
export const INACTIVE_HANDOFF = `---
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

No active handoff. The session that starts work sets \`status: active\`, fills the frontmatter (owner, \`session_date\`, branch, \`base_commit\`, \`current_commit\`, \`feature_id\`, \`task_id\`, \`expires_after\`), and writes these sections: Session objective, Context used, Completed, Requirement coverage, Changed files, Commands executed, Current implementation state, Uncommitted work, Blockers, Decisions made during session, Context updates, Exact next step (one action, expected files, verification command), Do not do next, Validity. Repository-relative paths only; no secrets. In Claude Code, \`/sdd:handoff\` writes it; \`npm run context:archive-handoff\` archives it and restores this file.
`;

// `feature_id`/`task_id` are the v2 keys; `active_feature`/`active_task` are kept as fallbacks.
export function parseHandoff(text) {
  const { data, body, error } = parseFrontmatter(text);
  const meta = data ?? {};
  const nextStep = section(body, /exact next step/i);
  return {
    status: scalar(meta.status) ?? 'inactive',
    feature_id: scalar(meta.feature_id) ?? scalar(meta.active_feature),
    task_id: scalar(meta.task_id) ?? scalar(meta.active_task),
    session_date: scalar(meta.session_date),
    expires: scalar(meta.expires) ?? scalar(meta.expires_after),
    nextStep: nextStep && !/\{\{/.test(nextStep) ? stripFences(nextStep) : null,
    error
  };
}

function stripFences(text) {
  return text
    .split('\n')
    .filter((line) => !/^\s*(`{3,}|~{3,})/.test(line))
    .join('\n')
    .trim();
}
