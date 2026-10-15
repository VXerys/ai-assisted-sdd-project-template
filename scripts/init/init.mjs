#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { execFileSync, spawnSync } from 'node:child_process';

import { TOOLS } from '../context/lib/config.mjs';
import { walk, readText, exists, writeLf } from '../context/lib/files.mjs';
import { APP_PRESETS, DB_PRESETS, loadPreset, COMMAND_KEYS } from './lib/presets.mjs';
import { fillPlaceholders, remainingPlaceholders } from './lib/fill.mjs';
import { LITE_PRUNE, TEMPLATE_ONLY, isPruned, relink, stripTemplateOnly } from './lib/prune.mjs';

const USAGE = `Usage: npm run init -- [flags]

Turns this template into a project: writes sdd.config.json, fills the steering and product
documents from your answers and the chosen presets, prunes documents the tier does not use,
removes template-only files, then renders, syncs adapters, and validates.

Flags (a missing flag is asked for; --yes takes the default instead):
  --name <text>          project name                       default: the directory name
  --description <text>   one sentence: what, for whom, outcome  default: "<name> is a <app> project."
  --tier lite|full       documentation tier                 default: lite
  --app <preset>         ${APP_PRESETS.join(' | ')}   default: generic
  --db <preset>          ${DB_PRESETS.join(' | ')}   default: none
  --tools <list>         comma-separated: ${TOOLS.join(', ')}   default: claude
  --owner <name>         owner written into frontmatter     default: git user.name
  --lang <language>      language of the project content    default: English
  --yes                  accept defaults, never prompt
  --dry-run              print the plan, change nothing
  --force                run again on a project whose templateMode is already false
  --help
`;

// Project documents whose owner, date, name, and preset placeholders init fills. Framework
// documents (status: template, owner "") carry no placeholders; the handoff is the inactive reset.
const FILL_TARGETS = [
  'docs/steering/product.md',
  'docs/steering/tech.md',
  'docs/steering/structure.md',
  'docs/steering/rules.md',
  'docs/steering/workflow.md',
  'docs/product/prd.md',
  'docs/product/idea-brief.md',
  'docs/product/roadmap.md',
  'docs/architecture/overview.md',
  'docs/architecture/data-model.md',
  'docs/architecture/security.md',
  'docs/architecture/boundaries.md',
  'docs/specs/_index.md',
  'docs/context/ASSUMPTIONS.md',
  'docs/quality/definition-of-done.md',
  'docs/quality/review-checklist.md',
  'docs/runbooks/database-migrations.md',
  'docs/runbooks/deployment.md',
  'CONTRIBUTING.md'
];

// Documents with a `<!-- template-only -->` block that describes maintaining the template itself.
const STRIP_TARGETS = ['CONTRIBUTING.md'];

const PROMPTS = [
  ['name', 'Project name'],
  ['tier', 'Tier (lite | full)'],
  ['app', `App preset (${APP_PRESETS.join(' | ')})`],
  ['db', `Database preset (${DB_PRESETS.join(' | ')})`],
  ['tools', `Tools, comma-separated (${TOOLS.join(', ')})`],
  ['owner', 'Owner'],
  ['lang', 'Content language'],
  ['description', 'One sentence: what it is, for whom, and the outcome']
];

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(USAGE);
    return;
  }
  const root = process.cwd();
  const configFile = path.join(root, 'sdd.config.json');
  if (!fs.existsSync(configFile)) throw new Error('sdd.config.json not found; run init from the repository root.');
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  if (config.templateMode === false && !args.force) {
    throw new Error('templateMode is already false in sdd.config.json, so this project is initialized; re-run with --force to apply init again.');
  }

  const answers = await collectAnswers(args, root);
  const plan = buildPlan(root, config, answers);

  console.log(`Init plan: ${answers.name} (tier ${answers.tier}, app ${answers.app}, db ${answers.db}, tools ${answers.tools.join(',')})`);
  for (const action of plan.actions) console.log(`  ${action.verb.padEnd(8)} ${action.target}${action.note ? `  (${action.note})` : ''}`);
  for (const script of ['context:render', 'adapters:sync', 'context:validate']) console.log(`  run      ${script}`);

  if (args.dryRun) {
    console.log('\nDry run: nothing changed.');
    printRemaining(plan.remaining);
    return;
  }

  for (const action of plan.actions) action.apply();
  console.log('');
  const render = runScript(root, 'scripts/context/render.mjs');
  const sync = runScript(root, 'scripts/adapters/sync.mjs');
  const validate = runScript(root, 'scripts/context/validate-context.mjs');
  printRemaining(plan.remaining);
  if (render.status !== 0 || sync.status !== 0) throw new Error('render or adapters:sync failed; see the output above.');
  process.exitCode = validate.status === 0 ? 0 : 1;
}

function parseArgs(argv) {
  const args = { tools: null };
  const valued = ['name', 'description', 'tier', 'app', 'db', 'tools', 'owner', 'lang'];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--yes') args.yes = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--force') args.force = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg.startsWith('--') && valued.includes(arg.slice(2))) {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('--')) throw new Error(`${arg} needs a value`);
      args[arg.slice(2)] = value;
      index += 1;
    } else throw new Error(`unknown argument ${arg}\n${USAGE}`);
  }
  return args;
}

async function collectAnswers(args, root) {
  const defaults = {
    name: path.basename(root),
    description: null,
    tier: 'lite',
    app: 'generic',
    db: 'none',
    tools: 'claude',
    owner: gitUserName(root),
    lang: 'English'
  };
  const answers = {};
  const missing = PROMPTS.filter(([key]) => args[key] === undefined || args[key] === null);
  const prompter = !args.yes && missing.length ? createPrompter() : null;
  try {
    for (const [key, label] of PROMPTS) {
      if (args[key] !== undefined && args[key] !== null) {
        answers[key] = args[key];
        continue;
      }
      const fallback = key === 'description' ? describe(answers.name, answers.app) : defaults[key];
      if (!prompter) {
        answers[key] = fallback;
        continue;
      }
      const reply = ((await prompter.ask(`${label} [${fallback}]: `)) ?? '').trim();
      answers[key] = reply || fallback;
    }
  } finally {
    prompter?.close();
  }
  if (!['lite', 'full'].includes(answers.tier)) throw new Error('tier must be lite or full');
  answers.appPreset = loadPreset('app', answers.app);
  answers.dbPreset = loadPreset('db', answers.db);
  answers.tools = [...new Set(answers.tools.split(',').map((tool) => tool.trim()).filter(Boolean))];
  for (const tool of answers.tools) if (!TOOLS.includes(tool)) throw new Error(`unknown tool '${tool}'; choose from ${TOOLS.join(', ')}`);
  if (!answers.description) answers.description = describe(answers.name, answers.app);
  answers.date = new Date().toISOString().slice(0, 10);
  return answers;
}

// Piped input delivers every line at once, so lines are queued instead of relying on rl.question().
function createPrompter() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const queue = [];
  const waiters = [];
  let closed = false;
  rl.on('line', (line) => (waiters.length ? waiters.shift()(line) : queue.push(line)));
  rl.on('close', () => {
    closed = true;
    for (const resolve of waiters.splice(0)) resolve(null);
  });
  return {
    ask(query) {
      process.stdout.write(query);
      if (queue.length) return Promise.resolve(queue.shift());
      if (closed) return Promise.resolve(null);
      return new Promise((resolve) => waiters.push(resolve));
    },
    close: () => rl.close()
  };
}

function describe(name, app) {
  return `${name} is a ${loadPreset('app', app).label} project.`;
}

function gitUserName(root) {
  try {
    return execFileSync('git', ['config', 'user.name'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

function code(value) {
  return value === null ? 'none' : value;
}

function fillValues(answers) {
  const { appPreset: app, dbPreset: db } = answers;
  const values = {
    PROJECT_NAME: answers.name,
    PROJECT_DESCRIPTION: answers.description,
    CONTENT_LANGUAGE: answers.lang,
    'YYYY-MM-DD': answers.date,
    PRESET_LANGUAGE: app.language,
    PRESET_APP: app.label,
    PRESET_DB: db.label,
    PRESET_FILE_MATCH: app.fileMatch.map((pattern) => `\`${pattern}\``).join(', '),
    PRESET_DB_MIGRATION_COMMAND: code(db.migrationCommand),
    PRESET_DB_MIGRATION_PATH: code(db.migrationPath),
    PRESET_DB_MIGRATION_TOOL: code(db.migrationTool),
    PRESET_STRUCTURE_ROWS: app.structure.map((row) => `\`${row.path}\` | ${row.responsibility} | ${row.rule} |`),
    PRESET_APP_NOTES: app.notes.length ? app.notes : ['none'],
    PRESET_DB_NOTES: db.notes.length ? db.notes : ['none'],
    // True for a freshly initialized project; the team replaces `none` when the fact appears.
    GENERATED_CODE_PATHS_OR_NONE: 'none',
    FROZEN_PATHS_OR_NONE: 'none',
    DEPENDENCY_RULE: 'none',
    DATA_RULE_OR_NONE: 'none'
  };
  for (const key of COMMAND_KEYS) values[`PRESET_${key.toUpperCase()}`] = code(app.commands[key]);
  if (answers.owner) for (const key of ['OWNER', 'PRODUCT_OWNER', 'ARCHITECTURE_OWNER', 'DATA_OWNER']) values[key] = answers.owner;
  return values;
}

function databaseSteering(answers) {
  const db = answers.dbPreset;
  const lines = ['---', 'inclusion: fileMatch', `fileMatchPattern: ${JSON.stringify(db.fileMatch)}`, '---', '', `# Database: ${db.label}`, ''];
  lines.push(`Rules for every change under ${db.fileMatch.map((pattern) => `\`${pattern}\``).join(', ')}. Generated by \`npm run init\` from the \`${db.name}\` preset; edit freely, it is a steering file.`, '');
  lines.push(`- Migration tool: ${db.migrationTool}`, `- Apply locally: \`${db.migrationCommand}\``, `- Migration files: \`${db.migrationPath}\``, '');
  lines.push('## Rules', '');
  for (const note of db.notes) lines.push(`- ${note}`);
  if (answers.tier === 'full') lines.push('', 'The full procedure, backfill, and rollback steps are in `docs/runbooks/database-migrations.md`.');
  return `${lines.join('\n')}\n`;
}

function buildPlan(root, config, answers) {
  const actions = [];
  const pruned = answers.tier === 'lite' ? LITE_PRUNE : [];
  const removed = [...TEMPLATE_ONLY];
  const dbSteering = answers.db !== 'none' ? `${config.paths?.steering ?? 'docs/steering'}/database.md` : null;
  const claudeDeselected = !answers.tools.includes('claude');
  if (claudeDeselected) removed.push('CLAUDE.md');

  config.project = { name: answers.name, tier: answers.tier };
  config.stack = { app: answers.app, database: answers.db };
  config.tools = answers.tools;
  config.templateMode = false;
  if (config.validate?.requiredFiles) {
    config.validate.requiredFiles = config.validate.requiredFiles.filter((file) => !isPruned(file, pruned) && !isPruned(file, removed));
    if (dbSteering && !config.validate.requiredFiles.includes(dbSteering)) config.validate.requiredFiles.push(dbSteering);
  }
  actions.push({ verb: 'write', target: 'sdd.config.json', note: 'templateMode false', apply: () => writeLf(root, 'sdd.config.json', `${JSON.stringify(config, null, 2)}\n`) });

  // Fill and relink may touch the same file, so every edit goes through one text map and is written once.
  const texts = new Map();
  const current = (file) => texts.get(file) ?? readText(root, file);
  const values = fillValues(answers);
  const remaining = [];
  for (const file of FILL_TARGETS) {
    if (!exists(root, file) || isPruned(file, pruned)) continue;
    const { text, filled } = fillPlaceholders(current(file), values);
    texts.set(file, text);
    for (const entry of remainingPlaceholders(text)) remaining.push({ file, ...entry });
    actions.push({ verb: 'fill', target: file, note: filled ? `${filled} placeholders` : 'already filled', apply: () => filled && writeLf(root, file, texts.get(file)) });
  }
  for (const file of STRIP_TARGETS) {
    if (!exists(root, file)) continue;
    const { text, removed: blocks } = stripTemplateOnly(current(file));
    if (!blocks) continue;
    texts.set(file, text);
    actions.push({ verb: 'strip', target: file, note: `${blocks} template-only block`, apply: () => writeLf(root, file, texts.get(file)) });
  }
  if (dbSteering) {
    const content = databaseSteering(answers);
    actions.push({ verb: 'create', target: dbSteering, note: `${answers.db} preset, fileMatch`, apply: () => writeLf(root, dbSteering, content) });
  }

  for (const target of pruned) {
    actions.push({ verb: 'prune', target, note: exists(root, target) ? 'lite tier' : 'already removed', apply: () => fs.rmSync(path.join(root, target), { recursive: true, force: true }) });
  }
  // Files that init rewrites or that adapters:sync regenerates are not worth relinking.
  const gone = [...pruned, ...removed];
  const rewritten = ['CHANGELOG.md', ...(config.generated ?? [])];
  for (const file of walk(root).filter((entry) => entry.endsWith('.md') && !isPruned(entry, gone) && !isPruned(entry, rewritten))) {
    const { text, removed: count } = relink(current(file), file, gone);
    if (!count) continue;
    texts.set(file, text);
    actions.push({ verb: 'relink', target: file, note: `${count} lines`, apply: () => writeLf(root, file, texts.get(file)) });
  }

  for (const target of removed) {
    const note = target === 'CLAUDE.md' ? 'tool claude not selected' : 'template-only';
    actions.push({ verb: 'remove', target, note: exists(root, target) ? note : 'already removed', apply: () => fs.rmSync(path.join(root, target), { recursive: true, force: true }) });
  }
  for (const file of walk(root, 'scripts').filter((entry) => entry.endsWith('.test.mjs') && !isPruned(entry, removed) && readText(root, entry).includes('__fixtures__'))) {
    actions.push({ verb: 'remove', target: file, note: 'test needs removed fixtures', apply: () => fs.rmSync(path.join(root, file), { force: true }) });
  }
  const version = JSON.parse(readText(root, 'package.json')).version;
  const changelog = `# Changelog\n\nFormat: Keep a Changelog. Versions follow Semantic Versioning.\n\n## [Unreleased]\n\n- Initialized from ai-assisted-sdd-project-template ${version} on ${answers.date} (tier ${answers.tier}, app ${answers.app}, database ${answers.db}).\n`;
  actions.push({ verb: 'reset', target: 'CHANGELOG.md', note: 'fresh [Unreleased]', apply: () => writeLf(root, 'CHANGELOG.md', changelog) });

  return { actions, remaining };
}

function runScript(root, script) {
  const result = spawnSync(process.execPath, [path.join(root, script)], { cwd: root, encoding: 'utf8' });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  console.log(`${script}:\n${output.split('\n').map((line) => `  ${line}`).join('\n')}`);
  return { status: result.status };
}

function printRemaining(remaining) {
  if (!remaining.length) return;
  console.log(`\nFill manually (${remaining.length} placeholders left):`);
  for (const entry of remaining) console.log(`  fill manually: ${entry.file}:${entry.line}  ${entry.name}`);
}
