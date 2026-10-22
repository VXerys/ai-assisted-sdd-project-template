---
id: SECURITY
title: Security policy
status: active
owner: VXerys
last_updated: 2026-10-22
---

# Security policy

This policy covers the template repository and its tooling (`scripts/`, `.claude/`, the CI workflows). A project initialized from the template writes its own policy.

## Supported versions

| Version | Supported |
|---|---|
| 2.x | yes |
| 1.x | no; migrate with `docs/MIGRATION-v1-to-v2.md` |

## Reporting a vulnerability

Report privately through GitHub: the repository's Security tab, "Report a vulnerability". Do not open a public issue for a vulnerability.

Include the affected file or command, the version (`package.json` or the commit), steps to reproduce, and the impact. Never include real secrets; describe them instead.

You get an acknowledgement within 7 days. A confirmed issue is fixed in a patch release, credited unless you ask otherwise, and listed in `CHANGELOG.md` once the fix ships.

## In scope

- The guard letting an agent write a generated, frozen, or protected path, or read a secret, through a tool call or shell command it is documented to catch (`docs/automation/README.md`).
- The validator accepting evidence or a status transition its rules reject.
- `init`, `sdd adopt`, or `sdd upgrade` deleting or overwriting a file they promise to keep.
- A workflow with a token permission or an unpinned action beyond what it needs.

The shell guard is documented as a best-effort tripwire: a deliberately obfuscated command getting past it is a known limit, not a vulnerability, unless it bypasses `npm run sdd -- guard --check` in CI as well.
