import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'smoke.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME
    ? [
        ['html', { open: 'never', outputFolder: 'playwright-report-smoke' }],
        ['list'],
        ['json'],
      ]
    : [
        ['html', { open: 'never', outputFolder: 'playwright-report-smoke' }],
        ['list'],
      ],
  use: {
    baseURL: 'http://localhost:4173/',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
  },
});
