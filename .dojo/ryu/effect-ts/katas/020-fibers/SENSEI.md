# SENSEI — 020 Fibers

## Briefing

### Goal

Work with fibers for lightweight concurrency, forking, joining, and interruption.

### Tasks

1. Implement `forkAndJoin(effect)` — fork the effect into a fiber, then join it to get the result
2. Implement `forkBoth(a, b)` — fork two effects, join both, return results as a tuple
3. Implement `forkAndInterrupt(effect)` — fork the effect, interrupt the fiber, return `"interrupted"`

### Hints

```ts
import { Effect, Fiber } from "effect";

// Fork and join
const program = Effect.gen(function* () {
  const fiber = yield* Effect.fork(myEffect);
  const result = yield* Fiber.join(fiber);
  return result;
});

// Interrupt a fiber
const interrupted = Effect.gen(function* () {
  const fiber = yield* Effect.fork(longRunning);
  yield* Fiber.interrupt(fiber);
  return "interrupted";
});
```

## Prerequisites

- **017 Parallel Effects** — `Effect.all`, concurrency
- **018 Race and Timeout** — `Effect.race`, `Effect.timeout`
- **019 Ref and State** — `Ref`, shared state

## Skills

Invoke `effect-patterns-concurrency-getting-started` before teaching this kata.

> **Note**: `Effect.runPromise` and `Effect.delay` appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `forkAndJoin returns the effect result` | `Effect.fork` + `Fiber.join` | Fork then join to get the result |
| `forkBoth returns both results` | `Effect.fork` + `Fiber.join` | Forking two fibers and joining both |
| `forkAndInterrupt returns 'interrupted'` | `Effect.fork` + `Fiber.interrupt` | Forking then cancelling a fiber |

## Teaching Approach

### Socratic prompts

- "What's the difference between `Effect.fork` and just running an effect? What does fork give you back?"
- "If `fork` returns a `Fiber`, how do you eventually get the result out of it?"
- "What happens when you interrupt a fiber — does it throw? Does it return a value? What does the calling code do next?"
- "How are fibers different from JavaScript Promises? Can you cancel a Promise?"

### Common pitfalls

1. **`forkAndInterrupt` — trying to get a result from an interrupted fiber** — after `Fiber.interrupt`, the fiber is done. Don't try to `Fiber.join` it expecting a value. Just return the string `"interrupted"` directly. Ask: "After interrupting the fiber, what do you need to return? Where does that value come from?"
2. **Forgetting `yield*` on fork/join** — `Effect.fork` and `Fiber.join` both return Effects. They must be yielded. Ask: "What type does `Effect.fork(myEffect)` return?"
3. **`forkBoth` — joining sequentially vs concurrently** — you can join two fibers one after another since they're already running concurrently (they were forked). The join just waits for completion. Ask: "If both fibers are already running, does the order you join them matter for correctness?"
4. **Confusing fork with Effect.all** — `Effect.all` handles parallelism for you. `fork` gives you the fiber handle for manual control. Ask: "When would you choose `fork` over `Effect.all`?"
5. **`forkBoth` is the pattern twice** — fork both effects to get two fibers, then join both fibers. Combine the two results into a tuple `[resultA, resultB]`.

## On Completion

### Insight

Fibers are Effect's unit of concurrency — lighter than threads, managed by the runtime. `fork` starts concurrent work, `join` waits for it, `interrupt` cancels it. Unlike raw Promises, fibers support structured concurrency: when a parent fiber is interrupted, all its children are too. This means no orphaned background work, no resource leaks from forgotten tasks. The runtime manages the lifecycle for you.

### Bridge

Concurrency is about managing running computations. But what about managing **resources** — things that need to be acquired and then reliably released? Kata 021 starts the Resource Management area with `acquireRelease` and `Scope` — ensuring cleanup happens even when things go wrong.
