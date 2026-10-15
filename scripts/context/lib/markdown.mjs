// Shared helpers for the parseable `### ID — title` + `- key: value` blocks.

const FENCE = /^\s{0,3}(`{3,}|~{3,})/;
const KEY_VALUE = /^-\s+([a-z_]+):\s*(.*)$/;

// Splits text into lines tagged with whether they sit inside a fenced code block.
export function taggedLines(text) {
  const result = [];
  let fence = null;
  for (const [index, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.replace(/\s+$/, '');
    const match = line.match(FENCE);
    if (match && fence === null) {
      fence = match[1];
      result.push({ number: index + 1, text: line, inFence: true });
      continue;
    }
    if (match && match[1][0] === fence[0] && match[1].length >= fence.length && line.trim() === match[1]) {
      fence = null;
      result.push({ number: index + 1, text: line, inFence: true });
      continue;
    }
    result.push({ number: index + 1, text: line, inFence: fence !== null });
  }
  return result;
}

// Cuts `### <prefix>-NNN — title` sections, stopping at the next ### or ## heading outside fences.
export function parseBlocks(text, prefix) {
  const heading = new RegExp(`^###\\s+(${prefix}-\\d{3})\\s+[—–-]+\\s*(.*)$`);
  const lines = taggedLines(text);
  const blocks = [];
  let current = null;

  for (const line of lines) {
    const match = line.inFence ? null : line.text.match(heading);
    if (match) {
      current = { id: match[1], title: match[2].trim(), line: line.number, lines: [] };
      blocks.push(current);
      continue;
    }
    if (current && !line.inFence && /^##?#?\s/.test(line.text) && !/^####/.test(line.text)) {
      current = null;
      continue;
    }
    if (current) current.lines.push(line);
  }
  return blocks;
}

// Reads the leading `- key: value` lines of a block; stops at the first blank or non-matching line.
export function parseKeyValues(lines) {
  const fields = {};
  const fieldLines = {};
  let index = 0;
  for (; index < lines.length; index += 1) {
    const match = lines[index].text.match(KEY_VALUE);
    if (!match) break;
    fields[match[1]] = stripComment(match[2]);
    fieldLines[match[1]] = lines[index].number;
  }
  return { fields, fieldLines, rest: lines.slice(index) };
}

// Templates carry the allowed vocabulary as a trailing comment on the value line.
export function stripComment(value) {
  return value.replace(/\s+#.*$/, '').trim();
}

export function parseList(value) {
  if (value === undefined || value === null) return [];
  const inner = value.trim().replace(/^\[/, '').replace(/\]$/, '');
  return inner
    .split(',')
    .map((item) => item.trim().replace(/^[`'"]|[`'"]$/g, ''))
    .filter(Boolean);
}

export function blockBody(lines) {
  return lines.map((line) => line.text).join('\n').trim();
}

// Returns the text under `## <heading>` up to the next ## heading, or null.
export function section(text, pattern) {
  const lines = taggedLines(text);
  const start = lines.findIndex((line) => !line.inFence && /^##\s/.test(line.text) && pattern.test(line.text));
  if (start === -1) return null;
  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (!line.inFence && /^##\s/.test(line.text)) break;
    body.push(line.text);
  }
  return body.join('\n').trim();
}
