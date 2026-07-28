# Local Development Runbook

## Prerequisites

- Runtime: {{RUNTIME_AND_VERSION}}
- Package manager: {{PACKAGE_MANAGER_AND_VERSION}}
- Required services: {{SERVICES}}

## First-Time Setup

```bash
{{CLONE_COMMAND}}
{{INSTALL_COMMAND}}
{{ENV_SETUP_COMMAND}}
```

## Environment Variables

Use `.env.example` as the key inventory. Never place real secrets in documentation.

| Variable | Required | Purpose | Safe local source |
|---|---|---|---|
| `{{VARIABLE}}` | Yes | {{PURPOSE}} | {{SOURCE}} |

## Run

```bash
{{DEV_COMMAND}}
```

## Verify Setup

```bash
{{HEALTH_OR_TEST_COMMAND}}
```

Expected result:

{{EXPECTED_RESULT}}

## Common Problems

| Symptom | Likely cause | Resolution |
|---|---|---|
| {{SYMPTOM}} | {{CAUSE}} | {{RESOLUTION}} |
