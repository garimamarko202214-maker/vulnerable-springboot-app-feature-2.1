/**
 * cucumber.js — Cucumber-JS configuration for the Playwright + TypeScript BDD
 * security regression suite.
 *
 * Each profile selects the matching Playwright project so the same scenarios
 * run across the three configured browsers (chromium / firefox / webkit).
 *
 *   npx cucumber-js --profile chromium
 *   npx cucumber-js --profile firefox
 *   npx cucumber-js --profile webkit   (default if --profile is omitted)
 */
module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: [
      'hooks/hooks.ts',
      'step-definitions/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:cucumber-report.html',
      'json:cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    parallel: 1,
    tags: '@security and not @skip'
  },
  chromium: {
    paths: ['features/**/*.feature'],
    require: [
      'hooks/hooks.ts',
      'step-definitions/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: ['progress'],
    tags: '@security and @critical and not @skip'
  },
  firefox: {
    paths: ['features/**/*.feature'],
    require: [
      'hooks/hooks.ts',
      'step-definitions/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: ['progress'],
    tags: '@security and @critical and not @skip'
  },
  webkit: {
    paths: ['features/**/*.feature'],
    require: [
      'hooks/hooks.ts',
      'step-definitions/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: ['progress'],
    tags: '@security and @critical and not @skip'
  }
};
