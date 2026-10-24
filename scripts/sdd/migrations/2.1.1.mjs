// Evidence recorded before a project upgraded to 2.1.x predates the trust rules on `command` and
// `commit` (ADR-0004). Each such block is stamped `legacy: true`, so the validator reports those two
// checks for it at the info level, while every block written after the upgrade must satisfy them.
import fs from 'node:fs';
import path from 'node:path';

import { parseEvidence } from '../../context/lib/specs.mjs';

export const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// Index just past the closing fence of the `- output:` block that starts after line `outputLine` (1-based).
function fenceEnd(lines, outputLine) {
  let index = outputLine;
  while (index < lines.length && lines[index].trim() === '') index += 1;
  const open = lines[index]?.match(/^\s*(`{3,}|~{3,})/);
  if (!open) return outputLine;
  for (index += 1; index < lines.length; index += 1) if (lines[index].trim() === open[1]) return index + 1;
  return outputLine;
}

// Pure: returns the text with `- legacy: true` appended to the key-value lines of every evidence
// block dated before `today`, and how many blocks were stamped. Already stamped blocks are left alone.
export function stampLegacyEvidence(text, today) {
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const positions = [];
  for (const ev of parseEvidence(lines.join('\n'))) {
    if (!ev.date || ev.date >= today || ev.fieldLines.legacy) continue;
    const fieldEnd = Math.max(0, ...Object.entries(ev.fieldLines).filter(([key]) => key !== 'output').map(([, line]) => line));
    const after = (ev.fieldLines.output ?? 0) > fieldEnd ? fenceEnd(lines, ev.fieldLines.output) : fieldEnd;
    if (after > 0) positions.push(after);
  }
  for (const line of positions.sort((a, b) => b - a)) lines.splice(line, 0, '- legacy: true');
  return { text: lines.join('\n'), stamped: positions.length };
}

export async function migrate({ root, stage }) {
  if (stage !== 'after') return;
  const specs = path.join(root, 'docs', 'specs');
  if (!fs.existsSync(specs)) return;
  const today = localDate(new Date());
  for (const entry of fs.readdirSync(specs, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^F-\d{3}-/.test(entry.name)) continue;
    const file = path.join(specs, entry.name, 'verification.md');
    if (!fs.existsSync(file)) continue;
    const { text, stamped } = stampLegacyEvidence(fs.readFileSync(file, 'utf8'), today);
    if (stamped) fs.writeFileSync(file, text);
  }
}
