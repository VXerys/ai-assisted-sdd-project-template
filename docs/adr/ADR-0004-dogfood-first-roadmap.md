---
id: ADR-0004
title: Dogfood-first roadmap — release order, evidence form, task claims, lite cap
type: adr
status: approved
tier: full
owner: VXerys
created: 2026-10-23
last_updated: 2026-10-23
last_verified: 2026-10-23
supersedes: null
---

# ADR-0004: Dogfood-first roadmap

Amends the execution order of ADR-0002 and settles the trusted-evidence and multi-agent decisions it left open. Evidence: `docs/research/2026-10-23-upgrade-recommendations.md` in the template repository. Every other ADR-0002 and ADR-0003 decision stands.

## Context

- Ten projects on the owner's machine were initialized from v2.0.0, before `init` recorded `template` answers or a manifest. Run with the current validator, every one fails: 611 errors in total, 50% "EV `command` is not in the `tech.md` Commands table", 37% "EV `commit` is not in `git log`". Real evidence is composite (several commands, browser checks at named viewports, FVM paths, a commit in another repository, "not committed yet"), and no agent ever used the `manual:` prefix.
- 18 documents in `lite` projects are 87 to 294 lines long; the 80-line cap produces warnings nobody acts on.
- Two projects already run parallel agents in `.claude/worktrees/` with their own `.claude/agents/` and `.claude/skills/`, before any claim mechanism exists.
- v2.1 is complete in `[Unreleased]` but untagged, and `sdd upgrade` rebuilds its base from a tag.
- Claude Code command hooks accept `onFailure: "block"` from v2.1.295; v2.1.309 fixed PowerShell hooks failing open; subagents with `memory: project` write `.claude/agent-memory/`.

## Decision drivers

1. The derived projects are the test; a public feature that advertises a broken upgrade path costs more than it earns.
2. Evidence must stay trustworthy without rejecting the evidence people actually produce.
3. Parallel work on one repository must not depend on `gh` or network access.

## Decision

**Order.** Dogfood first. Release 2.1.0 now with only two gate changes: `onFailure: "block"` on the PreToolUse guard, and `.claude/worktrees/` plus `.claude/agent-memory/` ignored by git with the memory rule below. Then 2.1.x: `sdd upgrade` infers the init answers from `sdd.config.json`, git config, and `product.md` and asks only for what is missing; legacy evidence migration; a pre-commit gate; `permissions.deny` rendered from the secret and frozen lists; `PostToolBatch` rendering; `.claude/agents/`, `.claude/skills/`, `.claude/launch.json` declared project-owned. Then pilot `sdd upgrade` on mangcoding-ui8-starter, then loopday-app, each on a branch `chore/sdd-upgrade-2.1` that is not pushed, with every migration error turned into a template test; then the other eight. Expand work (npm publish, `create-sdd`, docs site, translated README, plugin marketplace, community files) starts only when all ten pass `sdd validate` with legacy evidence as warnings.

**Evidence.** The 2.1 trust rules stay. An EV block gains `kind: command | manual | browser | external`, a `commands` list, `captured`, `exit_code`, `commit: pending` (allowed while the task is not `done`), and `commit: <repository>@<sha>` for another repository. `sdd verify` is the only writer of `captured: true`. A manual EV stays allowed, but a task whose evidence is only manual reaches `done` only with `reviewed_by: <human>`. `sdd upgrade` stamps every EV dated before the upgrade with `legacy: true`; a trust-rule violation on a legacy EV is a warning.

**Claims.** The default lock is a file lease in `tasks.md` (`claimed_by`, `claimed_at`, `lease_until`) plus the commit trailer `Task: T-XXX`. `sdd claim` is atomic and refuses a second claim; `sdd reconcile` clears expired leases; `sdd next` reads `tasks.md` from the other active worktrees before offering a task. The draft-PR lock of ADR-0002 activates only when `gh` is available.

**Lite cap.** `limits.lite` defaults to 120 lines; above 200 is an error.

**Thesis data.** `sdd stats --json` reports task, evidence, assumption, and lead-time counts locally; no outbound telemetry. `CITATION.cff` is added. Both are P2.

Applies to: the template from 2.1.0 and every derived project when it upgrades. Does not apply to: v1 projects.

## Consequences

- Positive: upgrade is exercised on ten real projects before anyone else sees it; evidence rules match the evidence people write; parallel sessions get a lock that works offline.
- Negative or cost: the public phase slips behind ten upgrades; the EV block grows five optional keys; two more CLI commands to maintain.
- Operational: the release before the fixes means the first upgrade runs against 2.1.0 and the fixes land in 2.1.x patches; the maintainer tags each one.

## Risks

| Risk | Impact | Mitigation or verification |
|---|---|---|
| An older Claude Code rejects the unknown `onFailure` field (UNVERIFIED) | hooks silently off | document the minimum version; `.claude/settings.local.json` can drop the field |
| `onFailure: "block"` denies every matched tool when node or the script cannot start | editing stops until fixed | that is the intended fail-closed behavior; the README names the cause (Git Bash missing, `CLAUDE_PROJECT_DIR` not expanded) |
| `legacy: true` hides evidence that was never valid | stale `done` tasks | legacy applies only to EV dated before the upgrade; `TRACE.md` shows them as suspect |
| A file lease is invisible to another machine until pushed | double claim across machines | PR lock when `gh` exists; `sdd reconcile` on conflict |

## Compatibility and migration

A 2.0 project upgrades with `sdd upgrade --base-ref v2.0.0`; answers are inferred where possible. Adapters re-render to the thin form, existing EV blocks become legacy, assumptions without `feature:` are filled from context or left as warnings.

## Follow-up

Tasks for 2.1.x and 2.2 are listed in `docs/research/2026-10-23-upgrade-recommendations.md` section 6 and are tracked in the changelog, not here.

## Revisit when

- All ten derived projects pass `sdd validate`: the expand phase opens.
- A second maintainer or an external user appears: extract `@vxerys/sdd` (ADR-0003).
- Claude Code changes hook failure semantics or the subagent memory location.
