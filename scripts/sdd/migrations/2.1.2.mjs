// `.gitignore` belongs to the project and is never managed, so the Claude Code entries the template
// added in 2.1.0 (worktree sessions, subagent memory) are appended here when a project lacks them.
import fs from 'node:fs';
import path from 'node:path';

export const CLAUDE_IGNORES = ['.claude/settings.local.json', '.claude/.sdd-session/', '.claude/worktrees/', '.claude/agent-memory/'];

// Pure: returns the ignore file with the missing entries appended under one comment, and how many were added.
export function ensureIgnoreEntries(text, entries = CLAUDE_IGNORES) {
  const normalized = String(text ?? '').replace(/\r\n/g, '\n');
  const present = new Set(normalized.split('\n').map((line) => line.trim().replace(/\/$/, '')));
  const missing = entries.filter((entry) => !present.has(entry.replace(/\/$/, '')));
  if (missing.length === 0) return { text: normalized, added: 0 };
  const separator = normalized === '' ? '' : normalized.endsWith('\n') ? '\n' : '\n\n';
  const block = ['# Claude Code: personal settings, per-session hook state, worktrees, and subagent memory', ...missing].join('\n');
  return { text: `${normalized}${separator}${block}\n`, added: missing.length };
}

export async function migrate({ root, stage }) {
  if (stage !== 'after') return;
  const file = path.join(root, '.gitignore');
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const { text, added } = ensureIgnoreEntries(current);
  if (added) fs.writeFileSync(file, text);
}
