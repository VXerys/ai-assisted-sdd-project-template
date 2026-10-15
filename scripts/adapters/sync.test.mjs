import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(here, '__fixtures__');
const expected = path.join(fixtures, 'multi-tool', '__expected__');
const sync = path.join(here, 'sync.mjs');

function run(cwd, args = []) {
  const result = spawnSync(process.execPath, [sync, ...args], { cwd, encoding: 'utf8' });
  return { status: result.status, out: `${result.stdout}\n${result.stderr}` };
}

function copyFixture(name) {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), `sdd-adapters-${name}-`));
  fs.cpSync(path.join(fixtures, name), target, { recursive: true });
  return target;
}

function read(cwd, file) {
  return fs.readFileSync(path.join(cwd, file), 'utf8');
}

// Set UPDATE_SNAPSHOTS=1 to rewrite the expected files after an intended format change.
function assertSnapshot(cwd, file) {
  const actual = read(cwd, file);
  const snapshot = path.join(expected, file);
  if (process.env.UPDATE_SNAPSHOTS) {
    fs.mkdirSync(path.dirname(snapshot), { recursive: true });
    fs.writeFileSync(snapshot, actual);
  }
  assert.equal(actual, fs.readFileSync(snapshot, 'utf8'), `${file} differs from its snapshot`);
}

test('AGENTS.md rendered from the multi-tool fixture matches its snapshot', () => {
  const cwd = copyFixture('multi-tool');
  const { status, out } = run(cwd);
  assert.equal(status, 0, out);
  assertSnapshot(cwd, 'AGENTS.md');
  assert.doesNotMatch(read(cwd, 'AGENTS.md'), /\r/);
});

test('a fileMatch steering file becomes a Cursor rule with globs that matches its snapshot', () => {
  const cwd = copyFixture('multi-tool');
  run(cwd);
  assertSnapshot(cwd, '.cursor/rules/database.mdc');
});

test('Cursor rules carry alwaysApply true for always and false without globs for manual', () => {
  const cwd = copyFixture('multi-tool');
  run(cwd);
  const product = read(cwd, '.cursor/rules/product.mdc');
  assert.match(product, /^alwaysApply: true$/m);
  assert.match(product, /^description: "Short product context for every session\."$/m);
  assert.doesNotMatch(product, /^globs:/m);
  const release = read(cwd, '.cursor/rules/release.mdc');
  assert.match(release, /^alwaysApply: false$/m);
  assert.doesNotMatch(release, /^globs:/m);
});

test('Copilot gets a short pointer file plus one applyTo instructions file per fileMatch steering file', () => {
  const cwd = copyFixture('multi-tool');
  run(cwd);
  const pointer = read(cwd, '.github/copilot-instructions.md');
  assert.match(pointer, /Todo API is a JSON API/);
  assert.match(pointer, /Follow `AGENTS\.md` and the rules in `docs\/steering\/`/);
  assert.match(pointer, /npm run context:validate/);
  assert.ok(pointer.split('\n').length < 20, 'pointer stays short');
  const database = read(cwd, '.github/instructions/database.instructions.md');
  assert.match(database, /^applyTo: "src\/db\/\*\*,migrations\/\*\*"$/m);
  assert.match(database, /Append-only; never edit an applied migration/);
  assert.equal(fs.existsSync(path.join(cwd, '.github/instructions/product.instructions.md')), false);
});

test('GEMINI.md imports AGENTS.md and adds three adapter lines', () => {
  const cwd = copyFixture('multi-tool');
  run(cwd);
  const gemini = read(cwd, 'GEMINI.md');
  assert.match(gemini, /^<!-- GENERATED FILE/);
  assert.match(gemini, /^@AGENTS\.md$/m);
  assert.equal(gemini.split('\n').filter((line) => line.startsWith('- ')).length, 3);
});

test('Kiro steering keeps the original frontmatter and body verbatim after the banner', () => {
  const cwd = copyFixture('multi-tool');
  run(cwd);
  const kiro = read(cwd, '.kiro/steering/database.md');
  assert.match(kiro, /^---\ninclusion: fileMatch\nfileMatchPattern: \["src\/db\/\*\*", "migrations\/\*\*"\]\n---\n<!-- GENERATED FILE/);
  assert.ok(kiro.endsWith(read(cwd, 'docs/steering/database.md').split('---\n')[2]));
});

test('CLAUDE.md imports AGENTS.md, keeps the adapter lines, and lists hooks and commands from .claude', () => {
  const cwd = copyFixture('multi-tool');
  run(cwd);
  const claude = read(cwd, 'CLAUDE.md');
  assert.match(claude, /^@AGENTS\.md$/m);
  assert.match(claude, /provider memory is an adapter, never a source of truth/);
  assert.match(claude, /\| SessionStart \| `startup\\\|resume\\\|compact` \| `scripts\/hooks\/session-start\.mjs` \|/);
  assert.match(claude, /\| Stop \| all \| `scripts\/hooks\/stop-handoff-check\.mjs` \|/);
  assert.match(claude, /\| `\/sdd:task <T-id>` \| Build the task prompt for a T-id and follow it \|/);
});

test('only the tools listed in sdd.config.json are generated unless --all is passed', () => {
  const cwd = copyFixture('multi-tool');
  const config = JSON.parse(read(cwd, 'sdd.config.json'));
  config.tools = ['claude'];
  fs.writeFileSync(path.join(cwd, 'sdd.config.json'), JSON.stringify(config, null, 2));
  run(cwd);
  assert.ok(fs.existsSync(path.join(cwd, 'AGENTS.md')));
  assert.ok(fs.existsSync(path.join(cwd, 'CLAUDE.md')));
  assert.equal(fs.existsSync(path.join(cwd, '.cursor')), false);
  assert.equal(fs.existsSync(path.join(cwd, 'GEMINI.md')), false);
  const all = run(cwd, ['--all']);
  assert.equal(all.status, 0, all.out);
  assert.ok(fs.existsSync(path.join(cwd, '.cursor/rules/product.mdc')));
  assert.ok(fs.existsSync(path.join(cwd, '.kiro/steering/release.md')));
});

test('--check passes right after a sync and fails on a hand-edited target', () => {
  const cwd = copyFixture('multi-tool');
  run(cwd);
  const fresh = run(cwd, ['--check']);
  assert.equal(fresh.status, 0, fresh.out);
  fs.appendFileSync(path.join(cwd, 'AGENTS.md'), '\nHand edit.\n');
  const stale = run(cwd, ['--check']);
  assert.equal(stale.status, 1);
  assert.match(stale.out, /AGENTS\.md: stale; run npm run adapters:sync/);
  assert.equal(run(cwd).status, 0);
  assert.equal(run(cwd, ['--check']).status, 0);
});

test('--check fails when a steering change is not synced, and sync is idempotent', () => {
  const cwd = copyFixture('multi-tool');
  run(cwd);
  const first = read(cwd, 'AGENTS.md');
  run(cwd);
  assert.equal(read(cwd, 'AGENTS.md'), first);
  fs.appendFileSync(path.join(cwd, 'docs/steering/rules.md'), '\n- New rule.\n');
  const stale = run(cwd, ['--check']);
  assert.equal(stale.status, 1);
  assert.match(stale.out, /AGENTS\.md: stale/);
  assert.match(stale.out, /\.cursor\/rules\/rules\.mdc: stale/);
});

test('an AGENTS.md over 400 lines is a warning, not a failure', () => {
  const cwd = copyFixture('multi-tool');
  fs.appendFileSync(path.join(cwd, 'docs/steering/rules.md'), '\n' + '- Padding rule.\n'.repeat(400));
  const { status, out } = run(cwd);
  assert.equal(status, 0, out);
  assert.match(out, /AGENTS\.md has \d+ lines, over the cap of 400/);
});
