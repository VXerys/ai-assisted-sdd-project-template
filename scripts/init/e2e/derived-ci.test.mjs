import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

import { WORKFLOW_PATH, derivedWorkflow } from '../lib/project.mjs';
import { loadPreset } from '../lib/presets.mjs';
import { LITE_ARGS, TEMPLATE_CI, initializedOnce, read, repo } from './helpers.mjs';

// The slowest test: it runs the derived project's own npm test, so it gets a process of its own.
const liteProject = initializedOnce('derived-ci', LITE_ARGS);

test('init replaces the template CI and package.json for the derived repository, whose npm test and strict validate pass', () => {
  const { cwd } = liteProject();
  assert.match(read(repo, WORKFLOW_PATH), TEMPLATE_CI, 'the template CI no longer carries the steps this test proves are gone');
  const workflow = read(cwd, WORKFLOW_PATH);
  assert.doesNotMatch(workflow, TEMPLATE_CI);
  assert.equal(workflow, derivedWorkflow(loadPreset('app', 'flutter')));
  const pkg = JSON.parse(read(cwd, 'package.json'));
  assert.equal(pkg.name, 'habit-tracker');
  assert.equal(pkg.version, '0.1.0');
  assert.equal(pkg.scripts['example:validate'], undefined);
  // Without this the nested test runner reports to the parent runner instead of stdout.
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const npm = (script) => spawnSync(`npm ${script}`, { cwd, encoding: 'utf8', shell: true, env });
  const tests = npm('test');
  assert.equal(tests.status, 0, `${tests.stdout}\n${tests.stderr}`);
  const summary = `${tests.stdout}${tests.stderr}`;
  assert.match(summary, /pass [1-9]\d*/);
  assert.match(summary, /fail 0/);
  const validated = npm('run context:validate -- --strict');
  assert.equal(validated.status, 0, `${validated.stdout}\n${validated.stderr}`);
  assert.match(validated.stdout, /Context validation passed: 0 error\(s\), 0 warning\(s\).*strict/);
});
