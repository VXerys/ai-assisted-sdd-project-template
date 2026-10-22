// `sdd adopt --into <repository>`: brings SDD into an existing codebase. Init is built for a fresh template
// clone (it resets the changelog, removes examples/, rewrites package.json), so adopt runs init in a temp
// copy and only adds files to the target: an existing file is never overwritten or deleted.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { walk } from '../context/lib/files.mjs';
import { mergeGitignore, slug } from '../init/lib/project.mjs';
import { DEFAULT_MANAGED, writeManifest } from './upgrade.mjs';

// Project files of the template that an existing repository keeps as its own.
const KEEP_TARGET = new Set(['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'LICENSE', 'SECURITY.md', '.gitignore', '.gitattributes', 'package.json', 'package-lock.json']);
const SDD_SCRIPTS = ['test', 'context:render', 'context:validate', 'context:archive-handoff', 'adapters:sync', 'sdd'];

export function adopt(templateRoot, target, initArgs, { dryRun = false } = {}, log = console.log) {
  const destination = path.resolve(target);
  if (!fs.existsSync(destination)) throw new Error(`${destination} does not exist`);
  if (fs.existsSync(path.join(destination, 'sdd.config.json'))) throw new Error(`${destination} already has sdd.config.json; use sdd upgrade instead`);

  const staged = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-adopt-'));
  fs.cpSync(templateRoot, staged, { recursive: true, filter: (entry) => !/[\\/](\.git|node_modules)([\\/]|$)/.test(entry.slice(templateRoot.length)) });
  fs.cpSync(path.join(templateRoot, 'node_modules', 'yaml'), path.join(staged, 'node_modules', 'yaml'), { recursive: true });
  const name = initArgs.includes('--name') ? [] : ['--name', path.basename(destination)];
  const run = spawnSync(process.execPath, [path.join(staged, 'scripts', 'init', 'init.mjs'), '--yes', ...name, ...initArgs], { cwd: staged, encoding: 'utf8' });
  const config = JSON.parse(fs.readFileSync(path.join(staged, 'sdd.config.json'), 'utf8'));
  if (config.templateMode !== false) throw new Error(`init failed:\n${run.stdout}\n${run.stderr}`);
  // The recorded commit is the template's, which is what `sdd upgrade` needs. The repository keeps its own
  // package.json and .gitattributes, so upgrades must not manage them.
  config.template.adopted = true;
  config.managed = DEFAULT_MANAGED.filter((entry) => !KEEP_TARGET.has(entry));
  fs.writeFileSync(path.join(staged, 'sdd.config.json'), `${JSON.stringify(config, null, 2)}\n`);
  writeManifest(staged, config.template.version, config.managed);
  // The rendered views and adapters hash sdd.config.json, so they are refreshed after the edit above.
  for (const script of ['scripts/context/render.mjs', 'scripts/adapters/sync.mjs']) {
    const refresh = spawnSync(process.execPath, [path.join(staged, script), '--quiet'], { cwd: staged, encoding: 'utf8' });
    if (refresh.status !== 0) throw new Error(`${script} failed:\n${refresh.stdout}\n${refresh.stderr}`);
  }

  const result = { added: [], skipped: [], merged: [] };
  for (const file of walk(staged)) {
    if (file.startsWith('node_modules/') || KEEP_TARGET.has(file)) continue;
    const to = path.join(destination, file);
    if (fs.existsSync(to)) {
      if (fs.readFileSync(to, 'utf8').replace(/\r\n/g, '\n') !== fs.readFileSync(path.join(staged, file), 'utf8').replace(/\r\n/g, '\n')) result.skipped.push(file);
      continue;
    }
    result.added.push(file);
    if (!dryRun) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(path.join(staged, file), to);
    }
  }

  const pkg = mergePackage(destination, staged, config.project.name);
  result.merged.push(`package.json (${pkg.note})`);
  if (!dryRun) fs.writeFileSync(path.join(destination, 'package.json'), pkg.text);
  if (pkg.renamedTest && !dryRun && result.added.includes('.github/workflows/context-integrity.yml')) {
    // `npm test` is now the project's own suite: the SDD step runs the renamed script, or a Node preset's
    // shared test step runs both.
    const workflow = path.join(destination, '.github', 'workflows', 'context-integrity.yml');
    const text = fs.readFileSync(workflow, 'utf8');
    const own = /(name: Test SDD tooling\n\s+run: )npm test$/m;
    fs.writeFileSync(workflow, own.test(text) ? text.replace(own, '$1npm run test:sdd') : text.replace(/run: npm test$/m, 'run: npm test && npm run test:sdd'));
  }
  const ignoreLines = fs.readFileSync(path.join(staged, '.gitignore'), 'utf8').split(/\r?\n/).filter((line) => line.trim() && !line.startsWith('#'));
  const gitignorePath = path.join(destination, '.gitignore');
  const gitignore = mergeGitignore(fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '', ignoreLines);
  if (gitignore.added) {
    result.merged.push(`.gitignore (${gitignore.added} lines)`);
    if (!dryRun) fs.writeFileSync(gitignorePath, gitignore.text);
  }
  fs.rmSync(staged, { recursive: true, force: true });

  for (const file of result.added) log(`  add      ${file}`);
  for (const file of result.skipped) log(`  skip     ${file}  (exists in the target; compare by hand)`);
  for (const entry of result.merged) log(`  merge    ${entry}`);
  return result;
}

// Adds the SDD scripts and the `yaml` dependency; a project's own `test` script wins and SDD's becomes `test:sdd`.
function mergePackage(destination, staged, projectName) {
  const source = JSON.parse(fs.readFileSync(path.join(staged, 'package.json'), 'utf8'));
  const file = path.join(destination, 'package.json');
  if (!fs.existsSync(file)) {
    const fresh = { name: slug(projectName), version: '0.1.0', private: true, type: source.type, engines: source.engines, bin: source.bin, scripts: source.scripts, dependencies: source.dependencies };
    return { text: `${JSON.stringify(fresh, null, 2)}\n`, note: 'created for the SDD tooling', renamedTest: false };
  }
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
  pkg.scripts ??= {};
  let renamedTest = false;
  const added = [];
  for (const key of SDD_SCRIPTS) {
    const value = source.scripts[key];
    if (!value) continue;
    const name = key === 'test' && pkg.scripts.test && pkg.scripts.test !== value ? 'test:sdd' : key;
    if (name === 'test:sdd') renamedTest = true;
    if (pkg.scripts[name] === undefined) {
      pkg.scripts[name] = value;
      added.push(name);
    }
  }
  const hasYaml = pkg.dependencies?.yaml || pkg.devDependencies?.yaml;
  if (!hasYaml) pkg.devDependencies = { ...(pkg.devDependencies ?? {}), yaml: source.dependencies.yaml };
  return { text: `${JSON.stringify(pkg, null, 2)}\n`, note: `scripts ${added.join(', ') || 'none'}${hasYaml ? '' : ', devDependency yaml'}`, renamedTest };
}
