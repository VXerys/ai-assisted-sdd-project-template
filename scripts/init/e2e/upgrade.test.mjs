import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { LITE_ARGS, copyRepo, init, read, validate } from './helpers.mjs';
import { localDate } from '../../sdd/migrations/2.1.1.mjs';

function git(cwd, ...args) {
  const result = spawnSync('git', ['-c', 'user.name=sdd-test', '-c', 'user.email=sdd@test.invalid', '-c', 'core.autocrlf=false', ...args], { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, `git ${args.join(' ')}: ${result.stderr}`);
  return result.stdout.trim();
}

function sdd(cwd, ...args) {
  const result = spawnSync(process.execPath, [path.join(cwd, 'scripts', 'sdd', 'cli.mjs'), ...args], { cwd, encoding: 'utf8' });
  return { status: result.status, out: `${result.stdout}\n${result.stderr}` };
}

const edit = (cwd, file, change) => fs.writeFileSync(path.join(cwd, file), change(read(cwd, file).replace(/\r\n/g, '\n')));

// A template repository with history, a project cloned and initialized from it, then a template release.
function scenario() {
  const template = copyRepo('upgrade-template');
  git(template, 'init', '-q', '-b', 'main');
  git(template, 'add', '-A');
  git(template, 'commit', '-q', '-m', 'template 1');

  const project = path.join(path.dirname(template), `${path.basename(template)}-project`);
  git(path.dirname(template), 'clone', '-q', template, project);
  fs.cpSync(path.join(template, 'node_modules'), path.join(project, 'node_modules'), { recursive: true });
  const initialized = init(project, LITE_ARGS);
  assert.equal(initialized.status, 0, initialized.out);
  git(project, 'add', '-A');
  git(project, 'commit', '-q', '-m', 'init');

  // Template release: a clean change, a change on a line the project also edits, a new file, a version bump.
  edit(template, 'docs/specs/_templates/tasks.md', (text) => `${text}\nTemplate release note.\n`);
  edit(template, 'docs/_templates/adr.md', (text) => text.replace('One expensive-to-reverse decision per record.', 'One decision per record, from the template.'));
  edit(template, 'scripts/hooks/stop-handoff-check.mjs', (text) => `${text}// template release marker\n`);
  fs.writeFileSync(path.join(template, 'docs/_templates/new-template.md'), '# New template\n');
  edit(template, 'package.json', (text) => text.replace(/"version": "[^"]+"/, '"version": "9.9.9"'));
  git(template, 'add', '-A');
  git(template, 'commit', '-q', '-m', 'template 2');

  // Project edits: one merges cleanly with the template change, one conflicts.
  edit(project, 'docs/specs/_templates/tasks.md', (text) => text.replace(/^---\n/, '---\n# project note\n'));
  edit(project, 'docs/_templates/adr.md', (text) => text.replace('One expensive-to-reverse decision per record.', 'One decision per record, project wording.'));
  git(project, 'commit', '-q', '-am', 'project edits');
  return { template, project };
}

// The first test only reads; the second upgrades the same copy, so they share one scenario in file order.
let shared = null;
const sharedScenario = () => (shared ??= scenario());

test('init records the template version, commit, answers, and a manifest of the managed files', () => {
  const { project, template } = sharedScenario();
  const config = JSON.parse(read(project, 'sdd.config.json'));
  assert.equal(config.template.commit, git(template, 'rev-parse', 'HEAD~1'));
  assert.equal(config.template.answers.app, 'flutter');
  assert.match(config.template.answers.date, /^\d{4}-\d{2}-\d{2}$/);
  const manifest = JSON.parse(read(project, '.sdd/manifest.json'));
  assert.ok(manifest.files['scripts/sdd/upgrade.mjs']);
  assert.equal(manifest.files['docs/steering/rules.md'], undefined, 'steering is never managed');

  const status = sdd(project, 'status');
  assert.match(status.out, /2 edited/);
  assert.match(status.out, /edited {3}docs\/_templates\/adr\.md/);
  const check = sdd(project, 'check', '--from', template);
  assert.equal(check.status, 1, check.out);
  assert.match(check.out, /template 9\.9\.9 is available/);
});

test('sdd upgrade updates unedited files, merges edited ones, marks conflicts, and records the new version', () => {
  const { project, template } = sharedScenario();
  const before = git(project, 'status', '--porcelain');
  const dry = sdd(project, 'upgrade', '--from', template, '--dry-run');
  assert.equal(dry.status, 0, dry.out);
  assert.match(dry.out, /conflict docs\/_templates\/adr\.md/);
  assert.equal(git(project, 'status', '--porcelain'), before, 'dry run changed files');

  const result = sdd(project, 'upgrade', '--from', template);
  assert.equal(result.status, 1, result.out);
  assert.match(result.out, /update {3}scripts\/hooks\/stop-handoff-check\.mjs/);
  assert.match(result.out, /add {6}docs\/_templates\/new-template\.md/);
  assert.match(result.out, /merge {4}docs\/specs\/_templates\/tasks\.md/);
  assert.match(read(project, 'scripts/hooks/stop-handoff-check.mjs'), /template release marker/);
  const tasks = read(project, 'docs/specs/_templates/tasks.md');
  assert.match(tasks, /# project note/);
  assert.match(tasks, /Template release note\./);
  assert.match(read(project, 'docs/_templates/adr.md'), /<<<<<<< project[\s\S]*project wording[\s\S]*=======[\s\S]*from the template[\s\S]*>>>>>>> template/);
  assert.ok(fs.existsSync(path.join(project, 'docs/_templates/new-template.md')));

  const config = JSON.parse(read(project, 'sdd.config.json'));
  assert.equal(config.template.version, '9.9.9');
  assert.equal(config.template.commit, git(template, 'rev-parse', 'HEAD'));
  assert.equal(JSON.parse(read(project, '.sdd/manifest.json')).version, '9.9.9');
  assert.match(sdd(project, 'check', '--from', template).out, /up to date with template 9\.9\.9/);
});

test('sdd upgrade refuses a dirty working tree', () => {
  const { project, template } = scenario();
  fs.appendFileSync(path.join(project, 'README.md'), '\nuncommitted\n');
  const result = sdd(project, 'upgrade', '--from', template);
  assert.equal(result.status, 1);
  assert.match(result.out, /uncommitted changes/);
});

// A project initialized before 2.1.0: no template record, no manifest, evidence from before the upgrade.
test('sdd upgrade infers the init answers of a project without a template record and stamps older evidence as legacy', () => {
  const { template, project } = scenario();
  const baseRef = git(template, 'rev-parse', 'HEAD~1');
  edit(project, 'sdd.config.json', (text) => `${JSON.stringify({ ...JSON.parse(text), template: undefined }, null, 2)}\n`);
  fs.rmSync(path.join(project, '.sdd'), { recursive: true, force: true });
  const feature = path.join(project, 'docs', 'specs', 'F-001-demo');
  fs.mkdirSync(feature, { recursive: true });
  const frontmatter = (type) => `---\nid: F-001\ntitle: Demo\ntype: ${type}\nstatus: implementing\ntier: lite\nowner: sehan\ncreated: 2026-01-05\nlast_updated: 2026-01-05\nlast_verified: 2026-01-05\nsupersedes: null\n---\n`;
  fs.writeFileSync(path.join(feature, 'requirements.md'), `${frontmatter('requirements')}\n# Demo\n\n### FR-001 — Demo\n- AC-001: Given a thing, when it runs, then it passes.\n`);
  fs.writeFileSync(path.join(feature, 'tasks.md'), `${frontmatter('tasks')}\n# Tasks\n\n### T-001 — Demo\n- status: done\n- requirements: [FR-001]\n- depends_on: []\n- evidence: [EV-001]\n`);
  const evidence = (id, title, command, date) => `### ${id} — ${title}\n- command: \`${command}\`\n- output:\n  \`\`\`text\n  ok\n  \`\`\`\n- date: ${date}\n- commit: abc1234\n- covers: [AC-001]\n`;
  fs.writeFileSync(path.join(feature, 'verification.md'), `${frontmatter('verification')}\n# Verification\n\n${evidence('EV-001', 'before the upgrade', 'flutter test && flutter build apk', '2026-01-05')}\n${evidence('EV-002', 'after the upgrade', 'flutter test && flutter build apk', localDate(new Date()))}`);
  git(project, 'add', '-A');
  git(project, 'commit', '-q', '-m', 'a 2.0 project with evidence');

  const check = sdd(project, 'check', '--from', template);
  assert.equal(check.status, 1, check.out);
  assert.match(check.out, /no template record/);

  const result = sdd(project, 'upgrade', '--from', template, '--base-ref', baseRef);
  assert.match(result.out, /Init answers inferred: name \(sdd\.config\.json\), description \(docs\/steering\/product\.md\)/);
  assert.match(result.out, /owner \(docs\/product\/prd\.md\)/);
  assert.match(result.out, /migrate {2}2\.1\.1 \(after\)/);
  const config = JSON.parse(read(project, 'sdd.config.json'));
  assert.equal(config.template.version, '9.9.9');
  assert.deepEqual(
    [config.template.answers.name, config.template.answers.app, config.template.answers.db, config.template.answers.tools, config.template.answers.owner],
    ['Habit Tracker', 'flutter', 'supabase', ['claude', 'kiro'], 'sehan']
  );
  assert.ok(fs.existsSync(path.join(project, '.sdd', 'manifest.json')));

  const verification = read(project, 'docs/specs/F-001-demo/verification.md').replace(/\r\n/g, '\n');
  assert.match(verification, /- date: 2026-01-05\n- commit: abc1234\n- covers: \[AC-001\]\n- legacy: true\n/);
  assert.doesNotMatch(verification.split('### EV-002')[1], /legacy/);
  const validation = validate(project);
  assert.match(validation.out, /info\s+EV-001 command `flutter test && flutter build apk` is not in the tech\.md Commands table \(legacy evidence\)/);
  assert.match(validation.out, /info\s+EV-001 commit abc1234 is not in git log \(legacy evidence\)/);
  assert.match(validation.out, /error\s+EV-002 command `flutter test && flutter build apk` is not in the tech\.md Commands table/);
  assert.match(validation.out, /error\s+EV-002 commit abc1234 is not in git log/);
});
