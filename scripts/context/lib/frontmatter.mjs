import YAML from 'yaml';

const FENCE = /^---\s*$/;

// Returns {data, body, line, error}; `line` is the 1-based line where the body starts.
export function parseFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (!FENCE.test(lines[0] ?? '')) return { data: null, body: text, line: 1, error: null };

  const end = lines.findIndex((entry, index) => index > 0 && FENCE.test(entry));
  if (end === -1) return { data: null, body: text, line: 1, error: 'unterminated frontmatter' };

  const raw = lines.slice(1, end).join('\n');
  try {
    const data = YAML.parse(raw);
    if (data !== null && typeof data !== 'object') {
      return { data: null, body: text, line: 1, error: 'frontmatter is not a mapping' };
    }
    return { data: data ?? {}, body: lines.slice(end + 1).join('\n'), line: end + 2, error: null };
  } catch (cause) {
    return { data: null, body: text, line: 1, error: `invalid YAML frontmatter: ${cause.message}` };
  }
}

export function isPlaceholder(value) {
  return typeof value === 'string' && /\{\{[^}]*\}\}/.test(value);
}

// Frontmatter values that are placeholders or empty count as unset.
export function scalar(value) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value).trim();
  if (text === '' || isPlaceholder(text)) return null;
  return text;
}
