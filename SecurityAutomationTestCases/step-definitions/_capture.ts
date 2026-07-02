/**
 * Small helper to capture an API response into the world state.
 * Kept in its own file so step-definition files don't duplicate the
 * parse-json-or-fall-back-to-string logic.
 */
import { CustomWorld } from '../support/world';
import { APIResponse } from '@playwright/test';

export async function capture(world: CustomWorld, response: APIResponse): Promise<void> {
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
