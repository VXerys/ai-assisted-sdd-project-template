import fs from 'node:fs';
import path from 'node:path';

import { loadFeatures } from './specs.mjs';
import { parseAssumptions } from './assumptions.mjs';
import { parseHandoff } from './handoff.mjs';
import { collectSourceFiles, sourceHash } from './hash.mjs';
import { parseFrontmatter } from './frontmatter.mjs';
import { section, taggedLines } from './markdown.mjs';

export const STATE_FILE = 'state.yaml';
export const VIEW_FILES = ['BRIEF.md', 'PROJECT_STATE.md', 'PROGRESS.md'];

export function featurePhase(tasks) {
  if (tasks.length === 0) return 'not_started';
  const statuses = new Set(tasks.map((task) => task.status));
  if (statuses.has('blocked')) return 'blocked';
  if (tasks.every((task) => task.status === 'done' || task.status === 'deferred')) return 'complete';
  if (statuses.has('in_progress') || statuses.has('review') || statuses.has('done')) return 'in_progress';
  return 'not_started';
}

function readOptional(root, file) {
  const absolute = path.join(root, file);
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : '';
}

// The one-liner is the first prose line under "## Vision" in product.md.
function productOneLiner(productText, fallback) {
  const vision = section(parseFrontmatter(productText).body, /^##\s+vision/i);
  const line = (vision ?? '')
    .split('\n')
    .map((entry) => entry.trim())
    .find((entry) => entry && !entry.startsWith('#'));
  return line ?? fallback;
}

function acceptanceFor(task, feature) {
  const mentioned = new Set(task.body.match(/AC-\d{3}/g) ?? []);
  const byFr = feature.requirements.fr.filter((fr) => task.requirements.includes(fr.id)).flatMap((fr) => fr.ac);
  const ids = mentioned.size ? [...mentioned] : byFr;
  return feature.requirements.ac.filter((ac) => ids.includes(ac.id)).map((ac) => `${ac.id}: ${ac.text}`);
}

export function buildModel(root, config, { previousState = null, git = null } = {}) {
  const features = loadFeatures(root, config.paths.specs).map((feature) => ({
    id: feature.id,
    title: feature.title,
    status: feature.status ?? 'draft',
    tier: feature.tier,
    phase: featurePhase(feature.tasks),
    spec_path: feature.dir,
    tasks: feature.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status ?? 'planned',
      requirements: task.requirements,
      depends_on: task.depends_on,
      evidence: task.evidence,
      body: task.body,
      acceptance: acceptanceFor(task, feature),
      ...(task.scope ? { scope: task.scope } : {})
    }))
  }));

  const assumptions = parseAssumptions(parseFrontmatter(readOptional(root, config.paths.assumptions)).body);
  const handoff = parseHandoff(readOptional(root, config.paths.handoff));
  const rulesBody = parseFrontmatter(readOptional(root, `${config.paths.steering}/rules.md`)).body;
  const hash = sourceHash(collectSourceFiles(root, config));
  const previousHash = previousState?.source_hash ?? null;

  return {
    project: {
      name: config.project.name,
      tier: config.project.tier,
      oneLiner: productOneLiner(readOptional(root, `${config.paths.steering}/product.md`), config.project.name)
    },
    features,
    active: deriveActive(features, handoff),
    assumptions,
    handoff,
    rules: {
      stopConditions: section(rulesBody, /^##\s+stop conditions/i),
      prohibited: section(rulesBody, /^##\s+prohibited/i)
    },
    paths: { generated: config.generated, frozen: config.frozen },
    // Repeated renders stay byte-identical while the sources are unchanged.
    generated_at: previousHash === hash && previousState?.generated_at ? String(previousState.generated_at) : new Date().toISOString(),
    source_hash: hash,
    git
  };
}

// An in_progress task wins; otherwise the handoff names the active pair.
export function deriveActive(features, handoff) {
  for (const feature of features) {
    const task = feature.tasks.find((entry) => entry.status === 'in_progress');
    if (task) return { feature_id: feature.id, task_id: task.id };
  }
  const feature = features.find((entry) => entry.id === handoff.feature_id);
  if (!feature) return { feature_id: null, task_id: null };
  const task = feature.tasks.find((entry) => entry.id === handoff.task_id);
  return { feature_id: feature.id, task_id: task ? task.id : null };
}

export function headingLines(text) {
  return taggedLines(text).filter((line) => !line.inFence && /^#/.test(line.text));
}
