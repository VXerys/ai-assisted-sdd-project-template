---
id: F-XXX-SYSTEM-ARCHITECTURE
feature: F-XXX
status: draft
owner: "{{OWNER}}"
last_updated: "{{YYYY-MM-DD}}"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "design.md"
---

# System Architecture: {{FEATURE_NAME}}

> This document owns module-level architectural reasoning. It should explain the system shape, boundaries, data and consistency model, scale/reliability/security strategy, and trade-offs for this capability. Exact repository paths, UI details, and low-level implementation mapping belong in `design.md`.
>
> Remove optional sections that genuinely do not apply. Do not fill them with invented complexity.

## 1. Architecture Intent

### Capability

{{What bounded capability does this module provide?}}

### Architectural objective

{{What must this architecture make possible while preserving project constraints?}}

### In scope

- {{BOUNDARY_OR_RESPONSIBILITY}}

### Out of scope

- {{EXCLUDED_RESPONSIBILITY}}

## 2. Requirements and Architecture Drivers

Referenced requirements:

- {{FR_IDS}}
- {{NFR_IDS}}
- {{BUSINESS_RULE_IDS}}

Prioritized architecture drivers:

| Driver | Requirement / assumption | Priority | Architectural consequence |
|---|---|---|---|
| {{LATENCY / RELIABILITY / SECURITY / SCALE / COST / CONSISTENCY}} | {{DETAIL}} | {{H/M/L}} | {{CONSEQUENCE}} |

Hard constraints:

- {{CONSTRAINT}}

Unknowns that may change the architecture:

- {{ASSUMPTION}} — validation: {{PLAN}}

## 3. Workload and Capacity Assumptions

Do not invent precise numbers when they are unknown. Use ranges, qualitative assumptions, or explicit TBDs with a validation plan.

| Dimension | Current / initial | Expected growth | Source / confidence |
|---|---|---|---|
| Active users / actors | {{VALUE}} | {{VALUE}} | {{SOURCE}} |
| Requests / events | {{VALUE}} | {{VALUE}} | {{SOURCE}} |
| Concurrent connections | {{VALUE_OR_NA}} | {{VALUE_OR_NA}} | {{SOURCE}} |
| Data growth | {{VALUE}} | {{VALUE}} | {{SOURCE}} |
| Payload / object size | {{VALUE}} | {{VALUE}} | {{SOURCE}} |
| Read : write ratio | {{VALUE}} | {{VALUE}} | {{SOURCE}} |
| Hot-key / hotspot risk | {{VALUE}} | {{VALUE}} | {{SOURCE}} |

Capacity-sensitive thresholds that would trigger redesign:

- {{THRESHOLD_OR_SIGNAL}}

## 4. System Context and Boundaries

### Context

```text
{{ACTOR_OR_SYSTEM}}
  -> {{MODULE_ENTRY_BOUNDARY}}
  -> {{MODULE}}
  -> {{DEPENDENCY_OR_PERSISTENCE}}
  -> {{EXTERNAL_CONSUMER_OR_RESULT}}
```

### Boundaries

| Boundary | Inside owner | Outside dependency / actor | Contract / trust implication |
|---|---|---|---|
| {{BOUNDARY}} | {{OWNER}} | {{OTHER_SIDE}} | {{RULE}} |

### Dependency direction

- {{ALLOWED_DIRECTION}}
- {{PROHIBITED_SHORTCUT}}

Project architecture constraints used:

- {{LINK_OR_RULE}}

## 5. Logical Components and Responsibilities

| Component / logical role | Responsibility | State owned | May call / depend on | Must not do |
|---|---|---|---|---|
| {{COMPONENT}} | {{RESPONSIBILITY}} | {{STATE}} | {{DEPENDENCY}} | {{PROHIBITION}} |

Do not force one deployment unit per logical component. This section describes responsibility first, deployment second.

## 6. Critical Flows

### Flow A — {{NAME}}

```text
{{TRIGGER}}
  -> {{STEP}}
  -> {{STEP}}
  -> {{PERSIST_OR_PUBLISH}}
  -> {{RESULT}}
```

Required semantics:

- Validation: {{RULE}}
- Authorization: {{RULE}}
- Ordering: {{RULE_OR_NA}}
- Idempotency: {{RULE_OR_NA}}
- Consistency: {{RULE}}
- Failure result: {{RULE}}

### Flow B — {{NAME_OR_REMOVE}}

```text
{{FLOW}}
```

## 7. Data Architecture

### Source of truth

- Primary source of truth: {{STORE_OR_OWNER}}
- Derived / cached state: {{STATE_OR_NONE}}
- Ephemeral state: {{STATE_OR_NONE}}

### Data model and access patterns

| Entity / aggregate | Ownership | Dominant access pattern | Consistency need | Retention / lifecycle |
|---|---|---|---|---|
| {{ENTITY}} | {{OWNER}} | {{READ_WRITE_PATTERN}} | {{STRONG_EVENTUAL}} | {{RULE}} |

### Storage model decision

Selected model: {{SQL / NOSQL / OBJECT STORAGE / SEARCH INDEX / HYBRID / EXISTING PLATFORM}}

Why it fits:

- {{REASON}}

Important rejected alternative:

- {{ALTERNATIVE}} — rejected because {{REASON}}

### Query and indexing implications

- Dominant queries: {{QUERIES}}
- Index requirements: {{INDEXES_OR_NA}}
- N+1 / unbounded scan risk: {{RISK_OR_NA}}
- Pagination / bounded reads: {{RULE_OR_NA}}

### Partitioning / sharding

- Required now: {{YES_OR_NO}}
- Partition key / isolation boundary: {{KEY_OR_NA}}
- Why: {{REASON_OR_NA}}
- Trigger to introduce/change sharding later: {{SIGNAL_OR_NA}}

Do not introduce sharding merely because future scale is theoretically possible.

## 8. Consistency, Concurrency, and Ordering

| Operation / state | Consistency requirement | Concurrency risk | Conflict / ordering rule | Recovery |
|---|---|---|---|---|
| {{OPERATION}} | {{STRONG / EVENTUAL / SESSION / OTHER}} | {{RISK}} | {{RULE}} | {{RECOVERY}} |

Transaction boundaries:

- {{TRANSACTION_RULE}}

Idempotency strategy:

- {{STRATEGY_OR_NA}}

Duplicate / replay handling:

- {{RULE_OR_NA}}

Clock/time ordering assumptions:

- {{RULE_OR_NA}}

## 9. Communication Model

Selected communication:

- Synchronous: {{REST / RPC / DIRECT SDK / NONE}}
- Realtime: {{WEBSOCKET / SSE / PROVIDER REALTIME / NONE}}
- Asynchronous: {{QUEUE / EVENT BUS / JOB / NONE}}

For each selected mechanism:

| Mechanism | Producer | Consumer | Delivery / ordering expectation | Timeout / retry owner |
|---|---|---|---|---|
| {{MECHANISM}} | {{PRODUCER}} | {{CONSUMER}} | {{SEMANTICS}} | {{OWNER}} |

Backpressure / rate limiting:

- {{RULE_OR_NA}}

Missed-event / reconnect / replay behavior:

- {{RULE_OR_NA}}

## 10. Caching Strategy

Caching required: {{YES_OR_NO}}

If yes:

| Cached object / query | Cache owner / location | Key | Freshness / TTL | Invalidation | Fallback on miss/failure |
|---|---|---|---|---|---|
| {{ITEM}} | {{OWNER}} | {{KEY}} | {{TTL_OR_RULE}} | {{INVALIDATION}} | {{FALLBACK}} |

Cache stampede / hot-key protection:

- {{STRATEGY_OR_NA}}

Source-of-truth conflict rule:

- {{RULE}}

If no cache is used, state why additional complexity is not justified.

## 11. Scalability Strategy

Current scaling model:

- {{VERTICAL / HORIZONTAL / MANAGED PLATFORM / OTHER}}

Application-node statefulness:

- {{STATELESS / STATEFUL}} because {{REASON}}

Load balancing / traffic distribution:

- {{STRATEGY_OR_NA}}

Scale levers:

| Bottleneck | First response | Later response / redesign trigger |
|---|---|---|
| {{DB_READS / WRITES / CONNECTIONS / CPU / MEDIA / QUEUE / HOT_PARTITION}} | {{ACTION}} | {{TRIGGER_AND_ACTION}} |

CDN / edge strategy:

- {{STRATEGY_OR_NA}}

Fan-out strategy:

- {{ON_WRITE / ON_READ / PROVIDER / NA}} — rationale: {{REASON}}

## 12. Reliability and Failure Handling

| Failure mode | Detection | Containment / handling | User/system degradation | Recovery / reconciliation |
|---|---|---|---|---|
| {{DEPENDENCY_TIMEOUT}} | {{SIGNAL}} | {{ACTION}} | {{RESULT}} | {{RECOVERY}} |

Timeout policy:

- {{RULE}}

Retry policy:

- Retryable failures: {{FAILURES}}
- Non-retryable failures: {{FAILURES}}
- Limit/backoff/jitter: {{POLICY}}

Circuit breaker:

- {{REQUIRED_OR_NOT}} — rationale: {{REASON}}

Partial-failure behavior:

- {{RULE}}

Graceful degradation:

- {{RULE_OR_NA}}

Data reconciliation / repair:

- {{RULE_OR_NA}}

## 13. Security and Privacy Architecture

Trust boundaries:

- {{BOUNDARY}}

Authentication source:

- {{SOURCE}}

Authorization decision point:

- {{BOUNDARY_AND_RULE}}

Tenant / resource isolation:

- {{RULE}}

Input validation:

- {{RULE}}

Sensitive data / PII:

- {{DATA_AND_HANDLING_OR_NA}}

Secrets / privileged credentials:

- {{RULE_OR_NA}}

Abuse / replay / enumeration / rate-limit risk:

- {{RISK_AND_CONTROL_OR_NA}}

File/media-specific controls:

- {{RULE_OR_NA}}

Security verification:

- {{TESTS_OR_REVIEW}}

## 14. Observability and Operational Signals

### Logs

- {{EVENT}}

Must not log:

- {{SENSITIVE_DATA_OR_NONE}}

### Metrics

| Signal | Why it matters | Expected baseline / threshold source |
|---|---|---|
| {{LATENCY / ERROR_RATE / CONNECTIONS / CACHE_HIT / QUEUE_DEPTH / LAG}} | {{REASON}} | {{SOURCE_OR_TBD}} |

### Tracing / audit

- Tracing: {{SCOPE_OR_NA}}
- Audit events: {{SCOPE_OR_NA}}

### Release / incident signals

The module should be considered unhealthy when:

- {{SIGNAL}}

## 15. Cost and Resource Model

Material cost drivers:

| Driver | What makes it grow | Control / optimization | Trade-off |
|---|---|---|---|
| {{DATABASE_IO / EGRESS / STORAGE / REALTIME_CONNECTIONS / INVOCATIONS / MODEL_INFERENCE}} | {{GROWTH}} | {{CONTROL}} | {{TRADEOFF}} |

Cost optimization must not violate correctness, security, or explicit performance requirements.

## 16. Deployment, Compatibility, and Evolution

Deployment topology impact:

- {{IMPACT_OR_NONE}}

Backward/forward compatibility:

- {{RULE}}

Migration / rollout sequence:

1. {{STEP}}
2. {{STEP}}
3. {{VERIFY}}

Rollback / roll-forward constraints:

- {{RULE}}

Feature flag / staged rollout:

- {{STRATEGY_OR_NA}}

## 17. Alternatives Considered

### Option A — {{NAME}}

Summary: {{DESCRIPTION}}

Advantages:

- {{ADVANTAGE}}

Disadvantages:

- {{DISADVANTAGE}}

Risks:

- {{RISK}}

### Option B — {{NAME}}

Summary: {{DESCRIPTION}}

Advantages:

- {{ADVANTAGE}}

Disadvantages:

- {{DISADVANTAGE}}

Risks:

- {{RISK}}

### Decision matrix

| Criterion | Weight / priority | Option A | Option B | Option C |
|---|---|---|---|---|
| Requirement fit | {{H/M/L}} | {{VALUE}} | {{VALUE}} | {{VALUE_OR_NA}} |
| Correctness / consistency | {{H/M/L}} | {{VALUE}} | {{VALUE}} | {{VALUE_OR_NA}} |
| Reliability | {{H/M/L}} | {{VALUE}} | {{VALUE}} | {{VALUE_OR_NA}} |
| Scalability | {{H/M/L}} | {{VALUE}} | {{VALUE}} | {{VALUE_OR_NA}} |
| Complexity | {{H/M/L}} | {{VALUE}} | {{VALUE}} | {{VALUE_OR_NA}} |
| Operational burden | {{H/M/L}} | {{VALUE}} | {{VALUE}} | {{VALUE_OR_NA}} |
| Security | {{H/M/L}} | {{VALUE}} | {{VALUE}} | {{VALUE_OR_NA}} |
| Cost | {{H/M/L}} | {{VALUE}} | {{VALUE}} | {{VALUE_OR_NA}} |
| Reversibility | {{H/M/L}} | {{VALUE}} | {{VALUE}} | {{VALUE_OR_NA}} |
| Team familiarity | {{H/M/L}} | {{VALUE}} | {{VALUE}} | {{VALUE_OR_NA}} |

Selected option: {{OPTION}}

Selection rationale:

{{Why this option best satisfies the prioritized drivers and constraints.}}

## 18. Accepted Trade-Offs

| Trade-off | Benefit gained | Cost / limitation accepted | Review trigger |
|---|---|---|---|
| {{TRADEOFF}} | {{BENEFIT}} | {{COST}} | {{TRIGGER}} |

## 19. Architecture Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation / experiment | Residual risk |
|---|---|---|---|---|
| {{RISK}} | {{L/M/H}} | {{L/M/H}} | {{MITIGATION}} | {{RESIDUAL}} |

## 20. Architecture Verification Plan

Architecture claims require evidence proportional to risk.

| Claim / risk | Verification | Evidence expected | When |
|---|---|---|---|
| {{CLAIM}} | {{LOAD_TEST / CONTRACT_TEST / FAILURE_INJECTION / INTEGRATION_TEST / MANUAL_MEASUREMENT}} | {{EVIDENCE}} | {{PRE_MERGE / STAGING / POST_RELEASE}} |

Examples of valid evidence:

- integration/contract tests for boundaries;
- authorization allowed/denied tests;
- query plans or bounded-query evidence;
- load/latency measurements when performance is a real requirement;
- reconnect/replay tests for realtime flows;
- failure/retry/idempotency tests;
- migration rehearsal where data risk requires it;
- release metrics proving the expected operational signal.

## 21. ADR and Global Architecture Impact

- New cross-feature invariant: {{YES_OR_NO}}
- Project architecture update required: {{YES_OR_NO}}
- ADR required: {{YES_OR_NO}}
- Related ADRs: `../../adr/{{ADR_FILE_OR_NONE}}`
- Promotion target if this becomes shared: {{PATH_OR_NONE}}

## 22. Open Architecture Questions

| ID | Question | Why it matters | Blocking? | Owner | Resolution |
|---|---|---|---|---|---|
| AQ-001 | {{QUESTION}} | {{IMPACT}} | {{YES/NO}} | {{OWNER}} | Pending |

Blocking architectural questions must be resolved before dependent tasks are implemented.

## 23. Approval and Maintenance

- Architecture owner: {{NAME}}
- Status: {{DRAFT / REVIEW / APPROVED / SUPERSEDED}}
- Approved date: {{DATE_OR_PENDING}}
- Conditions: {{CONDITIONS_OR_NONE}}

Review this architecture when:

- requirements or NFRs materially change;
- workload assumptions are invalidated;
- storage, consistency, caching, or communication strategy changes;
- a new trust boundary/external dependency is introduced;
- a major incident exposes an architectural weakness;
- the module becomes shared infrastructure;
- a related ADR is superseded.
