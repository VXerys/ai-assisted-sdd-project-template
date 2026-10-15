#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

import { runHook, projectRoot, hookConfig, emit } from '../lib/hook-io.mjs';
import { collectSourceFiles, sourceHash } from '../context/lib/hash.mjs';

// Claude Code caps a single additionalContext string at 10,000 characters.
const CONTEXT_CAP = 10000;

runHook('session-start', (payload) => {
  const root = projectRoot(payload);
  const config = hookConfig(root);
  if (!config.hooks.enabled) return;

  const briefPath = path.join(root, config.paths.context, 'BRIEF.md');
  const text = fs.existsSync(briefPath) ? fs.readFileSync(briefPath, 'utf8') : null;
  const context = text === null ? fallback(config) : briefContext(root, config, text);
  emit({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: cap(context) } });
});

function briefContext(root, config, text) {
  const lines = [];
  const briefHash = text.match(/source_hash:\s*([0-9a-f]{64})/)?.[1] ?? null;
  const currentHash = sourceHash(collectSourceFiles(root, config));
  if (briefHash !== currentHash) lines.push('SDD brief is stale: sources changed since the last render; run npm run context:render');
  lines.push(`SDD brief (rendered ${generatedAt(root, config)})`);
  lines.push(text.replace(/\r\n/g, '\n').trimEnd());
  return lines.join('\n');
}

function generatedAt(root, config) {
  const statePath = path.join(root, config.paths.context, 'state.yaml');
  try {
    return String(YAML.parse(fs.readFileSync(statePath, 'utf8'))?.generated_at ?? 'unknown time');
  } catch {
    return 'unknown time';
  }
}

function fallback(config) {
  const steering = config.paths.steering;
  return [
    `SDD: ${config.paths.context}/BRIEF.md is absent. Run npm run context:render, or read in this order:`,
    `1. ${steering}/rules.md, ${steering}/tech.md, ${steering}/structure.md, ${steering}/workflow.md, ${steering}/product.md`,
    `2. ${config.paths.handoff}`,
    `3. The active feature's tasks.md under ${config.paths.specs}/ (the one with an in_progress task, otherwise the one the handoff names)`,
    '4. The requirements.md, design.md, and system-architecture.md sections that task references',
    `5. ${config.paths.assumptions}, open entries only`,
    '6. git status, branch, and recent log'
  ].join('\n');
}

function cap(text) {
  if (text.length <= CONTEXT_CAP) return text;
  const note = '\n[truncated: read docs/context/BRIEF.md directly]';
  return text.slice(0, CONTEXT_CAP - note.length) + note;
}
