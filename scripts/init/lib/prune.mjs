import path from 'node:path';

import { taggedLines } from '../../context/lib/markdown.mjs';

// Full-tier documents a lite project does not carry (ADR-0001). A trailing slash removes a directory.
export const LITE_PRUNE = [
  'docs/specs/_templates/system-architecture.md',
  'docs/_templates/architecture-baseline.md',
  'docs/runbooks/',
  'docs/quality/test-strategy.md',
  'docs/architecture/MODULE_ARCHITECTURE_GUIDE.md',
  'docs/documentation/MODULARIZATION_GUIDE.md'
];

// Files that only make sense inside the template repository itself.
export const TEMPLATE_ONLY = [
  'scripts/context/__fixtures__/',
  'scripts/adapters/__fixtures__/',
  'scripts/init/__fixtures__/',
  'scripts/migrate/',
  'examples/',
  'docs/adr/ADR-0001-v2-revamp.md',
  'docs/MIGRATION-v1-to-v2.md'
];

const TEMPLATE_ONLY_BLOCK = /^[ \t]*<!-- template-only:start -->\n[\s\S]*?^[ \t]*<!-- template-only:end -->\n?/gm;

// Removes the sections a document marks as meaningful only inside the template repository.
export function stripTemplateOnly(text) {
  let removed = 0;
  const stripped = text.replace(TEMPLATE_ONLY_BLOCK, () => {
    removed += 1;
    return '';
  });
  return { text: stripped.replace(/\n{3,}/g, '\n\n'), removed };
}

const LINK = /\[[^\]]*\]\(([^)\s]+)[^)]*\)/g;
const BACKTICK_PATH = /`((?:docs|scripts|examples)\/[A-Za-z0-9_./-]+)`/g;
const TABLE_ROW = /^\s*\|/;
const LIST_MARKER = /^\s*(?:[-*]|\d+\.)\s+/;
const HEADING = /^(#{1,6})\s/;

export function isPruned(target, pruned) {
  const normalized = target.replace(/\\/g, '/').replace(/^\.\//, '');
  return pruned.some((entry) => (entry.endsWith('/') ? normalized === entry.slice(0, -1) || normalized.startsWith(entry) : normalized === entry));
}

function references(fragment, dir, pruned) {
  for (const match of fragment.matchAll(LINK)) {
    const target = match[1].split('#')[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    const resolved = target.startsWith('/') ? target.slice(1) : path.posix.normalize(path.posix.join(dir, target));
    if (isPruned(resolved, pruned)) return true;
  }
  for (const match of fragment.matchAll(BACKTICK_PATH)) if (isPruned(match[1], pruned)) return true;
  return false;
}

// Removes references to pruned paths from `text` (the content of `file`): a table row that points at
// one is dropped; a prose line or list item loses only the sentence that points at one; a heading
// left with nothing under it goes too.
export function relink(text, file, pruned) {
  const dir = path.posix.dirname(file.replace(/\\/g, '/'));
  let removed = 0;
  const kept = [];
  for (const line of taggedLines(text)) {
    if (line.inFence || !references(line.text, dir, pruned)) {
      kept.push(line);
      continue;
    }
    removed += 1;
    if (TABLE_ROW.test(line.text)) continue;
    const marker = line.text.match(LIST_MARKER)?.[0] ?? '';
    const sentences = line.text.slice(marker.length).split(/(?<=\.)\s+/).filter((sentence) => !references(sentence, dir, pruned));
    if (sentences.length) kept.push({ ...line, text: marker + sentences.join(' ') });
  }
  return { text: dropEmptySections(kept).join('\n').replace(/\n{3,}/g, '\n\n'), removed };
}

function dropEmptySections(lines) {
  const out = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const heading = line.inFence ? null : line.text.match(HEADING);
    if (heading) {
      let next = index + 1;
      while (next < lines.length && lines[next].text.trim() === '') next += 1;
      const following = lines[next];
      const closes = !following || (!following.inFence && (following.text.match(HEADING)?.[1].length ?? Infinity) <= heading[1].length);
      if (closes) {
        index = next - 1;
        continue;
      }
    }
    out.push(line.text);
  }
  return out;
}
