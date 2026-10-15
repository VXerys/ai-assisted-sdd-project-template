import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const contextFixtures = path.resolve(here, '..', 'context', '__fixtures__');
const adapterFixtures = path.resolve(here, '..', 'adapters', '__fixtures__');
const hook = (name) => path.join(here, `${name}.mjs`);

function run(name, cwd, payload, extraEnv = {}) {
  const input = typeof payload === 'string' ? payload : JSON.stringify({ session_id: 'test-session', cwd, hook_event_name: 'Test', ...payload });
  const result = spawnSync(process.execPath, [hook(name)], {
    cwd,
    input,
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: cwd, ...extraEnv }
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function copyFixture(base, name) {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), `sdd-hooks-${name}-`));
  fs.cpSync(path.join(base, name), target, { recursive: true });
  return target;
}

const read = (cwd, file) => fs.readFileSync(path.join(cwd, file), 'utf8');
const abs = (cwd, file) => path.join(cwd, ...file.split('/'));
const edit = (file) => ({ tool_name: 'Edit', tool_input: { file_path: file, old_string: 'a', new_string: 'b' } });
const json = (text) => JSON.parse(text);

test('session-start injects the brief prefixed by its render time', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const { status, stdout } = run('session-start', cwd, { hook_event_name: 'SessionStart', source: 'startup' });
  assert.equal(status, 0);
  const output = json(stdout);
  assert.equal(output.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.match(output.hookSpecificOutput.additionalContext, /^SDD brief \(rendered \d{4}-\d{2}-\d{2}T[^)]+\)\n/);
  assert.match(output.hookSpecificOutput.additionalContext, /Task T-002 — GET \/todos handler/);
  assert.ok(output.hookSpecificOutput.additionalContext.length <= 10000);
});

test('session-start warns first when the brief is stale against its sources', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  fs.appendFileSync(abs(cwd, 'docs/specs/F-001-create-todo/tasks.md'), '\nExtra line.\n');
  const { stdout } = run('session-start', cwd, { hook_event_name: 'SessionStart', source: 'resume' });
  assert.match(json(stdout).hookSpecificOutput.additionalContext, /^SDD brief is stale[^\n]*run npm run context:render\nSDD brief \(rendered/);
});

test('session-start prints the fallback read order when the brief is absent', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  fs.rmSync(abs(cwd, 'docs/context/BRIEF.md'));
  const { status, stdout } = run('session-start', cwd, { hook_event_name: 'SessionStart', source: 'startup' });
  assert.equal(status, 0);
  const context = json(stdout).hookSpecificOutput.additionalContext;
  assert.match(context, /BRIEF\.md is absent/);
  assert.match(context, /1\. docs\/steering\/rules\.md/);
  assert.match(context, /docs\/handoff\/current\.md/);
});

test('session-start fails open on unreadable stdin', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const { status, stdout } = run('session-start', cwd, '{not json');
  assert.equal(status, 0);
  assert.match(json(stdout).hookSpecificOutput.additionalContext, /SDD brief/);
});

test('pre-tool-guard denies an edit to a generated context file and names the render command', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const { status, stdout } = run('pre-tool-guard', cwd, edit(abs(cwd, 'docs/context/state.yaml')));
  assert.equal(status, 0);
  const output = json(stdout).hookSpecificOutput;
  assert.equal(output.hookEventName, 'PreToolUse');
  assert.equal(output.permissionDecision, 'deny');
  assert.match(output.permissionDecisionReason, /docs\/context\/state\.yaml is a generated path/);
  assert.match(output.permissionDecisionReason, /npm run context:render/);
});

test('pre-tool-guard denies an edit to an adapter and names adapters:sync', () => {
  const cwd = copyFixture(adapterFixtures, 'multi-tool');
  const output = json(run('pre-tool-guard', cwd, edit(abs(cwd, '.cursor/rules/product.mdc'))).stdout).hookSpecificOutput;
  assert.equal(output.permissionDecision, 'deny');
  assert.match(output.permissionDecisionReason, /npm run adapters:sync/);
});

test('pre-tool-guard denies a frozen path and asks for owner approval', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const output = json(run('pre-tool-guard', cwd, edit(abs(cwd, 'src/legacy/x.js'))).stdout).hookSpecificOutput;
  assert.equal(output.permissionDecision, 'deny');
  assert.match(output.permissionDecisionReason, /src\/legacy\/x\.js is a frozen path \(sdd\.config\.json frozen: src\/legacy\/\)/);
  assert.match(output.permissionDecisionReason, /owner approval/);
});

test('pre-tool-guard denies secret files anywhere, but not .env.example', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  for (const file of ['.env', 'apps/web/.env.local', 'certs/server.pem', 'android/app/google-services.json', 'android/release.keystore']) {
    const output = json(run('pre-tool-guard', cwd, { tool_name: 'Write', tool_input: { file_path: abs(cwd, file), content: 'x' } }).stdout).hookSpecificOutput;
    assert.equal(output.permissionDecision, 'deny', file);
    assert.match(output.permissionDecisionReason, /secret/);
  }
  assert.equal(run('pre-tool-guard', cwd, edit(abs(cwd, '.env.example'))).stdout, '');
});

test('pre-tool-guard stays silent for an ordinary source file', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const { status, stdout, stderr } = run('pre-tool-guard', cwd, edit(abs(cwd, 'src/x.js')));
  assert.equal(status, 0);
  assert.equal(stdout, '');
  assert.equal(stderr, '');
});

test('pre-tool-guard normalizes a backslash file_path before matching', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const windowsPath = `${cwd.replace(/\//g, '\\')}\\docs\\context\\BRIEF.md`;
  const output = json(run('pre-tool-guard', cwd, edit(windowsPath)).stdout).hookSpecificOutput;
  assert.equal(output.permissionDecision, 'deny');
});

test('pre-tool-guard surfaces a fileMatch steering file once per session', () => {
  const cwd = copyFixture(adapterFixtures, 'multi-tool');
  const payload = { session_id: 'abc-123', ...edit(abs(cwd, 'src/db/users.js')) };
  const first = run('pre-tool-guard', cwd, payload);
  assert.equal(first.status, 0);
  const output = json(first.stdout).hookSpecificOutput;
  assert.equal(output.hookEventName, 'PreToolUse');
  assert.equal(output.permissionDecision, undefined);
  assert.match(output.additionalContext, /^SDD steering: docs\/steering\/database\.md applies to src\/db\/users\.js/);
  assert.match(output.additionalContext, /Append-only; never edit an applied migration/);
  assert.ok(fs.existsSync(abs(cwd, '.claude/.sdd-session/abc-123.json')));

  assert.equal(run('pre-tool-guard', cwd, payload).stdout, '');
  assert.equal(run('pre-tool-guard', cwd, { ...payload, tool_input: { file_path: abs(cwd, 'migrations/002.sql') } }).stdout, '');
  assert.match(run('pre-tool-guard', cwd, { ...payload, session_id: 'other' }).stdout, /database\.md/);
  assert.equal(run('pre-tool-guard', cwd, { ...payload, tool_input: { file_path: abs(cwd, 'src/api.js') } }).stdout, '');
});

test('pre-tool-guard does nothing when hooks are disabled in sdd.config.json', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const config = JSON.parse(read(cwd, 'sdd.config.json'));
  config.hooks = { enabled: false };
  fs.writeFileSync(abs(cwd, 'sdd.config.json'), JSON.stringify(config));
  const { status, stdout } = run('pre-tool-guard', cwd, edit(abs(cwd, 'docs/context/state.yaml')));
  assert.equal(status, 0);
  assert.equal(stdout, '');
});

test('post-tool-render re-renders the context after a tasks.md edit', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const before = read(cwd, 'docs/context/state.yaml');
  const tasks = abs(cwd, 'docs/specs/F-001-create-todo/tasks.md');
  fs.writeFileSync(tasks, read(cwd, 'docs/specs/F-001-create-todo/tasks.md').replace('- status: in_progress', '- status: review'));
  const { status, stdout } = run('post-tool-render', cwd, { ...edit(tasks), tool_response: {} });
  assert.equal(status, 0);
  assert.match(stdout, /^SDD: re-rendered docs\/context\/ after docs\/specs\/F-001-create-todo\/tasks\.md changed\n$/);
  const after = read(cwd, 'docs/context/state.yaml');
  assert.notEqual(after, before);
  assert.match(after, /status: review/);
});

test('post-tool-render also syncs adapters after a steering edit', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  fs.appendFileSync(abs(cwd, 'docs/steering/rules.md'), '\n- New rule.\n');
  const { stdout } = run('post-tool-render', cwd, edit(abs(cwd, 'docs/steering/rules.md')));
  assert.match(stdout, /re-rendered docs\/context\/ and adapters after docs\/steering\/rules\.md changed/);
  assert.match(read(cwd, 'AGENTS.md'), /New rule\./);
});

test('post-tool-render ignores source files', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const before = read(cwd, 'docs/context/state.yaml');
  const { status, stdout } = run('post-tool-render', cwd, edit(abs(cwd, 'src/x.js')));
  assert.equal(status, 0);
  assert.equal(stdout, '');
  assert.equal(read(cwd, 'docs/context/state.yaml'), before);
});

function gitRepo() {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const git = (...args) => spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@x', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@x' } });
  git('init', '-q');
  git('add', '-A');
  git('commit', '-q', '-m', 'base');
  return cwd;
}

test('stop-handoff-check warns when tasks.md changed but the handoff did not', () => {
  const cwd = gitRepo();
  fs.appendFileSync(abs(cwd, 'docs/specs/F-001-create-todo/tasks.md'), '\nChanged.\n');
  spawnSync('git', ['add', '-A'], { cwd });
  const { status, stdout, stderr } = run('stop-handoff-check', cwd, { hook_event_name: 'Stop', stop_hook_active: false });
  assert.equal(status, 0);
  assert.equal(stderr, '');
  assert.match(stdout, /^SDD: docs\/specs\/F-001-create-todo\/tasks\.md changed but docs\/handoff\/current\.md did not\. Update the handoff/);
  assert.doesNotMatch(stdout, /"decision"/);
});

test('stop-handoff-check stays silent when the handoff changed too, or when it is already active', () => {
  const cwd = gitRepo();
  fs.appendFileSync(abs(cwd, 'docs/specs/F-001-create-todo/tasks.md'), '\nChanged.\n');
  fs.appendFileSync(abs(cwd, 'docs/handoff/current.md'), '\nChanged.\n');
  const both = run('stop-handoff-check', cwd, { hook_event_name: 'Stop', stop_hook_active: false });
  assert.equal(both.status, 0);
  assert.equal(both.stdout, '');
  spawnSync('git', ['checkout', '--', 'docs/handoff/current.md'], { cwd });
  const active = run('stop-handoff-check', cwd, { hook_event_name: 'Stop', stop_hook_active: true });
  assert.equal(active.status, 0);
  assert.equal(active.stdout, '');
});

test('stop-handoff-check exits 0 silently outside a git repository', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const { status, stdout } = run('stop-handoff-check', cwd, { hook_event_name: 'Stop', stop_hook_active: false }, { GIT_DIR: path.join(cwd, 'nowhere') });
  assert.equal(status, 0);
  assert.equal(stdout, '');
});
