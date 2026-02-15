---
"@dojocho/cli": patch
---

fix: rollback on failed `dojo add` and respect user's package manager

- Stage installs in a temp directory before writing to `.dojos/`. If dependency install fails, `.dojos/` is never touched.
- Detect the user's package manager from `packageManager` field or lockfiles instead of hardcoding pnpm.
- Use `pnpm pack` / `npm pack` (based on source PM) for local adds to natively resolve `workspace:*` deps.
- Remove manual workspace dependency linking (`linkWorkspaceDeps`).
