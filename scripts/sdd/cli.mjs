#!/usr/bin/env node
// Single entry point for the SDD tooling (ADR-0003). Sessions without hooks (multi-repository cloud
// sessions, project threads, tools without hooks) run `brief`, `guard --check`, and `validate` explicitly.
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { loadConfig } from '../context/lib/config.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const scripts = path.resolve(here, '..');

const USAGE = `Usage: sdd <command> [options]   (npm run sdd -- <command>)

  brief                       print the session brief, with a stale warning
  next [--json]               the next ready task, every ready task, and which can start in parallel
  validate [--strict]         run the context validator
  render [--check]            render docs/context views
  sync [--check]              sync tool adapters
  guard --check [--base <branch>] [--strict]
                              check changed files against the guard rules (secrets, frozen; protected warns)
  status                      list managed files edited since the last init or upgrade
  check --from <template> [--to <ref>]
                              exit 1 when the template has a newer version
  upgrade --from <template> [--to <ref>] [--base-ref <ref>] [--answers <file.json>]
          [--dry-run] [--conflict inline|rej]
                              3-way merge a newer template into this project
  adopt --into <repository> [--dry-run] [init flags]
                              from the template: add SDD to an existing codebase, never overwriting a file
`;

const [command, ...rest] = process.argv.slice(2);
const root = process.cwd();

function option(name, fallback = null) {
  const index = rest.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const value = rest[index + 1];
  if (value === undefined || value.startsWith('--')) fail(`--${name} needs a value`);
  return value;
}
const flag = (name) => rest.includes(`--${name}`);

function fail(message) {
  console.error(`sdd: ${message}`);
  process.exit(2);
}

function config() {
  const { config: loaded, errors } = loadConfig(root);
  if (!loaded) fail(errors.join('; '));
  return loaded;
}

function forward(script) {
  const result = spawnSync(process.execPath, [path.join(scripts, script), ...rest], { cwd: root, stdio: 'inherit' });
  process.exit(result.status ?? 1);
}

function postUpgrade() {
  for (const script of ['context/render.mjs', 'adapters/sync.mjs', 'context/validate-context.mjs']) {
    const result = spawnSync(process.execPath, [path.join(scripts, script)], { cwd: root, stdio: 'inherit' });
    if (result.status !== 0) return result.status ?? 1;
  }
  return 0;
}

async function main() {
  switch (command) {
    case 'brief': {
      const { briefText } = await import('../lib/brief.mjs');
      console.log(briefText(root, config()));
      return 0;
    }
    case 'next': {
      const { loadFeatures } = await import('../context/lib/specs.mjs');
      const { nextTasks } = await import('../context/lib/next.mjs');
      const result = nextTasks(loadFeatures(root, config().paths.specs));
      if (flag('json')) {
        console.log(JSON.stringify(result, null, 2));
        return 0;
      }
      const label = (task) => `${task.feature}/${task.id} — ${task.title}`;
      console.log(result.next ? `Next: ${label(result.next)}` : 'No ready task: every planned task waits on a dependency, or none is planned.');
      for (const task of result.working) console.log(`  working  ${label(task)} (${task.status})`);
      for (const task of result.ready) console.log(`  ready    ${label(task)}${result.parallelSafe.includes(task) ? '  [parallel-safe]' : ''}`);
      for (const task of result.waiting) console.log(`  waiting  ${label(task)} on ${task.unmet.join(', ')}`);
      return 0;
    }
    case 'validate':
      return forward('context/validate-context.mjs');
    case 'render':
      return forward('context/render.mjs');
    case 'sync':
      return forward('adapters/sync.mjs');
    case 'guard': {
      if (!flag('check')) fail('guard needs --check');
      const { guardCheck } = await import('./guard-check.mjs');
      const loaded = config();
      const { findings, checked, ref } = guardCheck(root, loaded, { base: option('base', loaded.git.baseBranch), strict: flag('strict') });
      for (const finding of findings) console.log(`${finding.file}  ${finding.level}  ${finding.rule}: ${finding.message}`);
      const errors = findings.filter((finding) => finding.level === 'error').length;
      console.log(`Guard check: ${errors} error(s), ${findings.length - errors} warning(s); ${checked} changed file(s) against ${ref ?? 'the working tree only'}.`);
      return errors ? 1 : 0;
    }
    case 'status': {
      const { status } = await import('./upgrade.mjs');
      const { manifest, edited, missing } = status(root);
      if (!manifest) {
        console.log('No .sdd/manifest.json: this project predates 2.1.0 or is the template itself.');
        return 0;
      }
      console.log(`Template ${manifest.version}: ${edited.length} edited, ${missing.length} deleted managed file(s).`);
      for (const file of edited) console.log(`  edited   ${file}`);
      for (const file of missing) console.log(`  deleted  ${file}`);
      return 0;
    }
    case 'check': {
      const { check } = await import('./upgrade.mjs');
      const from = option('from') ?? fail('check needs --from <template checkout>');
      const result = check(config(), { from: path.resolve(from), to: option('to', 'HEAD') });
      console.log(result.message);
      return result.behind ? 1 : 0;
    }
    case 'upgrade': {
      const fs = await import('node:fs');
      const { upgrade } = await import('./upgrade.mjs');
      const from = option('from') ?? fail('upgrade needs --from <template checkout>');
      const answersFile = option('answers');
      const answers = answersFile ? JSON.parse(fs.readFileSync(path.resolve(answersFile), 'utf8')) : undefined;
      const dryRun = flag('dry-run');
      const result = await upgrade(root, config(), {
        from: path.resolve(from), to: option('to', 'HEAD'), baseRef: option('base-ref'), answers, dryRun, conflict: option('conflict', 'inline')
      });
      console.log(`\n${result.updated.length} updated, ${result.added.length} added, ${result.deleted.length} deleted, ${result.merged.length} merged, ${result.conflicts.length} conflict(s), ${result.reported.length} to review.`);
      if (dryRun) {
        console.log('Dry run: nothing changed.');
        return 0;
      }
      const after = postUpgrade();
      if (result.conflicts.length) console.log('Resolve the conflicts, then run npm run sdd -- validate.');
      return result.conflicts.length ? 1 : after;
    }
    case 'adopt': {
      const { adopt } = await import('./adopt.mjs');
      if (!config().templateMode) fail('adopt runs from the template repository, not from a project');
      const into = option('into') ?? fail('adopt needs --into <existing repository>');
      const initArgs = rest.filter((word, index) => !['--into', '--dry-run'].includes(word) && rest[index - 1] !== '--into');
      const dryRun = flag('dry-run');
      const result = adopt(path.resolve(scripts, '..'), into, initArgs, { dryRun });
      console.log(`\n${result.added.length} added, ${result.skipped.length} skipped (already present), ${result.merged.length} merged.${dryRun ? ' Dry run: nothing changed.' : ''}`);
      if (!dryRun) console.log('Next, in the repository: npm install, then /sdd:adopt in Claude Code (or follow .claude/commands/sdd/adopt.md) to fill steering from the real code.');
      return 0;
    }
    case undefined:
    case 'help':
    case '--help':
    case '-h':
      console.log(USAGE);
      return 0;
    default:
      fail(`unknown command '${command}'\n${USAGE}`);
  }
}

main().then((code) => process.exit(code ?? 0)).catch((error) => {
  console.error(`sdd: ${error.message}`);
  process.exit(1);
});
