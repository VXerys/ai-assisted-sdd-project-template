import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { walk } from './files.mjs';

// Line endings are normalized so a checkout with autocrlf hashes the same as one without.
export function sourceHash(entries) {
  const hash = crypto.createHash('sha256');
  for (const entry of [...entries].sort((a, b) => a.path.localeCompare(b.path))) {
    hash.update(entry.path);
    hash.update('\0');
    hash.update(entry.content.replace(/\r\n/g, '\n'));
    hash.update('\0');
  }
  return hash.digest('hex');
}

// Source inputs: config, steering, feature specs, assumptions, handoff. Git facts are excluded on purpose.
export function collectSourceFiles(root, config) {
  const files = new Set(['sdd.config.json', config.paths.assumptions, config.paths.handoff]);
  for (const file of walk(root, config.paths.steering)) files.add(file);
  const specsRoot = path.join(root, config.paths.specs);
  if (fs.existsSync(specsRoot)) {
    for (const entry of fs.readdirSync(specsRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && /^F-\d{3}-/.test(entry.name)) {
        for (const file of walk(root, `${config.paths.specs}/${entry.name}`)) files.add(file);
      }
    }
  }
  return [...files]
    .filter((file) => fs.existsSync(path.join(root, file)))
    .map((file) => ({ path: file, content: fs.readFileSync(path.join(root, file), 'utf8') }));
}
