/**
 * Centralized environment / config loader.
 * Resolves the target base URL and HTTP Basic credentials from process.env
 * (populated from .env by the test runner or by the developer's shell).
 *
 * Keeping this in one place means step definitions, API helpers, and the
 * Cucumber World never read process.env directly.
 */

import { loadEnvOnce } from './dotenv';

loadEnvOnce();

export interface AppConfig {
  readonly baseUrl: string;
  readonly basicAlice: string;
  readonly basicBob: string;
  readonly basicAdmin: string;
}

const DEFAULT_BASE_URL = 'http://localhost:8080';
const PLACEHOLDER = 'CHANGEME';

function envOrDefault(key: string, fallback: string): string {
  const value = process.env[key];
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return value;
}

function envOrThrow(key: string, fallback: string): string {
  const value = envOrDefault(key, fallback);
  if (value === PLACEHOLDER) {
    // Not fatal — features that need a real credential will fail loudly with
    // a clear message. We log a warning so it's obvious during local dev.
    // eslint-disable-next-line no-console
    console.warn(`[env] ${key} is not set; using placeholder "${PLACEHOLDER}"`);
  }
  return value;
}

export const config: AppConfig = {
  baseUrl: envOrDefault('TARGET_HOST', DEFAULT_BASE_URL),
  basicAlice: envOrThrow('BASIC_ALICE', `${PLACEHOLDER}`),
  basicBob: envOrThrow('BASIC_BOB', `${PLACEHOLDER}`),
  basicAdmin: envOrThrow('BASIC_ADMIN', `${PLACEHOLDER}`)
};

/**
 * Build an HTTP Basic Authorization header value for a "user:password" pair.
 */
export function buildBasicAuthHeader(credentials: string): string {
  const encoded = Buffer.from(credentials, 'utf-8').toString('base64');
  return `Basic ${encoded}`;
}
