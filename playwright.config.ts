/**
 * playwright.config.ts
 *
 * This project uses Playwright as the HTTP transport inside Cucumber step
 * definitions (via `request.newContext()`), not as the test runner itself.
 * The runner is cucumber-js (see `npm test` in package.json).
 *
 * The configuration below is still useful because:
 *   1. It documents the three browser projects we target (so contributors can
 *      run `npx playwright test --list` to confirm spec parsing).
 *   2. It provides a `--project` selector for `npx playwright test` invocations
 *      (reserved for a future UI-mode suite).
 *   3. It supplies the canonical baseURL fallback if a step definition needs
 *      to launch a real browser page (we only do API calls today).
 */
import { defineConfig, devices } from '@playwright/test';

const BASE_URL =
  process.env.BASE_URL ||
  process.env.SPRING_BOOT_URL ||
  'http://localhost:8080';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      Accept: 'application/json'
    }
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});
