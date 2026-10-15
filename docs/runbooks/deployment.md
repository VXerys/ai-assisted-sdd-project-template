# Deployment Runbook

## Ownership

- Release owner: {{OWNER}}
- Rollback approver: {{OWNER}}
- Target environment: name it (production, staging) once it exists.

## Preconditions

- [ ] Included feature verification is complete.
- [ ] Required migrations are reviewed.
- [ ] Environment configuration is verified.
- [ ] Rollback strategy is available.
- [ ] Incident contact is available.

## Deployment

The build and deploy commands come from `docs/steering/tech.md` and the deployment target recorded there; write the exact sequence here once the target is decided.

## Post-deployment verification

1. Smoke check: the entry point answers.
2. Observability check: logs or metrics show the new version.
3. Critical flow check: the journey in `docs/steering/product.md` works end to end.

## Rollback trigger

Roll back when the smoke or critical flow check fails, or when error rate or latency crosses the threshold agreed for the release.

## Rollback procedure

Command or manual steps, and the data compatibility rule (which migrations are safe to leave applied).

## Closeout

- [ ] Record release version and commit.
- [ ] Update `../handoff/current.md`; run `npm run context:render`.
- [ ] Update roadmap and feature registry.
- [ ] Record incident or limitation when applicable.
