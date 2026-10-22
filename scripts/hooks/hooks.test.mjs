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
  const secrets = [
    '.env', 'apps/web/.env.local', 'certs/server.pem', 'android/app/google-services.json', 'android/release.keystore',
    'android/key.properties', 'ios/Runner/GoogleService-Info.plist', 'certs/client.p12', 'keys/AuthKey_ABC123.p8',
    'ios/profiles/dev.mobileprovision', 'certs/server.key', 'certs/bundle.pfx', '.ssh/id_rsa', '.ssh/id_rsa.pub', 'deploy/prod.secret'
  ];
  for (const file of secrets) {
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

test('pre-tool-guard leaves fileMatch steering to .claude/rules and writes no session state', () => {
  const cwd = copyFixture(adapterFixtures, 'multi-tool');
  const result = run('pre-tool-guard', cwd, { session_id: 'abc-123', ...edit(abs(cwd, 'src/db/users.js')) });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, '');
  assert.equal(fs.existsSync(abs(cwd, '.claude/.sdd-session')), false);
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

test('pre-tool-guard checks Bash and PowerShell commands', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const shell = (tool, command) => run('pre-tool-guard', cwd, { tool_name: tool, tool_input: { command } }).stdout;

  const bash = json(shell('Bash', 'echo x >> docs/context/BRIEF.md')).hookSpecificOutput;
  assert.equal(bash.permissionDecision, 'deny');
  assert.match(bash.permissionDecisionReason, /generated path.*shell command writes docs\/context\/BRIEF\.md/);
  assert.equal(json(shell('PowerShell', 'Set-Content -Path src/legacy/a.js -Value x')).hookSpecificOutput.permissionDecision, 'deny');
  assert.match(json(shell('Bash', 'cat .env')).hookSpecificOutput.permissionDecisionReason, /secret.*shell command reads \.env/);
  assert.equal(shell('Bash', 'npm test && git status'), '');
});

test('pre-tool-guard refuses Read of a secret file only', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const readFile = (file) => run('pre-tool-guard', cwd, { tool_name: 'Read', tool_input: { file_path: abs(cwd, file) } }).stdout;
  assert.equal(json(readFile('.env.local')).hookSpecificOutput.permissionDecision, 'deny');
  assert.equal(readFile('docs/context/state.yaml'), '');
});

test('pre-tool-guard asks before an edit to the gate in a derived project', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const output = json(run('pre-tool-guard', cwd, edit(abs(cwd, 'sdd.config.json'))).stdout).hookSpecificOutput;
  assert.equal(output.permissionDecision, 'ask');
  assert.match(output.permissionDecisionReason, /SDD configuration or check code/);
});

test('pre-tool-guard resolves the root of a nested git worktree', () => {
  const main = copyFixture(contextFixtures, 'valid-lite');
  fs.mkdirSync(abs(main, '.git'));
  const worktree = abs(main, '.claude/worktrees/w1');
  fs.cpSync(path.join(contextFixtures, 'valid-lite'), worktree, { recursive: true });
  fs.writeFileSync(path.join(worktree, '.git'), 'gitdir: ../../../.git/worktrees/w1\n');
  const target = path.join(worktree, 'docs', 'context', 'state.yaml');

  for (const cwd of [worktree, main]) {
    const result = spawnSync(process.execPath, [hook('pre-tool-guard')], {
      input: JSON.stringify({ session_id: 'wt', cwd, ...edit(target) }),
      encoding: 'utf8',
      env: { ...process.env, CLAUDE_PROJECT_DIR: main }
    });
    const output = json(result.stdout).hookSpecificOutput;
    assert.equal(output.permissionDecision, 'deny', cwd);
    assert.match(output.permissionDecisionReason, /^SDD guard: docs\/context\/state\.yaml is a generated path/);
  }
});

test('post-tool-render re-renders the context after a tasks.md edit', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  const before = read(cwd, 'docs/context/state.yaml');
  const tasks = abs(cwd, 'docs/specs/F-001-create-todo/tasks.md');
  fs.writeFileSync(tasks, read(cwd, 'docs/specs/F-001-create-todo/tasks.md').replace('- status: in_progress', '- status: review'));
  const { status, stdout } = run('post-tool-render', cwd, { ...edit(tasks), tool_response: {} });
  assert.equal(status, 0);
  const output = json(stdout).hookSpecificOutput;
  assert.equal(output.hookEventName, 'PostToolUse');
  assert.match(output.additionalContext, /^SDD: re-rendered docs\/context\/ after docs\/specs\/F-001-create-todo\/tasks\.md changed$/);
  const after = read(cwd, 'docs/context/state.yaml');
  assert.notEqual(after, before);
  assert.match(after, /status: review/);
});

test('post-tool-render also syncs adapters after a steering edit', () => {
  const cwd = copyFixture(contextFixtures, 'valid-lite');
  fs.appendFileSync(abs(cwd, 'docs/steering/rules.md'), '\n- New rule.\n');
  const { stdout } = run('post-tool-render', cwd, edit(abs(cwd, 'docs/steering/rules.md')));
  assert.match(json(stdout).hookSpecificOutput.additionalContext, /re-rendered docs\/context\/ and adapters after docs\/steering\/rules\.md changed/);
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
  const output = json(stdout).hookSpecificOutput;
  assert.equal(output.hookEventName, 'Stop');
  assert.match(output.additionalContext, /^SDD: docs\/specs\/F-001-create-todo\/tasks\.md changed but docs\/handoff\/current\.md did not\. Update the handoff/);
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

const repo = path.resolve(here, '..', '..');

// The repository without node_modules: what a derived project looks like before npm install.
function copyRepoWithoutDeps() {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-hooks-nodeps-'));
  fs.cpSync(repo, target, { recursive: true, filter: (source) => !/[\\/](\.git|node_modules)([\\/]|$)/.test(source) });
  // cpSync on Windows still copies some filtered-out children, so the directory is removed explicitly.
  fs.rmSync(path.join(target, 'node_modules'), { recursive: true, force: true });
  return target;
}

function runIn(cwd, name, payload) {
  const result = spawnSync(process.execPath, [path.join(cwd, 'scripts', 'hooks', `${name}.mjs`)], {
    cwd,
    input: JSON.stringify({ session_id: 'test-session', cwd, ...payload }),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: cwd }
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

test('without node_modules the guard fails closed and the other hooks fail open with a warning', () => {
  const cwd = copyRepoWithoutDeps();

  const guard = runIn(cwd, 'pre-tool-guard', edit(abs(cwd, 'src/x.js')));
  assert.equal(guard.status, 0, guard.stderr);
  assert.deepEqual(json(guard.stdout), {
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: 'SDD guard unavailable: run npm install' }
  });

  const start = runIn(cwd, 'session-start', { hook_event_name: 'SessionStart', source: 'startup' });
  assert.equal(start.status, 0, start.stderr);
  const startOutput = json(start.stdout).hookSpecificOutput;
  assert.equal(startOutput.hookEventName, 'SessionStart');
  assert.match(startOutput.additionalContext, /^SDD hook session-start unavailable \(.*\); run npm install$/);

  // post-tool-render and stop-handoff-check need no dependency; a missing lib is their import failure.
  fs.rmSync(abs(cwd, 'scripts/lib/glob.mjs'));
  const post = runIn(cwd, 'post-tool-render', edit(abs(cwd, 'docs/steering/rules.md')));
  assert.equal(post.status, 0, post.stderr);
  const postOutput = json(post.stdout).hookSpecificOutput;
  assert.equal(postOutput.hookEventName, 'PostToolUse');
  assert.match(postOutput.additionalContext, /^SDD hook post-tool-render unavailable \(.*\); run npm install$/);

  const stop = runIn(cwd, 'stop-handoff-check', { hook_event_name: 'Stop', stop_hook_active: false });
  assert.equal(stop.status, 0, stop.stderr);
  const stopOutput = json(stop.stdout).hookSpecificOutput;
  assert.equal(stopOutput.hookEventName, 'Stop');
  assert.match(stopOutput.additionalContext, /^SDD hook stop-handoff-check unavailable \(.*\); run npm install$/);
});
