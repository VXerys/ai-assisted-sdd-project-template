# Security Baseline

## Security Ownership

- Security approver: {{OWNER}}
- Incident contact: {{CONTACT}}
- Data classification owner: {{OWNER}}

## Trust Boundaries

```text
Untrusted Client
  -> Authenticated API Boundary
  -> Application Service
  -> Protected Data Store
```

## Authentication

- Provider: {{PROVIDER}}
- Session strategy: {{STRATEGY}}
- Token storage: {{LOCATION}}
- Session expiration: {{RULE}}

## Authorization

1. UI visibility is not authorization.
2. Access is enforced at the API, database policy, or trusted service boundary.
3. Default access is deny unless explicitly granted.
4. Ownership and role checks must be testable.

## Data Classification

| Classification | Examples | Storage | Logging |
|---|---|---|---|
| Public | {{EXAMPLE}} | Standard | Allowed |
| Internal | {{EXAMPLE}} | Access controlled | Limited |
| Sensitive | {{EXAMPLE}} | Encrypted and restricted | Prohibited or redacted |

## Secret Management

- Secrets must use environment or platform secret stores.
- `.env` files with real credentials must not be committed.
- Service-role or administrative credentials must never reach untrusted clients.
- Secret rotation and ownership must be documented.

## Input and Abuse Protection

- Validation: {{STRATEGY}}
- Rate limiting: {{STRATEGY}}
- File upload restrictions: {{STRATEGY}}
- Injection prevention: {{STRATEGY}}

## Security Verification

- Authorization tests: `{{COMMAND}}`
- Dependency audit: `{{COMMAND}}`
- Secret scan: `{{COMMAND}}`
- Manual threat review trigger: authentication, payment, personal data, file upload, external callbacks, or administrative actions.
