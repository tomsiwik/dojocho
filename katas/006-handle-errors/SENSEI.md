# SENSEI — 006 Handle Errors

## Briefing

### Goal

Create Effects that can fail, and recover from those failures.

### Tasks

1. Implement `divide(a, b)` — returns an Effect that divides `a / b`, failing with `{ _tag: "DivisionByZero" }` when `b === 0`
2. Implement `safeDivide(a, b)` — wraps `divide` and recovers from `DivisionByZero` by returning `0`
3. Implement `parseInteger(s)` — parses a string to int, failing with `{ _tag: "ParseError", input: s }` on invalid input

### Hints

```ts
import { Effect } from "effect";

// Effect.fail creates a failed Effect
const failed = Effect.fail({ _tag: "MyError" as const });

// catchAll recovers from any error
const recovered = Effect.catchAll(failed, (error) =>
  Effect.succeed("fallback"),
);

// catchTag recovers from a specific tagged error
const recovered2 = Effect.catchTag(failed, "MyError", (error) =>
  Effect.succeed("recovered"),
);
```

## Prerequisites

- **001 Hello Effect** — `Effect.succeed`, `Effect.sync`
- **002 Transform with Map** — `Effect.map`, `pipe`
- **003 Generator Pipelines** — `Effect.gen`, `yield*`, `Effect.fail`
- **004 FlatMap and Chaining** — `Effect.flatMap`, `Effect.andThen`, `Effect.tap`
- **005 Pipe Composition** — `pipe`, `.pipe()`, composition

## Skills

Invoke `effect-patterns-error-handling` before teaching this kata.

## Concepts Practiced

APIs the user writes in `solution.ts`:

- `Effect.succeed` — wrap a successful result
- `Effect.fail` — create a failed Effect with a typed error
- `Effect.catchAll` — recover from any error by providing an alternative Effect
- `Effect.catchTag` — recover from a specific tagged error

> **Note**: `Effect.runSync`, `Effect.runSyncExit`, and `Exit.isFailure` appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `divide(10, 2) succeeds with 5` | `Effect.succeed` | Happy path — normal division |
| `divide(10, 0) fails with DivisionByZero` | `Effect.fail` | Error path — division by zero |
| `safeDivide(10, 2) succeeds with 5` | `Effect.catchAll` or `Effect.catchTag` | Recovery pass-through on success |
| `safeDivide(10, 0) recovers with 0` | `Effect.catchAll` or `Effect.catchTag` | Recovery — returning a default on error |
| `parseInteger('42') succeeds with 42` | `Effect.succeed` | Parsing a valid positive integer |
| `parseInteger('-7') succeeds with -7` | `Effect.succeed` | Parsing a valid negative integer |
| `parseInteger('abc') fails with ParseError` | `Effect.fail` | Non-numeric input |
| `parseInteger('3.14') fails with ParseError` | `Effect.fail` | Float input rejected |

## Teaching Approach

### Socratic prompts

- "In regular TypeScript, division by zero gives `Infinity`. What if you want to treat it as an error instead?"
- "What does the type `Effect<number, DivisionByZero>` tell you that `number` alone doesn't?"
- "`safeDivide` has no error type — `Effect<number>`. How did the error disappear? Where did it go?"
- "What's the difference between `catchAll` and `catchTag`? When would you prefer one over the other?"

### Common pitfalls

1. **Forgetting to check for zero** — `divide` needs an explicit check before dividing. Ask: "What should `divide` do first — compute the result or check the divisor?"
2. **Using try/catch instead of Effect.fail** — students coming from imperative code may wrap division in try/catch. Nudge: "In Effect, errors are values, not exceptions. How do you create an error value?"
3. **Double-wrapping in safeDivide** — students may try `Effect.succeed(divide(a, b))` instead of calling `divide` and catching errors. Ask: "What does `divide(a, b)` return? Is it a plain number or an Effect?"
4. **ParseError for integers** — `parseInt('3.14')` returns `3`, not `NaN`. Students need to check that the string represents a whole number. Ask: "Does `parseInt('3.14')` fail? How do you detect that `'3.14'` isn't an integer?"

### When stuck

1. Start with `divide` — "Check the divisor first. If it's zero, fail. Otherwise, succeed with the result."
2. For `safeDivide`: "Call `divide`, then use `catchAll` to turn any error into `Effect.succeed(0)`"
3. For `parseInteger`: "Use `parseInt`, check if the result is `NaN`, and also verify the original string is a valid integer"
4. Point to the Briefing Hints section above and the error type definitions in solution.ts

## On Completion

### Insight

Effect errors are typed — the type system tracks exactly what can go wrong. Unlike try/catch where errors are `unknown`, an `Effect<number, DivisionByZero>` tells you at the type level that this computation either produces a number or fails with a `DivisionByZero`. When you use `catchAll` or `catchTag` to handle all possible errors, the error channel becomes `never` — the compiler proves your code handles every failure case.

### Bridge

Now that you can create and catch errors, the next step is making them richer. Kata 007 introduces `Data.TaggedError` — class-based errors with `_tag` discrimination that enable `catchTag` to selectively recover from specific error types while letting others propagate.
