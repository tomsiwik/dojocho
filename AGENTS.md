# Dojocho

A kata dojo system for hands-on learning with coding agents.

## Structure

```
.dojorc                                  — Dojo config (active ryu, commit settings, tracking)
.dojo/
├── scripts/setup.sh                     — Bootstrap (symlinks, deps)
└── ryu/<pack>/                          — Installed ryu (schools/styles)
    ├── package.json                     — Identity + dependencies
    ├── katas.json                       — Kata catalog, state, test command
    ├── DOJO.md                          — Teaching philosophy and standards
    ├── katas/<name>/                    — Individual kata exercises
    │   ├── SENSEI.md                    — Per-kata teacher (briefing, prompts, pitfalls)
    │   ├── solution.ts                  — Stubs to implement
    │   └── solution.test.ts             — Tests
    ├── commands/kata.md                 — /kata command (state machine)
    └── skills/                          — Pattern skills
.claude/, .opencode/, .codex/            — Agent symlinks → active ryu
```

## Teaching Architecture

```
DOJO.md (style)       — General standards. How to teach, talk, check work.
  └── SENSEI.md (teacher) — Kata-specific. Skills, prompts, pitfalls, rewards.
       └── kata.md (state machine) — Reads katas.json, runs tests, updates state.
```

## Kata Workflow

1. `/kata` — reads `katas.json`, finds current kata, teaches or checks
2. Edit the solution file
3. `/kata` — runs tests, updates state, continues

## Key Files

- **`katas.json`** — ordered array of katas with file paths and state. Defines test command.
- **`DOJO.md`** — teaching philosophy (never give solutions, Socratic method)
- **`SENSEI.md`** — per-kata teaching guide (briefing, test map, prompts)
- **`.dojorc`** — active ryu, tracking, commit settings
