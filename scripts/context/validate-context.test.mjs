import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const fixtures = path.join(here, '__fixtures__');
const validator = path.join(here, 'validate-context.mjs');
const renderer = path.join(here, 'render.mjs');
const archiver = path.join(here, 'archive-handoff.mjs');

function run(script, cwd, args = []) {
  const result = spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });
  return { status: result.status, out: `${result.stdout}\n${result.stderr}` };
}

// Fixtures are copied so a test can edit files without touching the committed fixture.
function copyFixture(name) {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), `sdd-${name}-`));
  fs.cpSync(path.join(fixtures, name), target, { recursive: true });
  return target;
}

function read(cwd, file) {
  return fs.readFileSync(path.join(cwd, file), 'utf8');
}

test('valid-lite fixture validates with exit 0 and no errors', () => {
  const cwd = copyFixture('valid-lite');
  const { status, out } = run(validator, cwd);
  assert.equal(status, 0, out);
  assert.doesNotMatch(out, /\s+error\s+/);
  assert.match(out, /Context validation passed/);
});

test('valid-lite reports the uncovered draft FR as a warning that --strict promotes', () => {
  const cwd = copyFixture('valid-lite');
  const normal = run(validator, cwd);
  assert.match(normal.out, /F-002-close-todo\/requirements\.md:\d+\s+warning\s+FR-001 has no task/);
  const strict = run(validator, cwd, ['--strict']);
  assert.equal(strict.status, 1, strict.out);
});

test('render is idempotent and --check passes right after rendering', () => {
  const cwd = copyFixture('valid-lite');
  assert.equal(run(renderer, cwd).status, 0);
  const first = read(cwd, 'docs/context/state.yaml');
  assert.equal(run(renderer, cwd).status, 0);
  assert.equal(read(cwd, 'docs/context/state.yaml'), first);
  const check = run(renderer, cwd, ['--check']);
  assert.equal(check.status, 0, check.out);
});

test('rendered state.yaml carries features, active pair, open assumptions and source_hash', () => {
  const cwd = copyFixture('valid-lite');
  run(renderer, cwd);
  const state = YAML.parse(read(cwd, 'docs/context/state.yaml'));
  assert.equal(state.schema_version, 2);
  assert.deepEqual(state.active, { feature_id: 'F-001', task_id: 'T-002' });
  assert.equal(state.features[0].tasks[0].status, 'done');
  assert.equal(state.features[0].phase, 'in_progress');
  assert.deepEqual(state.assumptions_open.map((entry) => entry.id), ['A-002']);
  assert.deepEqual(state.blockers, []);
  assert.match(state.source_hash, /^[0-9a-f]{64}$/);
  assert.equal(state.features[0].tasks.some((task) => task.scope), false, 'scope stays out of state.yaml');
});

test('rendered BRIEF names the active task, its acceptance criteria, stop conditions and scope', () => {
  const cwd = copyFixture('valid-lite');
  run(renderer, cwd);
  const brief = read(cwd, 'docs/context/BRIEF.md');
  assert.match(brief, /^<!-- GENERATED FILE/);
  assert.match(brief, /Todo API is a JSON API/);
  assert.match(brief, /Task T-002 — GET \/todos handler/);
  assert.match(brief, /AC-003: Given two todos/);
  assert.match(brief, /Stop and report when the task needs a prohibited action/);
  assert.match(brief, /`src\/todos\/router\.js`/);
  assert.match(brief, /A-002 — Default page size/);
  assert.match(brief, /Add the newest-first ordering test/);
  assert.match(brief, /T-003 — Feature integration/);
  assert.doesNotMatch(brief, /\r/);
});

test('missing-evidence fixture fails on the done task without evidence, with path:line', () => {
  const cwd = copyFixture('missing-evidence');
  const { status, out } = run(validator, cwd);
  assert.equal(status, 1);
  assert.match(out, /docs\/specs\/F-001-create-todo\/tasks\.md:\d+\s+error\s+T-001 is done without evidence/);
});

test('implemented-with-open-task fixture fails on the open task and the open assumption', () => {
  const cwd = copyFixture('implemented-with-open-task');
  const { status, out } = run(validator, cwd);
  assert.equal(status, 1);
  assert.match(out, /tasks\.md:\d+\s+error\s+F-001 is implemented but T-003 is planned/);
  assert.match(out, /ASSUMPTIONS\.md:\d+\s+error\s+A-002 is open but F-001 is implemented/);
});

test('stale-render fixture fails with the render instruction', () => {
  const cwd = copyFixture('stale-render');
  const { status, out } = run(validator, cwd);
  assert.equal(status, 1);
  assert.match(out, /state\.yaml:1\s+error\s+.*run npm run context:render/);
});

test('a hand-edited state.yaml fails validation until re-rendered', () => {
  const cwd = copyFixture('valid-lite');
  fs.appendFileSync(path.join(cwd, 'docs/context/state.yaml'), '# hand edit\n');
  const broken = run(validator, cwd);
  assert.equal(broken.status, 1);
  assert.match(broken.out, /run npm run context:render/);
  assert.equal(run(renderer, cwd).status, 0);
  const fixed = run(validator, cwd);
  assert.equal(fixed.status, 0, fixed.out);
});

test('a generated file without its banner is an error', () => {
  const cwd = copyFixture('valid-lite');
  const file = path.join(cwd, 'docs/context/PROGRESS.md');
  fs.writeFileSync(file, read(cwd, 'docs/context/PROGRESS.md').split('\n').slice(3).join('\n'));
  const { status, out } = run(validator, cwd);
  assert.equal(status, 1);
  assert.match(out, /PROGRESS\.md:1\s+error\s+generated file lacks the GENERATED banner/);
});

test('an unresolved placeholder in an active file is an error when templateMode is false', () => {
  const cwd = copyFixture('valid-lite');
  fs.appendFileSync(path.join(cwd, 'docs/steering/tech.md'), '\n| Build | `{{BUILD_COMMAND}}` |\n');
  const { status, out } = run(validator, cwd);
  assert.equal(status, 1);
  assert.match(out, /docs\/steering\/tech\.md:\d+\s+error\s+unresolved placeholder/);
});

test('a task that references an unknown FR is an error', () => {
  const cwd = copyFixture('valid-lite');
  const file = path.join(cwd, 'docs/specs/F-001-create-todo/tasks.md');
  fs.writeFileSync(file, read(cwd, 'docs/specs/F-001-create-todo/tasks.md').replace('- requirements: [FR-002]\n', '- requirements: [FR-009]\n'));
  run(renderer, cwd);
  const { status, out } = run(validator, cwd);
  assert.equal(status, 1);
  assert.match(out, /tasks\.md:\d+\s+error\s+T-002 references unknown requirement FR-009/);
});

test('archive-handoff archives the active handoff, resets it, and re-renders', () => {
  const cwd = copyFixture('valid-lite');
  const { status, out } = run(archiver, cwd);
  assert.equal(status, 0, out);
  assert.ok(fs.existsSync(path.join(cwd, 'docs/handoff/archive/2026-10-14-f-001-t-002.md')));
  assert.match(read(cwd, 'docs/handoff/current.md'), /^status: inactive/m);
  assert.match(read(cwd, 'docs/context/BRIEF.md'), /Handoff is `inactive`/);
  const validate = run(validator, cwd);
  assert.equal(validate.status, 0, validate.out);
});

test('the template repository itself renders cleanly and validates', () => {
  const check = run(renderer, root, ['--check']);
  assert.equal(check.status, 0, check.out);
  const { status, out } = run(validator, root);
  assert.equal(status, 0, out);
  assert.match(out, /Context validation passed/);
});
