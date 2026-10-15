#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { runHook, projectRoot, hookConfig, relativeTo, emit } from '../lib/hook-io.mjs';
import { guardDecision } from '../lib/guard.mjs';
import { loadSteering, steeringFor } from '../lib/steering.mjs';

const SESSION_DIR = '.claude/.sdd-session';

runHook('pre-tool-guard', (payload) => {
  const root = projectRoot(payload);
  const config = hookConfig(root);
  if (!config.hooks.enabled) return;

  const rawPath = payload.tool_input?.file_path;
  if (!rawPath) return;
  const relativePath = relativeTo(root, rawPath);

  const decision = guardDecision(relativePath, config, rawPath);
  if (decision) {
    emit({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: decision.reason } });
    return;
  }
  if (relativePath === null) return;

  const session = readSession(root, payload.session_id);
  const fresh = steeringFor(relativePath, loadSteering(root, config)).filter((entry) => !session.surfaced.includes(entry.name));
  if (!fresh.length) return;
  session.surfaced.push(...fresh.map((entry) => entry.name));
  writeSession(root, payload.session_id, session);

  const context = fresh
    .map((entry) => `SDD steering: ${entry.file} applies to ${relativePath} (pattern ${entry.patterns.join(', ')}). Follow it for this and later edits:\n\n${entry.body.trim()}`)
    .join('\n\n');
  emit({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: context } });
});

function sessionFile(root, sessionId) {
  const id = String(sessionId ?? 'default').replace(/[^\w-]/g, '_');
  return path.join(root, SESSION_DIR, `${id}.json`);
}

function readSession(root, sessionId) {
  try {
    const parsed = JSON.parse(fs.readFileSync(sessionFile(root, sessionId), 'utf8'));
    return { surfaced: Array.isArray(parsed.surfaced) ? parsed.surfaced : [] };
  } catch {
    return { surfaced: [] };
  }
}

function writeSession(root, sessionId, session) {
  const file = sessionFile(root, sessionId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(session));
}
