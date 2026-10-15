import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

import { buildModel } from './model.mjs';
import { renderState, renderBrief, renderProjectState, renderProgress, stableView } from './views.mjs';
import { gitFacts } from './git.mjs';
import { writeLf } from './files.mjs';

export function outputPaths(config) {
  const base = config.paths.context;
  return {
    state: `${base}/state.yaml`,
    brief: `${base}/BRIEF.md`,
    projectState: `${base}/PROJECT_STATE.md`,
    progress: `${base}/PROGRESS.md`
  };
}

function readPreviousState(root, file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) return null;
  try {
    const parsed = YAML.parse(fs.readFileSync(absolute, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

// Builds every rendered file as {relativePath: content} without touching disk.
export function renderOutputs(root, config) {
  const paths = outputPaths(config);
  const model = buildModel(root, config, { previousState: readPreviousState(root, paths.state), git: gitFacts(root) });
  return {
    model,
    outputs: {
      [paths.state]: renderState(model),
      [paths.brief]: renderBrief(model, config.limits),
      [paths.projectState]: renderProjectState(model),
      [paths.progress]: renderProgress(model)
    }
  };
}

// Returns the rendered files whose stable content differs from what is on disk.
export function staleOutputs(root, outputs) {
  return Object.entries(outputs)
    .filter(([file, content]) => {
      const absolute = path.join(root, file);
      if (!fs.existsSync(absolute)) return true;
      return stableView(fs.readFileSync(absolute, 'utf8')) !== stableView(content);
    })
    .map(([file]) => file);
}

export function writeOutputs(root, outputs) {
  for (const [file, content] of Object.entries(outputs)) writeLf(root, file, content);
  return Object.keys(outputs);
}
