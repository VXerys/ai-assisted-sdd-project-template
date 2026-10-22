import fs from 'node:fs';
import path from 'node:path';

import YAML from 'yaml';

import { collectSourceFiles, sourceHash } from '../context/lib/hash.mjs';

// The session-start text: BRIEF.md with its render time and a stale warning, or the fallback read order.
// Shared by the SessionStart hook and `sdd brief`, which sessions without hooks run instead.
export function briefText(root, config) {
  const briefPath = path.join(root, config.paths.context, 'BRIEF.md');
  if (!fs.existsSync(briefPath)) return fallback(config);
  const text = fs.readFileSync(briefPath, 'utf8');
  const lines = [];
  const briefHash = text.match(/source_hash:\s*([0-9a-f]{64})/)?.[1] ?? null;
  if (briefHash !== sourceHash(collectSourceFiles(root, config))) lines.push('SDD brief is stale: sources changed since the last render; run npm run context:render');
  lines.push(`SDD brief (rendered ${generatedAt(root, config)})`);
  lines.push(text.replace(/\r\n/g, '\n').trimEnd());
  return lines.join('\n');
}

function generatedAt(root, config) {
  try {
    return String(YAML.parse(fs.readFileSync(path.join(root, config.paths.context, 'state.yaml'), 'utf8'))?.generated_at ?? 'unknown time');
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
