# Test Strategy

## Purpose

Define the minimum confidence model for this project. Customize this file after selecting the stack and risk profile.

## Test Layers

| Layer | Primary purpose | Typical targets |
|---|---|---|
| Unit | Business rules and deterministic transformations | use cases, validators, parsers, state reducers |
| Integration | Boundaries and real contracts | repositories, database policies, API clients, migrations |
| UI / Component | Rendering and interaction states | loading, empty, success, validation, error |
| End-to-End | Critical user journeys | authentication, purchase, submission, destructive flows |
| Manual | UX and environment-specific behavior | accessibility, device behavior, production smoke checks |

## Risk-Based Rules

- High-impact business rules require direct automated tests.
- Every bug fix requires a regression test when technically practical.
- Authorization must be tested at the enforcement boundary, not only in UI.
- Database migrations require forward validation and rollback or an explicit residual-risk decision.
- Snapshot tests must not replace behavioral assertions.
- End-to-end tests should cover critical journeys, not every UI permutation.

## Test Evidence

Every active feature records evidence in its `verification.md`:

- command or test path;
- tested commit;
- environment;
- result;
- unresolved limitation.

## Required Project Commands

- Unit: `{{UNIT_TEST_COMMAND}}`
- Integration: `{{INTEGRATION_TEST_COMMAND}}`
- UI: `{{UI_TEST_COMMAND}}`
- End-to-end: `{{E2E_COMMAND}}`
- Coverage: `{{COVERAGE_COMMAND}}`

## Coverage Policy

Use coverage to find untested risk, not as the only quality target.

Project threshold: `{{THRESHOLD_OR_RISK_BASED}}`.
