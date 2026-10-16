import { test } from 'node:test';
import assert from 'node:assert/strict';

import { parseFrontmatter } from './frontmatter.mjs';
import { parseTasks, parseEvidence, parseRequirementIds, acceptanceByRequirement, findMalformedHeadings, parseTechCommands } from './specs.mjs';
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

test('acceptanceByRequirement maps each FR to the criteria under its heading and drops unmapped ones', () => {
  const text = '- AC-000: orphan before any FR.\n\n### FR-001 — A\n\n- AC-001: given x.\n\n## Rules\n\n- AC-009: not under an FR.\n\n### FR-002 — B\n\n- AC-002: given y.\n';
  const map = acceptanceByRequirement(parseRequirementIds(text));
  assert.deepEqual([...map.keys()], ['FR-001', 'FR-002']);
  assert.deepEqual([...map.get('FR-001')], ['AC-001']);
  assert.deepEqual([...map.get('FR-002')], ['AC-002']);
});

test('findMalformedHeadings flags wrong depth, padding and dash for tasks, requirements and evidence, outside fences', () => {
  const tasks = ['```markdown', '#### T-001 — fenced', '```', '### T-001 — fine', '#### T-002 — too deep', '### T3 — no dash or padding', '### T-004 no dash', '### T-005 - ascii dash is fine'].join('\n');
  assert.deepEqual(
    findMalformedHeadings(tasks, 'task').map((item) => [item.line, item.text, item.expected]),
    [
      [5, '#### T-002 — too deep', '### T-002 — title'],
      [6, '### T3 — no dash or padding', '### T-003 — title'],
      [7, '### T-004 no dash', '### T-004 — title']
    ]
  );
  const requirements = ['### FR-001 — fine', '- AC-001: fine', '### FR002 — bad', '### FR-3 — bad', '- AC004: bad', '- AC-5: bad'].join('\n');
  assert.deepEqual(
    findMalformedHeadings(requirements, 'requirement').map((item) => [item.line, item.expected]),
    [
      [3, '### FR-002 — title'],
      [4, '### FR-003 — title'],
      [5, '- AC-004: text'],
      [6, '- AC-005: text']
    ]
  );
  const evidence = ['### EV-001 — fine', '### EV-1 — bad', '#### EV-002 — bad'].join('\n');
  assert.deepEqual(
    findMalformedHeadings(evidence, 'evidence').map((item) => [item.line, item.expected]),
    [
      [2, '### EV-001 — title'],
      [3, '### EV-002 — title']
    ]
  );
});

test('parseTechCommands reads the backtick commands of the Commands table and drops none', () => {
  const text = ['# Tech', '', '| Concern | Technology |', '|---|---|', '| Runtime | `Node 22` |', '', '## Commands', '', '| Purpose | Command |', '|---|---|', '| Test | `npm test` |', '| Build | `none` |', '| Lint | `npx eslint .` |', '', '## Stack rules', '', '- run `npm audit` weekly'].join('\n');
  assert.deepEqual([...parseTechCommands(text)], ['npm test', 'npx eslint .']);
  assert.equal(parseTechCommands('# Tech\n\nno table\n').size, 0);
});
