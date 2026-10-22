import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { read, repo, validate } from './helpers.mjs';

function existingRepository() {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-adopt-target-'));
  const write = (file, text) => {
    fs.mkdirSync(path.dirname(path.join(target, file)), { recursive: true });
    fs.writeFileSync(path.join(target, file), text);
  };
  write('package.json', `${JSON.stringify({ name: 'legacy-app', version: '3.2.1', scripts: { test: 'jest' } }, null, 2)}\n`);
  write('README.md', '# Legacy app\n');
  write('CHANGELOG.md', '# Changelog\n\n## 3.2.1\n');
  write('examples/mine.txt', 'keep\n');
  write('scripts/ci/deploy.sh', 'keep\n');
  write('docs/architecture/README.md', '# Our architecture notes\n');
  write('.gitignore', 'node_modules/\n');
  return target;
}

const adopt = (target, ...args) => spawnSync(process.execPath, [path.join(repo, 'scripts', 'sdd', 'cli.mjs'), 'adopt', '--into', target, ...args], { cwd: repo, encoding: 'utf8' });

test('sdd adopt adds SDD to an existing repository without overwriting or deleting anything', () => {
  const target = existingRepository();
  const dry = adopt(target, '--dry-run', '--app', 'nextjs', '--db', 'postgres', '--owner', 'ci');
  assert.equal(dry.status, 0, dry.stderr);
  assert.equal(fs.existsSync(path.join(target, 'sdd.config.json')), false, 'dry run wrote files');

  const result = adopt(target, '--app', 'nextjs', '--db', 'postgres', '--tools', 'claude', '--owner', 'ci');
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /skip {5}docs\/architecture\/README\.md {2}\(exists in the target/);
  for (const [file, text] of [['README.md', '# Legacy app\n'], ['CHANGELOG.md', '# Changelog\n\n## 3.2.1\n'], ['examples/mine.txt', 'keep\n'], ['scripts/ci/deploy.sh', 'keep\n'], ['docs/architecture/README.md', '# Our architecture notes\n']]) {
    assert.equal(read(target, file), text, `${file} changed`);
  }
  const pkg = JSON.parse(read(target, 'package.json'));
  assert.equal(pkg.name, 'legacy-app');
  assert.equal(pkg.version, '3.2.1');
  assert.equal(pkg.scripts.test, 'jest');
  assert.equal(pkg.scripts['test:sdd'], 'node --test "scripts/**/*.test.mjs"');
  assert.ok(pkg.devDependencies.yaml);
  assert.match(read(target, '.github/workflows/context-integrity.yml'), /run: npm test && npm run test:sdd/);
  assert.match(read(target, '.gitignore'), /^node_modules\/\n\n# sdd preset\n/);

  const config = JSON.parse(read(target, 'sdd.config.json'));
  assert.equal(config.template.adopted, true);
  assert.ok(!config.managed.includes('package.json'));
  assert.equal(JSON.parse(read(target, '.sdd/manifest.json')).files['package.json'], undefined);
  assert.equal(fs.existsSync(path.join(target, 'scripts/init/e2e')), false);

  fs.cpSync(path.join(repo, 'node_modules', 'yaml'), path.join(target, 'node_modules', 'yaml'), { recursive: true });
  const validation = validate(target);
  assert.equal(validation.status, 0, validation.out);
  assert.match(adopt(target).stderr, /already has sdd\.config\.json/);
});
