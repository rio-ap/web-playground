#!/usr/bin/env node
import { readFileSync } from 'node:fs';

export const ALL_TAGS = ['@home', '@shop', '@cart', '@checkout'];

const MODULE_RULES = [
  {
    tag: '@home',
    patterns: [/^src\/views\/home\.js$/, /^tests\/e2e\/home\.spec\.ts$/],
  },
  {
    tag: '@shop',
    patterns: [
      /^src\/products\.js$/,
      /^src\/views\/shop\.js$/,
      /^tests\/e2e\/product-grid\.spec\.ts$/,
    ],
  },
  {
    tag: '@cart',
    patterns: [
      /^src\/cart\.js$/,
      /^tests\/e2e\/cart-flow\.spec\.ts$/,
      /^tests\/e2e\/add-to-cart-feedback\.spec\.ts$/,
      /^tests\/component\/cart-item\.spec\.ts$/,
    ],
  },
  {
    tag: '@checkout',
    patterns: [
      /^src\/checkout\.js$/,
      /^tests\/e2e\/checkout-flow\.spec\.ts$/,
      /^tests\/component\/checkout-form\.spec\.ts$/,
    ],
  },
];

const SHARED_PATTERNS = [
  /^src\/main\.js$/,
  /^src\/router\.js$/,
  /^src\/effects\.js$/,
  /^src\/views\/product-card\.js$/,
  /^src\/style\.css$/,
  /^index\.html$/,
  /^public\//,
  /^vite\.config\.js$/,
  /^vitest\.config\.js$/,
  /^playwright\.config\.ts$/,
  /^playwright\.smoke\.config\.ts$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^tests\/e2e\/pages\//,
  /^tests\/e2e\/helpers\//,
  /^tests\/a11y\//,
  /^tests\/e2e\/visual\//,
  /^scripts\//,
  /^\.github\//,
];

export function tagsForPaths(paths) {
  const found = new Set();
  for (const raw of paths) {
    const path = raw.trim();
    if (!path) continue;
    if (SHARED_PATTERNS.some((pattern) => pattern.test(path))) return [...ALL_TAGS];
    for (const rule of MODULE_RULES) {
      if (rule.patterns.some((pattern) => pattern.test(path))) found.add(rule.tag);
    }
  }
  return ALL_TAGS.filter((tag) => found.has(tag));
}

function main() {
  const args = process.argv.slice(2);
  const input = args.length ? args.join('\n') : readFileSync(0, 'utf8');
  const tags = tagsForPaths(input.split('\n'));
  if (tags.length) process.stdout.write(`${tags.join('|')}\n`);
}

if (process.argv[1]?.endsWith('detect-e2e-tags.mjs')) main();
