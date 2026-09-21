import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/a11y',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME
    ? [
        ['html', { open: 'never', outputFolder: 'playwright-report-a11y' }],
        ['list'],
        ['json'],
      ]
    : [
        ['html', { open: 'never', outputFolder: 'playwright-report-a11y' }],
        ['list'],
      ],
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
});
