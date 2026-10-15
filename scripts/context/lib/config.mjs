import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_PATHS = {
  steering: 'docs/steering',
  specs: 'docs/specs',
  context: 'docs/context',
  handoff: 'docs/handoff/current.md',
  assumptions: 'docs/context/ASSUMPTIONS.md'
};

export const DEFAULT_LIMITS = { lite: 80, full: 200, systemArchitecture: 300, steering: 120, staleDays: 30, briefTokens: 3000 };

// Returns {config, errors}; `config` is null when the file is missing or unreadable.
export function loadConfig(root) {
  const file = path.join(root, 'sdd.config.json');
  if (!fs.existsSync(file)) return { config: null, errors: ['Missing sdd.config.json.'] };
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (cause) {
    return { config: null, errors: [`sdd.config.json is not valid JSON: ${cause.message}`] };
  }
  const errors = validateConfig(raw);
  return { config: errors.length ? null : normalizeConfig(raw), errors };
}

export function validateConfig(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object') return ['sdd.config.json must be an object.'];
  if (raw.schemaVersion !== 2) errors.push(`sdd.config.json schemaVersion must be 2 (found ${JSON.stringify(raw.schemaVersion)}).`);
  if (!raw.project || typeof raw.project.name !== 'string') errors.push('sdd.config.json project.name must be a string.');
  if (raw.project && !['lite', 'full'].includes(raw.project.tier)) errors.push('sdd.config.json project.tier must be lite or full.');
  for (const key of ['generated', 'frozen']) {
    if (raw[key] !== undefined && !Array.isArray(raw[key])) errors.push(`sdd.config.json ${key} must be an array.`);
  }
  if (raw.paths !== undefined && typeof raw.paths !== 'object') errors.push('sdd.config.json paths must be an object.');
  if (raw.limits !== undefined && typeof raw.limits !== 'object') errors.push('sdd.config.json limits must be an object.');
  return errors;
}

export function normalizeConfig(raw) {
  const validate = raw.validate ?? {};
  return {
    project: { name: raw.project.name, tier: raw.project.tier },
    stack: raw.stack ?? {},
    tools: raw.tools ?? [],
    paths: { ...DEFAULT_PATHS, ...(raw.paths ?? {}) },
    generated: raw.generated ?? [],
    frozen: raw.frozen ?? [],
    limits: { ...DEFAULT_LIMITS, ...(raw.limits ?? {}) },
    templateMode: raw.templateMode === true,
    validate: {
      requiredFiles: validate.requiredFiles ?? [],
      generatedFiles: validate.generatedFiles ?? raw.generated ?? [],
      placeholderSensitiveFiles: validate.placeholderSensitiveFiles ?? []
    }
  };
}
