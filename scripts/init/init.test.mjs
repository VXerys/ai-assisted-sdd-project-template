// Unit tests for the init libraries; the end-to-end runs of init live in e2e/ (template-only).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import YAML from 'yaml';

import { fillPlaceholders, remainingPlaceholders } from './lib/fill.mjs';
import { relink, stripTemplateOnly, LITE_PRUNE, TEMPLATE_ONLY } from './lib/prune.mjs';
import { slug, mergeGitignore, stripExampleLines, derivedPackageJson, derivedWorkflow, PINNED_ACTIONS } from './lib/project.mjs';
import { APP_PRESETS, loadPreset } from './lib/presets.mjs';
import { INACTIVE_HANDOFF } from '../context/lib/handoff.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..', '..');

test('slug turns a project name into an npm package name', () => {
  assert.equal(slug('Habit Tracker'), 'habit-tracker');
  assert.equal(slug('  Shop_Admin v2! '), 'shop-admin-v2');
  assert.equal(slug('***'), 'project');
});

test('mergeGitignore appends only new lines under one marker and is idempotent', () => {
  const base = '# Dependencies\nnode_modules/\n\n# Build\ndist/\n';
  const first = mergeGitignore(base, ['node_modules/', 'ios/Pods/', '*.jks', 'ios/Pods/']);
  assert.equal(first.added, 2);
  assert.equal(first.text, `${base}\n# sdd preset\nios/Pods/\n*.jks\n`);
  const again = mergeGitignore(first.text, ['ios/Pods/', '*.jks']);
  assert.equal(again.added, 0);
  assert.equal(again.text, first.text);
  const grown = mergeGitignore(first.text, ['ios/Pods/', '*.jks', '.venv/']);
  assert.equal(grown.added, 1);
  assert.equal(grown.text, `${base}\n# sdd preset\nios/Pods/\n*.jks\n.venv/\n`);
  assert.equal(grown.text.split('# sdd preset').length, 2);
  assert.deepEqual(mergeGitignore(base, ['node_modules/', 'dist/']), { text: base, added: 0 });
  assert.equal(mergeGitignore('', ['.venv/']).text, '# sdd preset\n.venv/\n');
});

test('stripExampleLines drops example bullets and rows but keeps table headers and prose', () => {
  const text = ['## Personas', '', '- Example: Reader, a commuter.', '- Real persona.', '', '| Signal | Source |', '|---|---|', '| Example: daily check-ins | event |', '', 'An Example: in prose stays.', ''].join('\n');
  const { text: out, removed } = stripExampleLines(text);
  assert.equal(removed, 2);
  assert.equal(out, ['## Personas', '', '- Real persona.', '', '| Signal | Source |', '|---|---|', '', 'An Example: in prose stays.', ''].join('\n'));
  assert.deepEqual(stripExampleLines('none\n'), { text: 'none\n', removed: 0 });
});

test('derivedPackageJson renames the package, resets the version, and drops the example script', () => {
  const text = JSON.stringify({ name: 'ai-assisted-sdd-project-template', version: '2.0.0', description: 'template', scripts: { test: 'node --test', 'test:e2e': 'z', 'example:validate': 'x', init: 'y' } }, null, 2);
  const pkg = JSON.parse(derivedPackageJson(text, { name: 'Habit Tracker', description: 'Habit Tracker is a Flutter project.' }));
  assert.equal(pkg.name, 'habit-tracker');
  assert.equal(pkg.version, '0.1.0');
  assert.equal(pkg.description, 'Habit Tracker is a Flutter project.');
  assert.deepEqual(Object.keys(pkg.scripts), ['test', 'init']);
  assert.equal(JSON.parse(derivedPackageJson(JSON.stringify({ name: 'x', license: 'MIT', scripts: {} }), { name: 'P', description: 'd' })).license, undefined);
});

// What the template CI carries and a derived repository must not: the example project and the init job.
const TEMPLATE_CI = /examples\/|template-init|working-directory|init\.mjs/;
const GUARD_STEP = 'npm run sdd -- guard --check --base "${{ github.base_ref || github.event.repository.default_branch }}"';
const workflowSteps = (text) => YAML.parse(text).jobs.verify.steps.map((step) => step.run ?? step.uses);

test('derivedWorkflow gives every app preset one verify job without template-only steps', () => {
  for (const name of APP_PRESETS) {
    const preset = loadPreset('app', name);
    const text = derivedWorkflow(preset);
    assert.doesNotMatch(text, TEMPLATE_CI, name);
    const workflow = YAML.parse(text);
    assert.deepEqual(Object.keys(workflow.jobs), ['verify'], name);
    const steps = workflow.jobs.verify.steps;
    const runs = steps.filter((step) => step.run).map((step) => step.run);
    for (const key of preset.ci.run) assert.ok(runs.includes(preset.commands[key]), `${name}: ${key}`);
    for (const setup of preset.ci.setup) assert.ok(steps.some((step) => step.uses === setup.uses), `${name}: ${setup.uses}`);
    assert.equal(runs.filter((run) => run === 'npm ci').length, 1, `${name}: npm ci`);
    assert.equal(runs.filter((run) => run === 'npm test').length, 1, `${name}: npm test`);
    assert.equal(runs.at(-1), 'npm run context:validate -- --strict', name);
  }
});

test('derivedWorkflow sets up the preset toolchain and runs the SDD tooling steps once', () => {
  assert.deepEqual(workflowSteps(derivedWorkflow(loadPreset('app', 'flutter'))), [
    PINNED_ACTIONS.checkout.uses,
    PINNED_ACTIONS.setupNode.uses,
    loadPreset('app', 'flutter').ci.setup[0].uses,
    'npm ci',
    'flutter pub get',
    'flutter analyze',
    'flutter test',
    'flutter build appbundle --release',
    'npm test',
    GUARD_STEP,
    'npm run context:validate -- --strict'
  ]);
  // A Node preset's install and test are the SDD tooling's own, so they are not repeated.
  assert.deepEqual(workflowSteps(derivedWorkflow(loadPreset('app', 'nextjs'))), [
    PINNED_ACTIONS.checkout.uses,
    PINNED_ACTIONS.setupNode.uses,
    'npm ci',
    'npm run lint',
    'npx tsc --noEmit',
    'npm test',
    'npm run build',
    GUARD_STEP,
    'npm run context:validate -- --strict'
  ]);
  assert.deepEqual(workflowSteps(derivedWorkflow(loadPreset('app', 'generic'))), [
    PINNED_ACTIONS.checkout.uses,
    PINNED_ACTIONS.setupNode.uses,
    'npm ci',
    'npm test',
    GUARD_STEP,
    'npm run context:validate -- --strict'
  ]);
  const python = YAML.parse(derivedWorkflow(loadPreset('app', 'python-api'))).jobs.verify.steps;
  assert.equal(python.find((step) => step.uses?.startsWith('actions/setup-python@')).with['python-version'], '3.12');
  assert.match(derivedWorkflow(loadPreset('app', 'generic')), /uses: actions\/checkout@[0-9a-f]{40} # v4\.4\.0\n/);
  assert.ok(python.some((step) => step.run === 'python -m pip install -e ".[dev]"'));
});

test('fillPlaceholders replaces inline values, expands block placeholders line-wise, and leaves unknown ones', () => {
  const text = '# {{PROJECT_NAME}}\n| {{PRESET_STRUCTURE_ROWS}} | | |\n- {{PRESET_APP_NOTES}}\nowner: {{OWNER}} on {{YYYY-MM-DD}}\nkeep {{UNKNOWN}}\n';
  const { text: out, filled } = fillPlaceholders(text, {
    PROJECT_NAME: 'Demo',
    OWNER: 'sehan',
    'YYYY-MM-DD': '2026-10-15',
    PRESET_STRUCTURE_ROWS: ['`lib/` | code | rule |', '`test/` | tests | mirrors |'],
    PRESET_APP_NOTES: ['first', 'second']
  });
  assert.equal(out, '# Demo\n| `lib/` | code | rule |\n| `test/` | tests | mirrors |\n- first\n- second\nowner: sehan on 2026-10-15\nkeep {{UNKNOWN}}\n');
  assert.equal(filled, 5);
  assert.deepEqual(remainingPlaceholders(out), [{ line: 7, name: '{{UNKNOWN}}' }]);
});

test('fillPlaceholders never fills the date of an expires_after line', () => {
  const { text } = fillPlaceholders('session_date: "{{YYYY-MM-DD}}"\nexpires_after: "{{YYYY-MM-DD}}"\n', { 'YYYY-MM-DD': '2026-10-15' });
  assert.equal(text, 'session_date: "2026-10-15"\nexpires_after: "{{YYYY-MM-DD}}"\n');
});

test('relink drops rows that point at a pruned path and only the sentence in prose or list items', () => {
  const text = [
    '| [`system-architecture.md`](docs/specs/_templates/system-architecture.md) | full tier |',
    '| [`design.md`](docs/specs/_templates/design.md) | mapping |',
    '- `docs/documentation/MODULARIZATION_GUIDE.md`',
    '3. Record decisions as ADRs. Write the baseline from `docs/_templates/architecture-baseline.md`.',
    'Keep this. See `docs/runbooks/database-migrations.md` for the procedure. And this stays.',
    '```text',
    '├── MODULE_ARCHITECTURE_GUIDE.md',
    '```'
  ].join('\n');
  const result = relink(text, 'README.md', LITE_PRUNE);
  assert.equal(result.removed, 4);
  assert.deepEqual(result.text.split('\n'), [
    '| [`design.md`](docs/specs/_templates/design.md) | mapping |',
    '3. Record decisions as ADRs.',
    'Keep this. And this stays.',
    '```text',
    '├── MODULE_ARCHITECTURE_GUIDE.md',
    '```'
  ]);
});

test('relink recognizes backtick paths under examples/ and removes a heading whose section it emptied', () => {
  const text = [
    '## Example',
    '',
    '`examples/todo-api/` is a complete project; see `examples/README.md`.',
    '',
    '## Next',
    '',
    'Stays.',
    ''
  ].join('\n');
  const result = relink(text, 'README.md', TEMPLATE_ONLY);
  assert.equal(result.text, '## Next\n\nStays.\n');
});

test('relink resolves a relative link against the file that holds it', () => {
  const result = relink('- [`MODULARIZATION_GUIDE.md`](MODULARIZATION_GUIDE.md)\n- [`AI_COLLABORATION_MODEL.md`](AI_COLLABORATION_MODEL.md)\n', 'docs/documentation/README.md', LITE_PRUNE);
  assert.equal(result.text, '- [`AI_COLLABORATION_MODEL.md`](AI_COLLABORATION_MODEL.md)\n');
});

test('stripTemplateOnly removes every marked block with its markers and leaves the rest untouched', () => {
  const text = ['# Guide', '', '<!-- template-only:start -->', '## Maintainers', '', 'Only in the template.', '<!-- template-only:end -->', '', '## Everyone', '', 'Stays.', ''].join('\n');
  assert.deepEqual(stripTemplateOnly(text), { text: '# Guide\n\n## Everyone\n\nStays.\n', removed: 1 });
  assert.deepEqual(stripTemplateOnly('no markers\n'), { text: 'no markers\n', removed: 0 });
});

test('the template handoff is the archive reset text, so init has nothing session-specific to fill', () => {
  assert.equal(fs.readFileSync(path.join(repo, 'docs', 'handoff', 'current.md'), 'utf8').replace(/\r\n/g, '\n'), INACTIVE_HANDOFF);
});
