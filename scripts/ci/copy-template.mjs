#!/usr/bin/env node
// Copies this repository, minus .git, to the directory given as the first argument.
// Replaces `rsync`, which Windows runners do not have. Template-only: init removes scripts/ci/.
import fs from 'node:fs';
import path from 'node:path';

const target = process.argv[2];
if (!target) {
  process.stderr.write('usage: node scripts/ci/copy-template.mjs <target-directory>\n');
  process.exit(1);
}
const source = process.cwd();
const destination = path.resolve(source, target);
if (destination.startsWith(`${source}${path.sep}`)) {
  process.stderr.write('copy-template: the target must be outside the repository\n');
  process.exit(1);
}
fs.cpSync(source, destination, { recursive: true, filter: (entry) => !/[\\/]\.git([\\/]|$)/.test(entry) });
process.stdout.write(`Copied ${source} to ${destination}\n`);
