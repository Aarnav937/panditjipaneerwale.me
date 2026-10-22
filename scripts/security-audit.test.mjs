import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateAudit } from './security-audit.mjs';

const url = 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm';
const lock = { packages: { 'node_modules/braces': { dev: true }, 'node_modules/tailwindcss': { dev: true } } };
const braces = { name: 'braces', severity: 'high', nodes: ['node_modules/braces'], via: [{ url, title: 'Unpatched braces recursion' }] };

test('only accepts the documented unpatched development-only advisory', () => {
  const report = { vulnerabilities: { braces, tailwindcss: { name: 'tailwindcss', severity: 'high', nodes: ['node_modules/tailwindcss'], via: ['braces'] } } };
  assert.deepEqual(evaluateAudit(report, lock, new Date('2026-10-22')), { blocked: [], accepted: ['braces', 'tailwindcss'] });
});

test('blocks new advisories, production exposure and expired exceptions', () => {
  assert.equal(evaluateAudit({ vulnerabilities: { braces: { ...braces, via: [{ url: 'https://github.com/advisories/GHSA-new', title: 'New issue' }] } } }, lock).blocked.length, 1);
  assert.equal(evaluateAudit({ vulnerabilities: { braces } }, { packages: { 'node_modules/braces': {} } }).blocked.length, 1);
  assert.equal(evaluateAudit({ vulnerabilities: { braces } }, lock, new Date('2026-11-23')).blocked.length, 1);
});

test('rejects malformed audit responses and unknown dependency chains', () => {
  assert.throws(() => evaluateAudit({ error: 'registry unavailable' }, lock));
  assert.equal(evaluateAudit({ vulnerabilities: { vite: { name: 'vite', severity: 'critical', nodes: [], via: ['missing'] } } }, lock).blocked.length, 1);
});
