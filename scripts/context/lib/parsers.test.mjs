import { test } from 'node:test';
import assert from 'node:assert/strict';

import { parseFrontmatter } from './frontmatter.mjs';
import { parseTasks, parseEvidence, parseRequirementIds } from './specs.mjs';
import { parseAssumptions } from './assumptions.mjs';
import { parseHandoff } from './handoff.mjs';
import { sourceHash } from './hash.mjs';
import { renderBrief } from './views.mjs';

test('parseFrontmatter returns data and body, ignoring trailing vocabulary comments', () => {
  const text = '---\nid: F-001\nstatus: draft        # draft | review\nrequirements: [FR-001]\n---\n\n# Title\nbody\n';
  const { data, body, line } = parseFrontmatter(text);
  assert.equal(data.id, 'F-001');
  assert.equal(data.status, 'draft');
  assert.deepEqual(data.requirements, ['FR-001']);
  assert.match(body, /^# Title/m);
  assert.equal(line, 6);
});

test('parseTasks reads key-value blocks and skips fenced examples', () => {
  const text = [
    '## Format',
    '```markdown',
    '### T-999 — Example inside a fence',
    '- status: done',
    '```',
    '## Tasks',
    '### T-001 — First task',
    '- status: in_progress',
    '- requirements: [FR-001, FR-002]',
    '- depends_on: []',
    '- evidence: [EV-001]          # ids from verification.md',
    '- scope: [src/a.ts]',
    '',
    'Acceptance criteria: AC-001.',
    '',
    '### T-002 — Second',
    '- status: planned',
    '- requirements: [FR-001]',
    '- depends_on: [T-001]',
    '- evidence: []'
  ].join('\n');
  const tasks = parseTasks(text);
  assert.equal(tasks.length, 2);
  assert.equal(tasks[0].id, 'T-001');
  assert.equal(tasks[0].title, 'First task');
  assert.equal(tasks[0].status, 'in_progress');
  assert.deepEqual(tasks[0].requirements, ['FR-001', 'FR-002']);
  assert.deepEqual(tasks[0].evidence, ['EV-001']);
  assert.deepEqual(tasks[0].scope, ['src/a.ts']);
  assert.equal(tasks[0].line, 7);
  assert.match(tasks[0].body, /AC-001/);
  assert.deepEqual(tasks[1].depends_on, ['T-001']);
});

test('parseEvidence reads command, fenced output, date, commit, covers', () => {
  const text = [
    '## Evidence',
    '### EV-001 — Tests pass',
    '- command: `npm test`',
    '- output:',
    '  ```text',
    '  pass 3',
    '  ```',
    '- date: 2026-10-15',
    '- commit: abc1234',
    '- covers: [AC-001, AC-002]',
    '',
    '### EV-002 — Incomplete',
    '- command: `npm run build`',
    '- output:',
    '  ```text',
    '  ```',
    '- date: YYYY-MM-DD',
    '- commit:',
    '- covers: []'
  ].join('\n');
  const evidence = parseEvidence(text);
  assert.equal(evidence.length, 2);
  assert.equal(evidence[0].command, 'npm test');
  assert.equal(evidence[0].output, 'pass 3');
  assert.equal(evidence[0].date, '2026-10-15');
  assert.equal(evidence[0].commit, 'abc1234');
  assert.deepEqual(evidence[0].covers, ['AC-001', 'AC-002']);
  assert.equal(evidence[1].output, '');
  assert.equal(evidence[1].date, null);
  assert.equal(evidence[1].commit, null);
  assert.deepEqual(evidence[1].covers, []);
});

test('parseRequirementIds collects FR headings and AC lines', () => {
  const text = '### FR-001 — A\n\n- AC-001: given x.\n- AC-002: given y.\n\n### FR-002 — B\n\n- AC-003: given z.\n';
  const ids = parseRequirementIds(text);
  assert.deepEqual(ids.fr.map((item) => item.id), ['FR-001', 'FR-002']);
  assert.deepEqual(ids.ac.map((item) => item.id), ['AC-001', 'AC-002', 'AC-003']);
  assert.deepEqual(ids.fr[1].ac, ['AC-003']);
});

test('parseAssumptions reads status and feature per entry', () => {
  const text = '## Entries\n\n### A-001 — Token TTL\n- status: open\n- feature: F-001\n- raised: 2026-10-15\n- resolution:\n\nWhy.\n\n### A-002 — Old\n- status: rejected\n- feature: F-001\n';
  const entries = parseAssumptions(text);
  assert.equal(entries.length, 2);
  assert.equal(entries[0].id, 'A-001');
  assert.equal(entries[0].status, 'open');
  assert.equal(entries[0].feature, 'F-001');
  assert.equal(entries[1].status, 'rejected');
});

test('parseHandoff prefers feature_id/task_id and treats placeholders as unset', () => {
  const withIds = '---\nstatus: active\nfeature_id: F-001\ntask_id: T-002\nactive_feature: "F-009"\nexpires_after: "2026-12-31"\n---\n\n## Exact next step\n\n```text\nRun tests.\n```\n';
  const parsed = parseHandoff(withIds);
  assert.equal(parsed.status, 'active');
  assert.equal(parsed.feature_id, 'F-001');
  assert.equal(parsed.task_id, 'T-002');
  assert.equal(parsed.expires, '2026-12-31');
  assert.match(parsed.nextStep, /Run tests/);

  const legacy = '---\nstatus: inactive\nactive_feature: "{{FEATURE_ID}}"\nactive_task: "T-001"\n---\n';
  const fallback = parseHandoff(legacy);
  assert.equal(fallback.feature_id, null);
  assert.equal(fallback.task_id, 'T-001');
});

test('sourceHash is order-independent and line-ending-independent', () => {
  const a = sourceHash([
    { path: 'b.md', content: 'two\r\n' },
    { path: 'a.md', content: 'one\n' }
  ]);
  const b = sourceHash([
    { path: 'a.md', content: 'one\n' },
    { path: 'b.md', content: 'two\n' }
  ]);
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.notEqual(a, sourceHash([{ path: 'a.md', content: 'changed\n' }]));
});

test('renderBrief cuts lowest-priority sections first and lists what was cut', () => {
  const model = {
    project: { name: 'Demo', tier: 'lite', oneLiner: 'Demo is a CLI for testers that proves budgets.' },
    features: [
      {
        id: 'F-001',
        title: 'Budget',
        status: 'implementing',
        phase: 'in_progress',
        tasks: [
          { id: 'T-001', title: 'Active one', status: 'in_progress', requirements: ['FR-001'], depends_on: [], evidence: [], body: 'Do it.', acceptance: ['AC-001: x'] },
          { id: 'T-002', title: 'Later', status: 'planned', requirements: ['FR-001'], depends_on: ['T-001'], evidence: [], body: '', acceptance: [] }
        ]
      }
    ],
    active: { feature_id: 'F-001', task_id: 'T-001' },
    assumptions: [{ id: 'A-001', title: 'Open one', status: 'open', feature: 'F-001' }],
    handoff: { status: 'active', nextStep: 'Finish T-001.' },
    rules: { stopConditions: 'Stop when x.', prohibited: '- No force push.' },
    paths: { generated: ['docs/context/state.yaml'], frozen: [] },
    source_hash: 'abc'
  };
  const full = renderBrief(model, { briefTokens: 100000 });
  assert.match(full, /## Features/);
  assert.match(full, /Finish T-001/);
  assert.doesNotMatch(full, /Cut for budget/);

  const tight = renderBrief(model, { briefTokens: 200 });
  assert.match(tight, /Demo is a CLI/);
  assert.match(tight, /T-001/);
  assert.doesNotMatch(tight, /## Features/);
  assert.match(tight, /Cut for budget:.*features/);
  assert.ok(tight.length <= 200 * 4 + 200, 'stays near the budget');
});
