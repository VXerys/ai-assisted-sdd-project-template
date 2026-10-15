import path from 'node:path';

import { readText, exists, walk, writeLf } from '../context/lib/files.mjs';
import { parseFrontmatter } from '../context/lib/frontmatter.mjs';
import { taggedLines, section } from '../context/lib/markdown.mjs';
import { sourceHash } from '../context/lib/hash.mjs';
import { TOOLS } from '../context/lib/config.mjs';
import { loadSteering } from '../lib/steering.mjs';

export const AGENTS_LINE_CAP = 400;
const SOURCES = 'docs/steering/, sdd.config.json';
const BODY_ORDER = ['rules', 'tech', 'structure', 'workflow', 'product'];

// Every adapter path adapters:sync can write; sdd.config.json lists them under `generated`.
export const ADAPTER_TARGETS = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', '.cursor/rules/', '.github/copilot-instructions.md', '.github/instructions/', '.kiro/steering/'];

function banner(hash) {
  return `<!-- GENERATED FILE — DO NOT EDIT. Rendered by \`npm run adapters:sync\`.\nSource: ${SOURCES}.\nsource_hash: ${hash} -->\n`;
}

function quote(text) {
  return JSON.stringify(text ?? '');
}

// Builds every adapter as {relativePath: content} without touching disk.
export function renderAdapters(root, config, { all = false } = {}) {
  const steering = loadSteering(root, config);
  const tools = new Set(all ? TOOLS : config.tools);
  const hash = sourceHash([
    { path: 'sdd.config.json', content: exists(root, 'sdd.config.json') ? readText(root, 'sdd.config.json') : '' },
    ...steering.map((entry) => ({ path: entry.file, content: readText(root, entry.file) }))
  ]);
  const warnings = [];
  const outputs = {};

  const agents = renderAgents(root, config, steering, hash);
  outputs['AGENTS.md'] = agents;
  const agentsLines = agents.split('\n').length;
  if (agentsLines > AGENTS_LINE_CAP) warnings.push(`AGENTS.md has ${agentsLines} lines, over the cap of ${AGENTS_LINE_CAP}; shorten docs/steering/`);

  if (tools.has('claude')) outputs['CLAUDE.md'] = renderClaude(root, hash);
  if (tools.has('gemini')) outputs['GEMINI.md'] = renderGemini(hash);
  if (tools.has('cursor')) for (const entry of steering) outputs[`.cursor/rules/${entry.name}.mdc`] = renderCursor(entry, hash);
  if (tools.has('copilot')) {
    outputs['.github/copilot-instructions.md'] = renderCopilot(root, config, steering, hash);
    for (const entry of steering.filter((item) => item.inclusion === 'fileMatch')) {
      outputs[`.github/instructions/${entry.name}.instructions.md`] = renderCopilotInstructions(entry, hash);
    }
  }
  if (tools.has('kiro')) for (const entry of steering) outputs[`.kiro/steering/${entry.name}.md`] = renderKiro(entry, hash);

  return { outputs, warnings, hash };
}

export function staleAdapters(root, outputs) {
  return Object.entries(outputs)
    .filter(([file, content]) => !exists(root, file) || normalize(readText(root, file)) !== normalize(content))
    .map(([file]) => file);
}

export function writeAdapters(root, outputs) {
  for (const [file, content] of Object.entries(outputs)) writeLf(root, file, content);
  return Object.keys(outputs);
}

function normalize(text) {
  return text.replace(/\r\n/g, '\n').trimEnd();
}

function oneLiner(root, config, steering) {
  const product = steering.find((entry) => entry.name === 'product');
  const vision = product ? section(product.body, /^##\s+vision/i) : null;
  const line = (vision ?? '').split('\n').map((entry) => entry.trim()).find((entry) => entry && !entry.startsWith('#'));
  return line ?? `${config.project.name}.`;
}

function orderedAlways(steering) {
  const always = steering.filter((entry) => entry.inclusion === 'always');
  const rank = (entry) => (BODY_ORDER.includes(entry.name) ? BODY_ORDER.indexOf(entry.name) : BODY_ORDER.length);
  return always.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

// Drops the H1 (the section title replaces it) and pushes every other heading down `depth` levels.
function demote(body, depth) {
  const lines = taggedLines(body);
  const out = [];
  for (const line of lines) {
    if (!line.inFence && /^#\s+/.test(line.text)) continue;
    if (!line.inFence && /^#{2,}\s/.test(line.text)) out.push('#'.repeat(depth) + line.text);
    else out.push(line.text);
  }
  return out.join('\n').trim();
}

function renderAgents(root, config, steering, hash) {
  const always = orderedAlways(steering);
  const conditional = steering.filter((entry) => entry.inclusion === 'fileMatch');
  const manual = steering.filter((entry) => entry.inclusion === 'manual');
  const paths = config.paths;
  const lines = [banner(hash)];

  lines.push(`# Repository contract: ${config.project.name}`, '');
  lines.push(oneLiner(root, config, steering), '');
  lines.push(`Rendered from \`${paths.steering}/\` and \`sdd.config.json\` for humans and coding agents. Edit the steering files, then run \`npm run adapters:sync\`.`, '');

  lines.push('## Read first', '');
  lines.push(`1. \`${paths.context}/BRIEF.md\` (single entry point; rendered, never hand-edited)`);
  lines.push(`2. ${always.map((entry) => `\`${entry.file}\``).join(', ') || `\`${paths.steering}/\``}`);
  lines.push(`3. The active feature under \`${paths.specs}/\`: \`tasks.md\`, then the sections it references`, '');
  lines.push(`Fallback when \`BRIEF.md\` is absent: \`${paths.context}/NEW_CHAT_PROTOCOL.md\`.`, '');

  lines.push('## Source of truth', '', '| Question | Source |', '|---|---|');
  lines.push(`| Product intent | \`${paths.steering}/product.md\`, \`docs/product/prd.md\` |`);
  lines.push(`| Stack and commands | \`${paths.steering}/tech.md\` |`);
  lines.push(`| Directory and dependency rules | \`${paths.steering}/structure.md\` |`);
  lines.push(`| Engineering and security rules | \`${paths.steering}/rules.md\` |`);
  lines.push(`| Lifecycle and status vocabulary | \`${paths.steering}/workflow.md\` |`);
  lines.push('| Shared architecture | `docs/architecture/` |', '| Decisions | `docs/adr/` |');
  lines.push(`| Feature behavior, design, tasks, evidence | \`${paths.specs}/F-XXX-name/\` |`);
  lines.push(`| Task status | \`${paths.specs}/F-XXX-name/tasks.md\` (master) |`);
  lines.push(`| Unknowns | \`${paths.assumptions}\` |`, `| Session delta | \`${paths.handoff}\` |`);
  lines.push('| Current behavior | code, tests, schema, configuration |', '');
  lines.push('Chat history and provider memory are never a source of truth.', '');

  lines.push('## Read-only paths', '');
  lines.push(`Generated (edit the sources, then run \`npm run context:render\` or \`npm run adapters:sync\`): ${config.generated.map((entry) => `\`${entry}\``).join(', ') || 'none'}`, '');
  lines.push(`Frozen (explicit owner approval required): ${config.frozen.map((entry) => `\`${entry}\``).join(', ') || 'none'}`, '');

  for (const entry of always) lines.push(`## ${entry.title}`, '', demote(entry.body, 1), '');

  if (conditional.length || manual.length) {
    lines.push('## Conditional rules', '');
    if (conditional.length) lines.push('Apply the section when the edited path matches its pattern.', '');
    for (const entry of conditional) {
      lines.push(`### ${entry.title} (\`${entry.file}\`) applies to ${entry.patterns.map((pattern) => `\`${pattern}\``).join(', ')}`, '', demote(entry.body, 2), '');
    }
    if (manual.length) {
      lines.push('Read on request:', '');
      for (const entry of manual) lines.push(`- \`${entry.file}\`: ${entry.description || entry.title}`);
      lines.push('');
    }
  }

  lines.push('## Commands', '');
  lines.push(`Project commands: the Commands table in \`${paths.steering}/tech.md\` (the Tech section above). Context: \`npm run context:render\`, then \`npm run context:validate\`. Adapters: \`npm run adapters:sync\`.`);
  return `${lines.join('\n')}\n`;
}

const CLAUDE_ADAPTER = [
  '# Claude Code adapter',
  '',
  'Claude Code is a repository-integrated coding agent for this project.',
  '',
  '- Follow `AGENTS.md` and the canonical rules in `docs/steering/`.',
  '- Start every session from `docs/context/BRIEF.md`; when it is absent, follow `docs/context/NEW_CHAT_PROTOCOL.md`.',
  '- Repository artifacts are the durable context; provider memory is an adapter, never a source of truth.',
  '- Inspect code, tests, schema, and commands before asserting repository facts.',
  '- Hooks and slash commands surface or validate deterministic repository state; they never make product, architecture, security, or acceptance decisions.',
  '- Keep provider-specific local paths and session details out of canonical documentation.'
];

function renderClaude(root, hash) {
  const lines = [banner(hash), '@AGENTS.md', '', ...CLAUDE_ADAPTER, '', '## Hooks and commands', ''];
  lines.push('Rendered from `.claude/settings.json` and `.claude/commands/sdd/`.', '');
  const hooks = readHooks(root);
  if (!hooks.length) lines.push('No hooks configured.', '');
  else {
    lines.push('| Event | Matcher | Script |', '|---|---|---|');
    for (const hook of hooks) lines.push(`| ${hook.event} | ${hook.matcher} | \`${hook.script}\` |`);
    lines.push('');
  }
  const commands = readCommands(root);
  if (!commands.length) lines.push('No slash commands configured.');
  else {
    lines.push('| Command | Description |', '|---|---|');
    for (const command of commands) lines.push(`| \`${command.usage}\` | ${command.description} |`);
  }
  return `${lines.join('\n')}\n`;
}

function readHooks(root) {
  if (!exists(root, '.claude/settings.json')) return [];
  let settings;
  try {
    settings = JSON.parse(readText(root, '.claude/settings.json'));
  } catch {
    return [];
  }
  const result = [];
  for (const [event, groups] of Object.entries(settings.hooks ?? {})) {
    for (const group of groups ?? []) {
      for (const hook of group.hooks ?? []) {
        const script = String(hook.command ?? '').match(/scripts\/hooks\/[\w-]+\.mjs/)?.[0] ?? hook.command ?? '';
        result.push({ event, matcher: group.matcher ? `\`${group.matcher.replace(/\|/g, '\\|')}\`` : 'all', script });
      }
    }
  }
  return result;
}

function readCommands(root) {
  return walk(root, '.claude/commands/sdd')
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const { data } = parseFrontmatter(readText(root, file));
      const name = path.basename(file, '.md');
      const hint = data?.['argument-hint'] ? ` ${data['argument-hint']}` : '';
      return { usage: `/sdd:${name}${hint}`, description: data?.description ?? '' };
    });
}

function renderGemini(hash) {
  return [
    banner(hash),
    '@AGENTS.md',
    '',
    '# Gemini CLI adapter',
    '',
    '- Follow `AGENTS.md` and `docs/steering/`; start every session from `docs/context/BRIEF.md`.',
    '- Repository files are the only source of truth; Gemini memory is an adapter.',
    '- Run `npm run context:render` and `npm run context:validate` before claiming a task done.',
    ''
  ].join('\n');
}

function renderCursor(entry, hash) {
  const head = ['---', `description: ${quote(entry.description || entry.title)}`];
  if (entry.inclusion === 'fileMatch') head.push(`globs: ${quote(entry.patterns.join(','))}`);
  head.push(`alwaysApply: ${entry.inclusion === 'always'}`, '---');
  return `${head.join('\n')}\n${banner(hash)}${entry.body.replace(/^\n+/, '')}`;
}

function renderCopilot(root, config, steering, hash) {
  return [
    banner(hash),
    `# ${config.project.name}`,
    '',
    oneLiner(root, config, steering),
    '',
    'Follow `AGENTS.md` and the rules in `docs/steering/`. Path-scoped rules live in `.github/instructions/`.',
    '',
    'Commands: `npm run context:render`, `npm run context:validate`, `npm run adapters:sync`; project commands are in `docs/steering/tech.md`.',
    ''
  ].join('\n');
}

function renderCopilotInstructions(entry, hash) {
  return `---\napplyTo: ${quote(entry.patterns.join(','))}\n---\n${banner(hash)}${entry.body.replace(/^\n+/, '')}`;
}

function renderKiro(entry, hash) {
  return `${entry.frontmatterText}${banner(hash)}${entry.body}`;
}

