import YAML from 'yaml';

export const GIT_START = '<!-- GENERATED:GIT_FACTS:START -->';
export const GIT_END = '<!-- GENERATED:GIT_FACTS:END -->';
const CHARS_PER_TOKEN = 4;
const SOURCES = 'sdd.config.json, docs/steering/, docs/specs/F-*/, docs/context/ASSUMPTIONS.md, docs/handoff/current.md';

function banner(model) {
  return `<!-- GENERATED FILE — DO NOT EDIT. Rendered by \`npm run context:render\`.\nSource: ${SOURCES}.\nsource_hash: ${model.source_hash} -->\n`;
}

function openAssumptions(model, featureId = null) {
  return model.assumptions.filter((entry) => entry.status === 'open' && (featureId === null || entry.feature === featureId));
}

function activeFeature(model) {
  return model.features.find((feature) => feature.id === model.active.feature_id) ?? null;
}

function activeTask(model) {
  const feature = activeFeature(model);
  return feature?.tasks.find((task) => task.id === model.active.task_id) ?? null;
}

function count(tasks, predicate) {
  return tasks.filter(predicate).length;
}

export function renderState(model) {
  const state = {
    schema_version: 2,
    project: model.project.name,
    tier: model.project.tier,
    features: model.features.map((feature) => ({
      id: feature.id,
      title: feature.title,
      status: feature.status,
      phase: feature.phase,
      spec_path: feature.spec_path,
      tasks: feature.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        requirements: task.requirements,
        depends_on: task.depends_on,
        evidence: task.evidence
      }))
    })),
    active: { feature_id: model.active.feature_id, task_id: model.active.task_id },
    assumptions_open: openAssumptions(model).map((entry) => ({ id: entry.id, feature: entry.feature, title: entry.title })),
    blockers: model.features.flatMap((feature) =>
      feature.tasks.filter((task) => task.status === 'blocked').map((task) => ({ feature_id: feature.id, task_id: task.id, title: task.title }))
    ),
    generated_at: model.generated_at,
    source_hash: model.source_hash
  };
  const header = `# GENERATED FILE. Rendered by \`npm run context:render\`. Do not edit by hand.\n# Source: ${SOURCES}.\n\n`;
  return header + YAML.stringify(state, { lineWidth: 0 });
}

function briefSections(model) {
  const feature = activeFeature(model);
  const task = activeTask(model);
  const sections = [];

  sections.push({
    key: 'project',
    text: `# Brief\n\n${model.project.oneLiner}\n\nProject \`${model.project.name}\`, tier \`${model.project.tier}\`. Rendered from ${SOURCES}.`
  });

  const active = ['## Active'];
  if (!feature) {
    active.push('No active feature. Pick the first `planned` task whose `depends_on` are all `done`, or create `docs/specs/F-XXX-name/` from the templates.');
  } else {
    active.push(`Feature ${feature.id} — ${feature.title} (\`${feature.status}\`, ${feature.spec_path}/)`);
    if (task) {
      active.push(`Task ${task.id} — ${task.title} (\`${task.status}\`); requirements: ${task.requirements.join(', ') || 'none'}; depends on: ${task.depends_on.join(', ') || 'none'}`);
      if (task.body) active.push('', task.body);
      if (task.acceptance.length) active.push('', 'Acceptance criteria:', ...task.acceptance.map((line) => `- ${line}`));
      if (task.scope?.length) active.push('', 'Files you may touch:', ...task.scope.map((entry) => `- \`${entry}\``));
    } else {
      active.push('No active task. Take the first `planned` task whose `depends_on` are all `done`.');
    }
  }
  sections.push({ key: 'active', text: active.join('\n') });

  const rules = ['## Rules'];
  if (model.rules.stopConditions) rules.push('Stop conditions:', '', model.rules.stopConditions, '');
  if (model.rules.prohibited) rules.push('Prohibited without explicit owner approval:', '', model.rules.prohibited);
  if (rules.length === 1) rules.push('`docs/steering/rules.md` has no "Stop conditions" or "Prohibited" section.');
  sections.push({ key: 'rules', text: rules.join('\n').trim() });

  const paths = ['## Read-only paths'];
  paths.push(`Generated: ${model.paths.generated.map((entry) => `\`${entry}\``).join(', ') || 'none'}`);
  paths.push(`Frozen: ${model.paths.frozen.map((entry) => `\`${entry}\``).join(', ') || 'none'}`);
  sections.push({ key: 'paths', text: paths.join('\n') });

  const open = openAssumptions(model, feature ? feature.id : null);
  const assumptions = ['## Open assumptions'];
  assumptions.push(...(open.length ? open.map((entry) => `- ${entry.id} — ${entry.title}${entry.feature ? ` (${entry.feature})` : ''}`) : ['None.']));
  sections.push({ key: 'assumptions', text: assumptions.join('\n') });

  const handoff = ['## Handoff'];
  if (model.handoff.status !== 'active') handoff.push(`Handoff is \`${model.handoff.status}\`.`);
  else handoff.push(model.handoff.nextStep ? `Next step:\n\n${model.handoff.nextStep}` : 'Active handoff without an "Exact next step" section.');
  sections.push({ key: 'handoff', text: handoff.join('\n') });

  if (feature) {
    const others = feature.tasks.filter((entry) => entry.id !== task?.id && !['done', 'deferred'].includes(entry.status));
    sections.push({
      key: 'open_tasks',
      text: ['## Other open tasks', ...(others.length ? others.map((entry) => `- ${entry.id} — ${entry.title} (\`${entry.status}\`)`) : ['None.'])].join('\n')
    });
  }

  const table = ['## Features', '| Feature | Status | Phase | Done/Total |', '|---|---|---|---|'];
  table.push(...model.features.map((entry) => `| ${entry.id} ${entry.title} | ${entry.status} | ${entry.phase} | ${count(entry.tasks, (t) => t.status === 'done')}/${entry.tasks.length} |`));
  if (!model.features.length) table.push('| none yet | | | |');
  sections.push({ key: 'features', text: table.join('\n') });

  return sections;
}

// Sections are cut from the bottom until the budget fits; the first section always stays.
export function renderBrief(model, limits) {
  const budget = (limits.briefTokens ?? 3000) * CHARS_PER_TOKEN;
  const sections = briefSections(model);
  const cut = [];
  const assemble = () => {
    const parts = sections.map((entry) => entry.text);
    if (cut.length) parts.push(`Cut for budget: ${[...cut].reverse().join(', ')}. Read the sources directly for those.`);
    return `${banner(model)}\n${parts.join('\n\n')}\n`;
  };
  let text = assemble();
  while (text.length > budget && sections.length > 1) {
    cut.push(sections.pop().key);
    text = assemble();
  }
  return text;
}

export function renderProjectState(model) {
  const lines = [banner(model), '# Project State', '', `- Generated at: ${model.generated_at}`, `- Project: ${model.project.name} (tier \`${model.project.tier}\`)`];
  lines.push(`- Active: ${model.active.feature_id ?? 'none'} / ${model.active.task_id ?? 'none'}`);
  lines.push(`- Open assumptions: ${openAssumptions(model).length}`);
  lines.push(`- Blocked tasks: ${model.features.flatMap((f) => f.tasks).filter((t) => t.status === 'blocked').map((t) => t.id).join(', ') || 'none'}`);
  lines.push('', '## Features', '', '| Feature | Status | Phase | Planned | In progress | Blocked | Review | Done | Deferred |', '|---|---|---|---|---|---|---|---|---|');
  for (const feature of model.features) {
    const by = (status) => count(feature.tasks, (task) => task.status === status);
    lines.push(`| ${feature.id} ${feature.title} | ${feature.status} | ${feature.phase} | ${by('planned')} | ${by('in_progress')} | ${by('blocked')} | ${by('review')} | ${by('done')} | ${by('deferred')} |`);
  }
  if (!model.features.length) lines.push('| none yet | | | | | | | | |');
  lines.push('', GIT_START, '## Git', '');
  if (!model.git?.available) lines.push('Git facts unavailable.');
  else {
    lines.push(`- Branch: \`${model.git.branch}\``, `- HEAD: \`${model.git.head}\``, `- Worktree: ${model.git.dirty ? 'dirty' : 'clean'}`, '', 'Recent commits:', '');
    lines.push(...(model.git.commits.length ? model.git.commits.map((entry) => `- \`${entry}\``) : ['- none']));
  }
  lines.push(GIT_END, '');
  return lines.join('\n');
}

export function renderProgress(model) {
  const lines = [banner(model), '# Project Progress', ''];
  if (!model.features.length) lines.push('No features yet. Task status lives in each feature\'s `tasks.md`.');
  for (const feature of model.features) {
    lines.push(`## ${feature.id} — ${feature.title} (\`${feature.status}\`, ${feature.phase})`, '');
    lines.push('| Task | Status | Requirements | Depends on | Evidence |', '|---|---|---|---|---|');
    for (const task of feature.tasks) {
      lines.push(`| ${task.id} ${task.title} | ${task.status} | ${task.requirements.join(', ')} | ${task.depends_on.join(', ')} | ${task.evidence.join(', ')} |`);
    }
    if (!feature.tasks.length) lines.push('| no tasks | | | | |');
    lines.push('');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

// Git facts change with every commit, so freshness checks compare the views without them.
export function stableView(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(new RegExp(`${GIT_START}[\\s\\S]*?${GIT_END}`), '')
    .trimEnd();
}
