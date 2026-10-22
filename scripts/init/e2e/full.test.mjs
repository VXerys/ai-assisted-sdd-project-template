import { test } from 'node:test';
import assert from 'node:assert/strict';

import { WORKFLOW_PATH, derivedWorkflow } from '../lib/project.mjs';
import { LITE_PRUNE } from '../lib/prune.mjs';
import { loadPreset } from '../lib/presets.mjs';
import { FULL_ARGS, copyRepo, exists, init, initializedOnce, read, validate } from './helpers.mjs';

const fullProject = initializedOnce('full', FULL_ARGS);

test('full init keeps the runbook with the database preset notes and the full-tier templates', () => {
  const { cwd, out } = fullProject();
  for (const file of LITE_PRUNE) assert.ok(exists(cwd, file), `${file} missing`);
  const runbook = read(cwd, 'docs/runbooks/database-migrations.md');
  assert.match(runbook, /under `db\/migrations\/` \(versioned SQL files/);
  assert.match(runbook, /Row Level Security \(RLS\) policies/);
  assert.doesNotMatch(runbook, /PRESET_/);
  assert.match(read(cwd, 'docs/steering/database.md'), /docs\/runbooks\/database-migrations\.md/);
  const tech = read(cwd, 'docs/steering/tech.md');
  assert.match(tech, /\| Typecheck \| `npx tsc --noEmit` \|/);
  assert.match(tech, /Server Components by default/);
  assert.equal(JSON.parse(read(cwd, 'sdd.config.json')).project.tier, 'full');
  assert.equal(read(cwd, WORKFLOW_PATH), derivedWorkflow(loadPreset('app', 'nextjs')));
  assert.match(out, /Context validation passed: 0 error\(s\)/);
  assert.equal(validate(cwd).status, 0);
});

test('a database of none skips the database steering file and says none in tech.md', () => {
  const cwd = copyRepo('nodb');
  const result = init(cwd, ['--yes', '--name', 'Tool', '--tier', 'lite', '--app', 'python-api', '--db', 'none', '--tools', 'codex', '--owner', 'sehan']);
  assert.equal(result.status, 0, result.out);
  assert.ok(!exists(cwd, 'docs/steering/database.md'));
  assert.match(read(cwd, 'docs/steering/tech.md'), /\| Data store \| none \|/);
  assert.match(read(cwd, 'docs/steering/tech.md'), /\| Data store change check \| `none` \|/);
  assert.equal(validate(cwd).status, 0, result.out);
});
