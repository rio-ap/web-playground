import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  buildPayload,
  initAnalytics,
  OPT_OUT_KEY,
  readOptOut,
  referrerHost,
  routeFromHash,
  shouldTrack,
} from '../../src/analytics';

function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

function installGlobals({ hostname = 'playground.trazire.com', hash = '#/', search = '', doNotTrack = null, webdriver = false } = {}) {
  const listeners = {};
  const beats = [];
  const window = {
    location: { hostname, hash, search },
    addEventListener: (type, listener) => {
      (listeners[type] ||= []).push(listener);
    },
    localStorage: fakeStorage(),
  };
  const navigator = {
    doNotTrack,
    webdriver,
    sendBeacon: (url, body) => {
      beats.push({ url, body });
      return true;
    },
  };
  const document = { referrer: 'https://linkedin.com/post' };
  vi.stubGlobal('window', window);
  vi.stubGlobal('navigator', navigator);
  vi.stubGlobal('document', document);
  return { window, listeners, beats };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('shouldTrack', () => {
  it('tracks when nothing blocks it', () => {
    expect(shouldTrack({ hostname: 'playground.trazire.com' })).toBe(true);
  });

  it('refuses empty hostnames and opted-out browsers', () => {
    expect(shouldTrack({ hostname: '' })).toBe(false);
    expect(shouldTrack({ hostname: 'x', optedOut: true })).toBe(false);
  });

  it('tracks when Do Not Track is set', () => {
    expect(shouldTrack({ hostname: 'x', doNotTrack: '1' })).toBe(true);
    expect(shouldTrack({ hostname: 'x', doNotTrack: true })).toBe(true);
  });
});

describe('routeFromHash', () => {
  it('normalizes hashes to routes', () => {
    expect(routeFromHash('#/shop')).toBe('/shop');
    expect(routeFromHash('#/checkout/address')).toBe('/checkout/address');
    expect(routeFromHash('')).toBe('/');
    expect(routeFromHash('#/')).toBe('/');
    expect(routeFromHash('#/shop/')).toBe('/shop');
    expect(routeFromHash('#/shop?utm=x')).toBe('/shop');
    expect(routeFromHash('shop')).toBe('/shop');
  });
});

describe('referrerHost', () => {
  it('keeps only the hostname', () => {
    expect(referrerHost('https://linkedin.com/feed')).toBe('linkedin.com');
    expect(referrerHost('https://www.google.com/search?q=x')).toBe('www.google.com');
  });

  it('returns null for empty or invalid values', () => {
    expect(referrerHost('')).toBeNull();
    expect(referrerHost('not a url')).toBeNull();
    expect(referrerHost(undefined)).toBeNull();
  });
});

describe('buildPayload', () => {
  it('builds the wire payload with a referrer host', () => {
    expect(buildPayload('playground', '/shop', { referrer: 'https://linkedin.com/feed', automated: true })).toEqual({
      site: 'playground',
      route: '/shop',
      automated: true,
      ref: 'linkedin.com',
    });
  });

  it('omits ref when there is no referrer and defaults automated to false', () => {
    expect(buildPayload('playground', '/')).toEqual({
      site: 'playground',
      route: '/',
      automated: false,
    });
  });
});

describe('readOptOut', () => {
  it('sets and clears the opt-out flag from the no-track query parameter', () => {
    const storage = fakeStorage();
    expect(readOptOut('?no-track=1', storage)).toBe(true);
    expect(storage.getItem(OPT_OUT_KEY)).toBe('1');
    expect(readOptOut('?no-track=0', storage)).toBe(false);
    expect(storage.getItem(OPT_OUT_KEY)).toBeNull();
  });

  it('returns false when storage throws', () => {
    const storage = {
      getItem: () => {
        throw new Error('denied');
      },
    };
    expect(readOptOut('', storage)).toBe(false);
  });

  it('honors no-track=1 even when storage throws', () => {
    const storage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    expect(readOptOut('?no-track=1', storage)).toBe(true);
  });

  it('reads a previously persisted opt-out', () => {
    expect(readOptOut('', fakeStorage({ [OPT_OUT_KEY]: '1' }))).toBe(true);
  });
});

describe('initAnalytics', () => {
  const config = {
    site: 'playground',
    endpoint: 'https://collect.trazire.com/collect',
    allowedHost: 'playground.trazire.com',
  };

  it('sends an initial pageview and one per hash change', () => {
    const { window, listeners, beats } = installGlobals();
    expect(initAnalytics(config)).toBe(true);
    expect(beats).toHaveLength(1);
    expect(beats[0].url).toBe(config.endpoint);
    expect(JSON.parse(beats[0].body)).toEqual({
      site: 'playground',
      route: '/',
      automated: false,
      ref: 'linkedin.com',
    });

    window.location.hash = '#/shop';
    listeners.hashchange[0]();
    expect(beats).toHaveLength(2);
    expect(JSON.parse(beats[1].body).route).toBe('/shop');
  });

  it('labels automation without filtering it', () => {
    const { beats } = installGlobals({ webdriver: true });
    initAnalytics(config);
    expect(JSON.parse(beats[0].body).automated).toBe(true);
  });

  it('does nothing on other hostnames', () => {
    const { beats } = installGlobals({ hostname: 'localhost' });
    expect(initAnalytics(config)).toBe(false);
    expect(beats).toHaveLength(0);
  });

  it('tracks when DNT is set', () => {
    const { beats } = installGlobals({ doNotTrack: '1' });
    expect(initAnalytics(config)).toBe(true);
    expect(beats).toHaveLength(1);
  });

  it('honors a stored opt-out', () => {
    const { beats } = installGlobals({ search: '?no-track=1' });
    expect(initAnalytics(config)).toBe(false);
    expect(beats).toHaveLength(0);
  });

  it('never throws when sendBeacon fails', () => {
    installGlobals();
    vi.stubGlobal('navigator', {
      doNotTrack: null,
      webdriver: false,
      sendBeacon: () => {
        throw new Error('blocked');
      },
    });
    expect(() => initAnalytics(config)).not.toThrow();
  });

  it('never throws when localStorage access is blocked', () => {
    installGlobals();
    vi.stubGlobal('window', {
      location: { hostname: 'playground.trazire.com', hash: '#/', search: '' },
      get localStorage() {
        throw new Error('blocked');
      },
      addEventListener: () => {},
    });
    expect(() => initAnalytics(config)).not.toThrow();
  });

  it('honors a previously persisted opt-out', () => {
    const { window, beats } = installGlobals();
    window.localStorage.setItem(OPT_OUT_KEY, '1');
    expect(initAnalytics(config)).toBe(false);
    expect(beats).toHaveLength(0);
  });

  it('honors no-track=1 when localStorage access throws', () => {
    const beats = [];
    vi.stubGlobal('window', {
      location: { hostname: 'playground.trazire.com', hash: '#/', search: '?no-track=1' },
      get localStorage() {
        throw new Error('blocked');
      },
      addEventListener: () => {},
    });
    vi.stubGlobal('navigator', {
      doNotTrack: null,
      webdriver: false,
      sendBeacon: (...args) => {
        beats.push(args);
        return true;
      },
    });
    vi.stubGlobal('document', { referrer: '' });
    expect(initAnalytics(config)).toBe(false);
    expect(beats).toHaveLength(0);
  });
});
