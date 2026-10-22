#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Claude Code caps a single additionalContext string at 10,000 characters.
const CONTEXT_CAP = 10000;

// A cloud session starts from a fresh clone: install the tooling before importing it, so the brief
// and the guard work there too. Locally a missing node_modules stays a warning for the owner.
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
let installNote = '';
if (process.env.CLAUDE_CODE_REMOTE === 'true' && !fs.existsSync(path.join(root, 'node_modules', 'yaml'))) {
  const install = spawnSync('npm', ['ci', '--no-audit', '--no-fund'], { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' });
  installNote = install.status === 0 ? 'SDD: installed the tooling with npm ci (cloud session).\n' : `SDD: npm ci failed in the cloud session (${(install.stderr || '').trim().split('\n').pop()}).\n`;
}

// Lib imports are dynamic so a missing node_modules warns the model instead of crashing the hook.
try {
  const [{ runHook, projectRoot, hookConfig, emit }, { briefText }] = await Promise.all([
    import('../lib/hook-io.mjs'),
    import('../lib/brief.mjs')
  ]);

  runHook('session-start', (payload) => {
    const projectDir = projectRoot(payload);
    const config = hookConfig(projectDir);
    if (!config.hooks.enabled) return;
    emit({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: cap(installNote + briefText(projectDir, config)) } });
  });
} catch (cause) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: `${installNote}SDD hook session-start unavailable (${cause.message}); run npm install` } }));
  process.exitCode = 0;
}

function cap(text) {
  if (text.length <= CONTEXT_CAP) return text;
  const note = '\n[truncated: read docs/context/BRIEF.md directly]';
  return text.slice(0, CONTEXT_CAP - note.length) + note;
}
