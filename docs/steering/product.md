---
inclusion: always          # always | fileMatch | manual
---

# Product

Short, always-loaded product context. The full product requirements live in `docs/product/prd.md`; this file must agree with it and stays under 120 lines.

## Vision

{{PROJECT_DESCRIPTION}}

One paragraph on why it exists now and what "working" looks like for the user. Project content (specs, product docs, UI copy) is written in {{CONTENT_LANGUAGE}}; the framework text stays English.

## Personas

- Example: Reader, a commuter who logs a daily reading session from a phone in under ten seconds.

## Core use cases

- UC-001: actor, trigger, outcome.

## Non-goals

- Nearby capabilities this product deliberately does not provide in the current milestone.

## Success signals

| Signal | What it tells us | Source |
|---|---|---|
| Example: daily check-ins per active user | the habit loop works | analytics event `check_in` |

## Constraints that shape product decisions

- Example: offline use on the primary device is required.
- Example: data of minors is never collected.
