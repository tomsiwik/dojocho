# Effect Kata

A self-tracking Effect-TS dojo. Learn Effect patterns through test-driven katas.

## Quick Start

```bash
# start you favorite coding agent
claude

# run /kata command
# enjoy
```

## Workflow

1. **`/kata`** — start the dojo (auto-detects progress, teaches concepts, suggests next kata)
2. Edit `katas/NNN-name/solution.ts` to make the tests pass
3. **`/kata`** — check your work and continue

That's it. One command does everything.

## Configuration

Commits are blocked by default to keep your workspace clean. To enable:

```json
// .kata/config.json
{ "allowCommit": true }
```

## Special thanks to

[PaulJPhilp/EffectPatterns](https://github.com/PaulJPhilp/EffectPatterns). The `refs/effect-patterns/` submodule contains 700+ Effect-TS patterns - highly useful on it's own but this guy also added skills which allowed me to create this in the first place.
