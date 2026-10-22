#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const SESSION_DIR = '.claude/.sdd-session';

// Lib imports are dynamic so a missing node_modules denies the edit instead of silently disabling the guard.
try {
  const [{ runHook, projectRoot, hookConfig, relativeTo, emit }, { guardDecision, guardShellCommand }, { loadSteering, steeringFor }] = await Promise.all([
    import('../lib/hook-io.mjs'),
    import('../lib/guard.mjs'),
    import('../lib/steering.mjs')
  ]);
  const SHELL_TOOLS = new Set(['Bash', 'PowerShell']);
  const READ_TOOLS = new Set(['Read']);
  const refuse = (decision) =>
    emit({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: decision.decision, permissionDecisionReason: decision.reason } });

  runHook('pre-tool-guard', (payload) => {
    const input = payload.tool_input ?? {};

    if (SHELL_TOOLS.has(payload.tool_name)) {
      const root = projectRoot(payload);
      const config = hookConfig(root);
      if (!config.hooks.enabled || typeof input.command !== 'string') return;
      const base = payload.cwd || root;
      const decision = guardShellCommand(input.command, config, (raw) => relativeTo(root, path.resolve(base, expandProjectDir(raw, root))));
      if (decision) refuse(decision);
      return;
    }

    const rawPath = input.file_path ?? input.notebook_path;
    if (!rawPath) return;
    const root = projectRoot(payload, rawPath);
    const config = hookConfig(root);
    if (!config.hooks.enabled) return;
    const relativePath = relativeTo(root, path.resolve(payload.cwd || root, String(rawPath).replace(/\\/g, '/')));

    const decision = guardDecision(relativePath, config, rawPath, READ_TOOLS.has(payload.tool_name) ? 'read' : 'write');
    if (decision) {
      refuse(decision);
      return;
    }
    if (relativePath === null || READ_TOOLS.has(payload.tool_name)) return;

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
} catch (cause) {
  process.stderr.write(`pre-tool-guard: ${cause.message}\n`);
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: 'SDD guard unavailable: run npm install' } }));
  process.exitCode = 0;
}

// Git Bash on Windows writes `/d/Projects/x`; path.resolve would read that as `D:\d\Projects\x`.
function expandProjectDir(raw, root) {
  const expanded = String(raw)
    .replace(/^(?:\$\{CLAUDE_PROJECT_DIR\}|\$CLAUDE_PROJECT_DIR|\$env:CLAUDE_PROJECT_DIR)/, root.replace(/\\/g, '/'))
    .replace(/\\/g, '/');
  return process.platform === 'win32' ? expanded.replace(/^\/([A-Za-z])\//, '$1:/') : expanded;
}

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
