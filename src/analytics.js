// Vendored from https://github.com/TrazireOfficial/trazire-analytics client/beacon.js @ 18a34b8
// Do not edit here. Copy the file again to update.
export const OPT_OUT_KEY = 'trazire-analytics-opt-out';

export function shouldTrack({ hostname, doNotTrack, optedOut } = {}) {
  if (!hostname) return false;
  if (optedOut) return false;
  if (doNotTrack === '1' || doNotTrack === true) return false;
  return true;
}

export function routeFromHash(hash) {
  let path = String(hash ?? '')
    .replace(/^#/, '')
    .split('?')[0]
    .split('#')[0];
  path = path.replace(/\/+$/, '');
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

export function referrerHost(referrer) {
  if (typeof referrer !== 'string' || !referrer) return null;
  try {
    const { hostname } = new URL(referrer);
    return hostname || null;
  } catch {
    return null;
  }
}

export function buildPayload(site, route, { referrer, automated } = {}) {
  const payload = { site, route, automated: automated === true };
  const ref = referrerHost(referrer);
  if (ref) payload.ref = ref;
  return payload;
}

export function readOptOut(search, storage) {
  const params = new URLSearchParams(search || '');
  const param = params.get('no-track');
  if (param === '0') {
    try {
      storage.removeItem(OPT_OUT_KEY);
    } catch {
      // Storage may be blocked; opting back in still applies for this pageview.
    }
    return false;
  }
  if (param === '1') {
    try {
      storage.setItem(OPT_OUT_KEY, '1');
    } catch {
      // Storage may be blocked; the opt-out still applies for this pageview.
    }
    return true;
  }
  try {
    return storage.getItem(OPT_OUT_KEY) === '1';
  } catch {
    return false;
  }
}

export function initAnalytics({ site, endpoint, allowedHost } = {}) {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (window.location.hostname !== allowedHost) return false;

  let storage = null;
  try {
    storage = window.localStorage;
  } catch {
    storage = null;
  }
  const optedOut = readOptOut(window.location.search, storage);

  if (!shouldTrack({ hostname: window.location.hostname, doNotTrack: navigator.doNotTrack, optedOut })) {
    return false;
  }

  const send = () => {
    try {
      const payload = buildPayload(site, routeFromHash(window.location.hash), {
        referrer: document.referrer,
        automated: navigator.webdriver === true,
      });
      navigator.sendBeacon(endpoint, JSON.stringify(payload));
    } catch {
      // Analytics must never affect the site.
    }
  };

  send();
  try {
    window.addEventListener('hashchange', send);
  } catch {
    // Analytics must never affect the site.
  }
  return true;
}
