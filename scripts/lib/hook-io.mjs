import fs from 'node:fs';
import path from 'node:path';

import { loadConfig, normalizeConfig, DEFAULT_PATHS } from '../context/lib/config.mjs';
import { normalizePath } from './glob.mjs';

// Hooks must never break the agent: a bad payload is an empty one, a crash is a stderr line and exit 0.
export function runHook(name, main) {
  try {
    main(readPayload());
  } catch (cause) {
    process.stderr.write(`${name}: ${cause.message}\n`);
  }
  process.exitCode = 0;
}

export function readPayload() {
  try {
    const text = fs.readFileSync(0, 'utf8');
    const parsed = text.trim() ? JSON.parse(text) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function projectRoot(payload) {
  return process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();
}

// Falls back to defaults so the guard still protects secrets in a project without sdd.config.json.
export function hookConfig(root) {
  const { config } = loadConfig(root);
  return config ?? normalizeConfig({ schemaVersion: 2, project: { name: path.basename(root), tier: 'lite' }, paths: DEFAULT_PATHS });
}

// Repo-relative POSIX path, or null when the file lives outside the project.
export function relativeTo(root, filePath) {
  if (!filePath) return null;
  // Claude Code on Windows sends backslash paths; POSIX path.resolve would treat them as one filename.
  const forwardSlashes = String(filePath).replace(/\\/g, '/');
  const relative = path.relative(root, path.resolve(root, forwardSlashes));
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return normalizePath(relative);
}

export function emit(output) {
  process.stdout.write(typeof output === 'string' ? output : JSON.stringify(output));
}

export function isUnder(relativePath, directory) {
  const prefix = normalizePath(directory).replace(/\/+$/, '');
  return relativePath === prefix || relativePath.startsWith(`${prefix}/`);
}
