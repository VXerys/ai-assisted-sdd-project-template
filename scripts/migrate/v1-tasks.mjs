#!/usr/bin/env node

// Converts a v1 tasks.md (checkbox tasks, `TASK-001` ids) to the v2 block format
// (`### T-001 — title` with status, requirements, depends_on, evidence). Facts it
// cannot infer from the source are returned as notes, never invented.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseFrontmatter, scalar } from '../context/lib/frontmatter.mjs';

const STATUS = { ' ': 'planned', '-': 'in_progress', x: 'done', X: 'done', '!': 'blocked' };
const HEADING_TASK = /^#{2,4}\s+\[([ xX!-])\]\s+TASK-(\d{1,3})\s*[—–:-]?\s*(.*)$/;
const LIST_TASK = /^\s*[-*]\s+\[([ xX!-])\]\s+TASK-(\d{1,3})\s*[—–:-]?\s*(.*)$/;
const HEADING = /^#{1,6}\s/;
const FR_ID = /\bFR-\d{3}\b/g;
// Lookahead keeps the target in the stream so a chain `A -> B -> C` yields both edges.
const DEPENDENCY = /TASK-(\d{1,3})\s*->\s*(?=TASK-(\d{1,3}))/g;
const DROPPED_SECTIONS = /^(status legend|dependency map)$/i;

const taskId = (number) => `T-${String(Number(number)).padStart(3, '0')}`;

export function convertV1Tasks(source) {
  const { data, body } = parseFrontmatter(source);
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const dependencies = new Map();
  for (const match of body.matchAll(DEPENDENCY)) {
    const to = taskId(match[2]);
    dependencies.set(to, [...(dependencies.get(to) ?? []), taskId(match[1])]);
  }

  const tasks = [];
  const prelude = [];
  let current = null;
  let dropping = false;
  for (const line of lines) {
    const task = line.match(HEADING_TASK) ?? line.match(LIST_TASK);
    if (task) {
      current = { id: taskId(task[2]), title: task[3].trim(), status: STATUS[task[1]], body: [] };
      tasks.push(current);
      dropping = false;
      continue;
    }
    const heading = line.match(HEADING);
    if (heading && !current) {
      const title = line.replace(HEADING, '').trim();
      dropping = DROPPED_SECTIONS.test(title);
      if (!dropping && !/^tasks$/i.test(title)) prelude.push(line);
      continue;
    }
    if (heading && current) {
      // A heading after the tasks ends the task body; v1 trailing sections are kept verbatim.
      current = null;
      dropping = false;
      prelude.push(line);
      continue;
    }
    if (dropping) continue;
    (current ? current.body : prelude).push(line);
  }

  const notes = [];
  const blocks = tasks.map((task) => {
    const bodyText = task.body.join('\n');
    const requirements = unique([...`${task.title}\n${bodyText}`.matchAll(FR_ID)].map((match) => match[0]));
    const dependsOn = dependencies.get(task.id) ?? [];
    if (!requirements.length) notes.push(`${task.id}: no FR id found; fill requirements`);
    if (task.status === 'done') notes.push(`${task.id}: done without evidence; add an EV id from verification.md or set status to review`);
    if (task.status === 'blocked') notes.push(`${task.id}: blocked; log the reason in docs/context/ASSUMPTIONS.md`);
    if (!dependencies.has(task.id) && !isFirstInMap(task.id, dependencies)) notes.push(`${task.id}: no dependency map entry; confirm depends_on`);
    const body = trimBlankLines(task.body);
    return [
      `### ${task.id} — ${task.title}`,
      `- status: ${task.status}`,
      `- requirements: [${requirements.join(', ')}]`,
      `- depends_on: [${dependsOn.join(', ')}]`,
      '- evidence: []',
      ...(body.length ? ['', ...body] : [])
    ].join('\n');
  });

  const allRequirements = unique(blocks.flatMap((block) => [...block.matchAll(FR_ID)].map((match) => match[0]))).sort();
  const frontmatter = v2Frontmatter(data ?? {}, allRequirements);
  const head = trimBlankLines(prelude).join('\n');
  const text = `${frontmatter}\n\n${head}\n\n## Tasks\n\n${blocks.join('\n\n')}\n`.replace(/\n{3,}/g, '\n\n').replace(/TASK-(\d{1,3})\b/g, (_, number) => taskId(number));
  return { text, notes };
}

function isFirstInMap(id, dependencies) {
  for (const sources of dependencies.values()) if (sources.includes(id)) return true;
  return false;
}

function v2Frontmatter(data, requirements) {
  const feature = scalar(data.feature) ?? String(scalar(data.id) ?? 'F-XXX').match(/F-\d{3}/)?.[0] ?? 'F-XXX';
  const date = scalar(data.last_updated) ?? 'YYYY-MM-DD';
  const quote = (value) => (value === undefined || value === null || value === '' ? '""' : String(value));
  return [
    '---',
    `id: ${feature}`,
    `title: ${quote(scalar(data.title))}`,
    'type: tasks',
    `status: ${scalar(data.status) ?? 'draft'}`,
    'tier: lite',
    `owner: ${quote(scalar(data.owner))}`,
    `created: ${scalar(data.created) ?? date}`,
    `last_updated: ${date}`,
    `last_verified: ${date}`,
    `requirements: [${requirements.join(', ')}]`,
    'supersedes: null',
    '---'
  ].join('\n');
}

function unique(values) {
  return [...new Set(values)];
}

function trimBlankLines(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === '') start += 1;
  while (end > start && lines[end - 1].trim() === '') end -= 1;
  return lines.slice(start, end);
}

function main(argv) {
  const write = argv.includes('--write');
  const file = argv.find((arg) => !arg.startsWith('--'));
  if (!file) {
    console.error('Usage: node scripts/migrate/v1-tasks.mjs <tasks.md> [--write]');
    process.exit(1);
  }
  const { text, notes } = convertV1Tasks(fs.readFileSync(file, 'utf8'));
  if (write) {
    fs.writeFileSync(file, text);
    console.error(`wrote ${file}`);
  } else {
    process.stdout.write(text);
  }
  if (notes.length) console.error(`could not infer (${notes.length}):\n${notes.map((note) => `  ${note}`).join('\n')}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
