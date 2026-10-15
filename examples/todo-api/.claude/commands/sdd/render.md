---
description: Render context views, sync tool adapters, and validate the repository
allowed-tools: Bash(npm run context:render:*), Bash(npm run adapters:sync:*), Bash(npm run context:validate:*), Read
---

1. Run `npm run context:render`.
2. Run `npm run adapters:sync`.
3. Run `npm run context:validate`.
4. Report each command's exit status, the files that changed, and every `error` line verbatim with its `path:line`. For a stale-view or stale-adapter error, the fix is the command the message names; for any other error, name the source file to edit and stop.

Never edit a generated file to make validation pass.
