/**
 * AuthApi — login endpoint and Authorization-header helpers.
 *
 * Maps to the application's /api/login and the HTTP Basic auth used by
 * the rest of the API. Used by SEC-TC-0002 (SQLi login bypass) and
 * SEC-TC-0012 (mass-assignment role=ADMIN → subsequent login).
 */
import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApi } from './BaseApi';
import { buildBasicAuthHeader, config } from '../utils/env';

export class AuthApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request);
  }

  /**
   * POST /api/login with the given credentials. The endpoint is publicly
   * accessible (no Authorization header required). Returns the raw
   * APIResponse so callers can assert status / body.
   */
  async login(username: string, password: string): Promise<APIResponse> {
    return this.sendAndLog('POST', '/api/login', {
      data: { username, password }
    });
  }

  /**
   * Build the Basic auth header for a seeded test user.
   * The "credentials" string is "user:password" sourced from .env.
   */
  static basicHeaderFor(credentials: string): string {
    return buildBasicAuthHeader(credentials);
  }

  /** Convenience: get the alice Basic header from config. */
  static aliceHeader(): string {
    return AuthApi.basicHeaderFor(config.basicAlice);
  }
}
