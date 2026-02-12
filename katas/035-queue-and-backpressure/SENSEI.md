# SENSEI — 035 Queue and Backpressure

## Briefing

### Goal

Use bounded `Queue` to implement producer-consumer patterns with automatic backpressure, coordinating data flow between fibers.

### Tasks

1. Implement `roundTrip(items)` — create a bounded queue with capacity equal to `items.length` (or 1 if empty), offer all items, then take them back in order
2. Implement `backpressureDemo()` — create a bounded queue of capacity 2, fork a producer that offers `[1, 2, 3]`, take 3 items from the main fiber. The producer will block on the 3rd offer until a take frees space.
3. Implement `producerConsumer(n)` — fork a producer that offers numbers `1..n` into a bounded queue, fork a consumer that takes `n` items and collects them, return the collected items

### Hints

```ts
import { Effect, Queue, Fiber } from "effect";

// Create a bounded queue
const program = Effect.gen(function* () {
  const queue = yield* Queue.bounded<number>(10);

  // Offer items
  yield* Queue.offer(queue, 1);
  yield* Queue.offer(queue, 2);

  // Take items (FIFO)
  const a = yield* Queue.take(queue);
  const b = yield* Queue.take(queue);

  return [a, b]; // [1, 2]
});

// Backpressure: offer blocks when queue is full
const backpressure = Effect.gen(function* () {
  const queue = yield* Queue.bounded<number>(2);
  // Fork producer — it will block on 3rd offer
  const producer = yield* Effect.fork(
    Effect.all([
      Queue.offer(queue, 1),
      Queue.offer(queue, 2),
      Queue.offer(queue, 3), // blocks until space opens
    ]),
  );
  // Consumer takes, freeing space
  const items = yield* Effect.all([
    Queue.take(queue),
    Queue.take(queue),
    Queue.take(queue),
  ]);
  yield* Fiber.join(producer);
  return items;
});
```

## Prerequisites

- **020 Fibers** — `Effect.fork`, `Fiber.join`, fiber lifecycle
- **034 Deferred and Coordination** — `Deferred`, one-shot synchronization
- **017 Parallel Effects** — `Effect.all`, concurrency

## Skills

Invoke `effect-patterns-concurrency-getting-started` before teaching this kata.

## Test Map

> **Note**: `Effect.runPromise` appears only in tests. Never attribute it to the user's learning.

| Test | Concept | Verifies |
|------|---------|----------|
| `roundTrip offers and takes items` | `Queue.bounded` + `offer` + `take` | Basic queue lifecycle with multiple items |
| `roundTrip works with empty array` | Edge case handling | Queue creation and empty iteration |
| `backpressureDemo collects all 3 items despite bounded queue` | Backpressure | Producer blocks when queue is full, consumer unblocks it |
| `producerConsumer collects n items` | Fork + Queue coordination | Full producer-consumer pattern with separate fibers |

## Teaching Approach

### Socratic prompts

- "What happens when a producer calls `Queue.offer` on a full bounded queue? Does it fail, drop the item, or do something else?"
- "In `backpressureDemo`, the queue has capacity 2 but the producer offers 3 items. How does the system avoid losing the third item without the producer explicitly waiting?"
- "Why use a bounded queue instead of an unbounded one? What problem does backpressure solve that an ever-growing buffer doesn't?"

### Common pitfalls

1. **Deadlocking by offering and taking in the wrong order** — If you offer more items than the queue capacity in the main fiber (without forking), the fiber blocks on `offer` and never reaches `take`. The producer must be in a separate fiber so the consumer can drain the queue. Ask: "If the queue is full and `offer` blocks, who will call `take` to free space?"
2. **Forgetting to join the producer fiber** — If you don't join the producer, the test may complete before the producer finishes offering. Always join to ensure all items are produced. Ask: "What guarantees that the producer has finished all its offers before you inspect the results?"
3. **Using `Queue.unbounded` instead of `Queue.bounded`** — Unbounded queues never block on offer, which means `backpressureDemo` won't demonstrate backpressure at all. The exercise specifically requires bounded queues. Ask: "What is the behavioral difference between `Queue.bounded(2)` and `Queue.unbounded`?"

## On Completion

### Insight

Bounded queues implement backpressure automatically: when the queue is full, producers suspend until consumers make space. This is a fundamental pattern in concurrent systems — it prevents fast producers from overwhelming slow consumers, avoiding unbounded memory growth. The beauty of Effect's `Queue` is that this coordination happens transparently: the producer just calls `offer`, the consumer just calls `take`, and the runtime handles the suspension and resumption. Combined with fibers, queues let you build robust data pipelines where the flow rate self-regulates.

### Bridge

You have now covered Effect's core coordination primitives: `Deferred` for one-shot signals and `Queue` for streaming data between fibers. These are the building blocks for the more advanced concurrency patterns you will encounter in real-world Effect applications.
