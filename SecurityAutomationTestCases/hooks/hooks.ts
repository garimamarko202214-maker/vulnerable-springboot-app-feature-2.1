/**
 * Cucumber lifecycle hooks.
 *
 * - BeforeAll: load .env once so the rest of the suite sees TARGET_HOST and
 *   the seeded Basic credentials.
 * - Before: build a fresh APIRequestContext per scenario so scenarios are
 *   isolated. Replace the default World with our CustomWorld and attach it
 *   to the scenario's pickle context.
 * - After: dispose the per-scenario request context and log the captured
 *   response status.
 * - AfterAll: tear down the Playwright module-level resources.
 */
import { Before, BeforeAll, After, AfterAll, setWorldConstructor } from '@cucumber/cucumber';
import { request as playwrightRequest } from '@playwright/test';
import { loadEnvOnce } from '../utils/dotenv';
import { logger } from '../utils/logger';
import { CustomWorld } from '../support/world';

setWorldConstructor(CustomWorld);

BeforeAll(async function beforeAll(): Promise<void> {
  loadEnvOnce();
  logger.info('Test suite starting');
});

Before(async function before(this: CustomWorld): Promise<void> {
  const ctx = await playwrightRequest.newContext({
    baseURL: process.env.TARGET_HOST ?? 'http://localhost:8080',
    extraHTTPHeaders: { Accept: 'application/json,text/plain,*/*' }
  });
  // Replace the per-instance world state with one bound to this context.
  this.state.request = ctx;
  this.state.apis = this; // ApiRegistry instance itself
  this.state.lastResponse = null;
  this.state.lastResponseBody = null;
  this.state.lastResponseText = '';
  this.state.authHeader = '';
});

After(async function after(this: CustomWorld): Promise<void> {
  const state = this.state;
  if (state.lastResponse) {
    logger.debug('Final response of scenario', {
      status: state.lastResponse.status(),
      url: state.lastResponse.url()
    });
  }
  if (state.request) {
    await state.request.dispose();
  }
});

AfterAll(async function afterAll(): Promise<void> {
  logger.info('Test suite finished');
});
