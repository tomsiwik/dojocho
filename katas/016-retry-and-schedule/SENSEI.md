# SENSEI — 016 Retry and Schedule

## Briefing

### Goal

Learn to retry failing effects and repeat successful ones using Schedules.

### Tasks

1. Implement `retryThreeTimes(effect)` — retry the given effect up to 3 times using `Schedule.recurs(3)`
2. Implement `flakyEffect(failCount)` — create an effect that fails `failCount` times then succeeds with `"done"` (use a `Ref` to track attempts)
3. Implement `repeatCollect(effect)` — repeat the effect 3 times using `Schedule.recurs(3)` and collect results

### Hints

```ts
import { Effect, Schedule } from "effect";

// Retry up to 3 times
const retried = Effect.retry(myEffect, Schedule.recurs(3));

// Repeat and collect results
const repeated = Effect.repeat(myEffect, Schedule.recurs(3));
```

## Prerequisites

- **001-015** — all prior katas (Basics, Error Handling, Error Patterns, Value Handling, Dependency Injection, Testing, Domain Modeling)

## Skills

Invoke `effect-patterns-scheduling` before teaching this kata.

## Concepts Practiced

APIs the user writes in `solution.ts`:

- `Effect.retry` — retry a failing effect according to a schedule
- `Schedule.recurs` — create a schedule that recurs a fixed number of times
- `Ref.make` — create a mutable reference for tracking state
- `Ref.get` — read the current value of a Ref
- `Ref.update` — modify the value inside a Ref
- `Effect.gen` — sequence Effects with generator syntax (review)
- `Effect.succeed` — create a successful Effect (review)
- `Effect.fail` — create a failed Effect (review)
- `Effect.repeat` — repeat a successful effect according to a schedule

> **Note**: `Effect.runSync`, `Effect.runSyncExit`, and `Effect.runPromise` appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `retryThreeTimes succeeds on first try` | `Effect.retry` | Pass-through when the effect already succeeds |
| `flakyEffect that fails 2 times then succeeds` | `Ref` + `Effect.retry` | Ref counting attempts across retries |
| `flakyEffect that fails 5 times still fails after 3 retries` | `Effect.retry` + `Schedule.recurs` | Retry exhaustion — schedule allows only 3 retries |
| `repeatCollect collects repeated values` | `Effect.repeat` | Repeating a successful effect and collecting results |

## Teaching Approach

### Socratic prompts

- "What's the difference between retrying and repeating? When does each apply?"
- "`Schedule.recurs(3)` is a value, not a function call that does something. What does that mean for how you use it?"
- "For `flakyEffect`, each retry re-runs the effect from scratch. How can you track how many times it's been called across retries?"
- "What does `Effect.repeat` return — the last value, or all of them? How would you collect all results?"

### Common pitfalls

1. **`flakyEffect` needs a Ref to track state across retries** — since each retry re-runs the effect, you can't use a local variable. The Ref persists across calls. Ask: "If the effect is re-run on each retry, where does the attempt count live?"
2. **`repeatCollect` needs to collect results** — `Effect.repeat` with `Schedule.recurs(3)` runs the effect 1 + 3 = 4 times. Look at the schedule's return type or use a Ref to accumulate. Ask: "How many times does the effect run with `recurs(3)`? The initial run plus 3 repeats."
3. **Confusing retry and repeat** — retry applies to failing effects (retries on failure), repeat applies to succeeding effects (repeats on success). Ask: "Does `retryThreeTimes` retry successes or failures?"
4. **Off-by-one with `Schedule.recurs`** — `recurs(3)` means 3 retries (not 3 total attempts). So the effect runs up to 4 times total. Check the test expectations carefully.

### When stuck

1. Start with `retryThreeTimes` — it's the simplest: "Just apply `Effect.retry` with `Schedule.recurs(3)` to the effect"
2. For `flakyEffect`: "Use `Effect.gen` to create a Ref, then on each call increment it and decide whether to fail or succeed based on the count"
3. For `repeatCollect`: "Think about how to accumulate results across repeats — a Ref<number[]> can collect each value"
4. Point to the Briefing hints for `Effect.retry` and `Schedule.recurs` patterns

## On Completion

### Insight

Schedules are composable descriptions of retry/repeat policies. `Schedule.recurs(3)` is a value, not imperative code. You can combine schedules with `Schedule.union` (either), `Schedule.intersect` (both), and pipe through transforms. This declarative approach makes complex retry logic readable — you describe *what* the policy is, not *how* to implement the loop.

### Bridge

Now that you can retry and repeat individual effects, the next step is running multiple effects **at the same time**. Kata 017 introduces `Effect.all` and `Effect.forEach` with concurrency options — parallelism as a configuration, not a rewrite.
