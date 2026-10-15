import { parseFrontmatter, scalar } from './frontmatter.mjs';
import { section } from './markdown.mjs';

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
