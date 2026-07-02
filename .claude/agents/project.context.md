# Project Context

Project: vulnerable-springboot-app-feature-2.1

## Objective
Generate security automation using AI agents.

## Agent 1
Name: Security Test Case Generator

Status:
- Completed
- Reads SECURE_REMEDIATION_REPORT.md
- Generates manual security test cases
- Output:
  Testcases/security_test_cases.json

## Agent 2
Name: Security Automation Test Generator

Status:
- Created
- Reads Testcases/security_test_cases.json
- Converts manual security test cases into Playwright automation.

## Framework

Technology:
- Playwright
- TypeScript
- Cucumber BDD

Output Folder:
SecurityAutomationTestCases

The framework should contain:
- features
- step-definitions
- api
- pages
- utils
- hooks
- test-data
- reports
- playwright-report

Current Goal:
Generate only 2-3 simple, executable security automation test cases that are easy to demonstrate.

Next Task:
Generate the complete Playwright framework and automate the selected test cases.