/**
 * Tiny post-run report helper.
 *
 * Reads reports/cucumber.json and prints a one-line summary per scenario
 * to stdout. Intentionally dependency-free — a richer HTML report is
 * already produced by cucumber-js's `html:reports/cucumber-report.html`
 * format option. This script is just a quick "what passed / what failed"
 * glance for terminal CI logs.
 *
 * Usage: `npm run report`
 */
const fs = require('fs');
const path = require('path');

const REPORT_PATH = path.join(__dirname, '..', 'reports', 'cucumber.json');

function loadReport() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error(`No report found at ${REPORT_PATH}. Run "npm run bdd" first.`);
    process.exitCode = 1;
    return null;
  }
  const raw = fs.readFileSync(REPORT_PATH, 'utf-8');
  return JSON.parse(raw);
}

function summarize(report) {
  if (!Array.isArray(report)) {
    console.error('Cucumber JSON report is not an array. Was the run interrupted?');
    process.exitCode = 1;
    return;
  }
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  for (const feature of report) {
    for (const scenario of feature.elements ?? []) {
      for (const step of scenario.steps ?? []) {
        if (step.result?.status === 'passed') passed += 1;
        else if (step.result?.status === 'failed') failed += 1;
        else if (step.result?.status === 'skipped') skipped += 1;
      }
      const tags = (scenario.tags ?? []).map(t => t.name).join(' ');
      const verdict =
        scenario.steps?.some(s => s.result?.status === 'failed') ? 'FAIL'
        : scenario.steps?.some(s => s.result?.status === 'skipped') ? 'SKIP'
        : 'PASS';
      console.log(`${verdict.padEnd(4)}  ${tags}  ${feature.name} :: ${scenario.name}`);
    }
  }
  console.log('');
  console.log(`Steps: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  if (failed > 0) process.exitCode = 1;
}

const report = loadReport();
if (report) summarize(report);
