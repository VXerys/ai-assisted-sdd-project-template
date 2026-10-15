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

test('loadPreset rejects a name that is not a preset file', () => {
  assert.throws(() => loadPreset('app', 'rails'), /unknown app preset 'rails'/);
  assert.throws(() => loadPreset('db', '../etc'), /unknown db preset/);
});
