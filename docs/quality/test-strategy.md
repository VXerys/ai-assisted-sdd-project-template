# Test Strategy

## Purpose

Define the minimum confidence model for this project. Adjust after selecting the stack and risk profile.

## Test layers

| Layer | Primary purpose | Typical targets |
|---|---|---|
| Unit | Business rules and deterministic transformations | use cases, validators, parsers, state reducers |
| Integration | Boundaries and real contracts | repositories, data access rules, API clients, migrations |
| UI / Component | Rendering and interaction states | loading, empty, success, validation, error |
| End-to-End | Critical user journeys | authentication, purchase, submission, destructive flows |
| Manual | UX and environment-specific behavior | accessibility, device behavior, production smoke checks |

## Risk-based rules

- High-impact business rules require direct automated tests.
- Every bug fix requires a regression test when technically practical.
- Authorization must be tested at the enforcement boundary, not only in UI.
- Database migrations require forward validation and rollback or an explicit residual-risk decision.
- Snapshot tests must not replace behavioral assertions.
- End-to-end tests should cover critical journeys, not every UI permutation.

## Test evidence

Every active feature records evidence in its `verification.md` as EV blocks: command, output excerpt, date, commit, and the AC ids covered.

## Commands

The test command is the Commands table in `docs/steering/tech.md`. Add rows there for integration, UI, end-to-end, and coverage commands when the project gains them; this file does not keep a second copy.

## Coverage policy

Use coverage to find untested risk, not as the only quality target. Record the project threshold, or "risk-based" with the rule, here once decided.
