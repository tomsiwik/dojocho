# Dojocho

A kata dojo system for hands-on learning with coding agents.

## Structure

```
dojo.config.ts                           — Workspace config (KATAS_PATH for student files)
.dojorc                                  — Dojo config (active ryu, commit settings, tracking)
katas/<name>/solution.ts                 — Student workspace (solution files live here)
.dojo/
├── scripts/setup.sh                     — Bootstrap (symlinks, deps)
└── ryu/<pack>/                          — Installed ryu (hidden library)
    ├── package.json                     — Identity + dependencies
    ├── katas.json                       — Kata catalog, template paths, test command
    ├── DOJO.md                          — Teaching philosophy and standards
    ├── katas/<name>/                    — Individual kata exercises
    │   ├── SENSEI.md                    — Per-kata teacher (briefing, prompts, pitfalls)
    │   ├── solution.ts                  — Template stubs (copied to workspace on start)
    │   └── solution.test.ts             — Tests (import from workspace via @/katas alias)
    ├── commands/kata.md                 — /kata command (state machine)
    └── skills/                          — Pattern skills
.claude/, .opencode/, .codex/            — Agent symlinks → active ryu
```

## Workspace Model

The ryu is a **hidden library**. The student's workspace gets just solution stubs.

- **Library** (`.dojo/ryu/<pack>/`) — tests, SENSEI.md, and template stubs
- **Workspace** (`KATAS_PATH` from `dojo.config.ts`, default `./katas/`) — student solution files
- Tests import from `@/katas/<dir>/solution.js` which resolves to the workspace via vitest alias
- State is derived: file doesn't exist → not-started, file exists → ongoing, tests pass → finished

## Teaching Architecture

```
DOJO.md (style)       — General standards. How to teach, talk, check work.
  └── SENSEI.md (teacher) — Kata-specific. Skills, prompts, pitfalls, rewards.
       └── kata.md (state machine) — Reads katas.json, derives state, runs tests.
```

## Kata Workflow

1. `/kata` — reads `katas.json`, derives state from workspace, teaches or checks
2. Edit the solution file in `./katas/<name>/solution.ts`
3. `/kata` — runs tests, continues

## Key Files

- **`dojo.config.ts`** — workspace output path (`KATAS_PATH`)
- **`katas.json`** — ordered array of katas with template paths. Defines test command. Read-only (no state).
- **`DOJO.md`** — teaching philosophy (never give solutions, Socratic method)
- **`SENSEI.md`** — per-kata teaching guide (briefing, test map, prompts)
- **`.dojorc`** — active ryu, tracking, commit settings
