---
"dojocho": patch
---

Fix `npm install -g dojocho` failing with `EUNSUPPORTEDPROTOCOL Unsupported URL Type "workspace:": workspace:*`. The 1.0.0 tarball on the npm registry contained the raw `workspace:*` dep specifier instead of the resolved version. Republishing via `pnpm publish` (auto-detected by `changeset publish` in this pnpm workspace) rewrites the protocol before upload.
