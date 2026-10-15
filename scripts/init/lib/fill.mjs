const PLACEHOLDER = /\{\{([^{}]+)\}\}/g;

// Fills `{{NAME}}` from `values`. An array value is a block: the line holding its placeholder
// is replaced by one line per entry, keeping the text before the placeholder (a list marker or
// table pipe) and dropping the text after it. Unknown placeholders are left untouched.
export function fillPlaceholders(text, values) {
  let filled = 0;
  const blocks = Object.entries(values).filter(([, value]) => Array.isArray(value));
  const lines = text.split('\n').flatMap((line) => {
    for (const [name, entries] of blocks) {
      const token = `{{${name}}}`;
      const at = line.indexOf(token);
      if (at === -1) continue;
      filled += 1;
      const prefix = line.slice(0, at);
      return entries.map((entry) => `${prefix}${entry}`);
    }
    const replaced = line.replace(PLACEHOLDER, (match, inner) => {
      const name = inner.trim();
      if (!(name in values) || Array.isArray(values[name])) return match;
      // A handoff expiry is a decision for the session that writes it, not for init.
      if (name === 'YYYY-MM-DD' && /^\s*expires/.test(line)) return match;
      filled += 1;
      return values[name];
    });
    return [replaced];
  });
  return { text: lines.join('\n'), filled };
}

export function remainingPlaceholders(text) {
  const result = [];
  text.split('\n').forEach((line, index) => {
    for (const match of line.matchAll(PLACEHOLDER)) result.push({ line: index + 1, name: match[0] });
  });
  return result;
}
