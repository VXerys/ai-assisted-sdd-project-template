import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { LITE_ARGS, copyRepo, init, snapshotDir, treeDigest } from './helpers.mjs';

// Set UPDATE_SNAPSHOTS=1 to rewrite the plan snapshot after an intended change to the plan format.
test('--dry-run prints the plan, changes nothing, and matches its snapshot', () => {
  const cwd = copyRepo('dry');
  const before = treeDigest(cwd);
  const result = init(cwd, ['--dry-run', ...LITE_ARGS]);
  assert.equal(result.status, 0, result.out);
  assert.equal(treeDigest(cwd), before, 'dry run changed files');
  const plan = result.stdout.replace(/\r\n/g, '\n').split('\nFill manually')[0];
  const snapshot = path.join(snapshotDir, 'dry-run-plan.txt');
  if (process.env.UPDATE_SNAPSHOTS) fs.writeFileSync(snapshot, plan);
  assert.equal(plan, fs.readFileSync(snapshot, 'utf8'));
  assert.match(plan, /^ {2}replace {2}\.github\/workflows\/context-integrity\.yml {2}\(flutter preset: install, lint, test, build; strict context:validate\)$/m);
  assert.match(result.stdout, /Dry run: nothing changed\./);
});

test('init rejects an unknown preset, tier, or tool before touching anything', () => {
  const cwd = copyRepo('reject');
  const before = treeDigest(cwd);
  assert.match(init(cwd, ['--yes', '--app', 'rails']).out, /unknown app preset 'rails'/);
  assert.match(init(cwd, ['--yes', '--tier', 'medium']).out, /tier must be lite or full/);
  assert.match(init(cwd, ['--yes', '--tools', 'claude,emacs']).out, /unknown tool 'emacs'/);
  assert.equal(treeDigest(cwd), before);
});

test('init prompts on stdin for every value a flag did not set', () => {
  const cwd = copyRepo('prompt');
  const answers = ['Prompted App', 'lite', 'node-api', 'none', 'claude', 'sehan', 'Indonesian', 'a CLI for prompts'].join('\n') + '\n';
  const result = init(cwd, ['--dry-run'], answers);
  assert.equal(result.status, 0, result.out);
  assert.match(result.stdout, /Project name/);
  assert.match(result.stdout, /Prompted App .*lite.*node-api.*none.*claude/);
});
