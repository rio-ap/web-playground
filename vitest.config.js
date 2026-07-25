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
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
});
