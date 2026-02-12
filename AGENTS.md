# Effect Kata

A hands-on learning repository for Effect-TS patterns and best practices.

## Structure

- `KATAS.md` — Instructor entry-file: teaching groundrules, output style, kata table of contents
- `katas/NNN-name/SENSEI.md` — Per-kata teacher: briefing, skills, concepts, Socratic prompts, pitfalls
- `katas/NNN-name/solution.ts` — Stubs to implement
- `katas/NNN-name/solution.test.ts` — Tests (vitest)
- `.agents/commands/kata.md` — `/kata` command (state machine + tracking orchestrator)
- `.agents/scripts/setup.sh` — Idempotent bootstrap (symlinks, deps)
- `.agents/scripts/progress.sh` — Test runner + progress tracker
- `.agents/skills/` — 24 Effect-TS pattern skills (from [EffectPatterns](https://github.com/PaulJPhilp/EffectPatterns))
- `.claude/`, `.opencode/`, `.codex/` — Mirror symlinks to `.agents/` (commands + skills)
- `.kata/` — Local progress tracking and config (gitignored)
- `.kata/config.json` — User config (`allowCommit`, `tracking`)
- `.husky/pre-commit` — Blocks commits unless on a `kata/*` branch or `.kata/config.json` has `allowCommit: true`

## Teaching Architecture

```
KATAS.md (instructor)     — General standards. How to teach, talk, check work.
  └── SENSEI.md (teacher) — Kata-specific. Skills, prompts, pitfalls, rewards.
       └── kata.md (state machine) — Orchestrates flow. Reads both files.
```

**KATAS.md** sets sensible defaults for all katas. **SENSEI.md** introduces niche concepts and situation-specific teaching for each kata. When SENSEI.md has specific guidance, it overrides KATAS.md defaults. See `KATAS.md` for full details.

## Kata Workflow

1. `/kata` — start the dojo (auto-bootstraps, detects progress, teaches concepts)
2. Edit `katas/NNN-name/solution.ts` to implement the solution
3. `/kata` — check your work and continue

## Git Tracking

Kata progress can be tracked via git branches and commits. See `KATAS.md` for branch scheme, commit convention, and configuration.

## Skills reference

The 24 skills cover: core concepts, error handling, concurrency, domain modeling, streams, testing, observability, HTTP requests, scheduling, platform, resource management, data pipelines, APIs, and tooling/debugging.

Skills are auto-activated by context. Invoke manually with `/skill effect-patterns-{category}`.
