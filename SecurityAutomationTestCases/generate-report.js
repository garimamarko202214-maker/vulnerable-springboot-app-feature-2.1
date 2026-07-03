const reporter = require('cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

const jsonFile = path.join(__dirname,  'reports', 'cucumber.json');
const outputFile = path.join(__dirname,  'reports', 'cucumber-report.html');

if (!fs.existsSync(jsonFile)) {
  console.error(`❌ JSON report not found: ${jsonFile}`);
  process.exit(1);
}

reporter.generate({
  theme: 'bootstrap',
  jsonFile: jsonFile,
  output: outputFile,
  reportSuiteAsScenarios: true,
  launchReport: false
});

console.log('✅ HTML report generated at reports/cucumber-report.html');