---
description: Onboard an existing codebase - fill steering from the real repository, log pitfalls, propose one bounded first feature
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
disable-model-invocation: true
---

Run once, after `npm run sdd -- adopt --into <this repository>` (from the template) and `npm install`. Do not invent standards: every rule you write is either visible in the code or confirmed by the owner.

1. Survey: `git log --oneline -20`, the directory tree two levels deep, the manifest files (`package.json`, `pubspec.yaml`, `build.gradle*`, `pyproject.toml`, `go.mod`, ...), existing CI workflows, and any README, CONTRIBUTING, or older agent instructions (`CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`).
2. `docs/steering/tech.md`: the real stack and versions from the manifests; the Commands table with commands you ran here and that exited 0. A command you could not run stays in the table only with `(not run: <reason>)`; never claim it passes.
3. `docs/steering/structure.md`: directory responsibilities and the dependency direction the imports actually follow. Note where the code already breaks its own pattern instead of describing an ideal.
4. `docs/steering/rules.md`: keep the template rules; add a project rule only when the code or an existing document shows it. Existing instruction files: carry their rules over, then tell the owner which file to retire.
5. Pitfalls: things that surprised you and would mislead the next agent (generated code, legacy folders, flaky tests, scripts with side effects, environment needs). Write each as a bullet under a `## Pitfalls` section of `structure.md` or `tech.md`, where it belongs; anything you could not confirm becomes an `A-XXX` in `docs/context/ASSUMPTIONS.md` with `status: open`.
6. `sdd.config.json`: add generated code paths to `generated` and paths that must not change to `frozen`, each with the evidence in your report (a protected file: the owner approves the edit).
7. `docs/steering/product.md`: vision, personas, and non-goals only from what the repository and the owner state; leave the rest for the owner instead of guessing.
8. Run `npm run adapters:sync`, `npm run context:render`, `npm run context:validate`, and `npm run sdd -- guard --check`.
9. Report: what you filled and from which evidence, the commands that ran and their results, open assumptions, the pitfalls, and one bounded first feature to spec (a single observable behavior that touches few files). Do not start it.
