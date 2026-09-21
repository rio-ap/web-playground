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
  readTestStats,
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

  it('adds a Tests column with passed/total and a dash for missing stats', () => {
    const markdown = renderStatusTable(
      [
        { label: 'A', result: 'success', tests: { passed: 13, total: 13 } },
        { label: 'B', result: 'failure', tests: { passed: 51, total: 54 } },
        { label: 'C', result: 'skipped' },
      ],
      { title: 'CI test results' },
    );
    expect(markdown).toContain('| Test | Status | Tests |');
    expect(markdown).toContain('| A | ✅ Pass | 13/13 |');
    expect(markdown).toContain('| B | ❌ Fail | 51/54 |');
    expect(markdown).toContain('| C | ⏭️ Skipped | — |');
  });

  it('appends total tests run to the totals line', () => {
    const markdown = renderStatusTable(
      [
        { label: 'A', result: 'success', tests: { passed: 13, total: 13 } },
        { label: 'B', result: 'failure', tests: { passed: 51, total: 54 } },
      ],
      { title: 'CI test results' },
    );
    expect(markdown.endsWith('**1 passed · 1 failed · 0 skipped — 67 tests run**')).toBe(true);
  });

  it('lists failed tests in a collapsed block, capped at 15 per row', () => {
    const failures = Array.from({ length: 17 }, (_, index) => `spec › failure ${index + 1}`);
    const markdown = renderStatusTable(
      [
        { label: 'E2E · firefox', result: 'failure', tests: { passed: 37, total: 54 }, failures },
        { label: 'Unit · cart', result: 'success', tests: { passed: 13, total: 13 }, failures: [] },
      ],
      { title: 'CI test results' },
    );
    expect(markdown).toContain('<summary>❌ 17 failed tests</summary>');
    expect(markdown).toContain('**E2E · firefox**');
    expect(markdown).toContain('- `spec › failure 15`');
    expect(markdown).not.toContain('- `spec › failure 16`');
    expect(markdown).toContain('- `…and 2 more`');
    expect(markdown).not.toContain('**Unit · cart**');
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

const statsEntry = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  result: 'success',
  total: 10,
  passed: 9,
  failed: 1,
  skipped: 0,
  failedTests: ['spec › fails'],
  ...over,
});

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
      tests: {
        'e2e-webkit': statsEntry('e2e-webkit', { result: 'failure' }),
        'e2e-chromium': statsEntry('e2e-chromium'),
        'e2e-firefox': statsEntry('e2e-firefox'),
      },
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

  it('merges test stats into rows and keeps needs as the status source', () => {
    const markdown = buildSummary({
      jobs: { ...allPass, 'a11y-tests': { result: 'failure' } },
      tests: {
        'a11y-tests': statsEntry('a11y-tests', {
          result: 'success',
          total: 7,
          passed: 6,
          failed: 1,
          failedTests: ['a11y.spec.ts › home › no violations'],
        }),
      },
      commit: 'abc1234',
    });
    expect(markdown).toContain('| Accessibility | ❌ Fail | 6/7 |');
    expect(markdown).toContain('- `a11y.spec.ts › home › no violations`');
  });

  it('uses per-browser e2e stats results and counts when the e2e job ran', () => {
    const markdown = buildSummary({
      jobs: allPass,
      tests: {
        'e2e-chromium': statsEntry('e2e-chromium', {
          total: 54,
          passed: 54,
          failed: 0,
          failedTests: [],
        }),
        'e2e-firefox': statsEntry('e2e-firefox', {
          result: 'failure',
          total: 54,
          passed: 52,
          failed: 2,
          failedTests: ['a', 'b'],
        }),
      },
      commit: 'abc1234',
    });
    expect(markdown).toContain('| E2E · chromium | ✅ Pass | 54/54 |');
    expect(markdown).toContain('| E2E · firefox | ❌ Fail | 52/54 |');
    expect(markdown).toContain('| E2E · webkit | ❔ Unknown | — |');
  });

  it('keeps skipped/cancelled browser status even if stale stats exist', () => {
    const markdown = buildSummary({
      jobs: { ...allPass, 'e2e-tests': { result: 'skipped' } },
      tests: {
        'e2e-chromium': statsEntry('e2e-chromium', { passed: 10, failed: 0, failedTests: [] }),
      },
      commit: 'abc1234',
    });
    expect(markdown).toContain('| E2E · chromium | ⏭️ Skipped | 10/10 |');
  });

  it('shows a dash for reportMissing stats', () => {
    const markdown = buildSummary({
      jobs: { ...allPass, 'cart-unit': { result: 'failure' } },
      tests: {
        'cart-unit': {
          id: 'cart-unit',
          result: 'failure',
          reportMissing: true,
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          failedTests: [],
        },
      },
      commit: 'abc1234',
    });
    expect(markdown).toContain('| Unit · cart | ❌ Fail | — |');
  });
});

describe('readTestStats', () => {
  it('reads normalized stats keyed by id and skips corrupt or id-less files', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ci-summary-'));
    writeFileSync(join(dir, 'cart-unit.json'), JSON.stringify(statsEntry('cart-unit')));
    writeFileSync(join(dir, 'broken.json'), 'not json');
    writeFileSync(join(dir, 'no-id.json'), JSON.stringify({ total: 1 }));
    const stats = readTestStats(dir);
    expect(Object.keys(stats).sort()).toEqual(['cart-unit']);
    expect(stats['cart-unit'].total).toBe(10);
  });

  it('returns an empty object for a missing directory', () => {
    expect(readTestStats('/nonexistent-ci-summary-dir')).toEqual({});
  });
});

describe('ci-summary CLI', () => {
  const run = (args: string[], input?: string) =>
    execFileSync('node', ['scripts/ci-summary.mjs', ...args], input === undefined ? {} : { input }).toString();

  it('builds the CI comment from a needs file and tests directory', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ci-summary-cli-'));
    const testsDir = join(dir, 'tests');
    mkdirSync(testsDir);
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
    writeFileSync(
      join(testsDir, 'e2e-chromium.json'),
      JSON.stringify({
        id: 'e2e-chromium',
        result: 'success',
        total: 4,
        passed: 4,
        failed: 0,
        skipped: 0,
        failedTests: [],
      }),
    );
    const output = run(['--needs', needsPath, '--tests-dir', testsDir, '--commit', 'deadbeef1234']);
    expect(output).toContain(MARKER);
    expect(output).toContain('### CI test results — `deadbee`');
    expect(output).toContain('| Accessibility | ❌ Fail | — |');
    expect(output).toContain('| E2E · chromium | ✅ Pass | 4/4 |');
    expect(output).toContain('| E2E · firefox | ❔ Unknown | — |');
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
