/**
 * Base class for API helpers.
 *
 * Holds the shared APIRequestContext, base URL, and a few common helpers
 * (logging, header building, status assertion). Subclasses add
 * domain-specific methods like login, register, getUserById, etc.
 */
import { APIRequestContext, APIResponse } from '@playwright/test';
import { config } from '../utils/env';
import { logger } from '../utils/logger';

export abstract class BaseApi {
  protected readonly request: APIRequestContext;
  protected readonly baseUrl: string;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.baseUrl = config.baseUrl;
  }

  protected url(path: string): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${normalized}`;
  }

  protected async sendAndLog(method: string, path: string, options: { headers?: Record<string, string>; data?: unknown }): Promise<APIResponse> {
    const url = this.url(path);
    logger.debug('API request', { method, path, headers: options.headers ?? {} });
    const response = await this.request.fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
      data: options.data
    });
    logger.debug('API response', { method, path, status: response.status() });
    return response;
  }
}
