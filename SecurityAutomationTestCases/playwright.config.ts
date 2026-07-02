import { defineConfig } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './',
  fullyParallel: false,
  workers: 1,
  retries: isCI ? 2 : 1,
  forbidOnly: isCI,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    baseURL: process.env.TARGET_HOST ?? 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000
  },
  timeout: 60_000,
  expect: {
    timeout: 10_000
  }
});
