@security @owasp-a03 @cwe-89 @injection
Feature: SQL injection in /api/login must not bypass authentication
  Verifies that classic SQL injection payloads in the username field of the
  /api/login endpoint are rejected with HTTP 401. Maps to manual test case
  SEC-TC-0002 (VULN-002: SQL injection in login (authentication bypass)).

  Background:
    Given the application is running at the target host
    And the login endpoint is reachable

  @critical @SEC-TC-0002
  Scenario Outline: SQL injection payload in username must be rejected
    When the client posts a login attempt with username "<username>" and password "anything"
    Then the response status code must be 401
    And the response body must not contain an authentication token

    Examples:
      | username            |
      | ' OR '1'='1         |
      | admin'--            |
      | ' OR 1=1 --         |
      | " OR ""="           |
