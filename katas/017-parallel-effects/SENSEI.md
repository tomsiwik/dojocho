# SENSEI — 017 Parallel Effects

## Briefing

### Goal

Run multiple effects concurrently and control parallelism.

### Tasks

1. Implement `fetchAll(effects)` — run all effects in parallel and collect results
2. Implement `processWithLimit(items, fn)` — apply `fn` to each item with at most 3 concurrent operations

### Hints

```ts
import { Effect } from "effect";

// Run all in parallel
const results = Effect.all(effects, { concurrency: "unbounded" });

// Bounded concurrency
const processed = Effect.forEach(items, fn, { concurrency: 3 });
```

## Prerequisites

- **001-016** — all prior katas (Basics through Scheduling)

## Skills

Invoke `effect-patterns-concurrency` before teaching this kata.

## Concepts Practiced

APIs the user writes in `solution.ts`:

- `Effect.all` — run multiple effects and collect results, with optional concurrency
- `Effect.forEach` — apply an effectful function to each item in a collection, with optional concurrency

> **Note**: `Effect.runSync` and `Effect.runSyncExit` appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `fetchAll runs effects and collects results` | `Effect.all` | Running effects in parallel and collecting results |
| `fetchAll fails if any effect fails` | `Effect.all` | Error propagation — one failure fails the whole batch |
| `processWithLimit applies function to each item` | `Effect.forEach` | Applying a function to each item with bounded concurrency |
| `processWithLimit fails if any processing fails` | `Effect.forEach` | Error propagation through forEach |

## Teaching Approach

### Socratic prompts

- "You already know `Effect.all` from sequential use. What single option turns it parallel?"
- "What's the difference between `concurrency: 'unbounded'` and `concurrency: 3`? When would you choose each?"
- "`Effect.forEach` looks like `Array.map` but effectful. What extra capability does the concurrency option give you?"
- "If one effect in `fetchAll` fails, what happens to the others?"

### Common pitfalls

1. **Forgetting the concurrency option** — without `{ concurrency: "unbounded" }`, `Effect.all` runs sequentially. The tests pass either way for correctness, but the kata is about parallelism. Ask: "Is your code actually running in parallel, or just sequentially?"
2. **Using `Effect.all` instead of `Effect.forEach` for `processWithLimit`** — `Effect.forEach` takes a collection and a function, while `Effect.all` takes pre-built effects. Ask: "You have items and a function. Which combinator takes both?"
3. **Wrong concurrency value for `processWithLimit`** — the function should limit to 3 concurrent operations. Check: "What does `{ concurrency: 3 }` mean exactly?"

### When stuck

1. Start with `fetchAll` — it's a single function call: "Pass the array of effects to `Effect.all` with the right options"
2. For `processWithLimit`: "Think of it as `Array.map` but each mapping produces an Effect. Which Effect function does this?"
3. Point to the Briefing hints for `Effect.all` and `Effect.forEach` patterns

## On Completion

### Insight

`Effect.all` and `Effect.forEach` are the same functions you'd use sequentially — the `{ concurrency }` option is the only difference. Effect makes parallelism a configuration change, not a rewrite. You don't need `Promise.all` or manual thread management. Sequential, bounded parallel, or unbounded parallel — it's one option away.

### Bridge

Running effects in parallel is powerful, but sometimes you want **competition** rather than **cooperation** — the first to finish wins. Kata 018 introduces `Effect.race` and timeout patterns for when speed matters more than completeness.
