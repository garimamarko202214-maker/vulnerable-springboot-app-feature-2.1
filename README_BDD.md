# OWASP Lab BDD Security Regression Suite

Playwright + TypeScript + Cucumber (cucumber-js) BDD automation for the
**Top 3 Manual Security Test Cases** against the vulnerable Spring Boot lab
(`com.owasp.lab`). The scenarios are sourced from
`manual-security-testcases.json` and assert the **POST-REMEDIATION**
contract — they are intended to fail loudly if any of VULN-001 / VULN-002
/ VULN-003 / VULN-005 / VULN-006 / VULN-012 regress.

## Layout

```
features/                           # Gherkin .feature files
  mstc-001-unsafe-deserialization.feature
  mstc-002-sql-injection.feature
  mstc-003-broken-access-control.feature
step-definitions/                   # TS bindings for each feature
  mstc-001.steps.ts
  mstc-002.steps.ts
  mstc-003.steps.ts
pages/                              # Playwright POMs (one per endpoint area)
  DeserializePage.ts                # POST /api/deserialize
  LoginPage.ts                      # POST /api/login, /api/register
  SearchPage.ts                     # GET  /api/search
  AccountPage.ts                    # GET  /api/users, /api/profile/{id}, POST /api/transfer
hooks/hooks.ts                      # Cucumber lifecycle hooks
utils/
  config.ts                         # base URL + seeded creds (env-driven)
  request-context.ts                # shared Playwright APIRequestContext wrapper
  test-data-loader.ts               # loads the canonical test-cases JSON
tests/test-data/
  manual-security-testcases.json    # copy of the source-of-truth JSON
cucumber.js                         # Cucumber runner config (chromium / firefox / webkit profiles)
playwright.config.ts                # Playwright config (project matrix + defaults)
tsconfig.json                       # TypeScript settings for the BDD suite
package.json                        # npm scripts (`npm test`)
```

## Prereqs

- Node 18+
- The Spring Boot lab built and running:
  `cd vulnerable-springboot-app-feature-2.1 && mvn spring-boot:run`
- (Optional) Override the target URL: `export BASE_URL=http://localhost:8080`

## Install

```bash
npm install
npx playwright install
```

## Run

```bash
# Run all @security scenarios in the default profile (chromium):
npm test

# Run only MSTC-001 / 002 / 003 individually:
npm run test:mstc-001
npm run test:mstc-002
npm run test:mstc-003

# Pass through cucumber-js directly with a custom filter:
npx cucumber-js --config cucumber.js --tags "@mstc-001"
```

The suite emits `cucumber-report.html` and `cucumber-report.json` in the
project root by default.

## Mapping back to the JSON

| Scenario ID | JSON source                                              | File(s)                                   |
| ----------- | -------------------------------------------------------- | ----------------------------------------- |
| MSTC-001    | `test_cases[0]` (rank=1)                                 | `features/mstc-001-...feature`, `step-definitions/mstc-001.steps.ts`, `pages/DeserializePage.ts` |
| MSTC-002    | `test_cases[1]` (rank=2, merges VULN-002 / VULN-003)     | `features/mstc-002-...feature`, `step-definitions/mstc-002.steps.ts`, `pages/LoginPage.ts`, `pages/SearchPage.ts` |
| MSTC-003    | `test_cases[2]` (rank=3, merges VULN-005 / 006 / 012)    | `features/mstc-003-...feature`, `step-definitions/mstc-003.steps.ts`, `pages/AccountPage.ts`, `pages/LoginPage.ts` |

The JSON's `actual_result` field is intentionally left untouched (still
empty) — that field is a manual-tester artefact and automation only
consumes `expected_result` / `validation_criteria.remediation_verified`.
