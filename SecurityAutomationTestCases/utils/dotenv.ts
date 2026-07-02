/**
 * Reads the .env file into process.env exactly once at process start so
 * downstream `process.env.TARGET_HOST` lookups work without requiring
 * the developer to `export $(cat .env)` manually.
 *
 * Uses a small inline parser to avoid adding `dotenv` as a dependency.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

let loaded = false;

export function loadEnvOnce(envPath?: string): void {
  if (loaded) {
    return;
  }
  const path = envPath ?? resolve(process.cwd(), '.env');
  if (!existsSync(path)) {
    loaded = true;
    return;
  }
  const content = readFileSync(path, 'utf-8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const eq = line.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
  loaded = true;
}
