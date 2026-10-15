#!/usr/bin/env node

import { loadConfig } from './lib/config.mjs';
import { renderOutputs, staleOutputs, writeOutputs } from './lib/render.mjs';

const args = new Set(process.argv.slice(2));
const check = args.has('--check');
const quiet = args.has('--quiet');
const root = process.cwd();

const { config, errors } = loadConfig(root);
if (!config) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

const { outputs } = renderOutputs(root, config);

if (check) {
  const stale = staleOutputs(root, outputs);
  if (stale.length) {
    for (const file of stale) console.error(`${file}: stale; run npm run context:render`);
    process.exit(1);
  }
  if (!quiet) console.log('Rendered context is up to date.');
  process.exit(0);
}

const written = writeOutputs(root, outputs);
if (!quiet) console.log(`Rendered ${written.length} files: ${written.join(', ')}`);
