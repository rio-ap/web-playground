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
  return STATUS[result] ?? { key: 'unknown', icon: '❔', label: 'Unknown' };
}

export function renderStatusTable(rows, { title = 'Test results', commit = '' } = {}) {
  const heading = commit ? `${title} — \`${commit.slice(0, 7)}\`` : title;
  const counts = { pass: 0, fail: 0, skipped: 0, cancelled: 0, unknown: 0 };
  const lines = [`### ${heading}`, '', '| Test | Status |', '| --- | --- |'];
  for (const row of rows) {
    const status = statusFor(row.result);
    counts[status.key] += 1;
    lines.push(`| ${row.label} | ${status.icon} ${status.label} |`);
  }
  const parts = [
    `${counts.pass} passed`,
    `${counts.fail} failed`,
    `${counts.skipped} skipped`,
  ];
  if (counts.cancelled) parts.push(`${counts.cancelled} cancelled`);
  if (counts.unknown) parts.push(`${counts.unknown} unknown`);
  lines.push('', `**${parts.join(' · ')}**`);
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

export function buildSummary({ jobs = {}, e2e = [], commit = '' } = {}) {
  const rows = HEAD_ROWS.map(([id, label]) => ({ label, result: jobs[id]?.result }));
  const e2eResult = jobs['e2e-tests']?.result;
  const statuses = new Map();
  if (e2eResult === 'skipped' || e2eResult === 'cancelled') {
    for (const browser of E2E_BROWSERS) statuses.set(browser, e2eResult);
  } else {
    for (const entry of e2e) {
      if (entry && typeof entry.browser === 'string') statuses.set(entry.browser, entry.result);
    }
  }
  for (const browser of E2E_BROWSERS) {
    rows.push({ label: `E2E · ${browser}`, result: statuses.get(browser) });
  }
  for (const [id, label] of TAIL_ROWS) {
    rows.push({ label, result: jobs[id]?.result });
  }
  return [MARKER, renderStatusTable(rows, { title: 'CI test results', commit })].join('\n');
}

export function readE2eStatuses(dir) {
  if (!dir) return [];
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  return names
    .filter((name) => name.endsWith('.json'))
    .map((name) => JSON.parse(readFileSync(join(dir, name), 'utf8')))
    .filter((entry) => entry && typeof entry.browser === 'string');
}

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--needs') opts.needs = argv[++i];
    else if (arg === '--e2e-dir') opts.e2eDir = argv[++i];
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
      e2e: readE2eStatuses(opts.e2eDir),
      commit: opts.commit ?? '',
    });
  }
  process.stdout.write(`${markdown}\n`);
}

if (process.argv[1]?.endsWith('ci-summary.mjs')) main();
