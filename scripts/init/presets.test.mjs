import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP_PRESETS, DB_PRESETS, loadPreset, validatePreset } from './lib/presets.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const presetsDir = path.join(here, 'presets');

const EXPECTED_APP = ['nextjs', 'react-native', 'flutter', 'kotlin-android', 'node-api', 'python-api', 'generic'];
const EXPECTED_DB = ['supabase', 'firebase', 'postgres', 'mysql', 'sqlite-drift', 'mongodb', 'none'];

test('the preset lists name the seven app and seven database presets from ADR-0001', () => {
  assert.deepEqual([...APP_PRESETS].sort(), [...EXPECTED_APP].sort());
  assert.deepEqual([...DB_PRESETS].sort(), [...EXPECTED_DB].sort());
});

for (const name of EXPECTED_APP) {
  test(`app preset ${name} is a JSON file that satisfies the app schema`, () => {
    const file = path.join(presetsDir, 'app', `${name}.json`);
    assert.ok(fs.existsSync(file), `${file} missing`);
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.deepEqual(validatePreset('app', raw), []);
    const preset = loadPreset('app', name);
    assert.equal(typeof preset.label, 'string');
    assert.ok(preset.structure.length >= 3 && preset.structure.length <= 6);
    assert.ok(preset.notes.length <= 5);
  });
}

for (const name of EXPECTED_DB) {
  test(`db preset ${name} is a JSON file that satisfies the db schema`, () => {
    const file = path.join(presetsDir, 'db', `${name}.json`);
    assert.ok(fs.existsSync(file), `${file} missing`);
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.deepEqual(validatePreset('db', raw), []);
  });
}

test('db presets other than none carry an authorization mechanism in their notes and fileMatch patterns', () => {
  for (const name of EXPECTED_DB.filter((entry) => entry !== 'none')) {
    const preset = loadPreset('db', name);
    assert.ok(preset.fileMatch.length > 0, `${name} has no fileMatch`);
    assert.ok(preset.notes.length > 0, `${name} has no notes`);
    assert.equal(typeof preset.migrationTool, 'string', `${name} migrationTool`);
  }
  const none = loadPreset('db', 'none');
  assert.equal(none.migrationTool, null);
  assert.deepEqual(none.fileMatch, []);
});

test('validatePreset reports every schema violation with its key', () => {
  const errors = validatePreset('app', { label: 1, commands: { install: 'x' }, structure: [], fileMatch: 'lib/**', notes: 'a' });
  assert.ok(errors.some((entry) => entry.includes('label')));
  assert.ok(errors.some((entry) => entry.includes('language')));
  assert.ok(errors.some((entry) => entry.includes('commands.dev')));
  assert.ok(errors.some((entry) => entry.includes('structure')));
  assert.ok(errors.some((entry) => entry.includes('fileMatch')));
  assert.ok(errors.some((entry) => entry.includes('notes')));
  assert.ok(errors.some((entry) => entry.includes('unknown key')) === false);
  assert.ok(validatePreset('db', { label: 'x', migrationTool: 1, migrationCommand: null, migrationPath: null, notes: [], fileMatch: [] }).some((entry) => entry.includes('migrationTool')));
});

test('app presets declare CI setup steps and run only commands they have, never dev', () => {
  assert.deepEqual(loadPreset('app', 'flutter').ci.run, ['install', 'lint', 'test', 'build']);
  const setup = (name) => loadPreset('app', name).ci.setup.map((step) => `${step.uses.replace(/@.*/, '')} ${step.version}`);
  assert.deepEqual(setup('flutter'), ['subosito/flutter-action v2.23.0']);
  assert.deepEqual(setup('kotlin-android'), ['actions/setup-java v6.1.0']);
  assert.deepEqual(setup('python-api'), ['actions/setup-python v7.1.0']);
  // `npx expo run:android` installs on a device or emulator, which a CI runner does not have.
  assert.ok(!loadPreset('app', 'react-native').ci.run.includes('build'));
  assert.deepEqual(loadPreset('app', 'generic').ci, { setup: [], run: [] });
  for (const name of EXPECTED_APP) {
    const preset = loadPreset('app', name);
    for (const key of preset.ci.run) assert.equal(typeof preset.commands[key], 'string', `${name}: ${key}`);
  }

  const base = JSON.parse(fs.readFileSync(path.join(presetsDir, 'app', 'flutter.json'), 'utf8'));
  const errorsFor = (ci) => validatePreset('app', { ...base, ci });
  assert.ok(validatePreset('app', { ...base, ci: undefined }).some((entry) => entry.includes('ci must be an object')));
  assert.ok(errorsFor({ setup: [], run: ['typecheck'] }).some((entry) => entry.includes("'typecheck' has no command")));
  assert.ok(errorsFor({ setup: [], run: ['dev'] }).some((entry) => entry.includes("'dev' must be one of")));
  assert.ok(errorsFor({ setup: [], run: ['test', 'test'] }).some((entry) => entry.includes('twice')));
  assert.ok(errorsFor({ setup: [{ name: 'Setup' }], run: [] }).some((entry) => entry.includes('ci.setup[0].uses')));
  assert.ok(errorsFor({ setup: [{ name: 'Setup', uses: 'a/b@v1', with: { list: [1] } }], run: [] }).some((entry) => entry.includes('ci.setup[0].with')));
  assert.ok(errorsFor({ setup: [{ name: 'Setup', uses: 'a/b@v1', run: 'x' }], run: [] }).some((entry) => entry.includes('ci.setup[0].run is not a known key')));
  assert.ok(errorsFor({ setup: [], run: [], cache: true }).some((entry) => entry.includes('ci.cache is not a known key')));
  assert.ok(errorsFor({ setup: [{ name: 'Setup', uses: 'a/b@v1', version: 'v1' }], run: [] }).some((entry) => entry.includes('full 40-character commit SHA')));
  assert.ok(errorsFor({ setup: [{ name: 'Setup', uses: `a/b@${'0'.repeat(40)}` }], run: [] }).some((entry) => entry.includes('ci.setup[0].version')));
});

test('loadPreset rejects a name that is not a preset file', () => {
  assert.throws(() => loadPreset('app', 'rails'), /unknown app preset 'rails'/);
  assert.throws(() => loadPreset('db', '../etc'), /unknown db preset/);
});

test('no preset command contains reset, drop, or --force', () => {
  const commands = [];
  for (const name of EXPECTED_APP) commands.push(...Object.values(loadPreset('app', name).commands).filter(Boolean));
  for (const name of EXPECTED_DB) {
    const command = loadPreset('db', name).migrationCommand;
    if (command) commands.push(command);
  }
  assert.ok(commands.length > 10);
  for (const command of commands) assert.doesNotMatch(command, /\b(reset|drop)\b|--force/, command);
});

test('the supabase preset checks a change with supabase db diff and its notes no longer name db reset', () => {
  const preset = loadPreset('db', 'supabase');
  assert.equal(preset.migrationCommand, 'supabase db diff');
  assert.ok(preset.notes.some((note) => note.includes('supabase db diff')));
  assert.ok(!preset.notes.some((note) => note.includes('db reset')));
});

test('presets declare generatedPaths and gitignore lines, and the schema requires them', () => {
  assert.deepEqual(loadPreset('app', 'flutter').generatedPaths, ['lib/**/*.g.dart', 'lib/**/*.freezed.dart']);
  assert.deepEqual(loadPreset('app', 'kotlin-android').generatedPaths, ['build/**']);
  for (const name of EXPECTED_APP.filter((entry) => !['flutter', 'kotlin-android'].includes(entry))) {
    assert.deepEqual(loadPreset('app', name).generatedPaths, [], name);
  }
  assert.deepEqual(loadPreset('app', 'flutter').gitignore, ['ios/Pods/', '.flutter-plugins*', 'android/key.properties', '*.jks']);
  assert.deepEqual(loadPreset('app', 'kotlin-android').gitignore, ['.gradle/', 'local.properties']);
  assert.deepEqual(loadPreset('app', 'python-api').gitignore, ['.venv/', '__pycache__/']);
  assert.deepEqual(loadPreset('db', 'supabase').gitignore, ['supabase/.temp/', 'supabase/.branches/']);
  assert.deepEqual(loadPreset('db', 'firebase').gitignore, ['.firebase/', '*-debug.log']);
  assert.deepEqual(loadPreset('db', 'none').gitignore, []);

  const app = JSON.parse(fs.readFileSync(path.join(presetsDir, 'app', 'generic.json'), 'utf8'));
  delete app.generatedPaths;
  delete app.gitignore;
  const appErrors = validatePreset('app', app);
  assert.ok(appErrors.some((entry) => entry.includes('generatedPaths')));
  assert.ok(appErrors.some((entry) => entry.includes('gitignore')));
  const db = JSON.parse(fs.readFileSync(path.join(presetsDir, 'db', 'none.json'), 'utf8'));
  delete db.gitignore;
  assert.ok(validatePreset('db', db).some((entry) => entry.includes('gitignore')));
});
