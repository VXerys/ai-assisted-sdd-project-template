import fs from 'node:fs';
import path from 'node:path';

export const SKIP_DIRS = new Set(['.git', 'node_modules', '.context-cache', '__fixtures__']);

export function normalize(filePath) {
  return filePath.split(path.sep).join('/');
}

// Lists files under `relativeDir` as repo-relative POSIX paths, sorted.
export function walk(root, relativeDir = '') {
  const start = path.join(root, relativeDir);
  if (!fs.existsSync(start)) return [];
  const result = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const item = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) visit(item);
        continue;
      }
      result.push(normalize(path.relative(root, item)));
    }
  };
  visit(start);
  return result.sort();
}

export function readText(root, relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

export function exists(root, relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

// Every rendered file is written with LF so the output is identical on every platform.
export function writeLf(root, relativePath, content) {
  const absolute = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content.replace(/\r\n/g, '\n'));
}
