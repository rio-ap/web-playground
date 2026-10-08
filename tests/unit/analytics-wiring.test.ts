import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { initAnalytics } from '../../src/analytics';

const CONFIG = {
  site: 'playground',
  endpoint: 'https://collect.trazire.com/collect',
  allowedHost: 'playground.trazire.com',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('main.js wiring', () => {
  it('initializes analytics exactly once with production values', () => {
    const source = readFileSync(new URL('../../src/main.js', import.meta.url), 'utf8');
    expect(source.match(/initAnalytics\(/g)).toHaveLength(1);
    expect(source).toContain("site: 'playground'");
    expect(source).toContain("endpoint: 'https://collect.trazire.com/collect'");
    expect(source).toContain("allowedHost: 'playground.trazire.com'");
  });
});

describe('hostname gate', () => {
  const lookalikes = [
    'localhost',
    '127.0.0.1',
    'evil.trazire.com',
    'trazire.com',
    'playground.trazire.com.evil.com',
  ];

  it('rejects every non-exact hostname without sending', () => {
    for (const hostname of lookalikes) {
      const beats: string[] = [];
      vi.stubGlobal('window', {
        location: { hostname, hash: '#/', search: '' },
        addEventListener: () => {},
        localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      });
      vi.stubGlobal('navigator', {
        doNotTrack: null,
        webdriver: false,
        sendBeacon: (url: string) => {
          beats.push(url);
          return true;
        },
      });
      vi.stubGlobal('document', { referrer: '' });
      expect(initAnalytics(CONFIG)).toBe(false);
      expect(beats).toEqual([]);
      vi.unstubAllGlobals();
    }
  });

  it('tracks only the exact production hostname', () => {
    const beats: string[] = [];
    vi.stubGlobal('window', {
      location: { hostname: 'playground.trazire.com', hash: '#/shop', search: '' },
      addEventListener: () => {},
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    });
    vi.stubGlobal('navigator', {
      doNotTrack: null,
      webdriver: false,
      sendBeacon: (url: string) => {
        beats.push(url);
        return true;
      },
    });
    vi.stubGlobal('document', { referrer: '' });
    expect(initAnalytics(CONFIG)).toBe(true);
    expect(beats).toEqual([CONFIG.endpoint]);
  });
});
