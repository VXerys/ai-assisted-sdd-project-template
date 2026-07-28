# API Contracts

Use this index for contracts shared across applications or services. Prefer machine-readable OpenAPI, GraphQL schema, or generated client contracts when available.

## Contract Ownership

| Contract | Provider | Consumers | Canonical definition | Versioning |
|---|---|---|---|---|
| {{CONTRACT}} | {{PROVIDER}} | {{CONSUMERS}} | `{{PATH}}` | {{STRATEGY}} |

## Global Rules

1. Inputs are validated at the trusted boundary.
2. Errors use stable machine-readable codes.
3. Public behavior changes require compatibility analysis.
4. Authentication and authorization failures must remain distinguishable.
5. Pagination, idempotency, retry, and timeout behavior must be explicit.
6. Sensitive internal errors must not be returned to clients.

## Error Envelope

```json
{
  "error": {
    "code": "stable_error_code",
    "message": "Safe user-facing message",
    "requestId": "optional-correlation-id"
  }
}
```

## Compatibility Policy

- Backward-compatible additions: {{POLICY}}
- Breaking changes: {{POLICY}}
- Deprecation window: {{WINDOW}}
- Client version support: {{POLICY}}

Feature-specific request and response details belong in each feature `design.md` or the machine-readable contract.
