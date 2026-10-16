// What init rewrites to turn the template repository into a project repository.

const GITIGNORE_MARKER = '# sdd preset';
const EXAMPLE_LINE = /^\s*[-|]\s*Example:/;

export const DERIVED_WORKFLOW = `name: Context Integrity

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  validate-context:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install
        run: npm ci

      - name: Test
        run: npm test

      - name: Validate context
        run: npm run context:validate
`;

export function slug(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
}

// The template's package.json minus what only the template repository runs.
export function derivedPackageJson(text, { name, description }) {
  const pkg = JSON.parse(text);
  pkg.name = slug(name);
  pkg.version = '0.1.0';
  pkg.description = description;
  if (pkg.scripts) delete pkg.scripts['example:validate'];
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
