import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const PRESETS_DIR = path.resolve(here, '..', 'presets');

export const COMMAND_KEYS = ['install', 'dev', 'format', 'lint', 'typecheck', 'test', 'build'];
export const STRUCTURE_KEYS = ['path', 'responsibility', 'rule'];
const APP_KEYS = ['label', 'language', 'commands', 'structure', 'fileMatch', 'notes'];
const DB_KEYS = ['label', 'migrationTool', 'migrationCommand', 'migrationPath', 'notes', 'fileMatch'];

function listPresets(kind) {
  return fs
    .readdirSync(path.join(PRESETS_DIR, kind))
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.slice(0, -5))
    .sort();
}

export const APP_PRESETS = listPresets('app');
export const DB_PRESETS = listPresets('db');

function isStringOrNull(value) {
  return value === null || typeof value === 'string';
}

function isStringList(value, { min = 0, max = Infinity } = {}) {
  return Array.isArray(value) && value.length >= min && value.length <= max && value.every((entry) => typeof entry === 'string' && entry.trim());
}

// Returns a list of schema violations; an empty list means the preset is valid.
export function validatePreset(kind, raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return ['preset must be a JSON object'];
  if (typeof raw.label !== 'string' || !raw.label.trim()) errors.push('label must be a non-empty string');
  if (kind === 'app') {
    if (typeof raw.language !== 'string' || !raw.language.trim()) errors.push('language must be a non-empty string');
    if (!raw.commands || typeof raw.commands !== 'object') errors.push('commands must be an object');
    else {
      for (const key of COMMAND_KEYS) if (!(key in raw.commands) || !isStringOrNull(raw.commands[key])) errors.push(`commands.${key} must be a string or null`);
      for (const key of Object.keys(raw.commands)) if (!COMMAND_KEYS.includes(key)) errors.push(`commands.${key} is not a known command`);
    }
    if (!Array.isArray(raw.structure) || raw.structure.length < 3 || raw.structure.length > 6) errors.push('structure must list 3 to 6 rows');
    else {
      raw.structure.forEach((row, index) => {
        for (const key of STRUCTURE_KEYS) if (typeof row?.[key] !== 'string' || !row[key].trim()) errors.push(`structure[${index}].${key} must be a non-empty string`);
      });
    }
    if (!isStringList(raw.fileMatch, { min: 1 })) errors.push('fileMatch must be a non-empty array of glob strings');
    if (!isStringList(raw.notes, { max: 5 })) errors.push('notes must be an array of at most 5 strings');
  } else if (kind === 'db') {
    for (const key of ['migrationTool', 'migrationCommand', 'migrationPath']) if (!isStringOrNull(raw[key])) errors.push(`${key} must be a string or null`);
    if (!isStringList(raw.notes)) errors.push('notes must be an array of strings');
    if (!isStringList(raw.fileMatch)) errors.push('fileMatch must be an array of glob strings');
  } else {
    return [`unknown preset kind '${kind}'`];
  }
  const known = kind === 'app' ? APP_KEYS : DB_KEYS;
  for (const key of Object.keys(raw)) if (!known.includes(key)) errors.push(`unknown key '${key}'`);
  return errors;
}

export function loadPreset(kind, name) {
  const names = kind === 'app' ? APP_PRESETS : DB_PRESETS;
  if (!names.includes(name)) throw new Error(`unknown ${kind} preset '${name}'; choose one of ${names.join(', ')}`);
  const raw = JSON.parse(fs.readFileSync(path.join(PRESETS_DIR, kind, `${name}.json`), 'utf8'));
  const errors = validatePreset(kind, raw);
  if (errors.length) throw new Error(`${kind} preset '${name}' is invalid: ${errors.join('; ')}`);
  return { name, ...raw };
}
