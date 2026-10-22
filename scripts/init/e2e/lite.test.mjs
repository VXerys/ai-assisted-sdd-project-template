import { test } from 'node:test';
import assert from 'node:assert/strict';

import { LITE_PRUNE } from '../lib/prune.mjs';
import { walk } from '../../context/lib/files.mjs';
import { LITE_ARGS, exists, init, initializedOnce, read, validate } from './helpers.mjs';

const liteProject = initializedOnce('lite', LITE_ARGS);

test('init refuses to run twice unless --force is given', () => {
  const { cwd } = liteProject();
  const refused = init(cwd, LITE_ARGS);
  assert.equal(refused.status, 1);
  assert.match(refused.out, /templateMode is already false/);
  const forced = init(cwd, ['--force', ...LITE_ARGS]);
  assert.equal(forced.status, 0, forced.out);
  assert.equal(validate(cwd).status, 0);
});

test('init merges the preset generated globs into sdd.config.json and structure.md', () => {
  const { cwd } = liteProject();
  const config = JSON.parse(read(cwd, 'sdd.config.json'));
  assert.ok(config.generated.includes('lib/**/*.g.dart'));
  assert.ok(config.generated.includes('lib/**/*.freezed.dart'));
  assert.equal(config.generated.filter((entry) => entry === 'lib/**/*.g.dart').length, 1, 'duplicated after --force');
  assert.match(read(cwd, 'docs/steering/structure.md'), /generated API clients\): `lib\/\*\*\/\*\.g\.dart`, `lib\/\*\*\/\*\.freezed\.dart`/);
  assert.match(read(cwd, 'AGENTS.md'), /`lib\/\*\*\/\*\.g\.dart`/);
});

test('init appends the preset gitignore lines once under the sdd preset marker', () => {
  const { cwd } = liteProject();
  const gitignore = read(cwd, '.gitignore');
  assert.equal(gitignore.split('# sdd preset').length, 2, 'marker written more than once after --force');
  const block = gitignore.split('# sdd preset\n')[1];
  assert.equal(block, 'ios/Pods/\n.flutter-plugins*\nandroid/key.properties\n*.jks\nsupabase/.temp/\nsupabase/.branches/\n');
  assert.equal(gitignore.match(/^node_modules\/$/gm).length, 1);
});

test('init strips the example personas, signals, and constraints from steering', () => {
  const { cwd } = liteProject();
  const product = read(cwd, 'docs/steering/product.md');
  assert.doesNotMatch(product, /^\s*[-|]\s*Example:/m);
  assert.match(product, /^\| Signal \| What it tells us \| Source \|$/m);
  assert.match(product, /^## Personas$/m);
  assert.doesNotMatch(read(cwd, 'AGENTS.md'), /Example:/);
  for (const file of walk(cwd, 'docs/steering')) assert.doesNotMatch(read(cwd, file), /^\s*[-|]\s*Example:/m, file);
});

test('lite init writes sdd.config.json with the answers and templateMode false', () => {
  const { cwd } = liteProject();
  const config = JSON.parse(read(cwd, 'sdd.config.json'));
  assert.equal(config.templateMode, false);
  assert.deepEqual(config.project, { name: 'Habit Tracker', tier: 'lite' });
  assert.deepEqual(config.stack, { app: 'flutter', database: 'supabase' });
  assert.deepEqual(config.tools, ['claude', 'kiro']);
  assert.ok(config.generated.includes('docs/context/BRIEF.md'));
  assert.ok(!config.validate.requiredFiles.includes('docs/documentation/MODULARIZATION_GUIDE.md'));
  assert.ok(config.validate.requiredFiles.includes('docs/steering/database.md'));
});

test('lite init fills steering from the presets and the answers', () => {
  const { cwd } = liteProject();
  const tech = read(cwd, 'docs/steering/tech.md');
  assert.match(tech, /\| Language and runtime \| Dart \(Flutter stable\) \|/);
  assert.match(tech, /\| Data store \| Supabase \(PostgreSQL\) \|/);
  assert.match(tech, /\| Analyze or lint \| `flutter analyze` \|/);
  assert.match(tech, /\| Typecheck \| `none` \|/);
  assert.match(tech, /\| Data store change check \| `supabase db diff` \|/);
  assert.match(tech, /- `flutter analyze` at 0 issues/);
  assert.doesNotMatch(tech, /\{\{/);
  const structure = read(cwd, 'docs/steering/structure.md');
  assert.match(structure, /\| `lib\/features\/<feature>\/` \|/);
  assert.doesNotMatch(structure, /\{\{/);
  const product = read(cwd, 'docs/steering/product.md');
  assert.match(product, /^Habit Tracker is a Flutter project\.$/m);
  assert.match(product, /written in English/);
  assert.doesNotMatch(read(cwd, 'docs/steering/rules.md'), /\{\{/);
  assert.match(read(cwd, 'docs/context/ASSUMPTIONS.md'), /^owner: "sehan"$/m);
});

test('lite init generates a fileMatch database steering file from the db preset', () => {
  const { cwd } = liteProject();
  const database = read(cwd, 'docs/steering/database.md');
  assert.match(database, /^inclusion: fileMatch$/m);
  assert.match(database, /^fileMatchPattern: \["supabase\/\*\*"\]$/m);
  assert.match(database, /Row Level Security \(RLS\)/);
  assert.doesNotMatch(database, /docs\/runbooks/);
  assert.ok(exists(cwd, '.kiro/steering/database.md'));
  assert.match(read(cwd, 'AGENTS.md'), /## Conditional rules/);
});

test('lite init prunes the full-tier documents and every link to them', () => {
  const { cwd } = liteProject();
  for (const file of LITE_PRUNE) assert.ok(!exists(cwd, file), `${file} still exists`);
  for (const file of walk(cwd).filter((entry) => entry.endsWith('.md') && !entry.startsWith('node_modules/'))) {
    const text = read(cwd, file);
    assert.doesNotMatch(text, /\]\([^)]*(system-architecture\.md|architecture-baseline\.md|MODULARIZATION_GUIDE\.md|MODULE_ARCHITECTURE_GUIDE\.md|test-strategy\.md|runbooks\/)/, `${file} links a pruned file`);
  }
  assert.doesNotMatch(read(cwd, 'README.md'), /docs\/_templates\/architecture-baseline/);
});

test('init removes the template-only files and resets the changelog', () => {
  const { cwd } = liteProject();
  for (const file of ['scripts/context/__fixtures__', 'scripts/adapters/__fixtures__', 'scripts/init/__fixtures__', 'examples', 'docs/adr/ADR-0001-v2-revamp.md']) {
    assert.ok(!exists(cwd, file), `${file} still exists`);
  }
  assert.ok(exists(cwd, '.github/pull_request_template.md'));
  const changelog = read(cwd, 'CHANGELOG.md');
  assert.match(changelog, /^## \[Unreleased\]$/m);
  assert.doesNotMatch(changelog, /Phase 3/);
  for (const file of walk(cwd, 'scripts').filter((entry) => entry.endsWith('.test.mjs'))) {
    assert.doesNotMatch(read(cwd, file), /__fixtures__/, `${file} still depends on removed fixtures`);
  }
});

test('lite init ends with a passing validation and nothing left to fill by hand', () => {
  const { cwd, out } = liteProject();
  assert.match(out, /Context validation passed: 0 error\(s\)/);
  assert.doesNotMatch(out, /fill manually:/);
  const result = validate(cwd);
  assert.equal(result.status, 0, result.out);
});

test('lite init leaves no placeholder in any file outside the templates', () => {
  const { cwd } = liteProject();
  const left = walk(cwd)
    .filter((file) => /\.(md|json|yaml)$/.test(file) && !file.startsWith('node_modules/') && !file.includes('/_templates/'))
    .filter((file) => /\{\{[^{}]+\}\}/.test(read(cwd, file)))
    // Prose that names the placeholder convention itself, not an unfilled value.
    .filter((file) => !['docs/automation/README.md', 'docs/context/CONTEXT_SYSTEM.md', 'scripts/init/presets/README.md'].includes(file));
  assert.deepEqual(left, []);
});

test('init fills the CONTRIBUTING commands from the preset and strips the template-maintainer section', () => {
  const { cwd } = liteProject();
  const contributing = read(cwd, 'CONTRIBUTING.md');
  assert.match(contributing, /^flutter analyze$/m);
  assert.match(contributing, /^flutter test$/m);
  assert.match(contributing, /^npm run context:validate$/m);
  assert.doesNotMatch(contributing, /\{\{|template-only|UPDATE_SNAPSHOTS|scripts\/init\/presets/);
  assert.ok(!exists(cwd, 'scripts/migrate'), 'scripts/migrate still exists');
});
