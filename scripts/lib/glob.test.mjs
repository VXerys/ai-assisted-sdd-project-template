import { test } from 'node:test';
import assert from 'node:assert/strict';

import { matchesGlob, matchesAny } from './glob.mjs';

test('** spans directories and * stays inside one segment', () => {
  assert.equal(matchesGlob('src/a/b.ts', '**/*.ts'), true);
  assert.equal(matchesGlob('a.ts', '**/*.ts'), true);
  assert.equal(matchesGlob('src/x/y.js', 'src/**'), true);
  assert.equal(matchesGlob('lib/x.js', 'src/**'), false);
  assert.equal(matchesGlob('docs/a/b.md', 'docs/*.md'), false);
  assert.equal(matchesGlob('docs/a.md', 'docs/*.md'), true);
});

test('a pattern without a slash matches the basename at any depth', () => {
  assert.equal(matchesGlob('apps/web/.env.local', '.env*'), true);
  assert.equal(matchesGlob('.env', '.env*'), true);
  assert.equal(matchesGlob('src/env.ts', '.env*'), false);
  assert.equal(matchesGlob('android/app/google-services.json', 'google-services.json'), true);
});

test('? matches exactly one character inside a segment', () => {
  assert.equal(matchesGlob('src/a1.js', 'src/a?.js'), true);
  assert.equal(matchesGlob('src/a12.js', 'src/a?.js'), false);
  assert.equal(matchesGlob('src/a/.js', 'src/a?.js'), false);
});

test('a literal path matches itself and, as a directory, everything under it', () => {
  assert.equal(matchesGlob('AGENTS.md', 'AGENTS.md'), true);
  assert.equal(matchesGlob('docs/AGENTS.md', 'AGENTS.md'), true);
  assert.equal(matchesGlob('src/legacy/x.js', 'src/legacy/'), true);
  assert.equal(matchesGlob('src/legacy/deep/x.js', 'src/legacy'), true);
  assert.equal(matchesGlob('src/legacy-new/x.js', 'src/legacy/'), false);
  assert.equal(matchesGlob('docs/context/state.yaml', 'docs/context/state.yaml'), true);
  assert.equal(matchesGlob('docs/context/state.yaml.bak', 'docs/context/state.yaml'), false);
});

test('backslashes and a leading ./ are normalized before matching', () => {
  assert.equal(matchesGlob('docs\\context\\BRIEF.md', 'docs/context/BRIEF.md'), true);
  assert.equal(matchesGlob('./src/x.js', 'src/*.js'), true);
  assert.equal(matchesGlob('src/x.js', './src/*.js'), true);
});

test('regex metacharacters in a pattern are literal', () => {
  assert.equal(matchesGlob('src/a+b.js', 'src/a+b.js'), true);
  assert.equal(matchesGlob('src/aab.js', 'src/a+b.js'), false);
  assert.equal(matchesGlob('src/x.js', 'src/x.js'), true);
  assert.equal(matchesGlob('src/xxjs', 'src/x.js'), false);
});

test('a bare ** matches every path', () => {
  assert.equal(matchesGlob('anything/at/all.txt', '**'), true);
});

test('matchesAny reports the first matching pattern or null', () => {
  assert.equal(matchesAny('src/legacy/x.js', ['docs/**', 'src/legacy/']), 'src/legacy/');
  assert.equal(matchesAny('src/x.js', ['docs/**', 'src/legacy/']), null);
  assert.equal(matchesAny('src/x.js', []), null);
});
