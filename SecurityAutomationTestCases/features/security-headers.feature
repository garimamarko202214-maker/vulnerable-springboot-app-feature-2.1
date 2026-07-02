@security @owasp-a05 @cwe-693 @security-misconfiguration
Feature: Responses must include baseline security headers
  Verifies that all responses include baseline security headers:
  Content-Security-Policy, X-Frame-Options, Referrer-Policy, and
  Strict-Transport-Security. Maps to manual test case SEC-TC-0016
  (VULN-016: Missing security response headers).

  Background:
    Given the application is running at the target host

  @medium @SEC-TC-0016
  Scenario Outline: Baseline security headers must be present on a public response
    When the client sends a GET request to "<path>" without an Authorization header
    Then the response status code must be 200
    And the response must include the security header "<header>"

    Examples:
      | path   | header                    |
      | /      | Content-Security-Policy   |
      | /      | X-Frame-Options           |
      | /      | Referrer-Policy           |
      | /      | Strict-Transport-Security |
