import { test } from 'node:test';
import assert from 'node:assert/strict';

import { nextTasks, scopesOverlap } from './next.mjs';

const task = (id, status, extra = {}) => ({ id, title: id, status, depends_on: [], ...extra });

test('scopesOverlap treats a directory prefix or a matching glob as shared files', () => {
  assert.ok(scopesOverlap(['src/db/**'], ['src/db/users.js']));
  assert.ok(scopesOverlap(['src/'], ['src/api/x.js']));
  assert.ok(scopesOverlap(['**/*.js'], ['src/a.js']));
  assert.ok(!scopesOverlap(['src/db/**'], ['src/api/**']));
  assert.ok(!scopesOverlap(['lib/features/a/**'], ['lib/features/ab/**']));
});

test('nextTasks lists ready tasks in order and the ones whose scope is disjoint from the work in flight', () => {
  const features = [
    { id: 'F-001', tasks: [
      task('T-001', 'in_progress', { scope: ['src/db/**'] }),
      task('T-002', 'planned', { scope: ['src/db/migrations/**'] }),
      task('T-003', 'planned', { scope: ['src/api/**'] }),
      task('T-004', 'planned'),
      task('T-005', 'planned', { depends_on: ['T-001'] })
    ] },
    { id: 'F-002', tasks: [task('T-001', 'done'), task('T-002', 'planned', { depends_on: ['T-001'], scope: ['web/**'] })] }
  ];
  const result = nextTasks(features);
  assert.equal(result.next.id, 'T-002');
  assert.deepEqual(result.ready.map((entry) => `${entry.feature}/${entry.id}`), ['F-001/T-002', 'F-001/T-003', 'F-001/T-004', 'F-002/T-002']);
  assert.deepEqual(result.parallelSafe.map((entry) => `${entry.feature}/${entry.id}`), ['F-001/T-003', 'F-002/T-002']);
  assert.deepEqual(result.waiting.map((entry) => [entry.id, entry.unmet]), [['T-005', ['T-001']]]);
  assert.equal(nextTasks([{ id: 'F-003', tasks: [task('T-001', 'in_progress'), task('T-002', 'planned', { scope: ['x/**'] })] }]).parallelSafe.length, 0, 'unknown scope in flight blocks parallel work');
});
