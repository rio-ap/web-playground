import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  parseVitestReport,
  parsePlaywrightReport,
  normalizeReport,
} from '../../scripts/parse-test-report.mjs';

const vitestReport = {
  numTotalTests: 4,
  numPassedTests: 2,
  numFailedTests: 1,
  numPendingTests: 1,
  numTodoTests: 0,
  testResults: [
    {
      name: '/repo/tests/unit/cart.test.ts',
      assertionResults: [
        { fullName: 'addItem adds a product', title: 'adds a product', status: 'passed' },
        { fullName: 'addItem rejects duplicates', title: 'rejects duplicates', status: 'failed' },
        { fullName: 'addItem ignores empty', title: 'ignores empty', status: 'pending' },
      ],
    },
  ],
};

const playwrightReport = {
  stats: { expected: 2, unexpected: 1, skipped: 1, flaky: 1 },
  suites: [
    {
      title: '',
      suites: [
        {
          title: 'e2e/cart-flow.spec.ts',
          suites: [
            {
              title: 'cart flow',
              specs: [
                { title: 'adds item', ok: true, tests: [{ status: 'expected' }] },
                { title: 'keeps item after reload', ok: false, tests: [{ status: 'unexpected' }] },
                { title: 'eventually passes', ok: true, tests: [{ status: 'flaky' }] },
              ],
            },
          ],
        },
      ],
    },
  ],
};

describe('parseVitestReport', () => {
  it('extracts counts and failed names with repo-relative files', () => {
    expect(parseVitestReport(vitestReport, '/repo')).toEqual({
      total: 4,
      passed: 2,
      failed: 1,
      skipped: 1,
      failedTests: ['tests/unit/cart.test.ts › addItem rejects duplicates'],
    });
  });
});

describe('parsePlaywrightReport', () => {
  it('counts flaky as passed and lists failed specs with suite path', () => {
    expect(parsePlaywrightReport(playwrightReport)).toEqual({
      total: 5,
      passed: 3,
      failed: 1,
      skipped: 1,
      failedTests: ['e2e/cart-flow.spec.ts › cart flow › keeps item after reload'],
    });
  });
});

describe('normalizeReport', () => {
  it('marks a missing report without throwing', () => {
    expect(
      normalizeReport({ id: 'smoke', tool: 'playwright', result: 'failure', report: null }),
    ).toEqual({
      id: 'smoke',
      result: 'failure',
      reportMissing: true,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      failedTests: [],
    });
  });
});

describe('parse-test-report CLI', () => {
  const run = (args: string[]) =>
    execFileSync('node', ['scripts/parse-test-report.mjs', ...args]).toString();

  it('writes normalized stats to the output file, creating directories', () => {
    const dir = mkdtempSync(join(tmpdir(), 'parse-test-'));
    const reportPath = join(dir, 'raw.json');
    writeFileSync(reportPath, JSON.stringify(vitestReport));
    const outputPath = join(dir, 'nested', 'tests', 'products-unit.json');
    run([
      '--tool',
      'vitest',
      '--id',
      'products-unit',
      '--report',
      reportPath,
      '--result',
      'success',
      '--output',
      outputPath,
    ]);
    const normalized = JSON.parse(readFileSync(outputPath, 'utf8'));
    expect(normalized.id).toBe('products-unit');
    expect(normalized.result).toBe('success');
    expect(normalized.total).toBe(4);
    expect(normalized.failedTests).toEqual([
      '/repo/tests/unit/cart.test.ts › addItem rejects duplicates',
    ]);
  });

  it('treats a missing report as reportMissing', () => {
    const dir = mkdtempSync(join(tmpdir(), 'parse-test-'));
    const outputPath = join(dir, 'out.json');
    run([
      '--tool',
      'playwright',
      '--id',
      'smoke',
      '--report',
      join(dir, 'nope.json'),
      '--output',
      outputPath,
    ]);
    const normalized = JSON.parse(readFileSync(outputPath, 'utf8'));
    expect(normalized.reportMissing).toBe(true);
    expect(normalized.total).toBe(0);
  });

  it('treats a corrupt report as reportMissing', () => {
    const dir = mkdtempSync(join(tmpdir(), 'parse-test-'));
    const reportPath = join(dir, 'broken.json');
    writeFileSync(reportPath, 'not json');
    const outputPath = join(dir, 'out.json');
    run(['--tool', 'vitest', '--id', 'cart-unit', '--report', reportPath, '--output', outputPath]);
    expect(JSON.parse(readFileSync(outputPath, 'utf8')).reportMissing).toBe(true);
  });

  it('exits 2 for an unknown tool', () => {
    expect(() =>
      run(['--tool', 'mocha', '--id', 'x', '--report', '/dev/null']),
    ).toThrow();
  });
});
