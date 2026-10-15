import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { fillPlaceholders, remainingPlaceholders } from './lib/fill.mjs';
import { relink, stripTemplateOnly, LITE_PRUNE, TEMPLATE_ONLY } from './lib/prune.mjs';
import { walk } from '../context/lib/files.mjs';
import { INACTIVE_HANDOFF } from '../context/lib/handoff.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..', '..');
const snapshotDir = path.join(here, '__fixtures__');

// A temp copy of this repository with the `yaml` dependency, so init runs exactly as it would in a fresh clone.
function copyRepo(label) {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), `sdd-init-${label}-`));
  fs.cpSync(repo, target, { recursive: true, filter: (source) => !/[\\/](\.git|node_modules)([\\/]|$)/.test(source) });
  fs.cpSync(path.join(repo, 'node_modules', 'yaml'), path.join(target, 'node_modules', 'yaml'), { recursive: true });
  return target;
}

function init(cwd, args, input) {
  const result = spawnSync(process.execPath, [path.join(cwd, 'scripts', 'init', 'init.mjs'), ...args], { cwd, encoding: 'utf8', input });
  return { status: result.status, out: `${result.stdout}\n${result.stderr}`, stdout: result.stdout };
}

function validate(cwd) {
  const result = spawnSync(process.execPath, [path.join(cwd, 'scripts', 'context', 'validate-context.mjs')], { cwd, encoding: 'utf8' });
  return { status: result.status, out: `${result.stdout}\n${result.stderr}` };
}

const read = (cwd, file) => fs.readFileSync(path.join(cwd, file), 'utf8');
const exists = (cwd, file) => fs.existsSync(path.join(cwd, file));

function treeDigest(root) {
  return walk(root)
    .filter((file) => !file.startsWith('node_modules/'))
    .map((file) => `${file}:${fs.statSync(path.join(root, file)).size}:${read(root, file).length}`)
    .join('\n');
}

const LITE_ARGS = ['--yes', '--name', 'Habit Tracker', '--tier', 'lite', '--app', 'flutter', '--db', 'supabase', '--tools', 'claude,kiro', '--owner', 'sehan'];
const FULL_ARGS = ['--yes', '--name', 'Shop Admin', '--tier', 'full', '--app', 'nextjs', '--db', 'postgres', '--tools', 'claude', '--owner', 'sehan'];

let lite = null;
let full = null;

// One initialized copy per tier, shared by the tests that only read it.
function liteProject() {
  if (!lite) {
    const cwd = copyRepo('lite');
    const result = init(cwd, LITE_ARGS);
    assert.equal(result.status, 0, result.out);
    lite = { cwd, out: result.out };
  }
  return lite;
}

function fullProject() {
  if (!full) {
    const cwd = copyRepo('full');
    const result = init(cwd, FULL_ARGS);
    assert.equal(result.status, 0, result.out);
    full = { cwd, out: result.out };
  }
  return full;
}

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

// Set UPDATE_SNAPSHOTS=1 to rewrite the plan snapshot after an intended change to the plan format.
test('--dry-run prints the plan, changes nothing, and matches its snapshot', () => {
  const cwd = copyRepo('dry');
  const before = treeDigest(cwd);
  const result = init(cwd, ['--dry-run', ...LITE_ARGS]);
  assert.equal(result.status, 0, result.out);
  assert.equal(treeDigest(cwd), before, 'dry run changed files');
  const plan = result.stdout.replace(/\r\n/g, '\n').split('\nFill manually')[0];
  const snapshot = path.join(snapshotDir, 'dry-run-plan.txt');
  if (process.env.UPDATE_SNAPSHOTS) fs.writeFileSync(snapshot, plan);
  assert.equal(plan, fs.readFileSync(snapshot, 'utf8'));
  assert.match(result.stdout, /Dry run: nothing changed\./);
});

test('init refuses to run twice unless --force is given', () => {
  const { cwd } = liteProject();
  const refused = init(cwd, LITE_ARGS);
  assert.equal(refused.status, 1);
  assert.match(refused.out, /templateMode is already false/);
  const forced = init(cwd, ['--force', ...LITE_ARGS]);
  assert.equal(forced.status, 0, forced.out);
  assert.equal(validate(cwd).status, 0);
});

test('init rejects an unknown preset, tier, or tool before touching anything', () => {
  const cwd = copyRepo('reject');
  const before = treeDigest(cwd);
  assert.match(init(cwd, ['--yes', '--app', 'rails']).out, /unknown app preset 'rails'/);
  assert.match(init(cwd, ['--yes', '--tier', 'medium']).out, /tier must be lite or full/);
  assert.match(init(cwd, ['--yes', '--tools', 'claude,emacs']).out, /unknown tool 'emacs'/);
  assert.equal(treeDigest(cwd), before);
});

test('init prompts on stdin for every value a flag did not set', () => {
  const cwd = copyRepo('prompt');
  const answers = ['Prompted App', 'lite', 'node-api', 'none', 'claude', 'sehan', 'Indonesian', 'a CLI for prompts'].join('\n') + '\n';
  const result = init(cwd, ['--dry-run'], answers);
  assert.equal(result.status, 0, result.out);
  assert.match(result.stdout, /Project name/);
  assert.match(result.stdout, /Prompted App .*lite.*node-api.*none.*claude/);
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
  assert.match(tech, /\| Data store change check \| `supabase db reset` \|/);
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
