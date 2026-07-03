const reporter = require('cucumber-html-reporter');
const fs = require('fs');

const reportPath = 'reports/cucumber-report.json';
const outputPath = 'reports/cucumber-report.html';

if (!fs.existsSync(reportPath)) {
  console.error(`Report not found: ${reportPath}`);
  process.exit(1);
}

reporter.generate({
  theme: 'bootstrap',
  jsonFile: reportPath,
  output: outputPath,
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false
});

console.log('HTML report generated successfully.');