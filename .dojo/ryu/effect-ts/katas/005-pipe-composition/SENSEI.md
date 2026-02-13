# SENSEI — 005 Pipe Composition

## Briefing

### Goal

Compose multi-step Effect transformations using pipe and the fluent `.pipe()` style.

### Tasks

1. Implement `processNumber(n)` — pipe a number through: double, add 1, convert to string
2. Implement `processUser(name, age)` — pipe through validation and formatting using `.pipe()`
3. Implement `pipeline(s)` — compose parse, validate, and format using `.pipe()` chaining

### Hints

```ts
import { Effect, pipe } from "effect";

// Standalone pipe function
const result = pipe(
  Effect.succeed(10),
  Effect.map((n) => n * 2),
  Effect.map((n) => `Result: ${n}`)
);

// Fluent .pipe() style
const fluent = Effect.succeed("hello").pipe(
  Effect.map((s) => s.toUpperCase()),
  Effect.map((s) => `${s}!`)
);
```

## Prerequisites

- **001 Hello Effect** — `Effect.succeed`, `Effect.sync`
- **002 Transform with Map** — `Effect.map`, `pipe`
- **003 Generator Pipelines** — `Effect.gen`, `yield*`, `Effect.fail`
- **004 FlatMap and Chaining** — `Effect.flatMap`, `Effect.andThen`, `Effect.tap`

> **Note**: `Effect.runSync`, `Effect.runSyncExit`, and `Exit.isFailure` appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `processNumber(5) succeeds with '11'` | `pipe` + `Effect.map` | Multi-step: double, +1, toString |
| `processNumber(0) succeeds with '1'` | `pipe` | Edge case — 0 doubled + 1 = 1 |
| `processUser('Alice', 30) succeeds with 'Alice (age 30)'` | `.pipe()` + `Effect.flatMap` | Fluent style with validation |
| `processUser('', 30) fails with 'InvalidName'` | `.pipe()` + `Effect.fail` | Validation — empty name |
| `processUser('Alice', -1) fails with 'InvalidAge'` | `.pipe()` + `Effect.fail` | Validation — negative age |
| `pipeline('5') succeeds with 'Value: 5'` | `.pipe()` composition | Parse + validate + format |
| `pipeline('abc') fails` | `.pipe()` + `Effect.fail` | Parse failure |
| `pipeline('-3') fails with not positive` | `.pipe()` + `Effect.fail` | Validation failure |

## Teaching Approach

### Socratic prompts

- "You've used `pipe` before in kata 002. What's different about using `.pipe()` as a method on an Effect?"
- "For `processNumber`, the steps are: double, add 1, to string. Which operator works for each step?"
- "In `processUser`, you need to validate TWO things before formatting. What happens if the first validation fails — does the second one run?"
- "For `pipeline`, there are three phases: parse, validate, format. Which might fail? What error should each produce?"

### Common pitfalls

1. **Standalone `pipe()` vs fluent `.pipe()`** — both work the same way but read differently. `pipe(value, fn1, fn2)` vs `value.pipe(fn1, fn2)`. Ask: "Which style makes this code more readable?"
2. **Validation ordering in `processUser`** — students may validate name and age in a single step. Nudge: "What if name is empty AND age is negative? Which error should win? Check the tests."
3. **Parse + validate confusion in `pipeline`** — parsing and positivity check are separate concerns. Ask: "What does `parseInt` return for `'abc'`? How about `'-3'` — does it parse? Is it positive?"
4. **String conversion** — `processNumber` needs the final value as a string. Students may forget the `String()` or template literal step.
5. **Start with `processNumber`** — it's pure `pipe` + `map`, no errors: three maps in a row (double, add one, stringify).

## On Completion

### Insight

You've now completed the Basics area. You can create Effects (`succeed`, `sync`, `fail`), transform them (`map`), chain them (`flatMap`, `andThen`), observe them (`tap`), sequence them with generators (`gen`, `yield*`), and compose them into pipelines (`pipe`, `.pipe()`). These are the atoms of Effect programming — everything else builds on them.

### Bridge

With the basics solid, it's time for what makes Effect truly powerful: **typed error handling**. Kata 006 introduces `Effect.fail`, `catchAll`, and `catchTag` — giving you fine-grained control over what goes wrong and how to recover. In regular TypeScript, errors are `unknown`. In Effect, they're part of the type signature.
