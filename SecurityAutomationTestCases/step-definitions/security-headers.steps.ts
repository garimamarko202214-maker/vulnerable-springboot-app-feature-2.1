/**
 * Security-headers step definitions — SEC-TC-0016.
 *
 * Verifies that all responses include the baseline security headers:
 * Content-Security-Policy, X-Frame-Options, Referrer-Policy, and
 * Strict-Transport-Security.
 *
 * The shared "Given the application is running at the target host",
 * "When the client sends a GET request to {string} without an
 * Authorization header", and "Then the response status code must be {int}"
 * steps live in _common.steps.ts.
 */
import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Then('the response must include the security header {string}', async function (this: CustomWorld, headerName: string): Promise<void> {
  const headers = this.state.lastResponse?.headers() ?? {};
  const lowerName = headerName.toLowerCase();
  const value = headers[lowerName];
  expect(value, `Expected response to include security header "${headerName}" but it was missing. Headers seen: ${JSON.stringify(headers)}`).toBeTruthy();
  expect(String(value).length, `Security header "${headerName}" was present but empty`).toBeGreaterThan(0);
});
