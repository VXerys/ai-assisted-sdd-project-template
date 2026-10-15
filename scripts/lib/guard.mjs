import path from 'node:path';

import { matchesAny, normalizePath } from './glob.mjs';
import { ADAPTER_TARGETS } from '../adapters/render.mjs';

export const SECRET_PATTERNS = ['.env*', '*.pem', '*.keystore', '*.jks', 'google-services.json'];

// Returns {rule, pattern, reason} when an edit to `relativePath` must be refused, otherwise null.
// `relativePath` is null for files outside the project; only the secret rule applies to those.
export function guardDecision(relativePath, config, rawPath = relativePath) {
  const candidate = relativePath ?? normalizePath(rawPath ?? '');
  if (!candidate) return null;

  const secret = matchesAny(candidate, SECRET_PATTERNS);
  if (secret && path.posix.basename(candidate) !== '.env.example') {
    return { rule: 'secret', pattern: secret, reason: `SDD guard: ${candidate} is a secret file (${secret}); agents never read or edit it. Ask the owner to change it.` };
  }
  if (relativePath === null) return null;

  const generated = matchesAny(relativePath, config.generated);
  if (generated) {
    return { rule: 'generated', pattern: generated, reason: `SDD guard: ${relativePath} is a generated path (sdd.config.json generated: ${generated}). Edit its source, then run ${regenerateCommand(relativePath, config)}.` };
  }
  const frozen = matchesAny(relativePath, config.frozen);
  if (frozen) {
    return { rule: 'frozen', pattern: frozen, reason: `SDD guard: ${relativePath} is a frozen path (sdd.config.json frozen: ${frozen}). Edits need explicit owner approval and, when architectural, an ADR.` };
  }
  return null;
}

function regenerateCommand(relativePath, config) {
  if (matchesAny(relativePath, ADAPTER_TARGETS)) return 'npm run adapters:sync';
  if (matchesAny(relativePath, [`${config.paths.context}/`])) return 'npm run context:render';
  return 'its generator';
}
