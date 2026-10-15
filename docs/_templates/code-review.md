---
id: CR-XXX
title: ""
type: code-review
status: draft        # draft | review | approved | implementing | verification | implemented | superseded
tier: lite           # lite | full
owner: ""
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
last_verified: YYYY-MM-DD
supersedes: null
---

# Code review: {{CHANGE_TITLE}}

- Change: PR, commit, or diff reference
- Requirements and task: FR, AC, and T ids
- Reviewed scope: files or components actually read

Review against requirements before style. Every finding cites evidence in the diff.

## Summary

Intended change in one sentence. Assessment: approve | approve_with_notes | changes_required | blocked_by_missing_context, with one reason.

## Correctness

In-scope acceptance criteria implemented; happy path correct; important edge and failure behavior correct; state transitions and concurrency safe where relevant; behavior outside scope preserved.

## Architecture

Responsibilities in the intended layer; dependency direction preserved; no accidental shared abstraction; provider coupling respects boundaries; contract changes explicit and approved; no silent deviation from `system-architecture.md`.

## Security and data

Authorization enforced at the trusted boundary; user input validated; secrets and sensitive data not exposed or logged; data isolation preserved; migrations and destructive operations safe and approved.

## Testing and verification

Tests target the changed behavior and include negative cases; existing tests not weakened; integration or contract evidence where mocks are insufficient; EV blocks in `verification.md` reference real commands and output.

## Maintainability

Names and responsibilities understandable; control flow no more complex than needed; abstractions justified by current needs; comments explain why, not what; new dependency justified.

## Scope discipline

No unrelated refactor, speculative feature, unexpected dependency, or generated-file edit. Diff is coherent and reviewable.

## Findings

Severity: blocker (security, data loss, critical correctness, build, compatibility), major (significant correctness, architecture, testing, or regression problem), minor (limited impact), nit (optional).

### CR-001 — {{TITLE}}

- Severity: blocker | major | minor | nit
- Location: path:line or component
- Problem: evidence-based description
- Impact: why it matters
- Recommendation: smallest effective correction, or a question

If none: no blocking or material findings within the reviewed scope.

## Unverified

Anything that limits confidence: pending CI, missing migration, unclear requirement, unread area.

## Recommendation

approve | request_changes | block. Required before merge: finding ids or none. Optional follow-up: finding ids or none.
