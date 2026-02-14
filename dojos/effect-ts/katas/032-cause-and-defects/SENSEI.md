# SENSEI — 032 Cause and Defects

## Briefing

### Goal

Understand Effect's two-tier error model: expected failures (`Effect.fail`) vs unexpected defects (`Effect.die`), and the tools to inspect and recover from each.

### Tasks

1. Implement `boom` — an effect that dies with the string `"boom"`
2. Implement `catchDefect(effect)` — catch any defect; if it's an `Error`, return its `.message`; otherwise return `"unknown defect"`. Normal successes pass through unchanged.
3. Implement `sandboxed(effect)` — use `Effect.sandbox` to expose the full `Cause`, then map the cause back to a string error
4. Implement `safeDivide(n)` — die if `n < 0`, fail with `"zero"` if `n === 0`, succeed with `n` otherwise

### Hints

```ts
import { Cause, Effect } from "effect";

// Die with a defect (unrecoverable by default)
const defect = Effect.die("something unexpected");

// Catch defects
const recovered = Effect.catchAllDefect(myEffect, (defect) => {
  if (defect instanceof Error) return Effect.succeed(defect.message);
  return Effect.succeed("unknown defect");
});

// Sandbox exposes the full Cause
const exposed = Effect.sandbox(myEffect);
// exposed has error type Cause<OriginalError>

// Catch the sandboxed cause and extract failures
const handled = exposed.pipe(
  Effect.catchAll((cause) => {
    const failures = Cause.failures(cause); // Chunk of original errors
    return Effect.fail(Array.from(failures)[0] ?? "unknown");
  }),
);
```

## Prerequisites

- **006 Handle Errors** — `Effect.catchAll`, `Effect.catchTag`
- **007 Tagged Errors** — `Data.TaggedError` patterns
- **008 Error Patterns** — `Effect.mapError`, `Effect.catchSome`

## Skills

Invoke `effect-patterns-error-handling` before teaching this kata.

## Test Map

> **Note**: `Effect.runSyncExit`, `Exit.isFailure`, and `Cause.isDie` appear only in tests. Never attribute them to the user's learning.

| Test | Concept | Verifies |
|------|---------|----------|
| `boom dies with 'boom'` | `Effect.die` | Creating a defect (not a typed failure) |
| `catchDefect recovers from a die` | `Effect.catchAllDefect` | Recovering from a string defect |
| `catchDefect recovers from an Error defect` | `Effect.catchAllDefect` | Extracting `.message` from Error defects |
| `catchDefect passes through normal values` | `Effect.catchAllDefect` | Defect recovery does not interfere with success |
| `sandboxed exposes cause on failure` | `Effect.sandbox` | Converting typed errors to `Cause` for full inspection |
| `safeDivide succeeds with positive numbers` | `Effect.succeed` | Happy path branching |
| `safeDivide fails with 'zero' for 0` | `Effect.fail` | Expected failure branch |
| `safeDivide dies for negative numbers` | `Effect.die` | Defect branch for truly invalid input |

## Teaching Approach

### Socratic prompts

- "What is the difference between `Effect.fail('error')` and `Effect.die('error')`? If both stop execution, why have two mechanisms?"
- "`Effect.catchAll` handles typed failures. What happens if you use `catchAll` on an effect that dies — does it catch the defect?"
- "When would you intentionally use `Effect.die` in your own code? What kind of errors deserve to be defects rather than typed failures?"

### Common pitfalls

1. **Using `Effect.fail` instead of `Effect.die` for `boom`** — `fail` creates a typed, recoverable error. `die` creates an unrecoverable defect. The test checks for `Cause.isDie`. Ask: "What does the test expect to find in the Cause — a `Fail` or a `Die`?"
2. **Forgetting that `catchAllDefect` receives the raw defect, not a Cause** — The callback gets whatever value was passed to `Effect.die`. It might be a string, an Error, or anything. You need to check its type. Ask: "If someone calls `Effect.die(42)`, what type does your defect handler receive?"
3. **Confusing `sandbox` with `catchAllDefect`** — `sandbox` changes the error channel to `Cause<E>`, exposing the full error model. `catchAllDefect` specifically intercepts defects. For `sandboxed`, you need to work with the Cause type. Ask: "After `Effect.sandbox`, what is the new error type of the effect?"

## On Completion

### Insight

Effect's error model has two layers by design. Typed failures (`Effect.fail`) represent expected, recoverable business errors — they appear in the type signature and must be handled. Defects (`Effect.die`) represent bugs, assertion violations, or truly unexpected crashes — they propagate silently through `catchAll` and only surface when you explicitly use `catchAllDefect` or `sandbox`. This separation keeps your typed error channel meaningful: if the types say the only error is `NotFoundError`, you can trust that. Defects are for things that "should never happen" — and when they do, `Cause` gives you the full forensic picture including stack traces, parallel failures, and interruption.

### Bridge

You now understand Effect's complete error hierarchy. Kata 033 shifts to a different kind of safety: exhaustive pattern matching with `Match`, ensuring every case is handled at compile time rather than runtime.
