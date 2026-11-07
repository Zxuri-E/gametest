import { defineConfig, devices } from '@playwright/test';

/**
 * Novus Automated Playwright Testing Suite Configuration
 */
export default defineConfig({
  testDir: '../scenarios',
  timeout: 30000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: '../reports/html-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 720 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'api',
      testMatch: /controlled-repair\.spec\.ts/,
    },
    {
      name: 'chromium',
      testIgnore: /controlled-repair\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: /controlled-repair\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          executablePath: process.env.FIREFOX_BIN || '/usr/bin/firefox',
        },
      },
    },
  ],
});

