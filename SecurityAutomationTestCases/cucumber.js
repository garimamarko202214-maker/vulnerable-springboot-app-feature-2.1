module.exports = {
  default: {
    require: [
      'step-definitions/**/*.ts',
      'support/**/*.ts',
      'hooks/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber.json'
    ],
    formatOptions: { snippetInterface: 'async-await' },
    parallel: 1,
    retry: 1
  },

  chromium: {
    paths: ['features/**/*.feature'],
    require: [
      'step-definitions/**/*.ts',
      'support/**/*.ts',
      'hooks/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:reports/cucumber-chromium.html',
      'json:reports/cucumber-chromium.json'
    ],
    parallel: 1,
    retry: 1
  },

  firefox: {
    paths: ['features/**/*.feature'],
    require: [
      'step-definitions/**/*.ts',
      'support/**/*.ts',
      'hooks/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:reports/cucumber-firefox.html',
      'json:reports/cucumber-firefox.json'
    ],
    parallel: 1,
    retry: 1
  },

  webkit: {
    paths: ['features/**/*.feature'],
    require: [
      'step-definitions/**/*.ts',
      'support/**/*.ts',
      'hooks/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:reports/cucumber-webkit.html',
      'json:reports/cucumber-webkit.json'
    ],
    parallel: 1,
    retry: 1
  }
};
