// Shared setup for the init end-to-end tests. Each *.test.mjs file in this folder is its own process,
// so `node --test` runs them in parallel; tests inside one file share one initialized copy.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { walk } from '../../context/lib/files.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const repo = path.resolve(here, '..', '..', '..');
export const snapshotDir = path.join(repo, 'scripts', 'init', '__fixtures__');

// What the template CI carries and a derived repository must not: the example project and the init job.
export const TEMPLATE_CI = /examples\/|template-init|working-directory|init\.mjs/;

export const LITE_ARGS = ['--yes', '--name', 'Habit Tracker', '--tier', 'lite', '--app', 'flutter', '--db', 'supabase', '--tools', 'claude,kiro', '--owner', 'sehan'];
export const FULL_ARGS = ['--yes', '--name', 'Shop Admin', '--tier', 'full', '--app', 'nextjs', '--db', 'postgres', '--tools', 'claude', '--owner', 'sehan'];

// A temp copy of this repository with the `yaml` dependency, so init runs exactly as it would in a fresh clone.
export function copyRepo(label) {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), `sdd-init-${label}-`));
  fs.cpSync(repo, target, { recursive: true, filter: (source) => !/[\\/](\.git|node_modules)([\\/]|$)/.test(source) });
  fs.cpSync(path.join(repo, 'node_modules', 'yaml'), path.join(target, 'node_modules', 'yaml'), { recursive: true });
  return target;
}

export function init(cwd, args, input) {
  const result = spawnSync(process.execPath, [path.join(cwd, 'scripts', 'init', 'init.mjs'), ...args], { cwd, encoding: 'utf8', input });
  return { status: result.status, out: `${result.stdout}\n${result.stderr}`, stdout: result.stdout };
}

export function validate(cwd) {
  const result = spawnSync(process.execPath, [path.join(cwd, 'scripts', 'context', 'validate-context.mjs')], { cwd, encoding: 'utf8' });
  return { status: result.status, out: `${result.stdout}\n${result.stderr}` };
}

export const read = (cwd, file) => fs.readFileSync(path.join(cwd, file), 'utf8');
export const exists = (cwd, file) => fs.existsSync(path.join(cwd, file));

export function treeDigest(root) {
  return walk(root)
    .filter((file) => !file.startsWith('node_modules/'))
    .map((file) => `${file}:${fs.statSync(path.join(root, file)).size}:${read(root, file).length}`)
    .join('\n');
}

// One initialized copy per file, shared by the tests that only read it.
export function initializedOnce(label, args) {
  let project = null;
  return () => {
    if (!project) {
      const cwd = copyRepo(label);
      const result = init(cwd, args);
      assert.equal(result.status, 0, result.out);
      project = { cwd, out: result.out };
    }
    return project;
  };
}
