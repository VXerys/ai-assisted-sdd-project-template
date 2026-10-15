import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { convertV1Tasks } from './v1-tasks.mjs';
import { parseTasks } from '../context/lib/specs.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(here, '__fixtures__', 'v1-tasks.md');
const source = fs.readFileSync(fixture, 'utf8');

test('converts heading and list checkbox tasks to T-XXX blocks with the mapped status', () => {
  const { text } = convertV1Tasks(source);
  const tasks = parseTasks(text);
  assert.deepEqual(
    tasks.map((task) => [task.id, task.title, task.status]),
    [
      ['T-001', 'Add the todos table', 'done'],
      ['T-002', 'POST /todos route', 'in_progress'],
      ['T-003', 'List todos newest first', 'blocked'],
      ['T-004', 'Close a todo (FR-003)', 'planned'],
      ['T-005', 'Smoke test the deploy', 'done'],
      ['T-006', 'Write the runbook', 'in_progress'],
      ['T-007', 'Rotate the API key', 'blocked']
    ]
  );
  assert.doesNotMatch(text, /TASK-\d{3}/);
});

test('infers requirements from FR ids in the task body and depends_on from the dependency map', () => {
  const tasks = parseTasks(convertV1Tasks(source).text);
  const byId = Object.fromEntries(tasks.map((task) => [task.id, task]));
  assert.deepEqual(byId['T-001'].requirements, ['FR-001']);
  assert.deepEqual(byId['T-002'].requirements, ['FR-001', 'FR-002']);
  assert.deepEqual(byId['T-004'].requirements, ['FR-003']);
  assert.deepEqual(byId['T-002'].depends_on, ['T-001']);
  assert.deepEqual(byId['T-003'].depends_on, ['T-002']);
  assert.deepEqual(byId['T-001'].depends_on, []);
  for (const task of tasks) assert.deepEqual(task.evidence, []);
  assert.match(byId['T-001'].body, /One migration that creates `todos`\./);
});

test('reports what it could not infer: requirements, evidence for done tasks, dependencies', () => {
  const { notes } = convertV1Tasks(source);
  assert.deepEqual(notes, [
    'T-001: done without evidence; add an EV id from verification.md or set status to review',
    'T-003: no FR id found; fill requirements',
    'T-003: blocked; log the reason in docs/context/ASSUMPTIONS.md',
    'T-004: no dependency map entry; confirm depends_on',
    'T-005: no FR id found; fill requirements',
    'T-005: done without evidence; add an EV id from verification.md or set status to review',
    'T-005: no dependency map entry; confirm depends_on',
    'T-006: no FR id found; fill requirements',
    'T-006: no dependency map entry; confirm depends_on',
    'T-007: no FR id found; fill requirements',
    'T-007: blocked; log the reason in docs/context/ASSUMPTIONS.md',
    'T-007: no dependency map entry; confirm depends_on'
  ]);
});

test('rewrites the frontmatter to the v2 keys and drops the v1 legend and dependency map', () => {
  const { text } = convertV1Tasks(source);
  assert.match(text, /^id: F-001$/m);
  assert.match(text, /^type: tasks$/m);
  assert.match(text, /^status: approved$/m);
  assert.match(text, /^owner: ari$/m);
  assert.match(text, /^tier: lite$/m);
  assert.match(text, /^requirements: \[FR-001, FR-002, FR-003\]$/m);
  assert.doesNotMatch(text, /Status Legend|Dependency Map|last_verified_commit/);
});

test('the CLI prints the converted file to stdout and the notes to stderr, and --write replaces the file', () => {
  const cli = path.join(here, 'v1-tasks.mjs');
  const printed = spawnSync(process.execPath, [cli, fixture], { encoding: 'utf8' });
  assert.equal(printed.status, 0, printed.stderr);
  assert.match(printed.stdout, /^### T-001 — Add the todos table$/m);
  assert.match(printed.stderr, /could not infer \(12\):\n  T-001: done without evidence/);

  const temp = path.join(here, '__fixtures__', 'v1-tasks.tmp.md');
  fs.copyFileSync(fixture, temp);
  try {
    const written = spawnSync(process.execPath, [cli, temp, '--write'], { encoding: 'utf8' });
    assert.equal(written.status, 0, written.stderr);
    assert.match(fs.readFileSync(temp, 'utf8'), /^- status: in_progress$/m);
  } finally {
    fs.rmSync(temp, { force: true });
  }
  const missing = spawnSync(process.execPath, [cli], { encoding: 'utf8' });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /Usage: node scripts\/migrate\/v1-tasks\.mjs <tasks\.md> \[--write\]/);
});
