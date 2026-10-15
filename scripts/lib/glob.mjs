// Minimal glob matcher for sdd.config.json path lists and steering fileMatchPattern values.
// Supports `**`, `*`, `?`. A pattern without a slash matches the basename at any depth,
// a literal path matches itself and everything under it, a trailing slash means "under".

const cache = new Map();

export function normalizePath(filePath) {
  return String(filePath).replace(/\\/g, '/').replace(/^\.\//, '');
}

function escape(text) {
  return text.replace(/[.+^${}()|[\]\\]/g, '\\$&');
}

export function globToRegExp(pattern) {
  if (cache.has(pattern)) return cache.get(pattern);
  let glob = normalizePath(pattern).replace(/\/+$/, '/');
  const literal = !/[*?]/.test(glob);
  if (glob.endsWith('/')) glob += '**';

  let source = '';
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index];
    if (char === '*' && glob[index + 1] === '*') {
      const slashAfter = glob[index + 2] === '/';
      source += slashAfter ? '(?:.*/)?' : '.*';
      index += slashAfter ? 2 : 1;
    } else if (char === '*') source += '[^/]*';
    else if (char === '?') source += '[^/]';
    else source += escape(char);
  }
  if (literal) source += '(?:/.*)?';
  const anchored = glob.includes('/') ? `^${source}$` : `(?:^|/)${source}$`;
  const regex = new RegExp(anchored);
  cache.set(pattern, regex);
  return regex;
}

export function matchesGlob(filePath, pattern) {
  return globToRegExp(pattern).test(normalizePath(filePath));
}

export function matchesAny(filePath, patterns) {
  for (const pattern of patterns) if (matchesGlob(filePath, pattern)) return pattern;
  return null;
}
