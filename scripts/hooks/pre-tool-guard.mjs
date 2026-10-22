#!/usr/bin/env node

import path from 'node:path';

// fileMatch steering reaches Claude Code through `.claude/rules/*.md` with `paths:` (ADR-0003), which
// loads on a matching read or edit, so this hook only guards.
// Lib imports are dynamic so a missing node_modules denies the edit instead of silently disabling the guard.
try {
  const [{ runHook, projectRoot, hookConfig, relativeTo, emit }, { guardDecision, guardShellCommand }] = await Promise.all([
    import('../lib/hook-io.mjs'),
    import('../lib/guard.mjs')
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
    if (decision) refuse(decision);
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
