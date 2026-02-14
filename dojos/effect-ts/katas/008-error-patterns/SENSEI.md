# SENSEI — 008 Error Patterns

## Briefing

### Goal

Master advanced error handling patterns using catchTags, orElse, and match.

### Tasks

1. Implement `handleAllErrors` — use `Effect.catchTags` to handle NetworkError, TimeoutError, and AuthError differently
2. Implement `withFallback` — use `Effect.orElse` to try a primary effect, falling back on failure
3. Implement `toResult` — use `Effect.match` to wrap success as "ok: {value}" and failure as "err: {error}"

### Hints

```ts
import { Effect } from "effect";

// catchTags handles each tagged error by _tag
const handled = effect.pipe(
  Effect.catchTags({
    NetworkError: (e) => Effect.succeed(`network: ${e.url}`),
    TimeoutError: (e) => Effect.succeed(`timeout: ${e.ms}`),
  })
);

// orElse runs fallback if primary fails
const withFallback = primary.pipe(Effect.orElse(() => fallback));

// match folds both channels into a single success value
const matched = effect.pipe(
  Effect.match({
    onFailure: (e) => `err: ${e}`,
    onSuccess: (a) => `ok: ${a}`,
  })
);
```

## Prerequisites

- **006 Handle Errors** — `Effect.fail`, `Effect.catchAll`, `Effect.catchTag`
- **007 Tagged Errors** — `Data.TaggedError`, selective recovery

## Skills

Invoke `effect-patterns-error-handling-resilience` before teaching this kata.

> **Note**: `Effect.runSync` appears only in tests. Never attribute it to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `handleAllErrors handles NetworkError` | `Effect.catchTags` | Recovery from NetworkError |
| `handleAllErrors handles TimeoutError` | `Effect.catchTags` | Recovery from TimeoutError |
| `handleAllErrors handles AuthError` | `Effect.catchTags` | Recovery from AuthError |
| `handleAllErrors passes through success` | `Effect.catchTags` | Success is unaffected |
| `withFallback uses primary on success` | `Effect.orElse` | Primary Effect succeeds — fallback not used |
| `withFallback uses fallback on failure` | `Effect.orElse` | Primary Effect fails — fallback takes over |
| `toResult wraps success` | `Effect.match` | Success path folded to string |
| `toResult wraps failure` | `Effect.match` | Failure path folded to string |

## Teaching Approach

### Socratic prompts

- "In kata 007 you used `catchTag` for one error type. What if you have three different error types to handle? Would you chain three `catchTag` calls?"
- "`catchTags` takes an object with handlers. What happens to the error channel if you handle every possible error type?"
- "`orElse` ignores the original error and tries something else. How is that different from `catchAll`?"
- "`match` handles both success and failure. What type does the result have — can it still fail?"

### Common pitfalls

1. **Incomplete `catchTags` object** — if the effect has three error types, the handler object needs all three keys. The compiler will tell you if you miss one. Ask: "What errors can this effect produce? Does your handler cover all of them?"
2. **Confusing `orElse` and `catchAll`** — `orElse` takes a function that returns an Effect (ignoring the error), while `catchAll` receives the error as a parameter. Ask: "Do you need to inspect the error, or just try something else entirely?"
3. **`match` return types** — both the success and failure handlers in `match` must return the same type. Ask: "If success returns a string, what must failure return?"
4. **`withFallback` error type** — when both primary and fallback can fail, the resulting error type is the fallback's error type. Students may be surprised that the primary's error disappears.
5. **Start with `handleAllErrors`** — use `Effect.catchTags` with an object mapping each `_tag` to a recovery function; check the error type definitions in solution.ts for the exact `_tag` values to handle.

## On Completion

### Insight

`catchTags` is exhaustive — if you handle all error types, the error channel becomes `never`. This is the compiler helping you handle every case. `orElse` is for "try plan B" scenarios where you don't care why plan A failed. `match` collapses both channels into one, eliminating the error type entirely. Together with `catchAll` and `catchTag` from earlier katas, you now have a complete toolkit for error recovery.

### Bridge

Error handling is now complete. The next area is **Value Handling** — starting with `Option` in kata 009. Option represents values that might not exist, which is different from errors. Use Option when absence is a normal case (e.g., looking up a key), not an exceptional condition.
