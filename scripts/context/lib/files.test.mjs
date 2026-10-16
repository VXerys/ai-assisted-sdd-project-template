import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { walk } from './files.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.resolve(here, '..', '__fixtures__');
const validate = path.resolve(here, '..', 'validate-context.mjs');

const GIT_ENV = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@x', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@x' };
const git = (cwd, ...args) => spawnSync('git', args, { cwd, encoding: 'utf8', env: GIT_ENV });

function write(root, file, content = 'x\n') {
  const absolute = path.join(root, file);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content);
}

function tempDir(label) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `sdd-walk-${label}-`));
}

test('walk honours .gitignore inside a git repository and still skips fixtures and nested projects', () => {
  const root = tempDir('git');
  git(root, 'init', '-q');
  write(root, '.gitignore', 'ios/Pods/\n');
  write(root, 'lib/a.md');
  write(root, 'ios/Pods/x/README.md');
  write(root, 'examples/p/sdd.config.json', '{}');
  write(root, 'examples/p/README.md');
  write(root, '__fixtures__/f.md');
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'base');
  write(root, 'lib/untracked.md');
  assert.deepEqual(walk(root), ['.gitignore', 'lib/a.md', 'lib/untracked.md']);
  assert.deepEqual(walk(root, 'lib'), ['lib/a.md', 'lib/untracked.md']);

  fs.writeFileSync(path.join(root, '.gitignore'), '');
  assert.ok(walk(root).includes('ios/Pods/x/README.md'));
});

test('walk skips a tracked file deleted from the working tree', () => {
  const root = tempDir('deleted');
  git(root, 'init', '-q');
  write(root, 'a.md');
  write(root, 'b.md');
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'base');
  fs.rmSync(path.join(root, 'b.md'));
  assert.deepEqual(walk(root), ['a.md']);
});

test('walk falls back to the built-in skip list outside a git repository', () => {
  const root = tempDir('plain');
  for (const dir of ['node_modules', '.git', 'build', '.dart_tool', 'ios/Pods', 'android/.gradle', '.gradle', 'dist', 'coverage', '.next', '__fixtures__']) write(root, `${dir}/x.md`);
  write(root, 'src/a.md');
  write(root, 'ios/Runner/b.md');
  write(root, 'android/app/c.md');
  assert.deepEqual(walk(root), ['android/app/c.md', 'ios/Runner/b.md', 'src/a.md']);
});

test('the validator ignores a broken link in a gitignored file and reports it once un-ignored', () => {
  const root = tempDir('validate');
  fs.cpSync(path.join(fixtures, 'valid-lite'), root, { recursive: true });
  git(root, 'init', '-q');
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'base');
  write(root, 'ios/Pods/x/README.md', '[broken](missing.md)\n');
  write(root, '.gitignore', 'ios/Pods/\n');
  // Other validator rules may flag the fixture inside a fresh git repository, so only the delta is asserted.
  const run = () => {
    const result = spawnSync(process.execPath, [validate], { cwd: root, encoding: 'utf8' });
    const output = `${result.stdout}${result.stderr}`;
    return { status: result.status, output, errors: Number(output.match(/(\d+) error\(s\)/)[1]) };
  };
  const ignored = run();
  assert.doesNotMatch(ignored.output, /ios\/Pods/);

  fs.rmSync(path.join(root, '.gitignore'));
  const visible = run();
  assert.equal(visible.status, 1);
  assert.equal(visible.errors, ignored.errors + 1, visible.output);
  assert.match(visible.output, /ios\/Pods\/x\/README\.md:1\s+error\s+broken relative link missing\.md/);
});
