# SENSEI — 037 Cache and Memoization

## Briefing

### Goal

Learn to use Effect's `Cache` module to memoize effectful computations with capacity limits and time-to-live expiration.

### Tasks

1. Implement `makeUserCache` -- create a `Cache` with capacity 100 and 1-minute TTL using `Cache.make`
2. Implement `cachedLookup` -- retrieve a value from the cache by key
3. Implement `demonstrateCaching` -- combine a `Ref` counter with a cache to prove the lookup runs only once for repeated gets

### Hints

```ts
import { Cache, Duration, Effect, Ref } from "effect";

// Cache.make takes capacity, TTL, and a lookup function
const cache = Cache.make({
  capacity: 100,
  timeToLive: Duration.minutes(1),
  lookup: (key: string) => Effect.succeed(`value:${key}`),
});

// cache.get triggers the lookup on first call, returns cached on subsequent calls
const value = cache.pipe(Effect.flatMap((c) => c.get("myKey")));

// Ref for counting
const counter = Ref.make(0);
// Ref.update increments, Ref.get reads the current value
```

## Prerequisites

- **005 Pipe Composition** -- `pipe`, `Effect.flatMap`
- **019 Ref and State** -- `Ref.make`, `Ref.update`, `Ref.get`
- **003 Generator Pipelines** -- `Effect.gen`, `yield*`

## Test Map
> **Note**: `Effect.runPromise` appears only in tests. Never attribute it to the user's learning.

| Test | Concept | Verifies |
|------|---------|----------|
| `makeUserCache creates a cache` | `Cache.make` | Cache construction with capacity and TTL |
| `cachedLookup returns the computed value` | `cache.get` | First lookup triggers computation |
| `cachedLookup returns same value on repeated calls` | Cache memoization | Second lookup returns cached value, lookup count stays at 1 |
| `demonstrateCaching returns same value and only computes once` | `Ref` + `Cache` composition | End-to-end proof that caching prevents redundant computation |

## Teaching Approach

### Socratic prompts

- "`Cache.make` takes a `lookup` function that returns an `Effect`. Why must the lookup be effectful rather than a plain function?"
- "If you call `cache.get(\"alice\")` twice, the second call returns instantly. But what if the first call is still in-flight when the second arrives -- what should happen?"
- "The `demonstrateCaching` function needs to count how many times the lookup runs. You cannot use a mutable `let` variable inside an Effect pipeline. What Effect primitive lets you track mutable state safely?"

### Common pitfalls

1. **Forgetting that `Cache.make` returns an Effect** -- `Cache.make(...)` does not give you a cache directly; it gives you an `Effect<Cache<...>>`. You need to `yield*` or `flatMap` to get the actual cache. Ask: "What type does `Cache.make` return?"
2. **Using `cache.get` without understanding the lookup signature** -- the lookup function in `Cache.make` receives the key and must return an `Effect`. Students sometimes try to pass a synchronous function. Nudge: "Wrap your computation in `Effect.sync` or `Effect.succeed`."
3. **Counting calls with a plain variable** -- inside `Effect.gen`, a `let count = 0` will not work across multiple effect runs. Use `Ref.make(0)` and `Ref.update` to track state within the Effect world.

## On Completion

### Insight

`Cache` is a concurrency-safe, effectful memoization primitive. Unlike a simple `Map`, it handles concurrent requests for the same key by sharing the in-flight computation rather than duplicating work. The TTL and capacity parameters give you automatic eviction without manual cleanup. This is the Effect way of caching: declarative configuration, automatic lifecycle, and safe concurrency -- all managed by the runtime rather than hand-rolled logic.

### Bridge

You have learned to cache expensive computations. Kata 038 introduces `Metric` -- counters, histograms, and gauges that let you observe what your application is doing at runtime. Metrics and caching often work together: you might track cache hit rates with a counter.
