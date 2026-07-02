# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

**OWASP Vulnerability Learning Lab** — a Spring Boot 3 / Java 17 application where every endpoint deliberately exhibits a known security flaw. Each flaw is annotated with a `// VULNERABILITY:` (or `// REMEDIATION:`) comment naming the OWASP Top 10 (2021) category it belongs to.

> **Educational use only.** Do not deploy to any public server, container registry, or shared network. Run it locally in a sandbox (VM, behind a firewall, or on a loopback-only network).

The codebase has been processed through a security pipeline: a vulnerability scan produced `SECURITY_ASSESSMENT_REPORT.md`, then a remediation pass applied fixes and produced `SECURE_REMEDIATION_REPORT.md`. Both reports live in `.claude/reports/` and are tracked in git.

## Common commands

All commands run from the project root (where `pom.xml` lives).

```bash
# Build
mvn clean package              # produces target/vulnerable-spring-app-1.0.0.jar
mvn compile                    # quick compile-only check

# Run the app (port 8080)
mvn spring-boot:run
java -jar target/vulnerable-spring-app-1.0.0.jar

# Optional: enable H2 web console (off by default — see application.properties)
H2_CONSOLE_ENABLED=true mvn spring-boot:run
# Then browse http://localhost:8080/h2-console (JDBC URL jdbc:h2:mem:owaspdb, user sa, empty password)
```

There is no `mvn test` step — `src/test/` does not exist. `spring-boot-starter-test` is on the classpath but no test classes are committed.

## BDD security regression suites (Node / Playwright / Cucumber)

This repo ships **two parallel** Playwright + TypeScript + Cucumber BDD suites that both hit the running Spring Boot app over HTTP. They coexist — pick the one that fits the task.

### 1. Root-level suite — `README_BDD.md`

Top-level `package.json`, `cucumber.js`, `playwright.config.ts`, `tsconfig.json`. Features live in `features/`, steps in `step-definitions/`, POMs in `pages/`. Tags scenarios `@mstc-001` / `@mstc-002` / `@mstc-003` and `@security` (filter excludes `@skip`).

```bash
npm install                            # once
npx playwright install                 # once, for browser binaries
npm test                               # full default run (chromium, all @security scenarios)
npm run test:mstc-001                  # single feature — unsafe deserialisation
npm run test:mstc-002                  # single feature — SQL injection
npm run test:mstc-003                  # single feature — broken access control
npm run tsc:check                      # TypeScript typecheck (no emit)
npx cucumber-js --config cucumber.js --tags "@mstc-001"   # ad-hoc filter
```

Source-of-truth JSON: `tests/test-data/manual-security-testcases.json` (a copy of `Testcases/security_test_cases.json`; the runner consumes `expected_result` / `validation_criteria.remediation_verified`, never `actual_result`).

### 2. `SecurityAutomationTestCases/` subproject — its own `README.md`

Separate `node_modules/`, own `package.json` and `cucumber.js`. Targets the **top 3 manual test cases** (SEC-TC-0002 SQLi, SEC-TC-0005 anonymous `/api/**`, SEC-TC-0016 security headers) via `features/*.feature` → `step-definitions/*.steps.ts` → typed wrappers in `api/`. Configured by `.env` (`TARGET_HOST`, `BASIC_ALICE`/`BASIC_BOB`/`BASIC_ADMIN`).

```bash
cd SecurityAutomationTestCases
npm install
npm run bdd                 # full default run; emits reports/cucumber-report.html + cucumber.json
npm run bdd:auth            # SEC-TC-0005 only
npm run bdd:sql             # SEC-TC-0002 only
npm run bdd:headers         # SEC-TC-0016 only
npm run bdd:chromium        # per-browser profile
npm run tsc:check
npm run report              # one-line pass/fail summary from latest cucumber.json
npm run clean               # wipe reports/, screenshots/, videos/
```

Both suites assume the Spring Boot app is reachable at `http://localhost:8080` (overridable via `BASE_URL` / `SPRING_BOOT_URL` for the root suite, `TARGET_HOST` for the subproject). The Spring Boot app must be started in a separate terminal first — neither suite launches the server.

## Maven vs. Node tooling

The project root holds both `pom.xml` (Java) and `package.json` (BDD). All Maven commands run from the root; Node tooling runs from the root for suite #1 and from `SecurityAutomationTestCases/` for suite #2. Do not run `mvn` from inside `SecurityAutomationTestCases/`.

## Code architecture

Standard Spring Boot layered structure under `src/main/java/com/owasp/lab/`:

```
VulnerableSpringAppApplication.java   # @SpringBootApplication entrypoint
config/                               # Spring beans (security, data, secrets)
controller/                           # @RestController + @Controller endpoints
service/                              # @Service business logic (contains the actual vulns)
repository/                           # Spring Data JPA repositories
model/                                # @Entity classes (User, Product, Comment)
web/                                  # WebMvcConfig (CORS / interceptors)
```

### Request flow at runtime

- **Browser UI**: `controller/UIController.java` + `controller/VulnerabilityPageController.java` render Thymeleaf templates under `src/main/resources/templates/` (`login.html`, `dashboard.html`, `users.html`, `products.html`, `comments.html`, `transfer.html`, `vulnerabilities.html`).
- **JSON API**: `controller/AuthController.java`, `UserController.java`, `ProductController.java`, `CommentController.java`, `InsecureDeserializationController.java`, `VulnerabilityController.java` expose the `/api/*` surface used for exploitation demos (curl, scripts).
- **Security**: `config/SecurityConfig.java` is the single source of truth for auth/CORS/headers. `config/JpaUserDetailsService.java` bridges Spring Security to the `User` entity. `config/PasswordConfig.java` provides the BCrypt encoder. `config/SecretConfig.java` exposes `@Value`-injected secrets (`app.secret.api.key`, `app.secret.db.password`, `app.secret.jwt.signing.key`) sourced from environment variables — defaults are intentionally empty.
- **Persistence**: H2 in-memory DB (JPA, `ddl-auto=create`). `config/DataSeeder.java` populates three users (alice/bob/admin), three products, and a sample comment on every startup. User passwords are BCrypt-hashed before insertion.

### Two things to know that span many files

1. **The vulnerabilities are the features.** A naïve read of `UserService.findByUsernameUnsafe`, `AuthController.login`, `InsecureDeserializationController`, etc., will still look broken on purpose — those methods are intentionally marked with `// VULNERABILITY:` comments. The `// REMEDIATION:` blocks above them describe how the secure version should behave. When editing, preserve the annotated intent unless the task is explicitly a fix.
2. **The remediation status is uneven across the OWASP Top 10 categories.** The `.claude/reports/SECURE_REMEDIATION_REPORT.md` is the authoritative index of what has already been patched and what is still intentionally vulnerable. Before changing a vulnerable endpoint, read that file — if a fix is already documented there, follow the documented approach rather than inventing a new one.

## Claude Code pipeline (in-repo)

The `.claude/` directory holds project-local Claude configuration:

- `.claude/agents/vulnerability-scanner.md` — read-only static scanner that produced `SECURITY_ASSESSMENT_REPORT.md`.
- `.claude/agents/remediation-agent.md` — applies fixes directly to source files and produces `SECURE_REMEDIATION_REPORT.md`. Verifies the build still compiles before declaring done.
- `.claude/agents/git-agent.md` — chains remediation commits onto a `feature/safe-backup_<N>_<TIMESTAMP>` branch (one increment per push, off the previous chain branch — never off `feature/safe-backup`, never onto `main`).
- `.claude/commands/run-pipeline.md` — the `/run-pipeline` slash command that wires the scanner → remediation agent together.
- `.claude/reports/SECURITY_ASSESSMENT_REPORT.md` and `.claude/reports/SECURE_REMEDIATION_REPORT.md` — the latest pipeline output, tracked in git. Everything else under `.claude/reports/` is gitignored.

When the user invokes `/run-pipeline`, follow `.claude/commands/run-pipeline.md`. Do not duplicate the pipeline logic from memory — re-read the command file each time so any in-repo tweaks to the agents are picked up.

## Configuration surface (`src/main/resources/application.properties`)

- H2 datasource: `jdbc:h2:mem:owaspdb`, user `sa`, empty password.
- H2 console: disabled by default; enable with `H2_CONSOLE_ENABLED=true`.
- Secrets: `APP_SECRET_API_KEY`, `APP_SECRET_DB_PASSWORD`, `APP_SECRET_JWT_SIGNING_KEY` env vars (no committed defaults).
- Jackson: `fail-on-unknown-properties=true` (blocks mass-assignment).
- Spring error attributes: stacktrace and message suppressed.
- Thymeleaf template cache: off (so demo edits hot-reload without restart).