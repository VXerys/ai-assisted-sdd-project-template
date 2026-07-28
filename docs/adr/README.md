# Architecture Decision Records

ADRs preserve the context and consequences of decisions that are cross-cutting, expensive to reverse, or likely to be questioned later.

## Naming

```text
NNNN-short-kebab-case-title.md
```

Example:

```text
0001-use-supabase-authentication.md
```

## Lifecycle

```text
proposed -> accepted -> deprecated | superseded | rejected
```

Accepted ADRs are immutable except for status and supersession metadata. When a decision changes, create a new ADR and mark the previous record as superseded.

## Create an ADR when a decision

- changes a system boundary;
- introduces a major framework, provider, database, or dependency;
- changes authentication, authorization, persistence, or API strategy;
- creates migration or compatibility obligations;
- affects multiple features;
- has meaningful alternatives and consequences.

## Do not create an ADR for

- minor naming choices;
- routine implementation details already governed by repository conventions;
- easily reversible local refactors;
- temporary session decisions.

## Index

| ADR | Title | Status | Superseded by |
|---|---|---|---|
| — | No decisions recorded | — | — |

Copy `ADR.template.md`, assign the next number, and update this index.
