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
const syncer = path.join(root, 'scripts', 'adapters', 'sync.mjs');

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

function edit(cwd, file, from, to) {
  const text = read(cwd, file);
  assert.ok(text.includes(from), `${file} does not contain ${JSON.stringify(from)}`);
  fs.writeFileSync(path.join(cwd, file), text.replaceAll(from, to));
}

function git(cwd, args) {
  const result = spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...args], { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

// Turns a fixture copy into a one-commit repository and returns the short HEAD.
function gitInit(cwd) {
  git(cwd, ['init', '-q']);
  git(cwd, ['add', '-A']);
  git(cwd, ['commit', '-q', '-m', 'fixture']);
  return git(cwd, ['rev-parse', '--short', 'HEAD']);
}

const F1 = 'docs/specs/F-001-create-todo';
const F2 = 'docs/specs/F-002-close-todo';
const F2_FILES = ['requirements.md', 'design.md', 'tasks.md', 'verification.md'].map((name) => `${F2}/${name}`);

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
  assert.match(out, /docs\/specs\/F-001-create-todo\/tasks\.md:30\s+error\s+T-001 is done without evidence/);
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

test('a fileMatch steering file without fileMatchPattern is an error, and a pattern on an always file too', () => {
  const cwd = copyFixture('valid-lite');
  fs.writeFileSync(path.join(cwd, 'docs/steering/database.md'), '---\ninclusion: fileMatch\n---\n\n# Database\n');
  fs.writeFileSync(path.join(cwd, 'docs/steering/product.md'), read(cwd, 'docs/steering/product.md').replace('inclusion: always\n', 'inclusion: always\nfileMatchPattern: "src/**"\n'));
  const { status, out } = run(validator, cwd);
  assert.equal(status, 1);
  assert.match(out, /docs\/steering\/database\.md:1\s+error\s+fileMatch steering needs fileMatchPattern/);
  assert.match(out, /docs\/steering\/product\.md:1\s+error\s+fileMatchPattern is only valid with inclusion: fileMatch/);
});

test('a stale adapter is an error that names adapters:sync, cleared by a sync', () => {
  const cwd = copyFixture('valid-lite');
  fs.appendFileSync(path.join(cwd, 'AGENTS.md'), '\nHand edit.\n');
  const broken = run(validator, cwd);
  assert.equal(broken.status, 1);
  assert.match(broken.out, /AGENTS\.md:1\s+error\s+adapter is stale; run npm run adapters:sync/);
  assert.equal(run(path.resolve(here, '..', 'adapters', 'sync.mjs'), cwd).status, 0);
  const fixed = run(validator, cwd);
  assert.equal(fixed.status, 0, fixed.out);
});

test('a placeholder in a status: draft file is a warning, in any other file an error, once templateMode is false', () => {
  const cwd = copyFixture('valid-lite');
  const config = JSON.parse(read(cwd, 'sdd.config.json'));
  config.validate.placeholderSensitiveFiles.push('docs/product/prd.md');
  fs.writeFileSync(path.join(cwd, 'sdd.config.json'), JSON.stringify(config, null, 2));
  assert.equal(run(renderer, cwd).status, 0);
  assert.equal(run(syncer, cwd).status, 0);
  const prd = path.join(cwd, 'docs', 'product', 'prd.md');
  fs.mkdirSync(path.dirname(prd), { recursive: true });
  fs.writeFileSync(prd, '---\nstatus: draft\n---\n\n# PRD\n\nGoal: {{GOAL}}\n');
  const draft = run(validator, cwd);
  assert.equal(draft.status, 0, draft.out);
  assert.match(draft.out, /docs\/product\/prd\.md:7\s+warning\s+unresolved placeholder \{\{GOAL\}\} \(draft\)/);
  fs.writeFileSync(prd, '---\nstatus: approved\n---\n\n# PRD\n\nGoal: {{GOAL}}\n');
  const approved = run(validator, cwd);
  assert.equal(approved.status, 1);
  assert.match(approved.out, /docs\/product\/prd\.md:7\s+error\s+unresolved placeholder \{\{GOAL\}\}/);
});

test('a nested directory with its own sdd.config.json is left to its own validation', () => {
  const cwd = copyFixture('valid-lite');
  const nested = path.join(cwd, 'examples', 'inner');
  fs.cpSync(path.join(fixtures, 'valid-lite'), nested, { recursive: true });
  const { status, out } = run(validator, cwd);
  assert.equal(status, 0, out);
  assert.doesNotMatch(out, /duplicate id/);
  // 20 documents plus the three .claude/rules adapters (product, structure, workflow).
  assert.match(out, /; 23 Markdown files, 2 feature/);
});

test('the shipped examples/todo-api project validates with 0 errors on its own', () => {
  const example = path.join(root, 'examples', 'todo-api');
  const { status, out } = run(validator, example);
  assert.equal(status, 0, out);
  assert.match(out, /0 error\(s\)/);
  assert.match(out, /2 feature\(s\)/);
});

test('an EV commit missing from git log is an error; the HEAD commit passes', () => {
  const cwd = copyFixture('valid-lite');
  const head = gitInit(cwd);
  edit(cwd, `${F1}/verification.md`, '- commit: a1b2c3d', '- commit: deadbee');
  const broken = run(validator, cwd);
  assert.equal(broken.status, 1);
  assert.match(broken.out, /F-001-create-todo\/verification\.md:\d+\s+error\s+EV-001 commit deadbee is not in git log/);
  edit(cwd, `${F1}/verification.md`, '- commit: deadbee', `- commit: ${head}`);
  run(renderer, cwd);
  const fixed = run(validator, cwd);
  assert.equal(fixed.status, 0, fixed.out);
  assert.doesNotMatch(fixed.out, /commit/);
});

test('outside a git repository an EV commit is a warning, not an error', () => {
  const cwd = copyFixture('valid-lite');
  const { status, out } = run(validator, cwd);
  assert.equal(status, 0, out);
  assert.match(out, /verification\.md:\d+\s+warning\s+EV-001 commit a1b2c3d cannot be checked: not a git repository/);
});

test('the 0000000 placeholder commit is exempt only when templateMode is true', () => {
  const cwd = copyFixture('valid-lite');
  gitInit(cwd);
  edit(cwd, `${F1}/verification.md`, '- commit: a1b2c3d', '- commit: 0000000');
  run(renderer, cwd);
  const broken = run(validator, cwd);
  assert.equal(broken.status, 1);
  assert.match(broken.out, /error\s+EV-001 commit 0000000 is not in git log/);
  edit(cwd, 'sdd.config.json', '"templateMode": false', '"templateMode": true');
  run(renderer, cwd);
  run(syncer, cwd);
  const exempt = run(validator, cwd);
  assert.equal(exempt.status, 0, exempt.out);
  assert.doesNotMatch(exempt.out, /commit/);
});

test('an EV command outside the tech.md Commands table is an error unless prefixed manual:', () => {
  const cwd = copyFixture('valid-lite');
  edit(cwd, `${F1}/verification.md`, '- command: `npm test`', '- command: `echo pass`');
  run(renderer, cwd);
  const broken = run(validator, cwd);
  assert.equal(broken.status, 1);
  assert.match(broken.out, /verification\.md:\d+\s+error\s+EV-001 command `echo pass` is not in the tech\.md Commands table/);
  edit(cwd, `${F1}/verification.md`, '- command: `echo pass`', '- command: `manual: open /todos in a browser`');
  run(renderer, cwd);
  const manual = run(validator, cwd);
  assert.equal(manual.status, 0, manual.out);
});

test('legacy evidence reports an unknown command and a missing commit as info, which --strict does not promote', () => {
  const cwd = copyFixture('valid-lite');
  gitInit(cwd);
  edit(cwd, `${F1}/verification.md`, '- command: `npm test`', '- command: `echo pass`');
  edit(cwd, `${F1}/verification.md`, '- commit: a1b2c3d', '- commit: deadbee\n- legacy: true');
  run(renderer, cwd);
  const plain = run(validator, cwd);
  assert.equal(plain.status, 0, plain.out);
  assert.match(plain.out, /verification\.md:\d+\s+info\s+EV-001 command `echo pass` is not in the tech\.md Commands table \(legacy evidence\)/);
  assert.match(plain.out, /verification\.md:\d+\s+info\s+EV-001 commit deadbee is not in git log \(legacy evidence\)/);
  assert.match(plain.out, /0 error\(s\), \d+ warning\(s\), 2 info;/);
  const strict = run(validator, cwd, ['--strict']);
  assert.match(strict.out, /info\s+EV-001 command/);
  assert.doesNotMatch(strict.out, /error\s+EV-001/);
});

test('an EV date after today is an error', () => {
  const cwd = copyFixture('valid-lite');
  edit(cwd, `${F1}/verification.md`, '- date: 2026-10-14', '- date: 2999-01-01');
  run(renderer, cwd);
  const { status, out } = run(validator, cwd);
  assert.equal(status, 1);
  assert.match(out, /verification\.md:\d+\s+error\s+EV-001 date 2999-01-01 is in the future/);
});

test('a done task whose evidence covers no criterion of one of its FRs is an error', () => {
  const cwd = copyFixture('valid-lite');
  edit(cwd, `${F1}/tasks.md`, '- status: done\n- requirements: [FR-001]', '- status: done\n- requirements: [FR-001, FR-002]');
  run(renderer, cwd);
  const { status, out } = run(validator, cwd);
  assert.equal(status, 1);
  assert.match(out, /tasks\.md:\d+\s+error\s+T-001 is done but its evidence covers no acceptance criterion of FR-002/);
});

test('a done task whose evidence is all legacy reports the uncovered FR as info, not an error', () => {
  const cwd = copyFixture('valid-lite');
  edit(cwd, `${F1}/tasks.md`, '- status: done\n- requirements: [FR-001]', '- status: done\n- requirements: [FR-001, FR-002]');
  edit(cwd, `${F1}/verification.md`, '- commit: a1b2c3d', '- commit: a1b2c3d\n- legacy: true');
  run(renderer, cwd);
  const { status, out } = run(validator, cwd);
  assert.equal(status, 0, out);
  assert.match(out, /tasks\.md:\d+\s+info\s+T-001 is done but its evidence covers no acceptance criterion of FR-002 \(legacy evidence\)/);
});

test('a task jumping planned to done is an error naming the skipped states; planned to blocked is accepted', () => {
  const cwd = copyFixture('valid-lite');
  edit(cwd, `${F1}/tasks.md`, '- status: planned\n- requirements: [FR-001, FR-002]', '- status: done\n- requirements: [FR-001, FR-002]');
  const skip = run(validator, cwd);
  assert.equal(skip.status, 1);
  assert.match(skip.out, /tasks\.md:\d+\s+error\s+T-003 moved from planned to done, skipping in_progress, review/);
  edit(cwd, `${F1}/tasks.md`, '- status: done\n- requirements: [FR-001, FR-002]', '- status: blocked\n- requirements: [FR-001, FR-002]');
  const blocked = run(validator, cwd);
  assert.doesNotMatch(blocked.out, /T-003 moved|T-003 cannot move/);
});

test('a task leaving done is an error; a new task is accepted', () => {
  const cwd = copyFixture('valid-lite');
  edit(cwd, `${F1}/tasks.md`, '- status: done\n- requirements: [FR-001]', '- status: planned\n- requirements: [FR-001]');
  fs.appendFileSync(path.join(cwd, `${F1}/tasks.md`), '\n### T-004 — New\n- status: in_progress\n- requirements: [FR-001]\n- depends_on: []\n- evidence: []\n');
  const { out } = run(validator, cwd);
  assert.match(out, /tasks\.md:\d+\s+error\s+T-001 cannot move from done to planned/);
  assert.doesNotMatch(out, /T-004 (moved|cannot)/);
});

test('a feature jumping draft to approved is an error naming review', () => {
  const cwd = copyFixture('valid-lite');
  for (const file of F2_FILES) edit(cwd, file, 'status: draft', 'status: approved');
  const { status, out } = run(validator, cwd);
  assert.equal(status, 1);
  assert.match(out, /F-002-close-todo\/tasks\.md:1\s+error\s+F-002 moved from draft to approved, skipping review/);
});

test('approved requires a criterion per FR; implemented also requires an FR and a task', () => {
  const cwd = copyFixture('valid-lite');
  for (const file of F2_FILES) edit(cwd, file, 'status: draft', 'status: approved');
  edit(cwd, `${F2}/requirements.md`, '- AC-001: Given an open todo, when PATCH /todos/:id/close is called, then its state is closed.\n', '');
  const approved = run(validator, cwd);
  assert.equal(approved.status, 1);
  assert.match(approved.out, /F-002-close-todo\/requirements\.md:\d+\s+error\s+FR-001 has no acceptance criterion; required from approved onward/);
  for (const file of F2_FILES) edit(cwd, file, 'status: approved', 'status: implemented');
  edit(cwd, `${F2}/requirements.md`, '### FR-001 — Close a todo\n', '');
  const implemented = run(validator, cwd);
  assert.match(implemented.out, /F-002-close-todo\/requirements\.md:1\s+error\s+F-002 is implemented without a functional requirement/);
  assert.match(implemented.out, /F-002-close-todo\/tasks\.md:1\s+error\s+F-002 is implemented without a task/);
});

test('an assumption without a feature is an error, and so is an unknown feature id', () => {
  const cwd = copyFixture('valid-lite');
  edit(cwd, 'docs/context/ASSUMPTIONS.md', '- status: open\n- feature: F-001', '- status: open');
  edit(cwd, 'docs/context/ASSUMPTIONS.md', '- status: confirmed\n- feature: F-001', '- status: confirmed\n- feature: F-009');
  run(renderer, cwd);
  const { status, out } = run(validator, cwd);
  assert.equal(status, 1);
  assert.match(out, /ASSUMPTIONS\.md:\d+\s+error\s+A-002 has no feature/);
  assert.match(out, /ASSUMPTIONS\.md:\d+\s+error\s+A-001 references unknown feature F-009/);
});

test('feature: none marks a project-wide assumption: accepted when resolved, a warning while open, shown in every brief', () => {
  const cwd = copyFixture('valid-lite');
  edit(cwd, 'docs/context/ASSUMPTIONS.md', '- status: confirmed\n- feature: F-001', '- status: confirmed\n- feature: none');
  edit(cwd, 'docs/context/ASSUMPTIONS.md', '- status: open\n- feature: F-001', '- status: open\n- feature: none');
  run(renderer, cwd);
  const { status, out } = run(validator, cwd);
  assert.equal(status, 0, out);
  assert.doesNotMatch(out, /A-001/);
  assert.match(out, /ASSUMPTIONS\.md:\d+\s+warning\s+A-002 is open and project-wide \(feature: none\); it blocks no task/);
  assert.match(read(cwd, 'docs/context/BRIEF.md'), /- A-002 — [^\n]+ \(project-wide\)/);
});

test('malformed task, requirement, criterion and evidence headings are errors naming the expected form', () => {
  const cwd = copyFixture('valid-lite');
  edit(cwd, `${F1}/tasks.md`, '### T-002 — GET /todos handler', '#### T-002 — GET /todos handler');
  edit(cwd, `${F1}/tasks.md`, '### T-003 — Feature integration and verification', '### T-003 Feature integration and verification');
  edit(cwd, `${F1}/requirements.md`, '### FR-002 — List todos', '### FR2 — List todos');
  edit(cwd, `${F1}/requirements.md`, '- AC-003:', '- AC003:');
  edit(cwd, `${F1}/verification.md`, '### EV-001 — POST handler tests pass', '#### EV-001 — POST handler tests pass');
  const { status, out } = run(validator, cwd);
  assert.equal(status, 1);
  assert.match(out, /tasks\.md:\d+\s+error\s+malformed task heading '#### T-002 — GET \/todos handler'; expected '### T-002 — title'/);
  assert.match(out, /tasks\.md:\d+\s+error\s+malformed task heading '### T-003 Feature integration and verification'; expected '### T-003 — title'/);
  assert.match(out, /requirements\.md:\d+\s+error\s+malformed requirement heading '### FR2 — List todos'; expected '### FR-002 — title'/);
  assert.match(out, /requirements\.md:\d+\s+error\s+malformed acceptance criterion '- AC003:'; expected '- AC-003: text'/);
  assert.match(out, /verification\.md:\d+\s+error\s+malformed evidence heading '#### EV-001 — POST handler tests pass'; expected '### EV-001 — title'/);
});

test('targets and AC test links must name existing files: an error once implementing, a warning while draft', () => {
  const cwd = copyFixture('valid-lite');
  fs.mkdirSync(path.join(cwd, 'src'), { recursive: true });
  fs.mkdirSync(path.join(cwd, 'test'), { recursive: true });
  fs.writeFileSync(path.join(cwd, 'src/todos.js'), 'export {};\n');
  fs.writeFileSync(path.join(cwd, 'test/todos.test.js'), 'export {};\n');
  edit(cwd, `${F1}/requirements.md`, 'supersedes: null\n', 'supersedes: null\ntargets: ["src/todos.js", "src/missing/**"]\n');
  edit(cwd, `${F1}/requirements.md`, 'then 201 and the todo are returned.', 'then 201 and the todo are returned. [test: test/todos.test.js#creates a todo]');
  edit(cwd, `${F1}/requirements.md`, 'then 400 is returned.', 'then 400 is returned. [tests: test/todos.test.js, test/gone.test.js::empty title]');
  run(renderer, cwd);
  const implementing = run(validator, cwd);
  assert.equal(implementing.status, 1);
  assert.match(implementing.out, /requirements\.md:1\s+error\s+F-001 target src\/missing\/\*\* matches no file/);
  assert.match(implementing.out, /requirements\.md:\d+\s+error\s+AC-002 links test test\/gone\.test\.js, which does not exist/);
  assert.doesNotMatch(implementing.out, /src\/todos\.js matches no file|AC-001 links test/);

  edit(cwd, `${F2}/requirements.md`, 'supersedes: null\n', 'supersedes: null\ntargets: ["src/close/**"]\n');
  run(renderer, cwd);
  assert.match(run(validator, cwd).out, /F-002-close-todo\/requirements\.md:1\s+warning\s+F-002 target src\/close\/\*\* matches no file/);
});

test('a placeholder in a feature file is a warning while draft and an error from review on', () => {
  const cwd = copyFixture('valid-lite');
  fs.appendFileSync(path.join(cwd, `${F2}/design.md`), '\nRoute: {{ROUTE}}\n');
  run(renderer, cwd);
  const draft = run(validator, cwd);
  assert.equal(draft.status, 0, draft.out);
  assert.match(draft.out, /F-002-close-todo\/design\.md:\d+\s+warning\s+unresolved placeholder \{\{ROUTE\}\} \(draft\)/);
  for (const file of F2_FILES) edit(cwd, file, 'status: draft', 'status: review');
  run(renderer, cwd);
  const review = run(validator, cwd);
  assert.equal(review.status, 1);
  assert.match(review.out, /F-002-close-todo\/design\.md:\d+\s+error\s+unresolved placeholder \{\{ROUTE\}\}$/m);
});
