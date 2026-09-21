#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const MARKER = '<!-- ci-test-summary -->';

const STATUS = {
  success: { key: 'pass', icon: '✅', label: 'Pass' },
  failure: { key: 'fail', icon: '❌', label: 'Fail' },
  skipped: { key: 'skipped', icon: '⏭️', label: 'Skipped' },
  '': { key: 'skipped', icon: '⏭️', label: 'Skipped' },
  cancelled: { key: 'cancelled', icon: '⚠️', label: 'Cancelled' },
};

export function statusFor(result) {
  return Object.hasOwn(STATUS, result)
    ? STATUS[result]
    : { key: 'unknown', icon: '❔', label: 'Unknown' };
}

export function renderStatusTable(rows, { title = 'Test results', commit = '' } = {}) {
  const heading = commit ? `${title} — \`${commit.slice(0, 7)}\`` : title;
  const hasTests = rows.some((row) => row.tests);
  const counts = { pass: 0, fail: 0, skipped: 0, cancelled: 0, unknown: 0 };
  const lines = [`### ${heading}`, ''];
  lines.push(hasTests ? '| Test | Status | Tests |' : '| Test | Status |');
  lines.push(hasTests ? '| --- | --- | --- |' : '| --- | --- |');
  let totalTests = 0;
  for (const row of rows) {
    const status = statusFor(row.result);
    counts[status.key] += 1;
    const testsCell = row.tests?.total ? `${row.tests.passed}/${row.tests.total}` : '—';
    if (row.tests?.total) totalTests += row.tests.total;
    lines.push(
      hasTests
        ? `| ${row.label} | ${status.icon} ${status.label} | ${testsCell} |`
        : `| ${row.label} | ${status.icon} ${status.label} |`,
    );
  }
  const parts = [
    `${counts.pass} passed`,
    `${counts.fail} failed`,
    `${counts.skipped} skipped`,
  ];
  if (counts.cancelled) parts.push(`${counts.cancelled} cancelled`);
  if (counts.unknown) parts.push(`${counts.unknown} unknown`);
  const totals = parts.join(' · ');
  lines.push('', totalTests ? `**${totals} — ${totalTests} tests run**` : `**${totals}**`);
  const failing = rows.filter((row) => row.failures?.length);
  if (failing.length) {
    const failedCount = failing.reduce((sum, row) => sum + row.failures.length, 0);
    lines.push(
      '',
      '<details>',
      `<summary>❌ ${failedCount} failed test${failedCount === 1 ? '' : 's'}</summary>`,
      '',
    );
    for (const row of failing) {
      lines.push(`**${row.label}**`);
      for (const name of row.failures.slice(0, 15)) {
        lines.push(`- \`${name}\``);
      }
      if (row.failures.length > 15) {
        lines.push(`- \`…and ${row.failures.length - 15} more\``);
      }
      lines.push('');
    }
    lines.push('</details>');
  }
  return lines.join('\n');
}

export const E2E_BROWSERS = ['chromium', 'firefox', 'webkit'];

const HEAD_ROWS = [
  ['products-unit', 'Unit · products'],
  ['cart-unit', 'Unit · cart'],
  ['checkout-unit', 'Unit · checkout'],
];

const TAIL_ROWS = [
  ['smoke', 'Smoke'],
  ['a11y-tests', 'Accessibility'],
  ['coverage', 'Coverage'],
];

const toRowExtras = (stats) =>
  stats
    ? {
        tests: { passed: stats.passed, total: stats.total },
        failures: stats.reportMissing ? [] : (stats.failedTests ?? []),
      }
    : {};

export function buildSummary({ jobs = {}, tests = {}, commit = '' } = {}) {
  const rows = HEAD_ROWS.map(([id, label]) => ({
    label,
    result: jobs[id]?.result,
    ...toRowExtras(tests[id]),
  }));
  const e2eResult = jobs['e2e-tests']?.result;
  for (const browser of E2E_BROWSERS) {
    const stats = tests[`e2e-${browser}`];
    const result =
      e2eResult === 'skipped' || e2eResult === 'cancelled' ? e2eResult : stats?.result;
    rows.push({ label: `E2E · ${browser}`, result, ...toRowExtras(stats) });
  }
  for (const [id, label] of TAIL_ROWS) {
    rows.push({ label, result: jobs[id]?.result, ...toRowExtras(tests[id]) });
  }
  return [MARKER, renderStatusTable(rows, { title: 'CI test results', commit })].join('\n');
}

export function readTestStats(dir) {
  if (!dir) return {};
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return {};
  }
  const stats = {};
  for (const name of names) {
    if (!name.endsWith('.json')) continue;
    try {
      const entry = JSON.parse(readFileSync(join(dir, name), 'utf8'));
      if (entry && typeof entry.id === 'string') stats[entry.id] = entry;
    } catch {}
  }
  return stats;
}

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--needs') opts.needs = argv[++i];
    else if (arg === '--tests-dir') opts.testsDir = argv[++i];
    else if (arg === '--steps') opts.steps = argv[++i];
    else if (arg === '--commit') opts.commit = argv[++i];
    else if (arg === '--title') opts.title = argv[++i];
  }
  return opts;
}

function readInput(path) {
  return path === '-' ? readFileSync(0, 'utf8') : readFileSync(path, 'utf8');
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  let markdown;
  if (opts.steps !== undefined) {
    const rows = JSON.parse(readInput(opts.steps));
    markdown = renderStatusTable(rows, {
      title: opts.title ?? 'Test results',
      commit: opts.commit ?? '',
    });
  } else {
    const jobs = JSON.parse(readInput(opts.needs ?? '-'));
    markdown = buildSummary({
      jobs,
      tests: readTestStats(opts.testsDir),
      commit: opts.commit ?? '',
    });
  }
  process.stdout.write(`${markdown}\n`);
}

if (process.argv[1]?.endsWith('ci-summary.mjs')) main();
