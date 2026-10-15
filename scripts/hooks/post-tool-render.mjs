#!/usr/bin/env node

import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { runHook, projectRoot, hookConfig, relativeTo, emit, isUnder } from '../lib/hook-io.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const RENDER = path.resolve(here, '..', 'context', 'render.mjs');
const SYNC = path.resolve(here, '..', 'adapters', 'sync.mjs');

runHook('post-tool-render', (payload) => {
  const root = projectRoot(payload);
  const config = hookConfig(root);
  if (!config.hooks.enabled) return;

  const relativePath = relativeTo(root, payload.tool_input?.file_path);
  if (!relativePath) return;

  const steeringOrConfig = isUnder(relativePath, config.paths.steering) || relativePath === 'sdd.config.json';
  const contextSource = steeringOrConfig
    || isUnder(relativePath, config.paths.specs)
    || relativePath === config.paths.assumptions
    || relativePath === config.paths.handoff;
  if (!contextSource) return;

  const failures = [];
  if (!run(root, RENDER)) failures.push('context:render');
  if (steeringOrConfig && !run(root, SYNC)) failures.push('adapters:sync');

  const what = steeringOrConfig ? `${config.paths.context}/ and adapters` : `${config.paths.context}/`;
  if (failures.length) emit(`SDD: ${failures.join(' and ')} failed after ${relativePath} changed; run it by hand to see the error\n`);
  else emit(`SDD: re-rendered ${what} after ${relativePath} changed\n`);
});

function run(root, script) {
  const result = spawnSync(process.execPath, [script, '--quiet'], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) process.stderr.write(result.stderr ?? '');
  return result.status === 0;
}
