# SENSEI — 001 Hello Effect

## Briefing

### Goal

Create and run your first Effects.

### Tasks

1. Implement `hello()` — returns an Effect that succeeds with `"Hello, Effect!"`
2. Implement `lazyRandom()` — returns an Effect that lazily produces a random number (0–1)
3. Implement `greet(name)` — returns an Effect that succeeds with `"Hello, {name}!"`

### Hints

```ts
import { Effect } from "effect";

// Effect.succeed wraps a plain value
const myEffect = Effect.succeed(42);

// Effect.sync wraps a lazy computation
const lazy = Effect.sync(() => Math.random());

// Effect.runSync executes synchronously
const value = Effect.runSync(myEffect); // 42
```

## Prerequisites

None — this is the first kata.

## Skills

Invoke `effect-patterns-getting-started` before teaching this kata.

> **Note**: `Effect.runSync` appears only in tests. The student does NOT write it. Never attribute it to their learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `hello() succeeds with 'Hello, Effect!'` | `Effect.succeed` | Wrapping a string literal |
| `lazyRandom() produces a number between 0 and 1` | `Effect.sync` | Lazy computation wrapping `Math.random()` |
| `lazyRandom() is lazy (re-evaluates on each run)` | `Effect.sync` | Same Effect produces different values across multiple runs |
| `greet('World') succeeds with 'Hello, World!'` | `Effect.succeed` | Parameterized value wrapping |
| `greet('Effect') succeeds with 'Hello, Effect!'` | `Effect.succeed` | Parameterized value wrapping |

## Teaching Approach

### Socratic prompts

- "What's the difference between wrapping a value directly vs wrapping a function that produces a value?"
- "If you use `Effect.succeed(Math.random())`, when does `Math.random()` actually run?"
- "What does the type `Effect.Effect<string>` tell you about what this Effect produces?"

### Common pitfalls

1. **Using `succeed` for `lazyRandom`** — `Effect.succeed(Math.random())` evaluates `Math.random()` immediately when the function is called, not when the Effect is run. The value gets "baked in". Ask: "Try running `lazyRandom()` twice and comparing — are they always different? Why or why not?"
2. **Overcomplicating `greet`** — students may try template literals inside `sync`. Nudge: "Does `greet` need laziness? It already has the name parameter."
3. **Tackle one function at a time** — get `hello()` passing first, then think about what makes `lazyRandom` different.

## On Completion

### Insight

You used two ways to create Effects: `succeed` for values you already have, and `sync` for computations you want to defer. The tests used `Effect.runSync` to execute your Effects — but notice **you** never wrote `runSync`. In Effect, creating a computation and running it are separate concerns. This separation is what makes Effects composable.

### Bridge

Now that you can create Effects, the next step is **transforming** them. Kata 002 introduces `Effect.map` and `pipe` — the building blocks for turning one Effect's output into something new without leaving the Effect world.
