import path from 'node:path';

import { walk, readText } from '../context/lib/files.mjs';
import { parseFrontmatter } from '../context/lib/frontmatter.mjs';
import { taggedLines } from '../context/lib/markdown.mjs';
import { matchesAny } from './glob.mjs';

export const INCLUSIONS = ['always', 'fileMatch', 'manual'];

// Loads docs/steering/*.md as {name, file, title, inclusion, patterns, description, frontmatterText, body}.
export function loadSteering(root, config) {
  return walk(root, config.paths.steering)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const text = readText(root, file);
      const { data, body } = parseFrontmatter(text);
      const name = path.basename(file, '.md');
      return {
        name,
        file,
        title: headingTitle(body) ?? name[0].toUpperCase() + name.slice(1),
        inclusion: data?.inclusion ?? null,
        patterns: patternList(data?.fileMatchPattern),
        description: firstParagraph(body),
        frontmatterText: frontmatterBlock(text),
        body: body.replace(/\r\n/g, '\n')
      };
    });
}

export function patternList(value) {
  if (value === undefined || value === null) return [];
  return (Array.isArray(value) ? value : [value]).map(String).filter(Boolean);
}

// Returns the fileMatch steering entries whose pattern matches `relativePath`.
export function steeringFor(relativePath, steering) {
  return steering.filter((entry) => entry.inclusion === 'fileMatch' && matchesAny(relativePath, entry.patterns));
}

function headingTitle(body) {
  const line = taggedLines(body).find((entry) => !entry.inFence && /^#\s+/.test(entry.text));
  return line ? line.text.replace(/^#\s+/, '').trim() : null;
}

// The first prose paragraph after the title, collapsed to one line for tool descriptions.
function firstParagraph(body) {
  const lines = taggedLines(body);
  const paragraph = [];
  for (const line of lines) {
    if (line.inFence || /^#/.test(line.text) || /^[-*|]/.test(line.text)) {
      if (paragraph.length) break;
      continue;
    }
    if (!line.text.trim()) {
      if (paragraph.length) break;
      continue;
    }
    paragraph.push(line.text.trim());
  }
  const text = paragraph.join(' ');
  return text.length > 200 ? `${text.slice(0, 197).trimEnd()}...` : text;
}

function frontmatterBlock(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  if (!/^---\s*$/.test(lines[0] ?? '')) return '';
  const end = lines.findIndex((line, index) => index > 0 && /^---\s*$/.test(line));
  return end === -1 ? '' : `${lines.slice(0, end + 1).join('\n')}\n`;
}
