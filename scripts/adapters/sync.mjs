#!/usr/bin/env node

import { loadConfig } from '../context/lib/config.mjs';
import { renderAdapters, staleAdapters, writeAdapters } from './render.mjs';

const args = new Set(process.argv.slice(2));
const check = args.has('--check');
const quiet = args.has('--quiet');
const all = args.has('--all');
const root = process.cwd();

const { config, errors } = loadConfig(root);
if (!config) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

const { outputs, warnings } = renderAdapters(root, config, { all });
for (const warning of warnings) console.error(`WARNING: ${warning}`);

if (check) {
  const stale = staleAdapters(root, outputs);
  if (stale.length) {
    for (const file of stale) console.error(`${file}: stale; run npm run adapters:sync`);
    process.exit(1);
  }
  if (!quiet) console.log('Adapters are up to date.');
  process.exit(0);
}

const written = writeAdapters(root, outputs);
if (!quiet) console.log(`Synced ${written.length} adapters: ${written.join(', ')}`);
