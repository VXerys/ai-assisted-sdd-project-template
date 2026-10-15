# Security Baseline

## Security ownership

- Security approver: {{OWNER}}
- Incident contact: the security approver until a separate contact is named.
- Data classification owner: {{OWNER}}

## Trust boundaries

```text
Untrusted client
  -> authenticated entry boundary
  -> application service
  -> protected data store
```

## Authentication

Provider, session or token strategy, where the client stores the token, expiration and revocation rule. Copy the rows into `docs/steering/tech.md` once decided; `none` is a valid value for an application without accounts.

## Authorization

1. UI visibility is not authorization.
2. Access is enforced at the API, database policy, or trusted service boundary.
3. Default access is deny unless explicitly granted.
4. Ownership and role checks must be testable.

## Data classification

| Classification | Examples | Storage | Logging |
|---|---|---|---|
| Public | | standard | allowed |
| Internal | | access controlled | limited |
| Sensitive | | encrypted and restricted | prohibited or redacted |

## Secret management

- Secrets must use environment or platform secret stores.
- `.env` files with real credentials must not be committed.
- Service-role or administrative credentials must never reach untrusted clients.
- Secret rotation and ownership must be documented.

## Input and abuse protection

Validation strategy, rate limiting, file upload restrictions, injection prevention. One line each; `none` with a reason when the application has no such surface.

## Security verification

Authorization tests, dependency audit, and secret scan run through the commands in `docs/steering/tech.md`; record them as evidence in the feature's `verification.md`. Manual threat review is triggered by authentication, payment, personal data, file upload, external callbacks, or administrative actions.
