import { matchesGlob } from '../../lib/glob.mjs';

const WORKING = new Set(['in_progress', 'review']);

// Two scope patterns may touch the same file when one matches the other or one is a directory prefix of the other.
export function scopesOverlap(a = [], b = []) {
  const literal = (pattern) => pattern.replace(/\/?\*.*$/, '').replace(/\/$/, '');
  return a.some((left) => b.some((right) => {
    if (matchesGlob(left, right) || matchesGlob(right, left)) return true;
    const [x, y] = [literal(left), literal(right)];
    return x === y || x.startsWith(`${y}/`) || y.startsWith(`${x}/`) || !x || !y;
  }));
}

// Ready tasks (planned, every dependency done) across features, and the subset that can start next to
// the work in flight: a declared `scope` that overlaps no in_progress or review task. A task without
// `scope`, on either side, is never parallel-safe, since its files are unknown. Once one ready task
// starts it becomes working, so a ready task that overlaps it drops out on the next render.
export function nextTasks(features) {
  const ready = [];
  const working = [];
  const waiting = [];
  for (const feature of features) {
    const status = new Map(feature.tasks.map((task) => [task.id, task.status]));
    for (const task of feature.tasks) {
      const entry = { feature: feature.id, id: task.id, title: task.title, status: task.status, scope: task.scope ?? null, depends_on: task.depends_on };
      if (WORKING.has(task.status)) working.push(entry);
      if (task.status !== 'planned') continue;
      const unmet = task.depends_on.filter((dep) => status.get(dep) !== 'done');
      if (unmet.length) waiting.push({ ...entry, unmet });
      else ready.push(entry);
    }
  }
  const parallelSafe = ready.filter((task) => task.scope?.length
    && !working.some((other) => !other.scope?.length || scopesOverlap(task.scope, other.scope)));
  return { next: ready[0] ?? null, ready, parallelSafe, working, waiting };
}
