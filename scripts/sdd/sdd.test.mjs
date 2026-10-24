import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { compareVersions, inferAnswers, initArgs, mergeText, planFile } from './upgrade.mjs';
import { stampLegacyEvidence } from './migrations/2.1.1.mjs';
import { ensureIgnoreEntries } from './migrations/2.1.2.mjs';
import { guardCheck } from './guard-check.mjs';
import { normalizeConfig } from '../context/lib/config.mjs';

test('planFile takes the template file only where the project kept the base', () => {
  assert.equal(planFile({ base: 'a', theirs: 'b', ours: 'a' }).action, 'update');
  assert.equal(planFile({ base: 'a', theirs: 'a', ours: 'x' }).action, 'keep');
  assert.equal(planFile({ base: 'a', theirs: 'b', ours: 'x' }).action, 'merge');
  assert.equal(planFile({ base: null, theirs: 'b', ours: null }).action, 'add');
  assert.equal(planFile({ base: 'a', theirs: null, ours: 'a' }).action, 'delete');
  assert.equal(planFile({ base: 'a', theirs: null, ours: 'x' }).action, 'report');
  assert.equal(planFile({ base: 'a', theirs: 'b', ours: null }).action, 'report');
  assert.equal(planFile({ base: 'a', theirs: 'a', ours: null }).action, 'keep');
  assert.equal(planFile({ base: 'a', theirs: 'b', ours: 'b' }).action, 'keep');
});

test('mergeText merges separate hunks and marks a conflict on the same line', () => {
  const base = 'one\ntwo\nthree\nfour\nfive\n';
  const clean = mergeText('ONE\ntwo\nthree\nfour\nfive\n', base, 'one\ntwo\nthree\nfour\nFIVE\n');
  assert.equal(clean.conflicts, 0);
  assert.equal(clean.text, 'ONE\ntwo\nthree\nfour\nFIVE\n');
  const conflict = mergeText('one\nours\nthree\nfour\nfive\n', base, 'one\ntheirs\nthree\nfour\nfive\n');
  assert.equal(conflict.conflicts, 1);
  assert.match(conflict.text, /<<<<<<< project\nours\n=======\ntheirs\n>>>>>>> template/);
});

test('compareVersions orders release numbers numerically', () => {
  assert.equal(compareVersions('2.0.0', '2.1.0'), -1);
  assert.equal(compareVersions('v2.10.0', '2.9.1'), 1);
  assert.equal(compareVersions('2.1.0', '2.1.0'), 0);
});

test('guardCheck fails on a changed secret or frozen path, warns on protected, and ignores generated', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-guard-check-'));
  const git = (...args) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t.invalid', ...args], { cwd: root, encoding: 'utf8' });
  git('init', '-q', '-b', 'main');
  fs.writeFileSync(path.join(root, 'README.md'), 'x\n');
  git('add', '-A');
  git('commit', '-q', '-m', 'base');
  for (const file of ['.env.local', 'src/legacy/a.js', 'sdd.config.json', 'AGENTS.md', 'src/app.js']) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), 'x\n');
  }
  const config = normalizeConfig({ project: { name: 'T', tier: 'lite' }, generated: ['AGENTS.md'], frozen: ['src/legacy/'], templateMode: false });
  const { findings, checked } = guardCheck(root, config);
  assert.equal(checked, 5);
  const byFile = Object.fromEntries(findings.map((finding) => [finding.file, `${finding.level} ${finding.rule}`]));
  assert.deepEqual(byFile, { '.env.local': 'error secret', 'sdd.config.json': 'warning protected', 'src/legacy/a.js': 'error frozen' });
  assert.equal(guardCheck(root, config, { strict: true }).findings.find((finding) => finding.rule === 'protected').level, 'error');
});

test('inferAnswers reads the init answers back from sdd.config.json, product.md, prd.md, and git', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-infer-'));
  const git = (...args) => spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  git('init', '-q', '-b', 'main');
  git('config', 'user.name', 'git-user');
  fs.mkdirSync(path.join(root, 'docs', 'steering'), { recursive: true });
  fs.mkdirSync(path.join(root, 'docs', 'product'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs', 'steering', 'product.md'), '---\ninclusion: always\n---\n\n# Product\n\n## Vision\n\nHabit Tracker logs a daily reading session from a phone.\n\nProject content (specs, product docs, UI copy) is written in Indonesian; the framework text stays English.\n');
  fs.writeFileSync(path.join(root, 'docs', 'product', 'prd.md'), '---\nid: PRD\ntitle: Habit Tracker\nowner: "sehan"\ncreated: 2026-10-20\n---\n\n# PRD\n');
  const config = normalizeConfig({ project: { name: 'Habit Tracker', tier: 'lite' }, stack: { app: 'flutter', database: 'supabase' }, tools: ['claude', 'kiro'], templateMode: false });

  const full = inferAnswers(root, config);
  assert.deepEqual(full.missing, []);
  assert.deepEqual(full.answers, {
    name: 'Habit Tracker', description: 'Habit Tracker logs a daily reading session from a phone.', tier: 'lite', app: 'flutter', db: 'supabase',
    tools: ['claude', 'kiro'], owner: 'sehan', lang: 'Indonesian', date: '2026-10-20'
  });
  assert.equal(full.sources.owner, 'docs/product/prd.md');
  assert.equal(full.sources.date, 'docs/product/prd.md');

  // Without the documents, init's own defaults and git stand in; nothing is missing.
  fs.rmSync(path.join(root, 'docs'), { recursive: true });
  const bare = inferAnswers(root, config);
  assert.deepEqual(bare.missing, []);
  assert.equal(bare.answers.description, 'Habit Tracker is a flutter project.');
  assert.equal(bare.answers.owner, 'git-user');
  assert.equal(bare.sources.owner, 'git config user.name');
  assert.equal(bare.answers.lang, 'English');
  assert.equal(bare.sources.lang, 'default');
  assert.match(bare.answers.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(bare.sources.date, 'default');
});

test('initArgs passes only the flags the target init version lists in its usage', () => {
  const answers = { name: 'Habit Tracker', description: 'x', tier: 'lite', app: 'flutter', db: 'supabase', tools: ['claude', 'kiro'], owner: 'sehan', lang: 'English', date: '2026-10-20' };
  const usage200 = 'Flags:\n  --name <text>\n  --description <text>\n  --tier lite|full\n  --app <preset>\n  --db <preset>\n  --tools <list>\n  --owner <name>\n  --lang <language>\n  --yes\n  --dry-run\n';
  const args = initArgs(answers, usage200);
  assert.ok(!args.includes('--date'), '2.0.0 init has no --date');
  assert.deepEqual(args.slice(0, 5), ['--yes', '--name', 'Habit Tracker', '--description', 'x']);
  assert.equal(args[args.indexOf('--tools') + 1], 'claude,kiro');
  assert.ok(initArgs(answers, `${usage200}  --date <YYYY-MM-DD>\n`).includes('--date'));
  assert.ok(initArgs(answers, 'ERROR: something else').includes('--date'), 'unreadable usage passes every flag');
});

test('ensureIgnoreEntries appends only the Claude Code entries a .gitignore lacks', () => {
  const partial = 'node_modules/\n.env\n.claude/settings.local.json\n';
  const { text, added } = ensureIgnoreEntries(partial);
  assert.equal(added, 3);
  assert.match(text, /^node_modules\/\n\.env\n\.claude\/settings\.local\.json\n\n# Claude Code: [^\n]+\n\.claude\/\.sdd-session\/\n\.claude\/worktrees\/\n\.claude\/agent-memory\/\n$/);
  assert.deepEqual(ensureIgnoreEntries(text), { text, added: 0 });
  assert.equal(ensureIgnoreEntries('').added, 4);
  assert.equal(ensureIgnoreEntries('.claude/worktrees\r\n').added, 3, 'a trailing slash or CRLF does not hide an entry');
});

test('stampLegacyEvidence marks evidence dated before the upgrade and leaves newer or stamped blocks alone', () => {
  const block = (id, title, date, extra = []) => [`### ${id} — ${title}`, '- command: `echo pass`', '- output:', '  ```text', '  ok', '  ```', `- date: ${date}`, ...extra, '- commit: abc1234', '- covers: [AC-001]', ''];
  const outputLast = ['### EV-004 — output last', '- date: 2026-01-01', '- commit: abc1234', '- covers: [AC-001]', '- command: `echo pass`', '- output:', '  ```text', '  ok', '  ```', ''];
  const text = ['# Verification', '', ...block('EV-001', 'old', '2026-01-05'), ...block('EV-002', 'today', '2026-10-23'), ...block('EV-003', 'stamped', '2026-01-01', ['- legacy: true']), ...outputLast, '## Coverage', ''].join('\n');

  const { text: stamped, stamped: count } = stampLegacyEvidence(text, '2026-10-23');
  assert.equal(count, 2);
  assert.equal(stamped.match(/^- legacy: true$/gm).length, 3);
  assert.match(stamped.split('### EV-002')[0], /- covers: \[AC-001\]\n- legacy: true\n/);
  assert.doesNotMatch(stamped.split('### EV-002')[1].split('### EV-003')[0], /legacy/);
  assert.match(stamped.split('### EV-004')[1], /  ```\n- legacy: true\n\n## Coverage/);
  assert.deepEqual(stampLegacyEvidence(stamped, '2026-10-23'), { text: stamped, stamped: 0 });
});
