/**
 * Custom Cucumber World.
 *
 * Holds per-scenario state — the API helpers, the most recent API response,
 * and any captured auth header. The World is constructed once per scenario
 * by the hooks layer.
 */
import { IWorld, IWorldOptions } from '@cucumber/cucumber';
import { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiRegistry } from '../api/ApiRegistry';

export interface ScenarioState {
  /** Per-scenario request context, lifecycle managed by hooks. */
  request: APIRequestContext;
  /** Typed API helpers bound to the request context. */
  apis: ApiRegistry;
  /** Most recent response, captured by the most recent send-* step. */
  lastResponse: APIResponse | null;
  /** Most recent response body as a parsed JSON object (when JSON). */
  lastResponseBody: unknown;
  /** Most recent response body as a string. */
  lastResponseText: string;
  /** Active Authorization header (set by authentication steps). */
  authHeader: string;
}

export class CustomWorld extends ApiRegistry {
  /** Scenario state bag. Kept non-enumerable to avoid Cucumber serialization. */
  declare public state: ScenarioState;

  constructor(options: IWorldOptions, request: APIRequestContext) {
    super(request);
    this.state = {
      request,
      apis: this,
      lastResponse: null,
      lastResponseBody: null,
      lastResponseText: '',
      authHeader: ''
    };
    // Prevent the world from being serialized into JSON reports.
    Object.defineProperty(this, 'toJSON', {
      value: () => undefined,
      writable: true,
      configurable: true
    });
  }

  setResponse(response: APIResponse, body: unknown, text: string): void {
    this.state.lastResponse = response;
    this.state.lastResponseBody = body;
    this.state.lastResponseText = text;
  }
}
