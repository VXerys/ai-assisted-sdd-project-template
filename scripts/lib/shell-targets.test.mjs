import { test } from 'node:test';
import assert from 'node:assert/strict';

import { shellTargets, tokenize } from './shell-targets.mjs';
import { guardDecision, guardShellCommand } from './guard.mjs';

const config = { generated: ['docs/context/state.yaml', 'AGENTS.md', '.cursor/rules/'], frozen: ['src/legacy/'], paths: { context: 'docs/context' }, templateMode: false };
const writes = (command) => shellTargets(command).writes;
const reads = (command) => shellTargets(command).reads;
const identity = (raw) => raw.replace(/^\.\//, '');

test('tokenize keeps quoted text whole and splits operators', () => {
  assert.deepEqual(tokenize(`echo "a b" >> 'c d'&&ls`).map((token) => token.value), ['echo', 'a b', '>>', 'c d', '&&', 'ls']);
  assert.deepEqual(tokenize('cmd 2>/dev/null').map((token) => token.value), ['cmd', '2>', '/dev/null']);
});

test('redirects, tee, rm, mv, touch and in-place sed are writes', () => {
  assert.deepEqual(writes('echo x > AGENTS.md'), ['AGENTS.md']);
  assert.deepEqual(writes('npm run x 2>&1 | tee -a docs/context/state.yaml'), ['docs/context/state.yaml']);
  assert.deepEqual(writes('rm -rf .cursor/rules/a.mdc b'), ['.cursor/rules/a.mdc', 'b']);
  assert.deepEqual(writes("sed -i 's/a/b/' AGENTS.md"), ['s/a/b/', 'AGENTS.md']);
  assert.deepEqual(writes("sed -n '1,5p' AGENTS.md"), []);
  assert.deepEqual(writes('cp AGENTS.md /tmp/copy.md'), ['/tmp/copy.md']);
  assert.deepEqual(writes('mv a.md AGENTS.md'), ['a.md', 'AGENTS.md']);
});

test('PowerShell content and item cmdlets are writes; -Value text is not a path', () => {
  assert.deepEqual(writes("Set-Content -Path AGENTS.md -Value 'x'"), ['AGENTS.md']);
  assert.deepEqual(writes("Set-Content AGENTS.md 'x'"), ['AGENTS.md']);
  assert.deepEqual(writes('"x" | Out-File -FilePath docs/context/state.yaml -Encoding utf8'), ['docs/context/state.yaml']);
  assert.deepEqual(writes('Remove-Item -Recurse -Force .cursor/rules'), ['.cursor/rules']);
  assert.deepEqual(writes('Copy-Item -Path a.md -Destination AGENTS.md'), ['AGENTS.md']);
  assert.deepEqual(writes('Get-Content AGENTS.md'), []);
});

test('a leading cd moves relative targets; inline scripts expose their literals', () => {
  assert.deepEqual(writes('cd docs/context && rm state.yaml'), ['docs/context/state.yaml']);
  assert.deepEqual(writes('cd /repo; rm /abs/x'), ['/abs/x']);
  assert.ok(writes(`node -e "require('fs').writeFileSync('AGENTS.md', 'x')"`).includes('AGENTS.md'));
  assert.deepEqual(writes(`node -e "console.log('AGENTS.md')"`), []);
});

test('a heredoc body is content, scanned as code only when an interpreter reads it', () => {
  const script = "node - <<'EOF'\nconst fs = require('fs');\nfs.writeFileSync('AGENTS.md', '**');\nEOF";
  assert.deepEqual(writes(script), ['AGENTS.md']);
  assert.deepEqual(reads(script), []);
  assert.deepEqual(writes("cat > notes.md <<EOF\nrm AGENTS.md\n**\nEOF"), ['notes.md']);
  assert.equal(guardShellCommand("git commit -F - <<'EOF'\nfix: touch docs/context/state.yaml and .env\nEOF", config, identity), null);
});

test('reads never expand wildcards against secret patterns', () => {
  assert.equal(guardShellCommand('grep -rn x ** --include=*.mjs', config, identity), null);
  assert.equal(guardShellCommand('cat .env*', config, identity).rule, 'secret');
});

test('reads cover every path argument except for echo-like commands', () => {
  assert.deepEqual(reads('cat .env.local'), ['.env.local']);
  assert.deepEqual(reads('Get-Content -Path .env'), ['.env']);
  assert.deepEqual(reads('echo ".env" >> .gitignore'), []);
});

test('guardShellCommand denies generated writes and secret reads, allows ordinary commands', () => {
  assert.equal(guardShellCommand('echo x > AGENTS.md', config, identity).rule, 'generated');
  assert.equal(guardShellCommand('rm docs/context/*', config, identity).rule, 'generated');
  assert.equal(guardShellCommand('cat .env', config, identity).rule, 'secret');
  assert.equal(guardShellCommand('cat .env.example', config, identity), null);
  assert.equal(guardShellCommand('Set-Content src/legacy/a.js x', config, identity).rule, 'frozen');
  assert.equal(guardShellCommand('npm run adapters:sync && git status', config, identity), null);
  assert.equal(guardShellCommand('cat AGENTS.md', config, identity), null);
  assert.match(guardShellCommand('echo x > AGENTS.md', config, identity).reason, /shell command writes AGENTS\.md/);
});

test('guardDecision asks before the gate itself changes, outside the template only', () => {
  const decision = guardDecision('sdd.config.json', config);
  assert.equal(decision.rule, 'protected');
  assert.equal(decision.decision, 'ask');
  assert.equal(guardDecision('scripts/lib/guard.mjs', config).rule, 'protected');
  assert.equal(guardDecision('.claude/skills/sdd-task/SKILL.md', config).rule, 'protected');
  assert.equal(guardDecision('.claude/skills/other/SKILL.md', config), null);
  assert.equal(guardDecision('sdd.config.json', { ...config, templateMode: true }), null);
  assert.equal(guardDecision('AGENTS.md', config, 'AGENTS.md', 'read'), null);
  assert.equal(guardDecision('.env', config, '.env', 'read').rule, 'secret');
});
