import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    include: ['tests/unit/**/*.test.{js,ts}'],
  },
});
