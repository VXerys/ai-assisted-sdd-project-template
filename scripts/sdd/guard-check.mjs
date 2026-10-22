import { execFileSync } from 'node:child_process';

import { guardDecision } from '../lib/guard.mjs';

function git(root, args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

// Paths changed against the merge base with `base` (committed) plus the working tree (staged, unstaged, untracked).
export function changedPaths(root, base) {
  const paths = new Set();
  const ref = [base, `origin/${base}`].find((candidate) => candidate && git(root, ['rev-parse', '--verify', '--quiet', `${candidate}^{commit}`]) !== null);
  if (ref) {
    const mergeBase = git(root, ['merge-base', ref, 'HEAD'])?.trim();
    const committed = mergeBase ? git(root, ['diff', '--name-only', `${mergeBase}..HEAD`]) : null;
    for (const line of (committed ?? '').split('\n')) if (line.trim()) paths.add(line.trim());
  }
  for (const line of (git(root, ['status', '--porcelain', '-uall']) ?? '').split('\n')) {
    if (!line.trim()) continue;
    const entry = line.slice(3);
    for (const part of entry.split(' -> ')) paths.add(part.replace(/^"|"$/g, ''));
  }
  return { paths: [...paths].sort(), ref: ref ?? null };
}

// The CI and cloud-session counterpart of the PreToolUse guard (ADR-0003). Generated paths are left to
// `validate`, which fails when they are stale; a fresh render legitimately changes them.
export function guardCheck(root, config, { base = config.git.baseBranch, strict = false } = {}) {
  const { paths, ref } = changedPaths(root, base);
  const findings = [];
  for (const file of paths) {
    const decision = guardDecision(file, config);
    if (!decision || decision.rule === 'generated') continue;
    const level = decision.rule === 'protected' && !strict ? 'warning' : 'error';
    findings.push({ file, level, rule: decision.rule, message: decision.reason.replace(/^SDD guard: /, '') });
  }
  return { findings, checked: paths.length, ref };
}
