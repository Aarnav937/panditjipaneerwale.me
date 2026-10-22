import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// No patched braces release exists. Only repository-controlled Tailwind globs
// reach it; it is neither shipped to browsers nor used by the order backend.
const exceptionUrl = 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm';
const exceptionExpiry = new Date('2026-11-22T00:00:00Z');

export function evaluateAudit(report, lock, now = new Date()) {
  if (!report?.vulnerabilities || report.error) throw new Error('No valid npm audit response; refusing to pass.');
  const entries = report.vulnerabilities;
  function accepted(name, seen = new Set()) {
    const entry = entries[name];
    if (!entry || seen.has(name) || now >= exceptionExpiry || !entry.nodes?.length || !entry.via?.length) return false;
    if (!entry.nodes.every((node) => lock.packages[node]?.dev === true)) return false;
    const next = new Set([...seen, name]);
    return entry.via.every((via) => typeof via === 'string'
      ? accepted(via, next)
      : name === 'braces' && via.url === exceptionUrl);
  }
  const blocked = [], allowed = [];
  for (const [name] of Object.entries(entries)) {
    (accepted(name) ? allowed : blocked).push(name);
  }
  return { blocked, accepted: allowed };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (!process.env.npm_execpath) throw new Error('Run through npm run security:audit.');
    const result = spawnSync(process.execPath, [process.env.npm_execpath, 'audit', '--json', '--ignore-scripts'], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    if (result.error || result.signal || ![0, 1].includes(result.status)) throw new Error('npm audit did not complete.');
    const report = JSON.parse(result.stdout);
    const outcome = evaluateAudit(report, JSON.parse(readFileSync('package-lock.json', 'utf8')));
    console.log('npm audit counts:', JSON.stringify(report.metadata?.vulnerabilities));
    if (outcome.accepted.length) console.log('Documented development-only braces exception (expires 2026-11-22):', outcome.accepted.join(', '));
    if (outcome.blocked.length) throw new Error(`Unaccepted advisories: ${outcome.blocked.join(', ')}. Run npm audit for details.`);
    console.log('No unaccepted dependency advisories.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
