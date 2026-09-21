import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  MARKER,
  statusFor,
  renderStatusTable,
  buildSummary,
  readE2eStatuses,
  E2E_BROWSERS,
} from '../../scripts/ci-summary.mjs';

describe('statusFor', () => {
  it('maps GitHub job results to icons and labels', () => {
    expect(statusFor('success')).toEqual({ key: 'pass', icon: '✅', label: 'Pass' });
    expect(statusFor('failure')).toEqual({ key: 'fail', icon: '❌', label: 'Fail' });
    expect(statusFor('skipped')).toEqual({ key: 'skipped', icon: '⏭️', label: 'Skipped' });
    expect(statusFor('')).toEqual({ key: 'skipped', icon: '⏭️', label: 'Skipped' });
    expect(statusFor('cancelled')).toEqual({ key: 'cancelled', icon: '⚠️', label: 'Cancelled' });
  });

  it('falls back to unknown for unexpected results', () => {
    expect(statusFor('whoops')).toEqual({ key: 'unknown', icon: '❔', label: 'Unknown' });
    expect(statusFor(undefined)).toEqual({ key: 'unknown', icon: '❔', label: 'Unknown' });
  });

  it('does not resolve prototype properties', () => {
    expect(statusFor('constructor')).toEqual({ key: 'unknown', icon: '❔', label: 'Unknown' });
  });
});

describe('renderStatusTable', () => {
  it('renders heading with short commit, rows, and totals', () => {
    const markdown = renderStatusTable(
      [
        { label: 'A', result: 'success' },
        { label: 'B', result: 'failure' },
        { label: 'C', result: 'skipped' },
      ],
      { title: 'CI test results', commit: 'abc1234567890' },
    );
    expect(markdown).toBe(
      [
        '### CI test results — `abc1234`',
        '',
        '| Test | Status |',
        '| --- | --- |',
        '| A | ✅ Pass |',
        '| B | ❌ Fail |',
        '| C | ⏭️ Skipped |',
        '',
        '**1 passed · 1 failed · 1 skipped**',
      ].join('\n'),
    );
  });

  it('omits the commit when not provided', () => {
    const markdown = renderStatusTable([{ label: 'A', result: 'success' }], {
      title: 'CD pipeline results',
    });
    expect(markdown.startsWith('### CD pipeline results\n')).toBe(true);
  });

  it('appends cancelled and unknown counts only when present', () => {
    const markdown = renderStatusTable(
      [
        { label: 'A', result: 'cancelled' },
        { label: 'B', result: 'mystery' },
        { label: 'C', result: 'success' },
      ],
      { title: 'X' },
    );
    expect(markdown.endsWith('**1 passed · 0 failed · 0 skipped · 1 cancelled · 1 unknown**')).toBe(
      true,
    );
  });

  it('renders an empty table', () => {
    expect(renderStatusTable([], { title: 'Empty' })).toBe(
      '### Empty\n\n| Test | Status |\n| --- | --- |\n\n**0 passed · 0 failed · 0 skipped**',
    );
  });
});

it('exposes the sticky comment marker', () => {
  expect(MARKER).toBe('<!-- ci-test-summary -->');
});

const allPass = {
  'products-unit': { result: 'success' },
  'cart-unit': { result: 'success' },
  'checkout-unit': { result: 'success' },
  'e2e-tests': { result: 'success' },
  smoke: { result: 'success' },
  'a11y-tests': { result: 'success' },
  coverage: { result: 'success' },
};

const rowLabels = (markdown: string) =>
  [...markdown.matchAll(/^\| (.+?) \| (?:✅|❌|⏭️|⚠️|❔)/gm)].map((match) => match[1]);

describe('buildSummary', () => {
  it('starts with the sticky comment marker and a short commit heading', () => {
    const markdown = buildSummary({ jobs: allPass, commit: 'abc1234567890' });
    expect(markdown.startsWith(MARKER)).toBe(true);
    expect(markdown).toContain('### CI test results — `abc1234`');
  });

  it('renders every job and e2e browser in fixed order', () => {
    const markdown = buildSummary({
      jobs: allPass,
      e2e: [
        { browser: 'webkit', result: 'failure' },
        { browser: 'chromium', result: 'success' },
        { browser: 'firefox', result: 'success' },
      ],
      commit: 'abc1234',
    });
    expect(rowLabels(markdown)).toEqual([
      'Unit · products',
      'Unit · cart',
      'Unit · checkout',
      'E2E · chromium',
      'E2E · firefox',
      'E2E · webkit',
      'Smoke',
      'Accessibility',
      'Coverage',
    ]);
    expect(markdown).toContain('| E2E · webkit | ❌ Fail |');
  });

  it('marks all browser rows skipped when the e2e job was skipped', () => {
    const jobs = { ...allPass, 'e2e-tests': { result: 'skipped' } };
    const markdown = buildSummary({ jobs, e2e: [], commit: 'abc1234' });
    for (const browser of E2E_BROWSERS) {
      expect(markdown).toContain(`| E2E · ${browser} | ⏭️ Skipped |`);
    }
  });

  it('marks browser rows cancelled when the e2e job was cancelled', () => {
    const jobs = { ...allPass, 'e2e-tests': { result: 'cancelled' } };
    const markdown = buildSummary({ jobs, e2e: [], commit: 'abc1234' });
    for (const browser of E2E_BROWSERS) {
      expect(markdown).toContain(`| E2E · ${browser} | ⚠️ Cancelled |`);
    }
  });

  it('shows unknown when a browser status file is missing', () => {
    const markdown = buildSummary({
      jobs: allPass,
      e2e: [{ browser: 'chromium', result: 'success' }],
      commit: 'abc1234',
    });
    expect(markdown).toContain('| E2E · firefox | ❔ Unknown |');
    expect(markdown).toContain('| E2E · webkit | ❔ Unknown |');
  });

  it('shows unknown for missing job keys', () => {
    const markdown = buildSummary({ jobs: {}, commit: 'abc1234' });
    expect(markdown).toContain('| Unit · products | ❔ Unknown |');
    expect(markdown).toContain('| Coverage | ❔ Unknown |');
  });
});

describe('readE2eStatuses', () => {
  it('reads JSON status files from a directory', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ci-summary-'));
    writeFileSync(join(dir, 'chromium.json'), JSON.stringify({ browser: 'chromium', result: 'success' }));
    writeFileSync(join(dir, 'firefox.json'), JSON.stringify({ browser: 'firefox', result: 'failure' }));
    const statuses = readE2eStatuses(dir).sort((a, b) => a.browser.localeCompare(b.browser));
    expect(statuses).toEqual([
      { browser: 'chromium', result: 'success' },
      { browser: 'firefox', result: 'failure' },
    ]);
  });

  it('returns an empty list for a missing directory', () => {
    expect(readE2eStatuses('/nonexistent-ci-summary-dir')).toEqual([]);
  });

  it('skips corrupt status files', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ci-summary-'));
    writeFileSync(join(dir, 'chromium.json'), JSON.stringify({ browser: 'chromium', result: 'success' }));
    writeFileSync(join(dir, 'broken.json'), 'not json');
    expect(readE2eStatuses(dir)).toEqual([{ browser: 'chromium', result: 'success' }]);
  });
});

describe('ci-summary CLI', () => {
  const run = (args: string[], input?: string) =>
    execFileSync('node', ['scripts/ci-summary.mjs', ...args], input === undefined ? {} : { input }).toString();

  it('builds the CI comment from a needs file and e2e directory', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ci-summary-cli-'));
    const e2eDir = join(dir, 'e2e');
    mkdirSync(e2eDir);
    const needsPath = join(dir, 'needs.json');
    writeFileSync(
      needsPath,
      JSON.stringify({
        'products-unit': { result: 'success' },
        'cart-unit': { result: 'success' },
        'checkout-unit': { result: 'skipped' },
        'e2e-tests': { result: 'success' },
        smoke: { result: 'success' },
        'a11y-tests': { result: 'failure' },
        coverage: { result: 'success' },
      }),
    );
    writeFileSync(join(e2eDir, 'chromium.json'), JSON.stringify({ browser: 'chromium', result: 'success' }));
    const output = run(['--needs', needsPath, '--e2e-dir', e2eDir, '--commit', 'deadbeef1234']);
    expect(output).toContain(MARKER);
    expect(output).toContain('### CI test results — `deadbee`');
    expect(output).toContain('| Accessibility | ❌ Fail |');
    expect(output).toContain('| E2E · firefox | ❔ Unknown |');
  });

  it('builds a steps table from stdin for CD', () => {
    const input = JSON.stringify([
      { label: 'Unit coverage', result: 'success' },
      { label: 'E2E tests', result: 'failure' },
      { label: 'Smoke test', result: 'skipped' },
    ]);
    const output = run(['--steps', '-', '--title', 'CD pipeline results', '--commit', 'cafe123'], input);
    expect(output).toContain('### CD pipeline results — `cafe123`');
    expect(output).toContain('| E2E tests | ❌ Fail |');
    expect(output).toContain('**1 passed · 1 failed · 1 skipped**');
    expect(output).not.toContain(MARKER);
  });
});
