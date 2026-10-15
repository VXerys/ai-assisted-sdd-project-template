---
inclusion: fileMatch
fileMatchPattern: ["src/db/**", "migrations/**"]
---

# Database

Rules for the PostgreSQL layer; loaded only when a database file is edited.

## Migrations

- Append-only; never edit an applied migration.
