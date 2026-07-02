/**
 * Injection step definitions — SEC-TC-0002.
 *
 * Verifies that classic SQL injection payloads in the username field of
 * the /api/login endpoint are rejected with HTTP 401 and do not return
 * an authentication token.
 *
 * This file is completely self-contained for the feature-specific steps
 * (Given "the login endpoint is reachable", When "the client posts a
 * login attempt...", Then "the response body must not contain an
 * authentication token"). The shared background Given and the status-code
 * Then are owned by authentication.steps.ts to keep the step phrases
 * unambiguous across the suite. Before/After hooks and the capture
 * helper are local to this file so it does not depend on
 * hooks/hooks.ts or _capture.ts.
 */
import { Before, After, Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { APIResponse, request as playwrightRequest } from '@playwright/test';
import { CustomWorld } from '../support/world';

Before(async function before(this: CustomWorld): Promise<void> {
  const ctx = await playwrightRequest.newContext({
    baseURL: process.env.TARGET_HOST ?? 'http://localhost:8080',
    extraHTTPHeaders: { Accept: 'application/json,text/plain,*/*' }
  });
  this.state.request = ctx;
  this.state.apis = this;
  this.state.lastResponse = null;
  this.state.lastResponseBody = null;
  this.state.lastResponseText = '';
  this.state.authHeader = '';
});

After(async function after(this: CustomWorld): Promise<void> {
  const state = this.state;
  if (state.request) {
    await state.request.dispose();
  }
});

/**
 * Capture an API response into the world state, parsing JSON when possible
 * and falling back to the raw text otherwise.
 */
async function capture(world: CustomWorld, response: APIResponse): Promise<void> {
  const text = await response.text();
  let body: unknown = null;
  if (text && text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  world.setResponse(response, body, text);
}

Given('the login endpoint is reachable', async function (this: CustomWorld): Promise<void> {
  // Reserved for future health checks (e.g., /actuator/health if added).
  // Liveness is already proven by the previous step.
  void this;
});

When('the client posts a login attempt with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string): Promise<void> {
  const baseUrl = process.env.TARGET_HOST ?? 'http://localhost:8080';
  const response = await this.state.request.fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json,text/plain,*/*' },
    data: { username, password }
  });
  await capture(this, response);
});

Then('the response body must not contain an authentication token', async function (this: CustomWorld): Promise<void> {
  const text = this.state.lastResponseText.toLowerCase();
  // Common shapes: { token: "..." }, { jwt: "..." }, { sessionId: "..." }
  expect(text).not.toMatch(/"token"\s*:/);
  expect(text).not.toMatch(/"jwt"\s*:/);
  expect(text).not.toMatch(/"sessionid"\s*:/);
});
