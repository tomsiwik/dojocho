# @dojocho/cli

## 0.1.0

### Minor Changes

- a339acf: Add `dojo intro`, `dojo kata intro`, and `dojo setup` commands

  - `dojo setup [--agent]` replaces `dojo --start` — scaffolds the project and configures coding agent integrations (claude, opencode, codex, gemini) with flag-based selection
  - `dojo intro` shows the active dojo's DOJO.md, offers switching when multiple dojos are installed, and marks the dojo as introduced
  - `dojo kata intro` shows the current kata's SENSEI.md briefing and marks the kata as introduced
  - `dojo kata` smart mode auto-chains intros: outputs `!\`dojo intro\``when dojo not yet introduced,`!\`dojo kata intro\`` when kata not yet introduced
  - Add `introduced` and `kataIntros` fields to `KataProgress` for tracking introduction state
  - Extract agent config into shared `AGENTS` map and `configuredAgents()` helper
  - `dojo add` and `dojo remove` now use `configuredAgents()` instead of hardcoded agent list, supporting gemini
  - Add smoke tests for CLI (21 tests, vitest)
  - effect-ts DOJO.md: embed `!\`dojo intro\`` for inline agent invocation

### Patch Changes

- Updated dependencies [a339acf]
  - @dojocho/config@0.0.3

## 0.0.3

### Patch Changes

- a7f8d35: fix: rollback on failed `dojo add` and respect user's package manager

  - Stage installs in a temp directory before writing to `.dojos/`. If dependency install fails, `.dojos/` is never touched.
  - Detect the user's package manager from `packageManager` field or lockfiles instead of hardcoding pnpm.
  - Use `pnpm pack` / `npm pack` (based on source PM) for local adds to natively resolve `workspace:*` deps.
  - Remove manual workspace dependency linking (`linkWorkspaceDeps`).

## 0.0.2

### Patch Changes

- f5f3b51: Fix workspace protocol in published package
- Updated dependencies [f5f3b51]
  - @dojocho/config@0.0.2
