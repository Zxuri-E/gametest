/**
 * Playwright automated testing harness configuration foundation (Future implementation)
 */

export const testConfig = {
  testDir: '../scenarios',
  timeout: 30000,
  retries: 1,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry',
  },
};

export default testConfig;

