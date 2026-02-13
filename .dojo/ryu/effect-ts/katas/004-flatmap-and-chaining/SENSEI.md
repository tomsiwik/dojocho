# SENSEI — 004 FlatMap and Chaining

## Briefing

### Goal

Chain Effects together using flatMap, andThen, and tap.

### Tasks

1. Implement `lookupAndGreet(id)` — flatMap a lookup to return a greeting
2. Implement `validateAndProcess(input)` — chain validation then processing
3. Implement `logAndReturn(value, sideEffects)` — use tap to log a side effect without changing the value

### Hints

```ts
import { Effect } from "effect";

// Effect.flatMap chains a dependent Effect
const result = Effect.succeed(1).pipe(
  Effect.flatMap((n) => Effect.succeed(n + 1))
);

// Effect.andThen sequences two Effects
const chained = Effect.succeed("hello").pipe(
  Effect.andThen((s) => Effect.succeed(s.toUpperCase()))
);

// Effect.tap runs a side effect without altering the result
const tapped = Effect.succeed(42).pipe(
  Effect.tap((n) => Effect.sync(() => console.log(n)))
);
```

## Prerequisites

- **001 Hello Effect** — `Effect.succeed`, `Effect.sync`
- **002 Transform with Map** — `Effect.map`, `pipe`
- **003 Generator Pipelines** — `Effect.gen`, `yield*`, `Effect.fail`

> **Note**: `Effect.runSync`, `Effect.runSyncExit`, and `Exit.isFailure` appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `lookupAndGreet(0) succeeds with 'Hello, Alice!'` | `Effect.flatMap` | Chain dependent Effects — success path |
| `lookupAndGreet(1) succeeds with 'Hello, Bob!'` | `Effect.flatMap` | Chain dependent Effects — different lookup |
| `lookupAndGreet(99) fails with 'NotFound'` | `Effect.flatMap` + `Effect.fail` | Error propagation in chain |
| `validateAndProcess('hello') succeeds with 'HELLO'` | `Effect.andThen` | Sequential processing — success |
| `validateAndProcess('') fails with 'EmptyInput'` | `Effect.andThen` + `Effect.fail` | Validation failure |
| `logAndReturn records side effect and returns value` | `Effect.tap` + `Effect.sync` | Side effect without value change |

## Teaching Approach

### Socratic prompts

- "In `map`, your function returns a plain value. In `flatMap`, your function returns an Effect. Why would you need that?"
- "What's the difference between `flatMap` and `andThen`? Try looking at their type signatures."
- "If `tap` doesn't change the value, what's it useful for?"
- "For `lookupAndGreet`, you need a lookup step that might fail. Can a `map` callback fail? What can?"

### Common pitfalls

1. **Using `map` instead of `flatMap`** — if your callback returns an Effect, you'll get `Effect<Effect<...>>` (nested). Ask: "What type does `map` give you if your function returns an Effect?"
2. **Lookup logic** — students may overcomplicate the id-to-name mapping. Nudge: "A simple `if/else` or ternary works. What should happen for id 0? For id 1? For anything else?"
3. **`tap` changing the value** — the callback in `tap` runs for its side effect; its return value is ignored (the original value passes through). Ask: "After `tap`, what value does the chain continue with?"
4. **`logAndReturn` side effect** — students need to push to the `sideEffects` array. This is a mutation, so use `Effect.sync(() => { ... })` inside `tap`.
5. **Start with `lookupAndGreet`** — first create an Effect that looks up the name, then use `flatMap` to turn that name into a greeting Effect.

## On Completion

### Insight

`flatMap` is the fundamental chaining operation in Effect. Everything else builds on it: `gen` desugars `yield*` into flatMap calls, `andThen` is a more flexible flatMap, and `map` is flatMap where the callback wraps its return in `succeed` automatically. Understanding flatMap means understanding how Effect sequences computations.

### Bridge

You now have all the individual building blocks: `succeed`, `sync`, `fail`, `map`, `flatMap`, `andThen`, `tap`, `gen`. Kata 005 brings them together with **pipe composition** — building multi-step pipelines using both the standalone `pipe()` function and the fluent `.pipe()` method. It's the capstone of the Basics area.
