import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Directories the fallback walk never enters; `git ls-files` covers them through .gitignore instead.
export const SKIP_DIRS = new Set(['.git', 'node_modules', '.context-cache', '__fixtures__', 'build', '.dart_tool', '.gradle', 'dist', 'coverage', '.next']);
const SKIP_PATHS = ['ios/Pods', 'android/.gradle'];

export function normalize(filePath) {
  return filePath.split(path.sep).join('/');
}

// Lists files under `relativeDir` as repo-relative POSIX paths, sorted. Inside a git repository the
// list comes from git so .gitignore applies; elsewhere a filesystem walk with a built-in skip list.
// A nested directory with its own sdd.config.json is another project (an example, a fixture) and is skipped.
export function walk(root, relativeDir = '') {
  const start = path.join(root, relativeDir);
  if (!fs.existsSync(start)) return [];
  const listed = gitFiles(root, relativeDir) ?? fsFiles(root, start).filter((file) => !isSkipped(file));
  return listed.filter((file) => !file.split('/').includes('__fixtures__') && !inNestedProject(root, file)).sort();
}

function gitFiles(root, relativeDir) {
  const args = ['ls-files', '--cached', '--others', '--exclude-standard', '-z'];
  if (relativeDir) args.push('--', normalize(relativeDir));
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.error || result.status !== 0) return null;
  // The index still lists a file deleted from the working tree.
  return result.stdout.split('\0').filter((file) => file && fs.existsSync(path.join(root, file)));
}

function fsFiles(root, start) {
  const result = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const item = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(item);
      else result.push(normalize(path.relative(root, item)));
    }
  };
  visit(start);
  return result;
}

function isSkipped(file) {
  const segments = file.split('/');
  if (segments.some((segment) => SKIP_DIRS.has(segment))) return true;
  return SKIP_PATHS.some((prefix) => file.startsWith(`${prefix}/`));
}

function inNestedProject(root, file) {
  const segments = file.split('/');
  for (let depth = 1; depth < segments.length; depth += 1) {
    if (fs.existsSync(path.join(root, ...segments.slice(0, depth), 'sdd.config.json'))) return true;
  }
  return false;
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
