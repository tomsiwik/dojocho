# SENSEI — 034 Deferred and Coordination

## Briefing

### Goal

Use `Deferred` to coordinate between fibers, implementing one-shot signaling patterns for synchronization.

### Tasks

1. Implement `completeAndAwait(value)` — create a `Deferred`, immediately complete it with the given value, then await it
2. Implement `forkThenComplete(value)` — create a `Deferred`, fork a fiber that awaits it, complete the deferred from the main fiber, then join the forked fiber to get the result
3. Implement `gatedExecution(a, b)` — create a `Deferred` as a "gate", fork two fibers that each await the gate and then return their respective value, open the gate, join both fibers, return the results as a tuple

### Hints

```ts
import { Deferred, Effect, Fiber } from "effect";

// Create and use a Deferred
const program = Effect.gen(function* () {
  const deferred = yield* Deferred.make<string>();
  yield* Deferred.succeed(deferred, "hello");
  const value = yield* Deferred.await(deferred);
  return value; // "hello"
});

// Fork a waiter, then signal it
const coordination = Effect.gen(function* () {
  const gate = yield* Deferred.make<void>();
  const fiber = yield* Effect.fork(
    Effect.gen(function* () {
      yield* Deferred.await(gate);
      return "started!";
    }),
  );
  yield* Deferred.succeed(gate, undefined);
  return yield* Fiber.join(fiber);
});
```

## Prerequisites

- **020 Fibers** — `Effect.fork`, `Fiber.join`, fiber lifecycle
- **017 Parallel Effects** — `Effect.all`, concurrency
- **019 Ref and State** — Shared mutable state between fibers

## Skills

Invoke `effect-patterns-concurrency-getting-started` before teaching this kata.

## Test Map

> **Note**: `Effect.runPromise` appears only in tests. Never attribute it to the user's learning.

| Test | Concept | Verifies |
|------|---------|----------|
| `completeAndAwait resolves with the value` | `Deferred.make` + `succeed` + `await` | Basic deferred lifecycle with a number |
| `completeAndAwait works with strings` | `Deferred.make` + `succeed` + `await` | Deferred is generic over the value type |
| `forkThenComplete coordinates via deferred` | `Effect.fork` + `Deferred.await` + `Deferred.succeed` | Cross-fiber signaling |
| `gatedExecution both fibers run after gate opens` | Multiple fibers + shared `Deferred` | Gate pattern — multiple waiters, single signal |

## Teaching Approach

### Socratic prompts

- "A `Deferred` can only be completed once. What happens if you try to `Deferred.succeed` a second time? Why is this one-shot design useful for coordination?"
- "In `forkThenComplete`, the forked fiber calls `Deferred.await` — what does that fiber do while waiting? How is this different from a busy loop or polling?"
- "The gate pattern uses a single `Deferred` to unblock multiple fibers. Could you achieve the same thing with a `Ref`? What would be different?"

### Common pitfalls

1. **Completing the deferred after awaiting it (deadlock)** — If you `await` a deferred in the same fiber that needs to `succeed` it, you'll block forever. The completion must happen from a different fiber or before the await. Ask: "Which fiber completes the deferred, and which one waits? Can the same fiber do both sequentially?"
2. **Forgetting to join forked fibers** — Forking a fiber starts it, but you must `Fiber.join` to get the result. Without joining, the fiber's result is discarded and the test won't get the expected value. Ask: "After forking a fiber, how do you get its result back into the main fiber?"
3. **Not specifying the type parameter on `Deferred.make`** — `Deferred.make<A>()` needs a type parameter so TypeScript knows what the deferred will hold. If you omit it, type inference might not work as expected. Ask: "What type should the deferred hold for each function?"

## On Completion

### Insight

`Deferred` is Effect's primitive for one-shot synchronization. Unlike `Ref` (which can be updated many times), a `Deferred` transitions exactly once from "pending" to "completed." This makes it perfect for signaling: "the config is loaded," "the connection is ready," "all workers can start." Fibers that `await` a pending deferred are suspended without consuming CPU — the runtime resumes them when the deferred is completed. This is the building block for more sophisticated coordination patterns like barriers, latches, and rendezvous points.

### Bridge

`Deferred` coordinates fibers with a single signal. But what if fibers need to exchange a continuous stream of values? Kata 035 introduces `Queue` — Effect's bounded, backpressure-aware channel for producer-consumer communication.
