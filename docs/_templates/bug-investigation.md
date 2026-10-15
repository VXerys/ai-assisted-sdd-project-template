---
id: BUG-XXX
title: ""
type: bug-investigation
status: draft        # draft | review | approved | implementing | verification | implemented | superseded
tier: lite           # lite | full
owner: ""
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
last_verified: YYYY-MM-DD
supersedes: null
---

# Bug: {{BUG_ID}} {{TITLE}}

Evidence before fixes. Separate what was observed from what is suspected. No secrets in this file.

## Symptom

Observed behavior only, without a suspected cause.

- Expected:
- Actual:
- Severity: blocker | major | minor
- Impact: affected users or systems, frequency, data or security impact.
- Environment: commit, runtime and framework version, OS or device, data store version, relevant flags, external service state.

## Reproduction

Preconditions, numbered steps, reproducibility (for example 5/5, intermittent, production-only), smallest known reproduction.

## Evidence

- Logs or stack trace, request and response summary, data or state summary, screenshot or recording, recent change or diff. Paths and safe excerpts only.
- Localization: where expected and actual behavior first diverge (component, boundary, state transition), and the evidence that places it there.

## Hypotheses

### H-001 — {{HYPOTHESIS}}

- Prediction if true:
- Evidence for:
- Evidence against:
- Status: open | supported | rejected

## Experiments

### EXP-001 — {{EXPERIMENT}}

- Tests: H-001
- Procedure:
- Expected if the hypothesis holds:
- Result and conclusion:

## Root cause

The mechanism, not just the line. Contributing factors. Why existing tests or monitoring did not catch it.

## Fix

- Plan: smallest root-cause correction, affected components, contracts that must not change, security or data impact.
- Spec or architecture change required: no | yes, with the ADR or spec update it needs.
- Implementation reference: commit or PR.
- Temporary mitigation used: none | description. Temporary diagnostics are removed unless kept as observability.

## Regression verification

Record as EV blocks in the feature's `verification.md`, or here when no feature owns the area:

- Original reproduction no longer fails: EV-XXX
- Regression test added: EV-XXX
- Static, test, and build checks: EV-XXX
- Neighboring flow checked: EV-XXX

## Residual risk and follow-up

Residual risk. Durable follow-up only when it improves future engineering: doc or architecture update, monitoring, test infrastructure. Postmortem required: no | yes (security, data loss, outage, repeated systemic failure).
