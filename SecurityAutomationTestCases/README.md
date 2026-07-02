# SecurityAutomationTestCases

A focused, **Playwright + TypeScript + Cucumber BDD** automation framework
that converts the highest-value manual security test cases from
`../Testcases/security_test_cases.json` into executable scenarios.

It targets the **OWASP Vulnerability Learning Lab** Spring Boot 3 application
in `../vulnerable-springboot-app-feature-2.1/` and exercises a small set of
critical API-level security regressions.

## Selected test cases

| Manual ID    | Feature                | OWASP    | CWE     | Severity |
|--------------|------------------------|----------|---------|----------|
| SEC-TC-0005  | authentication.feature | A01:2021 | CWE-284 | Critical |
| SEC-TC-0002  | injection.feature      | A03:2021 | CWE-89  | Critical |
| SEC-TC-0016  | security-headers.feature | A05:2021 | CWE-693 | Medium  |

These three were chosen because they are:

* Pure API scenarios — fast, deterministic, no browser required.
* Cover a spread of OWASP categories (broken access control, injection,
  security misconfiguration).

## Folder structure

```
SecurityAutomationTestCases/
├── features/                  # Gherkin feature files (one per scenario group)
│   ├── authentication.feature # SEC-TC-0005 — anonymous /api/** → 401
│   ├── injection.feature      # SEC-TC-0002 — SQLi login bypass
│   └── security-headers.feature # SEC-TC-0016 — baseline security headers
├── step-definitions/          # Cucumber steps in TypeScript
│   ├── authentication.steps.ts
│   ├── injection.steps.ts
│   ├── security-headers.steps.ts
│   └── _capture.ts            # Shared response-capture helper
├── api/                       # Typed API helpers wrapping APIRequestContext
│   ├── ApiRegistry.ts         # Single point exposing auth
│   ├── BaseApi.ts             # Base class with shared request/response plumbing
│   └── AuthApi.ts             # /api/login, Basic header builders
├── support/                   # Cucumber world, custom World class
│   └── world.ts
├── hooks/                     # BeforeAll / Before / After / AfterAll
│   └── hooks.ts
├── utils/                     # Pure helpers — env, logger
│   ├── env.ts                 # Config loader (process.env + .env)
│   ├── dotenv.ts              # Minimal .env parser (no `dotenv` dep)
│   ├── logger.ts              # Tiny structured logger
│   └── generate-report.js     # Post-run summary script (`npm run report`)
├── reports/                   # Cucumber HTML + JSON output
├── playwright-report/         # Playwright HTML report (if any UI tests run)
├── screenshots/               # Captured automatically on failure
├── videos/                    # Captured automatically on failure
├── package.json               # Dependencies and npm scripts
├── playwright.config.ts       # Playwright configuration (for hybrid/UI tests)
├── tsconfig.json              # Strict TypeScript config
├── cucumber.js                # Cucumber-js configuration + browser profiles
├── .env                       # Local environment (TARGET_HOST, Basic creds)
└── README.md                  # This file
```

## Prerequisites

* Node.js 18+ and npm 9+ (tested on Node 22, npm 11).
* The OWASP Lab Spring Boot application running locally (see project README).
  Default: `http://localhost:8080`.

## Setup

```bash
# 1. Install Node dependencies
npm install

# 2. Install Playwright's browser binaries (only needed if you add UI tests)
npx playwright install
```

The first `npm install` will create `node_modules/`. The `.env` file is
committed with safe defaults for local development.

## Configuration

Environment variables (read from `.env` at the project root):

| Variable       | Default                       | Purpose                                  |
|----------------|-------------------------------|------------------------------------------|
| `TARGET_HOST`  | `http://localhost:8080`       | Base URL of the running Spring Boot app  |
| `BASIC_ALICE`  | `alice:alice123`              | HTTP Basic credentials for seeded alice  |
| `BASIC_BOB`    | `bob:bob123`                  | HTTP Basic credentials for seeded bob    |
| `BASIC_ADMIN`  | `admin:admin123`              | HTTP Basic credentials for seeded admin  |

Override any of these by exporting them in your shell before running, or by
editing `.env`.

## Running the suite

```bash
# Run the entire BDD suite (default profile)
npm run bdd

# Run a single feature file
npm run bdd:auth
npm run bdd:sql
npm run bdd:headers

# Run a specific Cucumber profile (separate reports per browser)
npm run bdd:chromium

# Verify the TypeScript compiles (no emit)
npm run tsc:check

# Print a one-line pass/fail summary from the latest cucumber.json
npm run report

# Wipe all generated reports / screenshots / videos
npm run clean
```

After `npm run bdd`:

* `reports/cucumber-report.html` — interactive HTML report
* `reports/cucumber.json` — machine-readable summary
* `playwright-report/index.html` — Playwright HTML report (if any UI tests ran)

Open the HTML report directly in your browser, or serve it with any static
file server.

## How the scenarios work

### SEC-TC-0005 — anonymous `/api/**` is rejected

`features/authentication.feature` issues three anonymous GETs
(`/api/users`, `/api/profile/1`, `/api/comment/greet?name=alice`)
and asserts each returns **HTTP 401** with a `WWW-Authenticate: Basic` header.

### SEC-TC-0002 — SQL injection in `/api/login`

`features/injection.feature` posts four classic SQLi payloads in the
`username` field and asserts each returns **HTTP 401** with no token in the
body. The injected username is treated as a literal string by the
parameterized query in the remediated app.

### SEC-TC-0016 — baseline security headers

`features/security-headers.feature` issues a GET to `/` and asserts that
each of `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`,
and `Strict-Transport-Security` is present and non-empty.

## Adding new scenarios

1. Add a new `.feature` file under `features/` (or extend an existing one).
2. Implement any new steps in `step-definitions/<domain>.steps.ts`.
3. If you need a new endpoint, add a typed method in `api/<Domain>Api.ts`
   and register it in `api/ApiRegistry.ts`.
4. Tag scenarios with `@owasp-aXX`, `@cwe-XXX`, and the severity
   (`@critical`, `@high`, `@medium`, `@low`) for easy filtering.

## Coding conventions

* **Strict TypeScript** — no `any`; prefer `unknown` and type guards.
* **No logic in step files** — every step delegates to a typed API helper.
* **One World per scenario** — fresh `APIRequestContext` in the
  `Before` hook, disposed in `After`. No shared state between scenarios.
* **DRY locators** — no duplicate step implementations.

## Troubleshooting

* **`Application does not appear to be running`** — the `Given` step
  couldn't reach `${TARGET_HOST}`. Start the Spring Boot app and retry.
* **HTML report missing** — run `npm run bdd` first; the
  `npm run report` step depends on `reports/cucumber.json`.

## License

This project is an internal security regression suite for the OWASP
Vulnerability Learning Lab. Use only against systems you are authorized to
test.
