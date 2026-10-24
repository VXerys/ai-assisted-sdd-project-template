// `sdd upgrade`, `sdd status`, `sdd check` (ADR-0003): copier's base rebuild plus a hash manifest of
// managed files, so a template fix reaches a project as a 3-way merge and never overwrites an edit silently.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

import { matchesAny } from '../lib/glob.mjs';
import { walk } from '../context/lib/files.mjs';

export const MANIFEST_PATH = '.sdd/manifest.json';

// What a template release may rewrite. Steering, specs, product, ADRs, handoff, assumptions, and the
// changelog belong to the project and are never listed; sdd.config.json `managed` replaces this list.
export const DEFAULT_MANAGED = [
  'scripts/context/', 'scripts/adapters/', 'scripts/hooks/', 'scripts/lib/', 'scripts/sdd/', 'scripts/init/',
  '.claude/commands/', '.claude/settings.json',
  'docs/_templates/', 'docs/specs/_templates/', 'docs/specs/README.md', 'docs/adr/README.md', 'docs/architecture/README.md',
  'docs/context/NEW_CHAT_PROTOCOL.md', 'docs/context/CONTEXT_SYSTEM.md', 'docs/context/CONTEXT_INDEX.md',
  'docs/automation/', 'docs/documentation/',
  '.github/workflows/context-integrity.yml', '.github/pull_request_template.md', '.github/dependabot.yml',
  '.gitattributes', 'package.json'
];

const ANSWER_KEYS = ['name', 'description', 'tier', 'app', 'db', 'tools', 'owner', 'lang', 'date'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const sha256 = (text) => crypto.createHash('sha256').update(lf(text)).digest('hex');
const lf = (text) => String(text).replace(/\r\n/g, '\n');
const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// Reads the init answers back from a project that recorded none (initialized before 2.1.0, ADR-0004):
// the stack and tools from sdd.config.json, the rest from the documents init filled, with init's own
// defaults where a document no longer carries the value. Only name, tier, app, db, and tools reach
// managed files, so those must be exact; the others only shape documents upgrade never touches.
export function inferAnswers(root, config) {
  const text = (file) => (fs.existsSync(path.join(root, file)) ? lf(fs.readFileSync(path.join(root, file), 'utf8')) : '');
  const field = (doc, key) => {
    const value = doc.match(new RegExp(`^${key}:[ \\t]*"?([^"\\n]*?)"?[ \\t]*$`, 'm'))?.[1].trim();
    return value && !value.includes('{{') ? value : null;
  };
  const tryGit = (args) => {
    try {
      return git(root, args).trim() || null;
    } catch {
      return null;
    }
  };
  const product = text('docs/steering/product.md');
  const prd = text('docs/product/prd.md');
  const lines = product.split('\n');
  const vision = lines.findIndex((line) => /^##\s+Vision\b/i.test(line));
  const description = vision === -1 ? null : lines.slice(vision + 1).map((line) => line.trim()).find((line) => line && !/^(#|<!--|\{\{)/.test(line)) ?? null;
  const lang = product.match(/is written in ([^;.\n]+)/)?.[1].trim() ?? null;
  const created = field(prd, 'created');
  const owner = field(prd, 'owner');

  const found = {
    name: [config.project?.name, 'sdd.config.json'],
    tier: [config.project?.tier, 'sdd.config.json'],
    app: [config.stack?.app, 'sdd.config.json'],
    db: [config.stack?.database, 'sdd.config.json'],
    tools: [config.tools?.length ? config.tools : null, 'sdd.config.json'],
    description: [description, 'docs/steering/product.md'],
    owner: owner ? [owner, 'docs/product/prd.md'] : [tryGit(['config', 'user.name']), 'git config user.name'],
    lang: [lang, 'docs/steering/product.md'],
    date: created && DATE.test(created) ? [created, 'docs/product/prd.md'] : [tryGit(['log', '--reverse', '--format=%cs'])?.split('\n')[0] ?? null, 'git log']
  };
  const name = found.name[0];
  const app = found.app[0];
  const defaults = { description: name && app ? `${name} is a ${app} project.` : null, lang: 'English', date: localDate(new Date()) };
  const answers = {};
  const sources = {};
  const missing = [];
  for (const key of ANSWER_KEYS) {
    const [value, source] = found[key];
    if (value) {
      answers[key] = value;
      sources[key] = source;
    } else if (defaults[key]) {
      answers[key] = defaults[key];
      sources[key] = 'default';
    } else {
      missing.push(key);
    }
  }
  return { answers, sources, missing };
}

export function managedFiles(root, patterns) {
  return walk(root).filter((file) => !file.startsWith('node_modules/') && !file.startsWith('.git/') && matchesAny(file, patterns));
}

export function writeManifest(root, version, patterns) {
  const files = {};
  for (const file of managedFiles(root, patterns)) files[file] = sha256(fs.readFileSync(path.join(root, file), 'utf8'));
  fs.mkdirSync(path.join(root, path.dirname(MANIFEST_PATH)), { recursive: true });
  fs.writeFileSync(path.join(root, MANIFEST_PATH), `${JSON.stringify({ version, files }, null, 2)}\n`);
  return files;
}

export function readManifest(root) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, MANIFEST_PATH), 'utf8'));
  } catch {
    return null;
  }
}

// Managed files whose content differs from what the template wrote, and managed files the project deleted.
export function status(root) {
  const manifest = readManifest(root);
  if (!manifest) return { manifest: null, edited: [], missing: [] };
  const edited = [];
  const missing = [];
  for (const [file, hash] of Object.entries(manifest.files ?? {})) {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) missing.push(file);
    else if (sha256(fs.readFileSync(full, 'utf8')) !== hash) edited.push(file);
  }
  return { manifest, edited, missing };
}

// The decision for one managed file given its three versions (null = absent). Pure, so it is unit-tested.
export function planFile({ base, theirs, ours }) {
  if (ours === theirs) return { action: 'keep', reason: 'already current' };
  if (ours === null) {
    if (base === null) return { action: 'add' };
    return theirs === base || theirs === null ? { action: 'keep', reason: 'deleted in the project' } : { action: 'report', reason: 'deleted in the project, changed by the template' };
  }
  if (theirs === null) return ours === base ? { action: 'delete' } : { action: 'report', reason: 'removed by the template, edited in the project' };
  if (ours === base) return { action: 'update' };
  if (theirs === base) return { action: 'keep', reason: 'edited in the project only' };
  return { action: 'merge' };
}

// git merge-file exits with the number of conflicts (negative on error) and prints the result with -p.
export function mergeText(ours, base, theirs, labels = ['project', 'base', 'template']) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-merge-'));
  const files = ['ours', 'base', 'theirs'].map((name, index) => {
    const file = path.join(dir, name);
    fs.writeFileSync(file, [ours, base, theirs][index] ?? '');
    return file;
  });
  const result = spawnSync('git', ['merge-file', '-p', '-L', labels[0], '-L', labels[1], '-L', labels[2], ...files], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  if (result.status === null || result.status < 0 || result.error) throw new Error(`git merge-file failed: ${result.error?.message ?? result.stderr}`);
  return { text: result.stdout, conflicts: result.status };
}

function git(cwd, args, options = {}) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options });
}

function resolveRef(from, ref) {
  try {
    return git(from, ['rev-parse', '--verify', `${ref}^{commit}`]).trim();
  } catch {
    return null;
  }
}

// Extracts the template at `commit` and runs that version's own init with the recorded answers.
export function renderTemplate(from, commit, answers, yamlSource) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-upgrade-'));
  const archive = spawnSync('git', ['archive', '--format=tar', commit], { cwd: from, maxBuffer: 512 * 1024 * 1024 });
  if (archive.status !== 0) throw new Error(`git archive ${commit} failed: ${archive.stderr}`);
  const untar = spawnSync('tar', ['-x', '-C', dir], { input: archive.stdout });
  if (untar.status !== 0) throw new Error(`tar failed: ${untar.stderr}`);
  fs.cpSync(yamlSource, path.join(dir, 'node_modules', 'yaml'), { recursive: true });
  const args = ['--yes'];
  for (const key of ANSWER_KEYS) {
    const value = Array.isArray(answers[key]) ? answers[key].join(',') : answers[key];
    if (value !== undefined && value !== null && value !== '') args.push(`--${key}`, String(value));
  }
  const run = spawnSync(process.execPath, [path.join(dir, 'scripts', 'init', 'init.mjs'), ...args], { cwd: dir, encoding: 'utf8' });
  const config = JSON.parse(fs.readFileSync(path.join(dir, 'sdd.config.json'), 'utf8'));
  if (config.templateMode !== false) throw new Error(`init of ${commit.slice(0, 12)} did not complete:\n${run.stdout}\n${run.stderr}`);
  return dir;
}

function versionAt(from, commit) {
  return JSON.parse(git(from, ['show', `${commit}:package.json`])).version;
}

export function compareVersions(a, b) {
  const parts = (value) => String(value).replace(/^v/, '').split(/[.-]/).map((part) => (/^\d+$/.test(part) ? Number(part) : part));
  const [x, y] = [parts(a), parts(b)];
  for (let index = 0; index < Math.max(x.length, y.length); index += 1) {
    if (x[index] === y[index]) continue;
    if (x[index] === undefined) return -1;
    if (y[index] === undefined) return 1;
    return x[index] < y[index] ? -1 : 1;
  }
  return 0;
}

export function check(config, { from, to = 'HEAD' }) {
  const current = config.template?.version;
  const commit = resolveRef(from, to);
  if (!commit) throw new Error(`${to} is not a commit in ${from}`);
  const latest = versionAt(from, commit);
  if (!current) {
    return { behind: true, current: null, latest, message: `sdd.config.json has no template record (initialized before 2.1.0); template ${latest} is available: run sdd upgrade --from ${from}, the init answers are inferred` };
  }
  const behind = compareVersions(current, latest) < 0;
  return { behind, current, latest, message: behind ? `template ${latest} is available (project on ${current}); run sdd upgrade --from ${from}` : `up to date with template ${latest}` };
}

// Loads the migrations shipped by the new template version: scripts/sdd/migrations/<version>.mjs,
// each exporting `migrate({root, stage})`, run for versions after `fromVersion` up to `toVersion`.
async function runMigrations(newDir, root, fromVersion, toVersion, stage, log) {
  const dir = path.join(newDir, 'scripts', 'sdd', 'migrations');
  if (!fs.existsSync(dir)) return;
  const versions = fs.readdirSync(dir).filter((file) => /^\d+\.\d+\.\d+\.mjs$/.test(file)).map((file) => file.replace(/\.mjs$/, ''))
    .filter((version) => compareVersions(version, fromVersion) > 0 && compareVersions(version, toVersion) <= 0)
    .sort(compareVersions);
  for (const version of versions) {
    const module = await import(new URL(`file:///${path.join(dir, `${version}.mjs`).replace(/\\/g, '/')}`));
    if (typeof module.migrate === 'function') {
      await module.migrate({ root, stage });
      log(`  migrate  ${version} (${stage})`);
    }
  }
}

export async function upgrade(root, config, options, log = console.log) {
  const { from, to = 'HEAD', dryRun = false, conflict = 'inline' } = options;
  if (!['inline', 'rej'].includes(conflict)) throw new Error('--conflict must be inline or rej');
  const template = config.template ?? {};
  let answers = options.answers ?? (options.inferAnswers ? null : template.answers) ?? null;
  let inference = null;
  if (!answers) {
    inference = inferAnswers(root, config);
    if (inference.missing.length) {
      throw new Error(`cannot infer the init answers for ${inference.missing.join(', ')}; pass --answers <file.json> with name, description, tier, app, db, tools, owner, lang, date`);
    }
    answers = inference.answers;
  }
  if (!fs.existsSync(path.join(from, '.git'))) throw new Error(`${from} is not a git checkout of the template`);

  if (!dryRun) {
    const dirty = git(root, ['status', '--porcelain']).trim();
    if (dirty) throw new Error('the working tree has uncommitted changes; commit or stash them first');
  }
  // A repository created with GitHub's "Use this template" starts a new history, so the recorded
  // commit may be unknown to the template checkout; the release tag of the recorded version is next,
  // and a project without any record was initialized from 2.0.0, the first version with sdd.config.json.
  const recorded = [template.commit, template.version && `v${template.version}`].filter(Boolean);
  const candidates = options.baseRef ? [options.baseRef] : recorded.length ? recorded : ['v2.0.0'];
  const baseCommit = candidates.map((ref) => resolveRef(from, ref)).find(Boolean);
  if (!baseCommit) throw new Error(`base ${candidates.join(' or ') || '(none)'} is not in ${from}; run git fetch --tags there or pass --base-ref`);
  const newCommit = resolveRef(from, to);
  if (!newCommit) throw new Error(`${to} is not a commit in ${from}`);
  const fromVersion = versionAt(from, baseCommit);
  const toVersion = versionAt(from, newCommit);

  const yamlSource = path.join(root, 'node_modules', 'yaml');
  if (!fs.existsSync(yamlSource)) throw new Error('node_modules/yaml is missing; run npm ci first');
  log(`Upgrade ${fromVersion} (${baseCommit.slice(0, 12)}) -> ${toVersion} (${newCommit.slice(0, 12)})${dryRun ? ', dry run' : ''}`);
  if (inference) {
    const inferred = ANSWER_KEYS.filter((key) => inference.sources[key] !== 'default').map((key) => `${key} (${inference.sources[key]})`);
    const defaulted = ANSWER_KEYS.filter((key) => inference.sources[key] === 'default').map((key) => `${key}=${inference.answers[key]}`);
    log(`Init answers inferred: ${inferred.join(', ')}${defaulted.length ? `; defaults: ${defaulted.join(', ')}` : ''}`);
  }
  const baseDir = renderTemplate(from, baseCommit, answers, yamlSource);
  const newDir = renderTemplate(from, newCommit, answers, yamlSource);

  const patterns = config.managed ?? DEFAULT_MANAGED;
  const read = (dir, file) => (fs.existsSync(path.join(dir, file)) ? lf(fs.readFileSync(path.join(dir, file), 'utf8')) : null);
  const files = [...new Set([baseDir, newDir, root].flatMap((dir) => managedFiles(dir, patterns)))].sort();
  const result = { updated: [], added: [], deleted: [], merged: [], conflicts: [], reported: [] };

  if (!dryRun) await runMigrations(newDir, root, fromVersion, toVersion, 'before', log);
  for (const file of files) {
    const versions = { base: read(baseDir, file), theirs: read(newDir, file), ours: read(root, file) };
    const plan = planFile(versions);
    const target = path.join(root, file);
    const write = (text) => {
      if (dryRun) return;
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, text);
    };
    if (plan.action === 'keep') continue;
    if (plan.action === 'report') {
      result.reported.push({ file, reason: plan.reason });
      log(`  report   ${file}  (${plan.reason})`);
    } else if (plan.action === 'add' || plan.action === 'update') {
      write(versions.theirs);
      result[plan.action === 'add' ? 'added' : 'updated'].push(file);
      log(`  ${plan.action.padEnd(8)} ${file}`);
    } else if (plan.action === 'delete') {
      if (!dryRun) fs.rmSync(target, { force: true });
      result.deleted.push(file);
      log(`  delete   ${file}`);
    } else {
      const merged = mergeText(versions.ours, versions.base ?? '', versions.theirs);
      if (!merged.conflicts) {
        write(merged.text);
        result.merged.push(file);
        log(`  merge    ${file}`);
      } else {
        if (conflict === 'inline') write(merged.text);
        else if (!dryRun) fs.writeFileSync(`${target}.rej`, merged.text);
        result.conflicts.push(file);
        log(`  conflict ${file}  (${merged.conflicts} hunk(s)${conflict === 'rej' ? `, see ${file}.rej` : ', markers inline'})`);
      }
    }
  }

  if (!dryRun) {
    await runMigrations(newDir, root, fromVersion, toVersion, 'after', log);
    const configPath = path.join(root, 'sdd.config.json');
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    raw.template = { version: toVersion, commit: newCommit, answers };
    fs.writeFileSync(configPath, `${JSON.stringify(raw, null, 2)}\n`);
    // The manifest records what the template produced, so a later status compares against it.
    const files = {};
    for (const file of managedFiles(newDir, patterns)) files[file] = sha256(fs.readFileSync(path.join(newDir, file), 'utf8'));
    fs.mkdirSync(path.join(root, '.sdd'), { recursive: true });
    fs.writeFileSync(path.join(root, MANIFEST_PATH), `${JSON.stringify({ version: toVersion, files }, null, 2)}\n`);
  }
  for (const dir of [baseDir, newDir]) fs.rmSync(dir, { recursive: true, force: true });
  return { ...result, fromVersion, toVersion };
}
