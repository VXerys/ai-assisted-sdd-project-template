#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

// Warns only; a stop hook that blocks would loop the agent on paperwork (ADR-0001, Claude Code integration).
// Lib imports are dynamic so a missing node_modules warns the model instead of crashing the hook.
try {
  const [{ runHook, projectRoot, hookConfig, emit }, { matchesGlob }] = await Promise.all([import('../lib/hook-io.mjs'), import('../lib/glob.mjs')]);

  runHook('stop-handoff-check', (payload) => {
    if (payload.stop_hook_active) return;
    const root = projectRoot(payload);
    const config = hookConfig(root);
    if (!config.hooks.enabled) return;

    const changed = changedFiles(root);
    if (!changed) return;
    const tasks = changed.filter((file) => matchesGlob(file, `${config.paths.specs}/F-*/tasks.md`));
    if (!tasks.length || changed.includes(config.paths.handoff)) return;

    const message = `SDD: ${tasks.join(', ')} changed but ${config.paths.handoff} did not. Update the handoff (objective, changed files, commands and results, exact next step), then run npm run context:render and npm run context:validate.`;
    emit({ hookSpecificOutput: { hookEventName: 'Stop', additionalContext: message } });
  });
} catch (cause) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'Stop', additionalContext: `SDD hook stop-handoff-check unavailable (${cause.message}); run npm install` } }));
  process.exitCode = 0;
}

// Staged, unstaged, and untracked paths from one porcelain call; null outside a repository.
function changedFiles(root) {
  const result = spawnSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) return null;
  return result.stdout
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).split(' -> ').pop().trim().replace(/^"|"$/g, ''));
}
