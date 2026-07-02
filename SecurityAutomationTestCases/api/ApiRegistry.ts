/**
 * API registry — single point that exposes the per-test API helpers.
 *
 * Step definitions receive a CustomWorld (see support/world.ts). The world
 * owns a Playwright APIRequestContext, and `world.apis` wraps it in the
 * typed helper classes used by the feature files. This keeps step files
 * dependency-free of `playwright/test` and makes the helpers trivially
 * mockable in unit tests.
 */
import { APIRequestContext } from '@playwright/test';
import { AuthApi } from './AuthApi';

export class ApiRegistry {
  readonly auth: AuthApi;

  constructor(request: APIRequestContext) {
    this.auth = new AuthApi(request);
  }
}
