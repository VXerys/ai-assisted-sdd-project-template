// What init rewrites to turn the template repository into a project repository.

import YAML from 'yaml';

const GITIGNORE_MARKER = '# sdd preset';
const EXAMPLE_LINE = /^\s*[-|]\s*Example:/;

export const WORKFLOW_PATH = '.github/workflows/context-integrity.yml';

const STEP_NAMES = { install: 'Install', format: 'Check formatting', lint: 'Lint', typecheck: 'Typecheck', test: 'Test', build: 'Build' };
// The SDD tooling is Node whatever the app stack is, so every project installs, tests, and runs it.
const SDD_INSTALL = 'npm ci';
const SDD_TEST = 'npm test';
const SDD_VALIDATE = 'npm run context:validate -- --strict';
// The hookless counterpart of the PreToolUse guard (ADR-0003); a pull request is checked against its base branch.
const SDD_GUARD = 'npm run sdd -- guard --check --base "${{ github.base_ref || github.event.repository.default_branch }}"';

const WORKFLOW_HEAD = `name: CI

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
`;

// lineWidth 0 keeps a long command on one line instead of folding it.
function scalar(value) {
  return YAML.stringify(value, { lineWidth: 0 }).trimEnd();
}

// Actions are pinned to a full commit SHA (GitHub hardening guidance); the trailing release comment
// is what Dependabot reads to propose updates.
export const PINNED_ACTIONS = {
  checkout: { uses: 'actions/checkout@11d5960a326750d5838078e36cf38b85af677262', version: 'v4.4.0' },
  setupNode: { uses: 'actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020', version: 'v4.4.0' }
};

function renderStep({ name, uses, version, run, with: inputs }) {
  const lines = [`      - name: ${scalar(name)}`];
  if (uses) lines.push(`        uses: ${scalar(uses)}${version ? ` # ${version}` : ''}`);
  if (run) lines.push(`        run: ${scalar(run)}`);
  if (inputs) {
    lines.push('        with:');
    for (const [key, value] of Object.entries(inputs)) lines.push(`          ${key}: ${scalar(value)}`);
  }
  return lines.join('\n');
}

// The template CI validates examples/ and re-runs init; a project runs the commands its app preset
// lists under `ci.run`, then the SDD tooling tests and strict validation. A Node preset whose install
// or test is the SDD tooling's own command runs it once.
export function derivedWorkflow(app) {
  const appSteps = app.ci.run.map((key) => ({ name: STEP_NAMES[key], run: app.commands[key] }));
  const runs = new Set(appSteps.map((step) => step.run));
  const steps = [
    // Full history, so the guard check can find the merge base with the pull request's base branch.
    { name: 'Checkout', ...PINNED_ACTIONS.checkout, with: { 'fetch-depth': 0 } },
    { name: 'Setup Node.js', ...PINNED_ACTIONS.setupNode, with: { 'node-version': 22, cache: 'npm' } },
    ...app.ci.setup,
    ...(runs.has(SDD_INSTALL) ? [] : [{ name: 'Install SDD tooling', run: SDD_INSTALL }]),
    ...appSteps,
    ...(runs.has(SDD_TEST) ? [] : [{ name: 'Test SDD tooling', run: SDD_TEST }]),
    { name: 'Guard check', run: SDD_GUARD },
    { name: 'Validate context', run: SDD_VALIDATE }
  ];
  const note = `# Written by npm run init from the ${app.name} app preset; keep the run steps in line with docs/steering/tech.md.\n`;
  return `${note}${WORKFLOW_HEAD}${steps.map(renderStep).join('\n\n')}\n`;
}

export function slug(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
}

// Scripts whose files init removes (examples/, scripts/init/e2e/).
const TEMPLATE_SCRIPTS = ['example:validate', 'test:e2e'];

// The template's package.json minus what only the template repository runs.
export function derivedPackageJson(text, { name, description }) {
  const pkg = JSON.parse(text);
  pkg.name = slug(name);
  pkg.version = '0.1.0';
  pkg.description = description;
  if (pkg.scripts) for (const script of TEMPLATE_SCRIPTS) delete pkg.scripts[script];
  return `${JSON.stringify(pkg, null, 2)}\n`;
}

// Appends the lines not already present under one marker block; a re-run rewrites that block in place.
export function mergeGitignore(text, lines) {
  const existing = (text ?? '').replace(/\r\n/g, '\n').split('\n');
  const marker = existing.indexOf(GITIGNORE_MARKER);
  let end = marker;
  if (marker !== -1) while (end < existing.length && existing[end].trim() !== '') end += 1;
  const rest = marker === -1 ? existing : [...existing.slice(0, marker), ...existing.slice(end)];
  const previous = marker === -1 ? [] : existing.slice(marker + 1, end);
  const known = new Set(rest.map((line) => line.trim()).filter(Boolean));
  const block = [];
  for (const line of lines) if (!known.has(line) && !block.includes(line)) block.push(line);
  if (!block.length && marker === -1) return { text: text ?? '', added: 0 };
  const added = block.filter((line) => !previous.includes(line)).length;
  const head = rest.join('\n').replace(/\n*$/, '');
  const merged = `${head ? `${head}\n\n` : ''}${GITIGNORE_MARKER}\n${block.join('\n')}\n`;
  return { text: block.length ? merged : `${head}\n`, added };
}

// Example bullets and table rows are placeholders a project must not inherit; table headers and prose stay.
export function stripExampleLines(text) {
  let removed = 0;
  const kept = text.split('\n').filter((line) => {
    if (!EXAMPLE_LINE.test(line)) return true;
    removed += 1;
    return false;
  });
  return { text: kept.join('\n'), removed };
}
