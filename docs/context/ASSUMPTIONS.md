---
id: ASSUMPTIONS
title: Assumptions Log
status: active
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
---

# Assumptions

Agents and contributors log unknowns here instead of guessing. An `open` assumption blocks the tasks it affects, and a feature cannot become `implemented` while it has an `open` assumption. The owner resolves entries to `confirmed` or `rejected` and records the resolution; rejected assumptions stay in the log. A project-wide assumption (license, platform, team rule) uses `feature: none`; while `open` it gates no task, so the validator warns until it names a feature or is resolved.

## Block format

Every entry uses exactly this shape; the key-value lines are parsed.

```markdown
### A-001 — title
- status: open          # open | confirmed | rejected
- feature: F-001        # F-XXX, or none for a project-wide assumption
- raised: YYYY-MM-DD
- resolution:

What was assumed, why it could not be verified, and what changes if it is wrong.
```

## Entries

None yet.
