import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';

import { walk, exists, readText } from './files.mjs';
import { parseFrontmatter, isPlaceholder, scalar } from './frontmatter.mjs';
import { loadFeatures, FEATURE_STATUSES, TASK_STATUSES, acceptanceByRequirement, findMalformedHeadings, parseTechCommands } from './specs.mjs';
import { parseAssumptions, ASSUMPTION_STATUSES } from './assumptions.mjs';
import { parseHandoff } from './handoff.mjs';
import { taggedLines } from './markdown.mjs';
import { patternList } from '../../lib/steering.mjs';
import { matchesGlob } from '../../lib/glob.mjs';
import { renderOutputs, staleOutputs } from './render.mjs';
import { renderAdapters, staleAdapters } from '../../adapters/render.mjs';

const SPEC_KEYS = ['id', 'title', 'type', 'status', 'tier', 'owner', 'created', 'last_updated', 'last_verified'];
const INCLUSION = ['always', 'fileMatch', 'manual'];
const OTHER_STATUSES = new Set(['template', 'active', 'inactive', ...FEATURE_STATUSES]);
const BANNER = /GENERATED FILE|GENERATED:/;
const PLACEHOLDER = /\{\{[^}]+\}\}/;
const BACKTICK_PATH = /`((?:docs|scripts)\/[A-Za-z0-9_./-]+)`/g;
// Files that name paths of earlier versions on purpose; their backtick paths are not checked.
const HISTORICAL_FILES = new Set(['CHANGELOG.md', 'docs/MIGRATION-v1-to-v2.md']);
const DAY = 24 * 60 * 60 * 1000;
const PLACEHOLDER_COMMIT = '0000000';
const MANUAL_COMMAND = /^manual:/;

// Allowed status moves; anything else is either a skip (a longer path exists) or not a transition at all.
const TASK_TRANSITIONS = {
  planned: ['in_progress', 'blocked', 'deferred'],
  in_progress: ['review', 'blocked', 'deferred'],
  review: ['done'],
  blocked: ['in_progress'],
  done: [],
  deferred: []
};
const FEATURE_TRANSITIONS = {
  draft: ['review', 'superseded'],
  review: ['approved', 'superseded'],
  approved: ['implementing', 'superseded'],
  implementing: ['verification', 'superseded'],
  verification: ['implemented', 'superseded'],
  implemented: ['superseded'],
  superseded: []
};

export function validateRepo(root, config, { now = new Date() } = {}) {
  const findings = [];
  const add = (file, line, level, message) => findings.push({ file, line: line ?? 1, level, message });
  const error = (file, line, message) => add(file, line, 'error', message);
  const warning = (file, line, message) => add(file, line, 'warning', message);
  const isTemplate = (file) => file.includes('/_templates/');

  for (const file of config.validate.requiredFiles) {
    if (!exists(root, file)) error(file, 1, 'missing required file');
  }

  const markdownFiles = walk(root).filter((file) => file.endsWith('.md'));
  const ids = new Map();
  const featureFiles = new Set();
  const features = loadFeatures(root, config.paths.specs);
  for (const feature of features) for (const entry of Object.values(feature.files)) featureFiles.add(entry.path);

  for (const file of markdownFiles) {
    const text = readText(root, file);
    const { data, error: parseError } = parseFrontmatter(text);
    if (parseError && !isTemplate(file)) error(file, 1, parseError);

    checkLinks(root, file, text, error);
    if (!HISTORICAL_FILES.has(file) && !file.startsWith('docs/handoff/archive/')) checkBacktickPaths(root, file, text, warning);

    // Feature files get their own placeholder rule in checkFeature, keyed on the feature status.
    if (!config.templateMode && !isTemplate(file) && !featureFiles.has(file) && placeholderApplies(config, file)) {
      // A draft may still carry placeholders; a document past draft may not.
      const draft = ['draft', 'template'].includes(scalar(data?.status));
      for (const line of taggedLines(text)) {
        if (!PLACEHOLDER.test(line.text)) continue;
        const found = line.text.match(PLACEHOLDER)[0];
        if (draft) warning(file, line.number, `unresolved placeholder ${found} (draft)`);
        else error(file, line.number, `unresolved placeholder ${found}`);
      }
    }

    if (isTemplate(file) || featureFiles.has(file) || !data) continue;
    const isAdr = /^docs\/adr\/ADR-\d{4}/.test(file);
    const id = scalar(data.id);
    if (id && !isAdr) {
      if (ids.has(id)) error(file, 1, `duplicate id ${id}, also in ${ids.get(id)}`);
      else ids.set(id, file);
    }
    const status = scalar(data.status);
    if (status && !isAdr && !OTHER_STATUSES.has(status)) error(file, 1, `unknown status '${status}'`);
  }

  if (!config.templateMode && exists(root, 'sdd.config.json') && PLACEHOLDER.test(readText(root, 'sdd.config.json'))) {
    error('sdd.config.json', 1, 'unresolved placeholder in sdd.config.json');
  }

  checkSteering(root, config, { error, warning });
  checkAdrs(root, { error });
  const assumptions = checkAssumptions(root, config, features, { error, warning });
  const trust = {
    previous: readPreviousStatuses(root, config),
    git: gitHistory(root),
    commands: parseTechCommands(exists(root, `${config.paths.steering}/tech.md`) ? readText(root, `${config.paths.steering}/tech.md`) : ''),
    today: localDate(now)
  };
  for (const feature of features) checkFeature(feature, assumptions, config, now, trust, { error, warning });
  const repoFiles = walk(root);
  for (const feature of features) checkTraceLinks(feature, repoFiles, { error, warning });
  checkHandoff(root, config, features, now, { error, warning });
  checkGenerated(root, config, { error });
  checkAdapters(root, config, { error });

  return { findings: sortFindings(findings), files: markdownFiles.length, features: features.length };
}

function placeholderApplies(config, file) {
  const list = config.validate.placeholderSensitiveFiles;
  return list.length === 0 || list.includes(file);
}

function localDate(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function checkLinks(root, file, text, error) {
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    let target = match[1].trim().split(/\s+['"]/)[0];
    if (!target || /^(https?:|mailto:|#)/.test(target) || isPlaceholder(target)) continue;
    target = target.split('#')[0].split('?')[0];
    if (!target) continue;
    const resolved = target.startsWith('/') ? path.join(root, target.slice(1)) : path.resolve(root, path.dirname(file), target);
    if (!fs.existsSync(resolved)) error(file, lineOf(text, match.index), `broken relative link ${match[1]}`);
  }
}

// Backtick paths with placeholders, globs, or XXX ids describe a shape, not a file.
function checkBacktickPaths(root, file, text, warning) {
  for (const match of text.matchAll(BACKTICK_PATH)) {
    const target = match[1];
    if (/XXX|\*|\{\{|<|\.\.\./.test(target)) continue;
    if (!fs.existsSync(path.join(root, target))) warning(file, lineOf(text, match.index), `path \`${target}\` does not exist`);
  }
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function checkSteering(root, config, { error, warning }) {
  for (const file of walk(root, config.paths.steering).filter((entry) => entry.endsWith('.md'))) {
    const text = readText(root, file);
    const { data } = parseFrontmatter(text);
    if (!data) error(file, 1, 'steering file has no frontmatter');
    else if (!INCLUSION.includes(data.inclusion)) error(file, 1, `inclusion must be one of ${INCLUSION.join(' | ')}`);
    else if (data.inclusion === 'fileMatch' && !patternList(data.fileMatchPattern).length) error(file, 1, 'fileMatch steering needs fileMatchPattern (string or array of globs)');
    else if (data.inclusion !== 'fileMatch' && data.fileMatchPattern !== undefined) error(file, 1, 'fileMatchPattern is only valid with inclusion: fileMatch');
    const lines = text.trimEnd().split(/\r?\n/).length;
    if (lines > config.limits.steering) warning(file, 1, `${lines} lines exceeds the steering cap of ${config.limits.steering}`);
  }
}

function checkAdrs(root, { error }) {
  const seen = new Map();
  for (const file of walk(root, 'docs/adr').filter((entry) => /\/ADR-\d{4}[^/]*\.md$/.test(entry))) {
    const text = readText(root, file);
    const { data } = parseFrontmatter(text);
    if (!data) {
      error(file, 1, 'ADR has no frontmatter');
      continue;
    }
    const expected = path.basename(file).match(/^ADR-\d{4}/)[0];
    const id = scalar(data.id);
    if (id !== expected) error(file, 1, `id ${id ?? '(missing)'} does not match file name ${expected}`);
    if (id) {
      if (seen.has(id)) error(file, 1, `duplicate ADR id ${id}, also in ${seen.get(id)}`);
      else seen.set(id, file);
    }
    for (const key of SPEC_KEYS) if (!(key in data)) error(file, 1, `frontmatter is missing ${key}`);
    if (scalar(data.type) !== 'adr') error(file, 1, "type must be 'adr'");
    const status = scalar(data.status);
    if (status && !FEATURE_STATUSES.includes(status)) error(file, 1, `unknown status '${status}'`);
  }
}

function checkAssumptions(root, config, features, { error }) {
  const file = config.paths.assumptions;
  if (!exists(root, file)) return [];
  const entries = parseAssumptions(parseFrontmatter(readText(root, file)).body);
  const seen = new Set();
  const featureIds = new Set(features.map((feature) => feature.id));
  for (const entry of entries) {
    if (seen.has(entry.id)) error(file, entry.line, `duplicate assumption id ${entry.id}`);
    seen.add(entry.id);
    if (!ASSUMPTION_STATUSES.includes(entry.status)) error(file, entry.fieldLines.status ?? entry.line, `${entry.id} has unknown status '${entry.status ?? ''}'`);
    if (!entry.feature) error(file, entry.fieldLines.feature ?? entry.line, `${entry.id} has no feature`);
    else if (!featureIds.has(entry.feature)) error(file, entry.fieldLines.feature ?? entry.line, `${entry.id} references unknown feature ${entry.feature}`);
  }
  return entries;
}

// Statuses from the state.yaml on disk, which is the last rendered state until the next render.
function readPreviousStatuses(root, config) {
  const file = `${config.paths.context}/state.yaml`;
  if (!exists(root, file)) return null;
  let state;
  try {
    state = YAML.parse(readText(root, file));
  } catch {
    return null;
  }
  if (!Array.isArray(state?.features)) return null;
  const features = new Map();
  const tasks = new Map();
  for (const feature of state.features) {
    if (typeof feature?.id !== 'string') continue;
    features.set(feature.id, feature.status);
    for (const task of feature.tasks ?? []) if (typeof task?.id === 'string') tasks.set(`${feature.id}/${task.id}`, task.status);
  }
  return { features, tasks };
}

function git(root, args) {
  try {
    execFileSync('git', args, { cwd: root, stdio: ['ignore', 'ignore', 'ignore'] });
    return true;
  } catch {
    return false;
  }
}

function gitHistory(root) {
  const reason = !git(root, ['rev-parse', '--git-dir']) ? 'not a git repository' : !git(root, ['rev-parse', '--verify', '--quiet', 'HEAD']) ? 'no commits yet' : null;
  return { reason, has: (commit) => git(root, ['cat-file', '-e', `${commit}^{commit}`]) };
}

// Returns null when the move is allowed, otherwise the error text; a reachable target names the skipped states.
function transitionError(graph, id, from, to) {
  if (from === to || !(from in graph) || !(to in graph)) return null;
  if (graph[from].includes(to)) return null;
  const route = shortestPath(graph, from, to);
  if (!route) return `${id} cannot move from ${from} to ${to}`;
  return `${id} moved from ${from} to ${to}, skipping ${route.slice(1, -1).join(', ')}`;
}

function shortestPath(graph, from, to) {
  const queue = [[from]];
  const seen = new Set([from]);
  while (queue.length) {
    const route = queue.shift();
    for (const next of graph[route.at(-1)]) {
      if (next === to) return [...route, next];
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push([...route, next]);
    }
  }
  return null;
}

function checkFeature(feature, assumptions, config, now, trust, { error, warning }) {
  const files = feature.files;
  for (const name of ['requirements.md', 'tasks.md', 'verification.md']) {
    if (!files[name]) error(`${feature.dir}/${name}`, 1, `${feature.id} is missing ${name}`);
  }
  if (!files['design.md']) warning(`${feature.dir}/design.md`, 1, `${feature.id} has no design.md`);
  if (feature.tier === 'full' && !files['system-architecture.md']) warning(`${feature.dir}/system-architecture.md`, 1, `${feature.id} is full tier without system-architecture.md`);

  const masterStatus = feature.status;
  for (const [name, entry] of Object.entries(files)) {
    const file = entry.path;
    if (entry.error) error(file, 1, entry.error);
    if (!entry.data) {
      error(file, 1, 'spec file has no frontmatter');
      continue;
    }
    const data = entry.data;
    for (const key of SPEC_KEYS) if (!(key in data)) error(file, 1, `frontmatter is missing ${key}`);
    if (scalar(data.id) !== feature.id) error(file, 1, `id ${scalar(data.id) ?? '(missing)'} does not match folder id ${feature.id}`);
    const type = name.replace(/\.md$/, '');
    if (scalar(data.type) !== type) error(file, 1, `type must be '${type}'`);
    const status = scalar(data.status);
    if (!status || !FEATURE_STATUSES.includes(status)) error(file, 1, `unknown status '${status ?? ''}'`);
    else if (status !== masterStatus) warning(file, 1, `status '${status}' differs from tasks.md status '${masterStatus}'`);
    const tier = scalar(data.tier);
    if (!['lite', 'full'].includes(tier)) error(file, 1, `tier must be lite or full`);

    const cap = type === 'system-architecture' ? config.limits.systemArchitecture : config.limits[feature.tier] ?? config.limits.lite;
    if (entry.lines > cap) warning(file, 1, `${entry.lines} lines exceeds the ${feature.tier} cap of ${cap}`);

    const verified = scalar(data.last_verified);
    if (['implementing', 'verification'].includes(status) && verified) {
      const age = (now - new Date(`${verified}T00:00:00Z`)) / DAY;
      if (Number.isFinite(age) && age > config.limits.staleDays) warning(file, 1, `last_verified ${verified} is older than ${config.limits.staleDays} days`);
    }

    // Fenced lines are skipped: a design may quote a template language that uses the same braces.
    for (const line of taggedLines(entry.text)) {
      if (line.inFence || !PLACEHOLDER.test(line.text)) continue;
      const found = line.text.match(PLACEHOLDER)[0];
      if (masterStatus === 'draft') warning(file, line.number, `unresolved placeholder ${found} (draft)`);
      else error(file, line.number, `unresolved placeholder ${found}`);
    }
  }

  const tasksFile = files['tasks.md']?.path ?? `${feature.dir}/tasks.md`;
  const verificationFile = files['verification.md']?.path ?? `${feature.dir}/verification.md`;
  const requirementsFile = files['requirements.md']?.path ?? `${feature.dir}/requirements.md`;
  const frIds = new Set(feature.requirements.fr.map((fr) => fr.id));
  const acIds = new Set(feature.requirements.ac.map((ac) => ac.id));
  const acByFr = acceptanceByRequirement(feature.requirements);
  const taskIds = new Set(feature.tasks.map((task) => task.id));
  const evidenceById = new Map(feature.evidence.map((ev) => [ev.id, ev]));

  for (const [name, kind] of [['requirements.md', 'requirement'], ['tasks.md', 'task'], ['verification.md', 'evidence']]) {
    if (!files[name]) continue;
    for (const item of findMalformedHeadings(files[name].text, kind)) {
      error(files[name].path, item.line, `malformed ${item.label} '${item.text}'; expected '${item.expected}'`);
    }
  }

  checkUnique(feature.requirements.fr, requirementsFile, 'requirement', error);
  checkUnique(feature.requirements.ac, requirementsFile, 'acceptance criterion', error);
  checkUnique(feature.tasks, tasksFile, 'task', error);
  checkUnique(feature.evidence, verificationFile, 'evidence', error);

  const previousFeature = trust.previous?.features.get(feature.id);
  if (previousFeature !== undefined && masterStatus) {
    const message = transitionError(FEATURE_TRANSITIONS, feature.id, previousFeature, masterStatus);
    if (message) error(tasksFile, 1, message);
  }

  for (const ev of feature.evidence) {
    for (const key of ['command', 'output', 'date', 'commit']) {
      if (!ev[key]) error(verificationFile, ev.fieldLines[key] ?? ev.line, `${ev.id} is missing ${key}`);
    }
    if (ev.covers.length === 0) error(verificationFile, ev.fieldLines.covers ?? ev.line, `${ev.id} covers no acceptance criterion`);
    for (const ac of ev.covers) if (!acIds.has(ac)) error(verificationFile, ev.fieldLines.covers ?? ev.line, `${ev.id} covers unknown ${ac}`);
    if (ev.command && !MANUAL_COMMAND.test(ev.command) && !trust.commands.has(ev.command)) {
      error(verificationFile, ev.fieldLines.command ?? ev.line, `${ev.id} command \`${ev.command}\` is not in the tech.md Commands table (prefix manual: for a manual check)`);
    }
    if (ev.date && ev.date > trust.today) error(verificationFile, ev.fieldLines.date ?? ev.line, `${ev.id} date ${ev.date} is in the future`);
    if (ev.commit && !(config.templateMode && ev.commit === PLACEHOLDER_COMMIT)) {
      if (trust.git.reason) warning(verificationFile, ev.fieldLines.commit ?? ev.line, `${ev.id} commit ${ev.commit} cannot be checked: ${trust.git.reason}`);
      else if (!trust.git.has(ev.commit)) error(verificationFile, ev.fieldLines.commit ?? ev.line, `${ev.id} commit ${ev.commit} is not in git log`);
    }
  }

  for (const task of feature.tasks) {
    if (!task.status || !TASK_STATUSES.includes(task.status)) error(tasksFile, task.fieldLines.status ?? task.line, `${task.id} has unknown status '${task.status ?? ''}'`);
    for (const fr of task.requirements) if (!frIds.has(fr)) error(tasksFile, task.fieldLines.requirements ?? task.line, `${task.id} references unknown requirement ${fr}`);
    for (const dep of task.depends_on) if (!taskIds.has(dep)) error(tasksFile, task.fieldLines.depends_on ?? task.line, `${task.id} depends on unknown task ${dep}`);
    for (const ev of task.evidence) if (!evidenceById.has(ev)) error(tasksFile, task.fieldLines.evidence ?? task.line, `${task.id} references unknown evidence ${ev}`);
    const previousTask = trust.previous?.tasks.get(`${feature.id}/${task.id}`);
    if (previousTask !== undefined && task.status) {
      const message = transitionError(TASK_TRANSITIONS, task.id, previousTask, task.status);
      if (message) error(tasksFile, task.fieldLines.status ?? task.line, message);
    }
    if (task.status === 'done') {
      const usable = task.evidence.filter((ev) => evidenceById.get(ev)?.covers.length);
      if (usable.length === 0) error(tasksFile, task.fieldLines.evidence ?? task.line, `${task.id} is done without evidence that covers an acceptance criterion`);
      const covered = new Set(task.evidence.flatMap((ev) => evidenceById.get(ev)?.covers ?? []));
      for (const fr of task.requirements) {
        const criteria = acByFr.get(fr);
        if (criteria && ![...criteria].some((ac) => covered.has(ac))) {
          error(tasksFile, task.fieldLines.evidence ?? task.line, `${task.id} is done but its evidence covers no acceptance criterion of ${fr}`);
        }
      }
    }
    if (masterStatus === 'implemented' && !['done', 'deferred'].includes(task.status)) {
      error(tasksFile, task.fieldLines.status ?? task.line, `${feature.id} is implemented but ${task.id} is ${task.status}`);
    }
  }

  const covered = new Set(feature.tasks.flatMap((task) => task.requirements));
  const drafting = ['draft', 'review', 'approved'].includes(masterStatus);
  for (const fr of feature.requirements.fr) {
    if (covered.has(fr.id)) continue;
    const report = drafting ? warning : error;
    report(requirementsFile, fr.line, `${fr.id} has no task in tasks.md`);
  }

  const approvedOnward = FEATURE_STATUSES.indexOf(masterStatus) >= FEATURE_STATUSES.indexOf('approved') && masterStatus !== 'superseded';
  if (approvedOnward) {
    for (const fr of feature.requirements.fr) {
      if (fr.ac.length === 0) error(requirementsFile, fr.line, `${fr.id} has no acceptance criterion; required from approved onward`);
    }
  }

  if (masterStatus === 'implemented') {
    if (feature.requirements.fr.length === 0) error(requirementsFile, 1, `${feature.id} is implemented without a functional requirement`);
    if (feature.tasks.length === 0) error(tasksFile, 1, `${feature.id} is implemented without a task`);
    for (const entry of assumptions.filter((item) => item.status === 'open' && item.feature === feature.id)) {
      error(config.paths.assumptions, entry.line, `${entry.id} is open but ${feature.id} is implemented`);
    }
  }
}

// Optional links from a feature to code: `targets` globs in requirements.md frontmatter and `[test: path]`
// on an acceptance criterion. A dangling link is a warning while the feature is planned, an error once code exists.
function checkTraceLinks(feature, repoFiles, { error, warning }) {
  const requirements = feature.files['requirements.md'];
  if (!requirements) return;
  const report = ['implementing', 'verification', 'implemented'].includes(feature.status) ? error : warning;
  const targets = requirements.data?.targets;
  if (targets !== undefined && targets !== null) {
    if (!Array.isArray(targets)) error(requirements.path, 1, 'targets must be a list of path globs');
    else for (const pattern of targets) {
      if (!repoFiles.some((file) => matchesGlob(file, String(pattern)))) report(requirements.path, 1, `${feature.id} target ${pattern} matches no file`);
    }
  }
  for (const ac of feature.requirements.ac) {
    for (const file of ac.tests ?? []) {
      if (!repoFiles.includes(file.replace(/^\.\//, ''))) report(requirements.path, ac.line, `${ac.id} links test ${file}, which does not exist`);
    }
  }
}

function checkUnique(items, file, label, error) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.id)) error(file, item.line, `duplicate ${label} id ${item.id}`);
    seen.add(item.id);
  }
}

function checkHandoff(root, config, features, now, { error, warning }) {
  const file = config.paths.handoff;
  if (!exists(root, file)) return;
  const handoff = parseHandoff(readText(root, file));
  if (handoff.error) error(file, 1, handoff.error);
  if (handoff.status !== 'active') return;
  if (handoff.expires) {
    const expiry = new Date(`${handoff.expires}T23:59:59Z`);
    if (!Number.isNaN(expiry.valueOf()) && expiry < now) warning(file, 1, `active handoff expired on ${handoff.expires}`);
  }
  const feature = features.find((entry) => entry.id === handoff.feature_id);
  if (handoff.feature_id && !feature) warning(file, 1, `handoff names unknown feature ${handoff.feature_id}`);
  if (feature && handoff.task_id && !feature.tasks.some((task) => task.id === handoff.task_id)) {
    warning(file, 1, `handoff names unknown task ${handoff.task_id} in ${feature.id}`);
  }
}

function checkGenerated(root, config, { error }) {
  for (const entry of config.validate.generatedFiles) {
    const files = entry.endsWith('/') ? walk(root, entry) : exists(root, entry) ? [entry] : [];
    for (const file of files) if (!BANNER.test(readText(root, file))) error(file, 1, 'generated file lacks the GENERATED banner');
  }
  const statePath = `${config.paths.context}/state.yaml`;
  if (exists(root, statePath)) {
    try {
      const state = YAML.parse(readText(root, statePath));
      if (state?.schema_version !== 2) error(statePath, 1, 'state.yaml schema_version must be 2');
    } catch (cause) {
      error(statePath, 1, `state.yaml is not valid YAML: ${cause.message}`);
    }
  }
  const { outputs } = renderOutputs(root, config);
  for (const file of staleOutputs(root, outputs)) error(file, 1, 'rendered view is stale; run npm run context:render');
}

// Adapters are rendered from steering and config, so a listed tool implies they must match a clean sync.
function checkAdapters(root, config, { error }) {
  if (!config.tools.length) return;
  const { outputs } = renderAdapters(root, config);
  for (const file of staleAdapters(root, outputs)) error(file, 1, 'adapter is stale; run npm run adapters:sync');
}

function sortFindings(findings) {
  return findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.level.localeCompare(b.level));
}

export function formatFindings(findings) {
  return findings.map((finding) => `${finding.file}:${finding.line}  ${finding.level}  ${finding.message}`);
}
