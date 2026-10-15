---
id: ASSUMPTIONS
title: Assumptions Log
status: active
owner: maintainer
last_updated: 2026-10-14
---

# Assumptions

## Block format

```markdown
### A-001 — Example inside a fence, never parsed
- status: open
```

## Entries

### A-001 — Title length limit
- status: confirmed
- feature: F-001
- raised: 2026-10-02
- resolution: 200 characters, confirmed by the owner on 2026-10-03.

Needed for AC-002 validation.

### A-002 — Default page size for GET /todos
- status: open
- feature: F-001
- raised: 2026-10-14
- resolution:

The PRD does not state a page size; T-002 assumes 50 until confirmed.
