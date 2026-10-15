# API Contracts

Index of contracts shared across applications or services. Prefer machine-readable OpenAPI, GraphQL schema, or generated client contracts when available. Leave the tables empty when the project has no contract boundary.

## Contract ownership

| Contract | Provider | Consumers | Canonical definition | Versioning |
|---|---|---|---|---|
| | | | path of the schema or generated client | semver, date, or URL version |

## Global rules

1. Inputs are validated at the trusted boundary.
2. Errors use stable machine-readable codes.
3. Public behavior changes require compatibility analysis.
4. Authentication and authorization failures must remain distinguishable.
5. Pagination, idempotency, retry, and timeout behavior must be explicit.
6. Sensitive internal errors must not be returned to clients.

## Error envelope

```json
{
  "error": {
    "code": "stable_error_code",
    "message": "Safe user-facing message",
    "requestId": "optional-correlation-id"
  }
}
```

## Compatibility policy

Backward-compatible additions, breaking changes, deprecation window, and client version support. One line each.

Feature-specific request and response details belong in each feature `design.md` or the machine-readable contract.
