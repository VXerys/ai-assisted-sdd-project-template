import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { compareVersions, mergeText, planFile } from './upgrade.mjs';
import { guardCheck } from './guard-check.mjs';
import { normalizeConfig } from '../context/lib/config.mjs';

test('planFile takes the template file only where the project kept the base', () => {
  assert.equal(planFile({ base: 'a', theirs: 'b', ours: 'a' }).action, 'update');
  assert.equal(planFile({ base: 'a', theirs: 'a', ours: 'x' }).action, 'keep');
  assert.equal(planFile({ base: 'a', theirs: 'b', ours: 'x' }).action, 'merge');
  assert.equal(planFile({ base: null, theirs: 'b', ours: null }).action, 'add');
  assert.equal(planFile({ base: 'a', theirs: null, ours: 'a' }).action, 'delete');
  assert.equal(planFile({ base: 'a', theirs: null, ours: 'x' }).action, 'report');
  assert.equal(planFile({ base: 'a', theirs: 'b', ours: null }).action, 'report');
  assert.equal(planFile({ base: 'a', theirs: 'a', ours: null }).action, 'keep');
  assert.equal(planFile({ base: 'a', theirs: 'b', ours: 'b' }).action, 'keep');
});

test('mergeText merges separate hunks and marks a conflict on the same line', () => {
  const base = 'one\ntwo\nthree\nfour\nfive\n';
  const clean = mergeText('ONE\ntwo\nthree\nfour\nfive\n', base, 'one\ntwo\nthree\nfour\nFIVE\n');
  assert.equal(clean.conflicts, 0);
  assert.equal(clean.text, 'ONE\ntwo\nthree\nfour\nFIVE\n');
  const conflict = mergeText('one\nours\nthree\nfour\nfive\n', base, 'one\ntheirs\nthree\nfour\nfive\n');
  assert.equal(conflict.conflicts, 1);
  assert.match(conflict.text, /<<<<<<< project\nours\n=======\ntheirs\n>>>>>>> template/);
});

test('compareVersions orders release numbers numerically', () => {
  assert.equal(compareVersions('2.0.0', '2.1.0'), -1);
  assert.equal(compareVersions('v2.10.0', '2.9.1'), 1);
  assert.equal(compareVersions('2.1.0', '2.1.0'), 0);
});

test('guardCheck fails on a changed secret or frozen path, warns on protected, and ignores generated', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-guard-check-'));
  const git = (...args) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t.invalid', ...args], { cwd: root, encoding: 'utf8' });
  git('init', '-q', '-b', 'main');
  fs.writeFileSync(path.join(root, 'README.md'), 'x\n');
  git('add', '-A');
  git('commit', '-q', '-m', 'base');
  for (const file of ['.env.local', 'src/legacy/a.js', 'sdd.config.json', 'AGENTS.md', 'src/app.js']) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), 'x\n');
  }
  const config = normalizeConfig({ project: { name: 'T', tier: 'lite' }, generated: ['AGENTS.md'], frozen: ['src/legacy/'], templateMode: false });
  const { findings, checked } = guardCheck(root, config);
  assert.equal(checked, 5);
  const byFile = Object.fromEntries(findings.map((finding) => [finding.file, `${finding.level} ${finding.rule}`]));
  assert.deepEqual(byFile, { '.env.local': 'error secret', 'sdd.config.json': 'warning protected', 'src/legacy/a.js': 'error frozen' });
  assert.equal(guardCheck(root, config, { strict: true }).findings.find((finding) => finding.rule === 'protected').level, 'error');
});
