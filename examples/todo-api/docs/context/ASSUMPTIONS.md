---
id: ASSUMPTIONS
title: Assumptions Log
status: active
owner: ari
last_updated: 2026-10-14
---

# Assumptions

Agents and contributors log unknowns here instead of guessing. An `open` assumption blocks the tasks it affects, and a feature cannot become `implemented` while it has an `open` assumption. The owner resolves entries to `confirmed` or `rejected` and records the resolution; rejected assumptions stay in the log.

## Block format

Every entry uses exactly this shape; the key-value lines are parsed.

```markdown
### A-001 — title
- status: open          # open | confirmed | rejected
- feature: F-001
- raised: YYYY-MM-DD
- resolution:

What was assumed, why it could not be verified, and what changes if it is wrong.
```

## Entries

### A-001 — Default page size for GET /todos is 50
- status: confirmed
- feature: F-001
- raised: 2026-10-02
- resolution: 50, confirmed by ari on 2026-10-03; the current list has 31 open todos and the CLI prints one page.

Assumed while writing T-002 because the PRD named no page size. If it had been wrong, only the constant in `listTodos` and AC-004 would change.

### A-002 — A cursor stays valid across status filters
- status: open
- feature: F-002
- raised: 2026-10-14
- resolution:

T-002 assumes the F-001 cursor (`created_at:id`) can be passed to `GET /todos?status=closed` unchanged, because keyset paging only needs the sort key. Not verified with ari: if the product wants a cursor to be bound to the filter it was issued for, the cursor format gains a status component, which changes the F-001 response contract. T-002 proceeds with the shared cursor; T-003 cannot mark the feature `implemented` while this is open.
