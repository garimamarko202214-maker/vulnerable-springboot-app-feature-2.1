/**
 * Authentication step definitions — SEC-TC-0005.
 *
 * Verifies that anonymous requests to /api/** endpoints are rejected
 * with HTTP 401 and a WWW-Authenticate: Basic challenge header.
 *
 * This file is completely self-contained: it owns its Given/When/Then
 * step implementations and its own response-capture helper. No shared
 * step-definition file is required.
 */
import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { APIResponse, request as playwrightRequest } from '@playwright/test';
import { CustomWorld } from '../support/world';

Before(async function before(this: CustomWorld): Promise<void> {
  const ctx = await playwrightRequest.newContext({  //fresh context
    baseURL: process.env.TARGET_HOST ?? 'http://localhost:8080',
    extraHTTPHeaders: { Accept: 'application/json,text/plain,*/*' }//deafult hearder
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
    await state.request.dispose();//Dispose API Context
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

Given('the application is running at the target host', async function (this: CustomWorld): Promise<void> {
  // A simple liveness probe keeps scenarios from silently passing
  // against a server that's down.
  const response = await this.state.request.get('/api/login', {
    headers: { 'Content-Type': 'application/json' }
  });
  if (response.status() === 0) {
    throw new Error(`Application does not appear to be running at ${process.env.TARGET_HOST ?? 'http://localhost:8080'}`);
  }
});

When('the client sends a GET request to {string} without an Authorization header', async function (this: CustomWorld, path: string): Promise<void> {
  const response = await this.state.request.fetch(`${process.env.TARGET_HOST ?? 'http://localhost:8080'}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json,text/plain,*/*' }
  });
  await capture(this, response);
});

Then('the response status code must be {int}', async function (this: CustomWorld, expected: number): Promise<void> {
  const actual = this.state.lastResponse?.status();
  expect(actual, `Expected HTTP ${expected} but got ${actual} for ${this.state.lastResponse?.url() ?? 'unknown URL'}`).toBe(expected);
});

Then('the response must include a WWW-Authenticate challenge header', async function (this: CustomWorld): Promise<void> {
  const headers = this.state.lastResponse?.headers() ?? {};
  const challenge = headers['www-authenticate'];
  expect(challenge, 'WWW-Authenticate header missing on 401 response').toBeTruthy();
  expect(String(challenge).toLowerCase()).toContain('basic'); //header must
});
