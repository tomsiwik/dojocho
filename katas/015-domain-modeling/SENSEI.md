# SENSEI — 015 Domain Modeling

## Briefing

### Goal

Combine TaggedError, Option, Schema, and Effect.gen to build a complete domain model.

### Tasks

1. Implement `validateEmail` — check that email contains "@", fail with `InvalidEmail` otherwise
2. Implement `validateAge` — check that age is 0-150, fail with `InvalidAge` otherwise
3. Implement `createUser` — validate email and age, then construct a `User` with `nickname` as `Option.none()`
4. Implement `formatUser` — format as `"{name} <{email}>"` with optional `" aka {nickname}"` if present

### Hints

```ts
import { Data, Effect, Option } from "effect";

// TaggedError for domain errors
class MyError extends Data.TaggedError("MyError")<{
  readonly reason: string;
}> {}

// Conditional failure
const validate = (x: number) =>
  x > 0 ? Effect.succeed(x) : Effect.fail(new MyError({ reason: "too small" }));

// Option matching
const greet = (nickname: Option.Option<string>) =>
  Option.match(nickname, {
    onNone: () => "",
    onSome: (n) => ` aka ${n}`,
  });
```

## Prerequisites

- **007 Tagged Errors** — `Data.TaggedError`, domain errors
- **009 Option Type** — `Option`, `some`, `none`, `match`
- **014 Schema Basics** — `Schema`, `decodeUnknown`

> **Note**: `Effect.runSync`, `Effect.runSyncExit`, and `Exit.isFailure` appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `validateEmail succeeds with valid email` | `Effect.succeed` | Email containing `@` passes validation |
| `validateEmail fails without @` | `Effect.fail` + `InvalidEmail` | Missing `@` produces a tagged error |
| `validateAge succeeds with valid age` | `Effect.succeed` | Age in 0-150 range passes validation |
| `validateAge fails with negative` | `Effect.fail` + `InvalidAge` | Negative age produces a tagged error |
| `createUser succeeds with valid input` | `Effect.gen` + `yield*` | Composing validators with generator |
| `createUser fails with invalid email` | Error propagation | Validator failure short-circuits the generator |
| `formatUser without nickname` | `Option.match` onNone | Formatting when nickname is `Option.none()` |
| `formatUser with nickname` | `Option.match` onSome | Formatting when nickname is `Option.some("Al")` |

## Teaching Approach

### Socratic prompts

- "You've used `Data.TaggedError` in kata 007. Here you have TWO error classes. What does the union type `InvalidEmail | InvalidAge` tell the caller?"
- "For `validateEmail`, what's the simplest way to check if a string contains `@`? What should you return in each case?"
- "In `createUser`, you call `validateEmail` and `validateAge` — both return Effects that might fail. What happens in `Effect.gen` if the first one fails?"
- "`formatUser` is a pure function, not an Effect. How does `Option.match` let you handle the nickname being present or absent?"

### Common pitfalls

1. **Constructing TaggedErrors wrong** — use `new InvalidEmail({ email })`, not `InvalidEmail({ email })`. The `Data.TaggedError` classes need `new`. Ask: "How do you create an instance of a class in JavaScript?"
2. **Forgetting Option.none() in createUser** — the `User` interface requires `nickname: Option.Option<string>`. When creating a user, set it to `Option.none()`. Students may use `undefined` or `null`. Ask: "What type does the `nickname` field expect?"
3. **Using if/else in createUser instead of Effect.gen** — students might try to validate everything in a single conditional. Nudge: "You already have `validateEmail` and `validateAge` as separate Effects. How does `yield*` let you compose them?"
4. **Option.match syntax** — the API is `Option.match(option, { onNone: () => ..., onSome: (value) => ... })`. Students may forget the object shape or try to pattern match differently. Check the Effect docs for the exact signature.
5. **formatUser output format** — the tests expect `"Alice <a@b.com>"` without nickname and `"Alice <a@b.com> aka Al"` with nickname. Watch the exact spacing and format.
6. **Compose validators with `Effect.gen`** — use `yield* validateEmail(email)`, then `yield* validateAge(age)`, then return the User object with `Option.none()` for nickname. If the first validator fails, the generator short-circuits.

## On Completion

### Insight

This kata shows how Effect's building blocks compose into a real domain model: `Data.TaggedError` for typed validation errors, `Option` for optional fields, `Effect.gen` for sequencing validators, and union error types that accumulate automatically. The compiler tracks every possible error — `createUser` returns `Effect<User, InvalidEmail | InvalidAge>`, telling every caller exactly what can go wrong. No more `unknown` errors, no more forgotten error cases.

### Bridge

Domain Modeling is complete. You now have the tools to model data, validate it, and handle errors with full type safety. Next up: **scheduling and resilience**. Kata 016 introduces `Schedule`, retry policies, and `Effect.retry` — teaching your programs to recover from transient failures automatically.
