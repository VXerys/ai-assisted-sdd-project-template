import { execFileSync } from 'node:child_process';

function git(root, args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

export function gitFacts(root) {
  const head = git(root, ['rev-parse', '--short', 'HEAD']);
  if (head === null) return { available: false, branch: null, head: null, dirty: null, commits: [] };
  const status = git(root, ['status', '--short']) ?? '';
  const log = git(root, ['log', '-5', '--pretty=format:%h %s']) ?? '';
  return {
    available: true,
    branch: git(root, ['branch', '--show-current']) || '(detached)',
    head,
    dirty: status.length > 0,
    commits: log ? log.split('\n') : []
  };
}
