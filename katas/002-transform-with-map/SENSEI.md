# SENSEI — 002 Transform with Map

## Briefing

### Goal

Transform Effect values using `map` and `pipe`.

### Tasks

1. Implement `double(n)` — returns an Effect that succeeds with `n * 2`
2. Implement `strlen(s)` — returns an Effect that succeeds with the length of `s`
3. Implement `doubleAndFormat(n)` — uses pipe + map to double a number and format as `"Result: {n}"`

### Hints

```ts
import { Effect, pipe } from "effect";

// Effect.map transforms the success value
const doubled = Effect.map(Effect.succeed(21), (n) => n * 2);

// pipe lets you compose left-to-right
const result = pipe(
  Effect.succeed(10),
  Effect.map((n) => n + 1),
  Effect.map((n) => `Value: ${n}`),
);
```

## Prerequisites

- **001 Hello Effect** — `Effect.succeed`, `Effect.sync` (creating Effects)

> **Note**: `Effect.runSync` appears only in tests. Never attribute it to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `double(5) succeeds with 10` | `Effect.succeed` + `Effect.map` | Basic numeric transformation |
| `double(0) succeeds with 0` | `Effect.map` | Edge case — identity under doubling |
| `double(-3) succeeds with -6` | `Effect.map` | Negative numbers |
| `strlen('hello') succeeds with 5` | `Effect.succeed` + `Effect.map` | String-to-number transformation |
| `strlen('') succeeds with 0` | `Effect.map` | Empty string edge case |
| `doubleAndFormat(5) succeeds with 'Result: 10'` | `pipe` + `Effect.map` | Chained transformations |
| `doubleAndFormat(0) succeeds with 'Result: 0'` | `pipe` + `Effect.map` | Chained edge case |

## Teaching Approach

### Socratic prompts

- "You know how to create Effects with `succeed`. What if you want to change the value inside without leaving the Effect world?"
- "What does `Effect.map` return — a plain value or an Effect?"
- "In `doubleAndFormat`, you need two steps. How does `pipe` help you connect them?"

### Common pitfalls

1. **Returning plain values from map** — `Effect.map(effect, (n) => n * 2)` is correct. Students sometimes try `Effect.succeed(Effect.map(...))` — double-wrapping. Ask: "What does `map` already return?"
2. **Skipping pipe for `doubleAndFormat`** — students may try to nest maps or create intermediate variables. Nudge: "Can you express both steps in a single `pipe` chain?"
3. **Confusing `pipe` import** — `pipe` comes from `"effect"`, not a separate module. The type signature helps: it takes a value and a series of functions.
4. **Start simple** — start with `double` (just `succeed` + `map`), then for `doubleAndFormat` add a second `map` step in the same `pipe`.

## On Completion

### Insight

`Effect.map` keeps you inside the Effect world — you never have to "unwrap" the value, transform it, and "re-wrap" it. This is what makes Effects composable: each transformation step produces a new Effect that chains naturally into the next. Think of `pipe` as a conveyor belt where each `map` is a station that modifies the item passing through.

### Bridge

Pipe chains with `map` work great when each step is synchronous and infallible. But what happens when a step itself needs to create an Effect — like parsing that might fail? Kata 003 introduces **generators** (`Effect.gen`), giving you an imperative-looking way to sequence multiple Effect steps.
