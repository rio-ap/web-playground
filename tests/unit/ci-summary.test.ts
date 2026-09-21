import { describe, it, expect } from 'vitest';
import {
  MARKER,
  statusFor,
  renderStatusTable,
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
});

it('exposes the sticky comment marker', () => {
  expect(MARKER).toBe('<!-- ci-test-summary -->');
});
