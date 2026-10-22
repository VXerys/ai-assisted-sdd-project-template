import path from 'node:path';

import { globToRegExp, matchesAny, normalizePath } from './glob.mjs';
import { shellTargets } from './shell-targets.mjs';
import { ADAPTER_TARGETS } from '../adapters/render.mjs';

export const SECRET_PATTERNS = [
  '.env*', '*.pem', '*.keystore', '*.jks', 'google-services.json', 'key.properties', 'GoogleService-Info.plist',
  '*.p12', '*.p8', '*.mobileprovision', '*.key', '*.pfx', 'id_rsa*', '*.secret'
];
const SECRET_EXAMPLES = new Set(['.env.example', '.env.sample', '.env.template']);

// The gate itself: an agent that can rewrite these can switch the checks off. In a derived project
// the owner approves each edit; in the template repository they are ordinary source.
export const PROTECTED_PATTERNS = [
  'sdd.config.json', '.claude/settings.json', '.claude/commands/', '.claude/skills/sdd-*/**', '.github/workflows/',
  'scripts/context/', 'scripts/lib/', 'scripts/hooks/', 'scripts/adapters/', 'scripts/sdd/'
];

// Returns {rule, pattern, decision, reason} when touching `relativePath` must be refused or confirmed, otherwise null.
// `relativePath` is null for files outside the project; only the secret rule applies to those.
// `access` is 'write' (default) or 'read'; reads are only refused for secrets.
export function guardDecision(relativePath, config, rawPath = relativePath, access = 'write') {
  const candidate = relativePath ?? normalizePath(rawPath ?? '');
  if (!candidate) return null;

  const secret = matchesAny(candidate, SECRET_PATTERNS) ?? wildcardHit(candidate, SECRET_PATTERNS);
  if (secret && !SECRET_EXAMPLES.has(path.posix.basename(candidate))) {
    return { rule: 'secret', pattern: secret, decision: 'deny', reason: `SDD guard: ${candidate} is a secret file (${secret}); agents never read or edit it. Ask the owner to change it.` };
  }
  if (relativePath === null || access === 'read') return null;

  const generated = matchesAny(relativePath, config.generated) ?? wildcardHit(relativePath, config.generated);
  if (generated) {
    return { rule: 'generated', pattern: generated, decision: 'deny', reason: `SDD guard: ${relativePath} is a generated path (sdd.config.json generated: ${generated}). Edit its source, then run ${regenerateCommand(relativePath, config)}.` };
  }
  const frozen = matchesAny(relativePath, config.frozen) ?? wildcardHit(relativePath, config.frozen);
  if (frozen) {
    return { rule: 'frozen', pattern: frozen, decision: 'deny', reason: `SDD guard: ${relativePath} is a frozen path (sdd.config.json frozen: ${frozen}). Edits need explicit owner approval and, when architectural, an ADR.` };
  }
  if (!config.templateMode) {
    const guarded = matchesAny(relativePath, PROTECTED_PATTERNS) ?? wildcardHit(relativePath, PROTECTED_PATTERNS);
    if (guarded) {
      return { rule: 'protected', pattern: guarded, decision: 'ask', reason: `SDD guard: ${relativePath} is SDD configuration or check code (${guarded}). Only the owner approves changes to the gate itself.` };
    }
  }
  return null;
}

// A shell argument may itself be a glob (`rm docs/context/*`); it hits a pattern when it would expand onto a literal path the pattern names.
function wildcardHit(candidate, patterns) {
  if (!/[*?]/.test(candidate)) return null;
  const expanded = globToRegExp(candidate);
  return patterns.find((pattern) => !/[*?]/.test(pattern) && expanded.test(pattern.replace(/\/$/, ''))) ?? null;
}

// Decision for a Bash or PowerShell command: the first write that hits a rule, or a read of a secret.
// `resolve(rawPath)` maps a path as written in the command to a repo-relative path, or null outside the project.
export function guardShellCommand(command, config, resolve) {
  const { writes, reads } = shellTargets(command);
  for (const raw of writes) {
    const decision = guardDecision(resolve(raw), config, raw, 'write');
    if (decision) return { ...decision, reason: `${decision.reason} (shell command writes ${raw})` };
  }
  for (const raw of reads) {
    const decision = guardDecision(resolve(raw), config, raw, 'read');
    if (decision) return { ...decision, reason: `${decision.reason} (shell command reads ${raw})` };
  }
  return null;
}

function regenerateCommand(relativePath, config) {
  if (matchesAny(relativePath, ADAPTER_TARGETS)) return 'npm run adapters:sync';
  if (matchesAny(relativePath, [`${config.paths.context}/`])) return 'npm run context:render';
  return 'its generator';
}
