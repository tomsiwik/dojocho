# SENSEI — 019 Ref and State

## Briefing

### Goal

Manage mutable state safely within effects using Ref.

### Tasks

1. Implement `counter(n)` — create a Ref with initial value 0, increment it `n` times, return the final value
2. Implement `accumulate(items)` — create a Ref of `string[]`, push each item, return the accumulated array
3. Implement `getAndIncrement(ref)` — use `Ref.modify` to atomically return the current value and increment by 1

### Hints

```ts
import { Effect, Ref } from "effect";

// Create and use a Ref
const program = Effect.gen(function* () {
  const ref = yield* Ref.make(0);
  yield* Ref.update(ref, (n) => n + 1);
  return yield* Ref.get(ref);
});

// Atomic read-and-update
const old = yield* Ref.modify(ref, (n) => [n, n + 1]);
```

## Prerequisites

- **017 Parallel Effects** — `Effect.all`, concurrency
- **018 Race and Timeout** — `Effect.race`, `Effect.timeout`

> **Note**: `Effect.runSync` appears only in tests. Never attribute it to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `counter(5) returns 5` | `Ref.make` + `Ref.update` + `Ref.get` | Incrementing a Ref n times in a loop |
| `counter(0) returns 0` | `Ref.make` + `Ref.get` | Edge case — no increments |
| `accumulate collects all items` | `Ref.make([])` + `Ref.update` | Pushing items into a Ref array |
| `getAndIncrement returns current then increments` | `Ref.modify` | Atomic read-then-update in one operation |

## Teaching Approach

### Socratic prompts

- "Why use a Ref instead of a regular `let` variable? What could go wrong with `let` in concurrent code?"
- "For `counter`, you need to increment n times. How do you loop in the Effect world?"
- "`Ref.modify` does a read AND an update atomically. What does 'atomically' mean here? Why does it matter?"
- "What's the difference between `Ref.update` (which returns void) and `Ref.modify` (which returns a value)?"

### Common pitfalls

1. **`counter` needs a loop** — you can't just set the Ref to n. Use `Effect.forEach` over a range (like `Array.from({ length: n }, (_, i) => i)`) or `Effect.repeatN`. Ask: "How do you express 'do this n times' in Effect?"
2. **`Ref.modify` tuple order** — `Ref.modify` takes a function that returns `[returnValue, newState]`. The return value comes first, the new state second. Getting this backwards means `getAndIncrement` returns the wrong value. Ask: "What does the tuple `[current, current + 1]` mean — which part is returned, which is stored?"
3. **Using `Ref.get` + `Ref.update` instead of `Ref.modify`** — for `getAndIncrement`, a separate get-then-update is not atomic. Between the read and the write, another fiber could modify the Ref. Ask: "What if two fibers call `getAndIncrement` at the same time with separate get and update?"
4. **Forgetting `yield*` on Ref operations** — `Ref.make`, `Ref.get`, `Ref.update`, and `Ref.modify` all return Effects. They must be yielded inside a generator. Ask: "What type does `Ref.make(0)` return?"
5. **`Ref.modify` returns `[returnValue, newState]`** — you need to return the current value AND set the new one in a single step. The function signature is `(current) => [valueToReturn, newState]`.

## On Completion

### Insight

Ref provides atomic state updates — no locks, no race conditions. `Ref.modify` is the fundamental operation: it atomically reads the current value AND computes the new value in one step. This is safe even with concurrent access. Unlike mutable variables, Ref operations are Effects — they compose, they're explicit about mutation, and the runtime guarantees atomicity.

### Bridge

You now have shared state with Ref and parallelism with `Effect.all`. But sometimes you need finer control over concurrent work — starting it, waiting for it, or cancelling it. Kata 020 introduces **Fibers**, Effect's lightweight unit of concurrency: `fork`, `join`, and `interrupt`.
