import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    include: ['tests/unit/**/*.test.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text', 'json-summary'],
      include: ['src/**/*.js'],
      exclude: ['node_modules/', 'dist/', 'src/main.js'],
      thresholds: {
        perFile: true,
        statements: 90,
        branches: 80,
        functions: 90,
        lines: 90,
      },
    },
  },
});
