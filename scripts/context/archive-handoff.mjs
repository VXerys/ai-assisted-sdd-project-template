#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { loadConfig } from './lib/config.mjs';
import { parseHandoff } from './lib/handoff.mjs';
import { renderOutputs, writeOutputs } from './lib/render.mjs';
import { writeLf } from './lib/files.mjs';

const root = process.cwd();
const { config, errors } = loadConfig(root);
if (!config) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

const currentFile = config.paths.handoff;
const currentPath = path.join(root, currentFile);
const archiveDir = path.join(path.dirname(currentFile), 'archive');

function slug(input, fallback) {
  if (!input) return fallback;
  return input.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || fallback;
}

if (!fs.existsSync(currentPath)) {
  console.error(`Missing ${currentFile}`);
  process.exit(1);
}

const current = fs.readFileSync(currentPath, 'utf8');
const handoff = parseHandoff(current);

if (handoff.status !== 'active') {
  console.error('Current handoff is not active; nothing was archived.');
  process.exit(1);
}

const date = handoff.session_date ?? new Date().toISOString().slice(0, 10);
const fileName = `${date}-${slug(handoff.feature_id, 'no-feature')}-${slug(handoff.task_id, 'no-task')}.md`;
const archiveFile = `${archiveDir.split(path.sep).join('/')}/${fileName}`;

if (fs.existsSync(path.join(root, archiveFile))) {
  console.error(`Archive already exists: ${archiveFile}`);
  process.exit(1);
}

writeLf(root, archiveFile, current);

const reset = `---
status: inactive
owner: ""
session_date: ""
branch: ""
base_commit: ""
current_commit: ""
feature_id: ""
task_id: ""
expires_after: ""
---

# Session Handoff

No active handoff. Start the next session by recording one objective, verified branch and worktree state, \`feature_id\`, \`task_id\`, completed work, evidence, blockers, and one exact next step.
`;

writeLf(root, currentFile, reset);
writeOutputs(root, renderOutputs(root, config).outputs);
console.log(`Archived handoff to ${archiveFile}, reset ${currentFile}, and re-rendered the context views.`);
