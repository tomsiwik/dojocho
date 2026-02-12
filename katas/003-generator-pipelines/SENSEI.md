# SENSEI — 003 Generator Pipelines

## Briefing

### Goal

Use `Effect.gen` to write imperative-style Effect pipelines with generators.

### Tasks

1. Implement `fetchAndDouble(n)` — uses `Effect.gen` to get a value, double it, and return it
2. Implement `combinedLength(a, b)` — uses `Effect.gen` to get lengths of two strings and add them
3. Implement `pipeline(s)` — uses `Effect.gen` to parse an integer string, double it, and format as `"Result: {n}"`; fails with `ParseError` on invalid input

### Hints

```ts
import { Effect } from "effect";

const program = Effect.gen(function* () {
  const a = yield* Effect.succeed(10);
  const b = yield* Effect.succeed(20);
  return a + b;
});

// Effect.runSync(program) => 30
```

## Prerequisites

- **001 Hello Effect** — `Effect.succeed`, `Effect.sync`
- **002 Transform with Map** — `Effect.map`, `pipe`

## Skills

None — continuing in the Basics area.

## Concepts Practiced

APIs the user writes in `solution.ts`:

- `Effect.gen` — create Effects using generator syntax
- `yield*` — unwrap an Effect's success value inside a generator
- `Effect.succeed` — create successful Effects (review)
- `Effect.fail` — create a failed Effect with a typed error

> **Note**: `Effect.runSync`, `Effect.runSyncExit`, and `Exit.isFailure` appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `fetchAndDouble(5) succeeds with 10` | `Effect.gen` + `yield*` | Basic generator with single yield |
| `fetchAndDouble(0) succeeds with 0` | `Effect.gen` | Edge case |
| `combinedLength('hello', 'world') succeeds with 10` | `Effect.gen` + multiple `yield*` | Combining results from multiple Effects |
| `combinedLength('', 'test') succeeds with 4` | `Effect.gen` | Empty string edge case |
| `pipeline('5') succeeds with 'Result: 10'` | `Effect.gen` | Multi-step pipeline in generator |
| `pipeline('0') succeeds with 'Result: 0'` | `Effect.gen` | Edge case |
| `pipeline('abc') fails with ParseError` | `Effect.fail` | Error handling inside generator |

## Teaching Approach

### Socratic prompts

- "In kata 002 you used `pipe` + `map`. What if you want to use an intermediate value in a later step — how would you do that with just `map`?"
- "What does `yield*` do to an Effect? What type does the variable get?"
- "Inside `Effect.gen`, if you `yield*` an Effect that fails, what happens to the rest of the generator?"

### Common pitfalls

1. **Forgetting `yield*`** — writing `const x = Effect.succeed(5)` inside a generator gives you an Effect, not the value 5. Ask: "What's the type of `x` without `yield*`?"
2. **Using `return` vs `yield*` for the final value** — the last expression in `Effect.gen` should be a plain `return`, not `yield* Effect.succeed(...)`. Nudge: "You can just `return` the computed value directly."
3. **ParseError shape** — the `pipeline` function needs to fail with `{ _tag: "ParseError", input: s }`. Students may forget the `input` field. Ask: "What does the `ParseError` interface require?"
4. **Checking for NaN** — `parseInt("abc")` returns `NaN`, not an error. Ask: "How do you detect when parsing didn't work?"

### When stuck

1. Start with `fetchAndDouble` — it's just `yield*` an Effect, transform, return: "Write `Effect.gen(function* () { ... })` and yield a succeed"
2. For `combinedLength`: "Same pattern but with two yields — how do you combine the results?"
3. For `pipeline`: "Break it into three steps: parse, check validity, format. Which step might fail?"
4. Point to the `ParseError` interface in solution.ts — it defines exactly what the error must look like

## On Completion

### Insight

Generators give you imperative-style code that's still fully Effect-powered. Each `yield*` is a suspension point — if any yielded Effect fails, the generator short-circuits, just like `throw` in regular code. You now have two styles: `pipe` chains (functional) and `gen` blocks (imperative). Neither is "better" — use whichever reads more clearly for the situation.

### Bridge

Generators and pipe both sequence Effects, but they hide the underlying mechanism: `Effect.flatMap`. Kata 004 makes flatMap explicit, along with `andThen` and `tap` — giving you direct control over how Effects chain together.
