# SENSEI — 018 Race and Timeout

## Briefing

### Goal

Race effects against each other and apply timeouts with fallbacks.

### Tasks

1. Implement `raceTwo(a, b)` — race two effects, returning whichever succeeds first
2. Implement `withTimeout(effect, duration)` — add a timeout that fails with `"timeout"` if exceeded
3. Implement `withTimeoutFallback(effect, duration, fallback)` — return a fallback value if the effect times out

### Hints

```ts
import { Effect, Duration } from "effect";

// Race two effects
const winner = Effect.race(effectA, effectB);

// Timeout with failure
const timed = Effect.timeoutFail(myEffect, {
  duration: "5 seconds",
  onTimeout: () => "timeout",
});

// Timeout with fallback
const safe = myEffect.pipe(
  Effect.timeout("5 seconds"),
  Effect.map(Option.getOrElse(() => fallback)),
);
```

## Prerequisites

- **017 Parallel Effects** — `Effect.all`, `Effect.forEach`, concurrency options

> **Note**: `Effect.runSync`, `Effect.runPromise`, and `Effect.delay` appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `raceTwo returns the faster result` | `Effect.race` | First-to-finish semantics |
| `withTimeout succeeds within time` | `Effect.timeoutFail` | Timeout with custom error — success path |
| `withTimeout fails when effect exceeds duration` | `Effect.timeoutFail` | Timeout with custom error — failure path |
| `withTimeoutFallback returns fallback on slow effect` | `Effect.timeout` + fallback | Timeout producing a fallback value |

## Teaching Approach

### Socratic prompts

- "What happens to the loser in a race? Does it keep running?"
- "For `withTimeout`, you need to fail with a specific string on timeout. Which timeout variant lets you specify a custom error?"
- "For `withTimeoutFallback`, `Effect.timeout` doesn't fail — it wraps the result in `Option`. How do you handle the `None` case?"
- "How is racing different from running two effects in parallel with `Effect.all`?"

### Common pitfalls

1. **`withTimeout` — using `Effect.timeout` instead of `Effect.timeoutFail`** — `Effect.timeout` wraps the result in Option and never fails on timeout. `Effect.timeoutFail` lets you specify a custom error. Ask: "Does this function need to fail on timeout, or return a fallback?"
2. **`withTimeoutFallback` — not handling the Option** — `Effect.timeout` changes the success type from `A` to `Option<A>`. You need to unwrap it with `Option.getOrElse` (via `Effect.map`) or another approach. Ask: "What's the type of the effect after applying `Effect.timeout`?"
3. **Duration import** — the functions take `Duration.DurationInput`, which accepts strings like `"1 second"`. Students don't need to construct Duration objects manually.
4. **`withTimeout` uses `Effect.timeoutFail`** — it takes the effect, a duration, and a function that creates the error. Don't confuse with `Effect.timeout` which wraps in Option instead of failing.

## On Completion

### Insight

Racing and timeout are composition patterns — you wrap existing effects with timing constraints. The original effect doesn't change; you add behavior around it. This is the power of Effect's compositional model: `race`, `timeout`, `timeoutFail` are all decorators that modify when and how an effect completes, without touching its internal logic.

### Bridge

You've seen concurrency through parallel execution (017) and racing (018). But concurrent code often needs **shared state**. Kata 019 introduces `Ref` — Effect's atomic mutable reference that makes shared state safe without locks or race conditions.
