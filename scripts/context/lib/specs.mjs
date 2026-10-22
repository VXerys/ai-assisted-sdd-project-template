import fs from 'node:fs';
import path from 'node:path';

import { parseFrontmatter } from './frontmatter.mjs';
import { parseBlocks, parseKeyValues, parseList, blockBody, taggedLines, stripComment, section } from './markdown.mjs';

export const FEATURE_DIR = /^(F-\d{3})-[a-z0-9][a-z0-9-]*$/;
export const FEATURE_FILES = ['requirements.md', 'design.md', 'tasks.md', 'verification.md', 'system-architecture.md'];
export const TASK_STATUSES = ['planned', 'in_progress', 'blocked', 'review', 'done', 'deferred'];
export const FEATURE_STATUSES = ['draft', 'review', 'approved', 'implementing', 'verification', 'implemented', 'superseded'];

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseTasks(text) {
  return parseBlocks(text, 'T').map((block) => {
    const { fields, fieldLines, rest } = parseKeyValues(block.lines);
    const task = {
      id: block.id,
      title: block.title,
      line: block.line,
      status: fields.status ?? null,
      requirements: parseList(fields.requirements),
      depends_on: parseList(fields.depends_on),
      evidence: parseList(fields.evidence),
      fieldLines,
      body: blockBody(rest)
    };
    if (fields.scope !== undefined) task.scope = parseList(fields.scope);
    return task;
  });
}

export function parseEvidence(text) {
  return parseBlocks(text, 'EV').map((block) => {
    const fields = {};
    const fieldLines = {};
    let output = null;
    let index = 0;
    while (index < block.lines.length) {
      const line = block.lines[index];
      const match = line.text.match(/^-\s+([a-z_]+):\s*(.*)$/);
      if (!match) break;
      fieldLines[match[1]] = line.number;
      if (match[1] === 'output') {
        const fenced = readFence(block.lines, index + 1);
        output = fenced.text;
        index = fenced.next;
        continue;
      }
      fields[match[1]] = stripComment(match[2]);
      index += 1;
    }
    const command = (fields.command ?? '').replace(/^`|`$/g, '').trim();
    const date = fields.date && DATE.test(fields.date) ? fields.date : null;
    const commit = fields.commit && !/\{\{/.test(fields.commit) ? fields.commit : null;
    return {
      id: block.id,
      title: block.title,
      line: block.line,
      command: command || null,
      output: output === null ? null : output,
      date,
      commit,
      covers: parseList(fields.covers),
      fieldLines
    };
  });
}

function readFence(lines, start) {
  let index = start;
  while (index < lines.length && lines[index].text.trim() === '') index += 1;
  const open = lines[index]?.text.match(/^\s*(`{3,}|~{3,})/);
  if (!open) return { text: null, next: index };
  const body = [];
  index += 1;
  for (; index < lines.length; index += 1) {
    if (lines[index].text.trim() === open[1]) {
      index += 1;
      break;
    }
    body.push(lines[index].text.trim());
  }
  return { text: body.join('\n').trim(), next: index };
}

export function acceptanceByRequirement(requirements) {
  return new Map(requirements.fr.map((fr) => [fr.id, new Set(fr.ac)]));
}

// Backtick commands of the `## Commands` table in tech.md; `none` marks a purpose without a command.
export function parseTechCommands(text) {
  const commands = new Set();
  const table = section(text, /^##\s+commands/i);
  if (!table) return commands;
  for (const line of table.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    for (const match of line.matchAll(/`([^`]+)`/g)) {
      const command = match[1].trim();
      if (command && command !== 'none') commands.add(command);
    }
  }
  return commands;
}

// A heading that names an id but misses the exact form hides the block from the parsers above.
const HEADING_FORMS = {
  task: [{ loose: /^#+\s+T-?(\d+)\b/, strict: /^###\s+T-\d{3}\s+[—–-]+(\s|$)/, label: 'task heading', form: (n) => `### T-${n} — title` }],
  requirement: [
    { loose: /^#+\s+FR-?(\d+)\b/, strict: /^###\s+FR-\d{3}\b/, label: 'requirement heading', form: (n) => `### FR-${n} — title` },
    { loose: /^\s*-\s+AC-?(\d+)\s*:/, strict: /^\s*-\s+AC-\d{3}\s*:/, label: 'acceptance criterion', form: (n) => `- AC-${n}: text`, quoteMatch: true }
  ],
  evidence: [{ loose: /^#+\s+EV-?(\d+)\b/, strict: /^###\s+EV-\d{3}\s+[—–-]+(\s|$)/, label: 'evidence heading', form: (n) => `### EV-${n} — title` }]
};

export function findMalformedHeadings(text, kind) {
  const found = [];
  for (const line of taggedLines(text)) {
    if (line.inFence) continue;
    for (const rule of HEADING_FORMS[kind]) {
      const match = line.text.match(rule.loose);
      if (!match || rule.strict.test(line.text)) continue;
      const number = match[1].padStart(3, '0');
      found.push({ line: line.number, text: (rule.quoteMatch ? match[0] : line.text).trim(), label: rule.label, expected: rule.form(number) });
    }
  }
  return found;
}

export function parseRequirementIds(text) {
  const fr = [];
  const ac = [];
  let current = null;
  for (const line of taggedLines(text)) {
    if (line.inFence) continue;
    const heading = line.text.match(/^###\s+(FR-\d{3})\b/);
    if (heading) {
      current = { id: heading[1], line: line.number, ac: [] };
      fr.push(current);
      continue;
    }
    if (/^##\s/.test(line.text)) current = null;
    const criterion = line.text.match(/^\s*-\s+(AC-\d{3})\s*:\s*(.*)$/);
    if (criterion) {
      ac.push({ id: criterion[1], line: line.number, text: criterion[2].trim(), tests: testLinks(criterion[2]) });
      if (current) current.ac.push(criterion[1]);
    }
  }
  return { fr, ac };
}

// `[test: test/todos.test.js#creates a todo]` or `[tests: a.test.js, b_test.py::case]` at the end of an
// acceptance criterion: the file part of each reference, which the validator checks exists.
export function testLinks(text) {
  const match = String(text).match(/\[tests?:\s*([^\]]+)\]\s*$/);
  if (!match) return [];
  return match[1].split(',').map((entry) => entry.trim().split(/#|::/)[0].trim()).filter(Boolean);
}

// Discovers docs/specs/F-*/ folders and parses every file in them.
export function loadFeatures(root, specsDir) {
  const base = path.join(root, specsDir);
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && FEATURE_DIR.test(entry.name))
    .map((entry) => loadFeature(root, `${specsDir}/${entry.name}`, entry.name.match(FEATURE_DIR)[1]))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function loadFeature(root, dir, id) {
  const files = {};
  for (const name of FEATURE_FILES) {
    const file = `${dir}/${name}`;
    const absolute = path.join(root, file);
    if (!fs.existsSync(absolute)) continue;
    const text = fs.readFileSync(absolute, 'utf8');
    const { data, body, error } = parseFrontmatter(text);
    files[name] = { path: file, text, data, body, error, lines: text.split(/\r?\n/).length };
  }
  const tasksFile = files['tasks.md'];
  const requirementsFile = files['requirements.md'];
  const verificationFile = files['verification.md'];
  const meta = tasksFile?.data ?? requirementsFile?.data ?? {};
  // Blocks are parsed from the whole file so their line numbers are file lines; frontmatter holds no block syntax.
  return {
    id,
    dir,
    title: typeof meta.title === 'string' && meta.title.trim() ? meta.title.trim() : id,
    status: typeof meta.status === 'string' ? meta.status : null,
    tier: typeof meta.tier === 'string' ? meta.tier : 'lite',
    files,
    tasks: tasksFile ? parseTasks(tasksFile.text) : [],
    evidence: verificationFile ? parseEvidence(verificationFile.text) : [],
    requirements: requirementsFile ? parseRequirementIds(requirementsFile.text) : { fr: [], ac: [] }
  };
}
