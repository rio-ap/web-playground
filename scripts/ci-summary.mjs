#!/usr/bin/env node

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
