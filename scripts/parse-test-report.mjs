#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function parseVitestReport(report, cwd = process.cwd()) {
  const failedTests = [];
  for (const file of report?.testResults ?? []) {
    const fileName = typeof file?.name === 'string' ? file.name.replace(`${cwd}/`, '') : '';
    for (const test of file?.assertionResults ?? []) {
      if (test?.status !== 'failed') continue;
      const name = test.fullName || test.title || 'unknown test';
      failedTests.push(fileName ? `${fileName} › ${name}` : name);
    }
  }
  const passed = report?.numPassedTests ?? 0;
  const failed = report?.numFailedTests ?? failedTests.length;
  const skipped = (report?.numPendingTests ?? 0) + (report?.numTodoTests ?? 0);
  const total = report?.numTotalTests ?? passed + failed + skipped;
  return { total, passed, failed, skipped, failedTests };
}

function collectPlaywrightSpecs(suite, path, out) {
  const nextPath = [...path, suite?.title].filter(Boolean);
  for (const spec of suite?.specs ?? []) {
    if (spec?.ok === false) {
      const name = [...nextPath, spec.title].filter(Boolean).join(' › ');
      out.push(name || 'unknown test');
    }
  }
  for (const child of suite?.suites ?? []) collectPlaywrightSpecs(child, nextPath, out);
}

export function parsePlaywrightReport(report) {
  const failedTests = [];
  for (const suite of report?.suites ?? []) collectPlaywrightSpecs(suite, [], failedTests);
  const stats = report?.stats ?? {};
  const passed = (stats.expected ?? 0) + (stats.flaky ?? 0);
  const failed = stats.unexpected ?? failedTests.length;
  const skipped = stats.skipped ?? 0;
  const total = (stats.expected ?? 0) + (stats.unexpected ?? 0) + skipped;
  return { total, passed, failed, skipped, failedTests };
}

export function parseTestReport(report, tool) {
  if (tool === 'vitest') return parseVitestReport(report);
  if (tool === 'playwright') return parsePlaywrightReport(report);
  throw new Error(`unknown tool: ${tool}`);
}

export function normalizeReport({ id, tool, result, report }) {
  if (tool !== 'vitest' && tool !== 'playwright') {
    throw new Error(`unknown tool: ${tool}`);
  }
  if (!report) {
    return {
      id,
      result,
      reportMissing: true,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      failedTests: [],
    };
  }
  return { id, result, ...parseTestReport(report, tool) };
}

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--tool') opts.tool = argv[++i];
    else if (arg === '--id') opts.id = argv[++i];
    else if (arg === '--report') opts.report = argv[++i];
    else if (arg === '--result') opts.result = argv[++i];
    else if (arg === '--output') opts.output = argv[++i];
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  let report = null;
  if (opts.report) {
    try {
      report = JSON.parse(readFileSync(opts.report, 'utf8'));
    } catch {
      report = null;
    }
  }
  let normalized;
  try {
    normalized = normalizeReport({
      id: opts.id ?? 'unknown',
      tool: opts.tool,
      result: opts.result,
      report,
    });
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(2);
  }
  const json = `${JSON.stringify(normalized, null, 2)}\n`;
  if (opts.output) {
    mkdirSync(dirname(opts.output), { recursive: true });
    writeFileSync(opts.output, json);
  } else {
    process.stdout.write(json);
  }
}

if (process.argv[1]?.endsWith('parse-test-report.mjs')) main();
