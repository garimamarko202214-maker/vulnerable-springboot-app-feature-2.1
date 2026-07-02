@security @owasp-a01 @cwe-284 @authentication
Feature: Authentication boundary on /api/** endpoints
  Verifies that anonymous requests to protected API endpoints are rejected
  with HTTP 401. Maps to manual test case SEC-TC-0005 (VULN-005: Authentication
  disabled on API endpoints).

  Background:
    Given the application is running at the target host

  @critical @SEC-TC-0005
  Scenario: Anonymous request to /api/users must be rejected with 401
    When the client sends a GET request to "/api/users" without an Authorization header
    Then the response status code must be 401
    And the response must include a WWW-Authenticate challenge header

  @critical @SEC-TC-0005
  Scenario: Anonymous request to /api/profile/{id} must be rejected with 401
    When the client sends a GET request to "/api/profile/1" without an Authorization header
    Then the response status code must be 401

  @critical @SEC-TC-0005
  Scenario: Anonymous request to /api/comment/greet must be rejected with 401
    When the client sends a GET request to "/api/comment/greet?name=alice" without an Authorization header
    Then the response status code must be 401
