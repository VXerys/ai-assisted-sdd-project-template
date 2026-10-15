#!/usr/bin/env node

import { loadConfig } from './lib/config.mjs';
import { validateRepo, formatFindings } from './lib/checks.mjs';

const args = new Set(process.argv.slice(2));
const strict = args.has('--strict');
const root = process.cwd();

const { config, errors } = loadConfig(root);
if (!config) {
  for (const error of errors) console.error(`sdd.config.json:1  error  ${error}`);
  console.error('\nContext validation failed: configuration.');
  process.exit(1);
}

const { findings, files, features } = validateRepo(root, config);
if (strict) for (const finding of findings) finding.level = 'error';

for (const line of formatFindings(findings)) console.log(line);

const errorCount = findings.filter((finding) => finding.level === 'error').length;
const warningCount = findings.length - errorCount;
const summary = `${errorCount} error(s), ${warningCount} warning(s); ${files} Markdown files, ${features} feature(s)${strict ? ', strict' : ''}.`;

if (errorCount > 0) {
  console.error(`\nContext validation failed: ${summary}`);
  process.exit(1);
}

console.log(`${findings.length ? '\n' : ''}Context validation passed: ${summary}`);
