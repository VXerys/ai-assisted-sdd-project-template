# Product Glossary

Use this file when domain language can be misunderstood or used inconsistently.

| Term | Canonical meaning | Do not confuse with | Notes |
|---|---|---|---|
| todo | one chore with a title, an `open` or `closed` status, `created_at`, and `closed_at` | task (`T-XXX` in specs) | `task` is reserved for the SDD vocabulary |
| open todo | a todo whose `status` is `open`; the only kind in the default list | pending, active | the API never uses `pending` |
| closed todo | a todo whose `status` is `closed`; `closed_at` is set once | deleted | nothing is deleted in M1 |
| default list | `GET /todos` without a `status` query, open todos newest first | `?status=all` | the CLI shows the default list |
| cursor | opaque string returned as `next_cursor`, passed back as `?cursor=` for the next page | offset | pages are keyset-based, see F-001 design |
| client | the CLI or the web client; both call the API with the team key | user | there are no user accounts in M1 |

Rules:

1. Requirements, UI copy, API contracts, and database terminology use these terms.
2. Do not add synonyms unless users genuinely use them.
3. When a term changes meaning, record the change and update affected specifications.
