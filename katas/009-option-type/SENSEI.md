# SENSEI — 009 Option Type

## Briefing

### Goal

Work with the Option type to safely represent values that may or may not exist.

### Tasks

1. Implement `fromNullable` — convert a nullable value to an Option
2. Implement `describe` — use `Option.match` to return "Found: {value}" or "Nothing"
3. Implement `doubleOption` — use `Option.map` to double the number inside an Option
4. Implement `safeDivide` — use `Option.flatMap` to divide safely (None if divisor is 0)
5. Implement `getOrDefault` — use `Option.getOrElse` to extract value or return a default

### Hints

```ts
import { Option } from "effect";

// Create Options
const some = Option.some(42);
const none = Option.none();

// fromNullable
const opt = Option.fromNullable(null); // None
const opt2 = Option.fromNullable(42); // Some(42)

// match
const result = Option.match(opt, {
  onNone: () => "nothing",
  onSome: (v) => `found: ${v}`,
});

// map and flatMap
const doubled = Option.map(some, (n) => n * 2);
const chained = Option.flatMap(some, (n) =>
  n > 0 ? Option.some(n) : Option.none()
);

// getOrElse
const value = Option.getOrElse(none, () => 0);
```

## Prerequisites

- **001-005 Basics** — `Effect.succeed`, `Effect.map`, `pipe`, `Effect.gen`, `Effect.flatMap`
- **006-008 Error Handling** — `Effect.fail`, `catchAll`, `catchTag`, `catchTags`, `match`

## Skills

Invoke `effect-patterns-value-handling` before teaching this kata.

## Concepts Practiced

APIs the user writes in `solution.ts`:

- `Option.fromNullable` — convert a nullable value to an Option
- `Option.match` — handle both Some and None cases
- `Option.map` — transform the value inside a Some
- `Option.flatMap` — chain Option-producing functions
- `Option.some` — create a Some value
- `Option.none` — create a None value
- `Option.getOrElse` — extract the value or provide a default

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `fromNullable converts value to Some` | `Option.fromNullable` | Non-null value wrapped in Some |
| `fromNullable converts null to None` | `Option.fromNullable` | Null becomes None |
| `fromNullable converts undefined to None` | `Option.fromNullable` | Undefined becomes None |
| `describe returns 'Found: hello' for Some` | `Option.match` | Pattern matching on Some |
| `describe returns 'Nothing' for None` | `Option.match` | Pattern matching on None |
| `doubleOption doubles Some(5) to Some(10)` | `Option.map` | Transform inside Some |
| `doubleOption returns None for None` | `Option.map` | None passes through unchanged |
| `safeDivide(10, 2) returns Some(5)` | `Option.some` + `Option.flatMap` | Division succeeds — Some result |
| `safeDivide(10, 0) returns None` | `Option.none` | Division by zero — None result |
| `getOrDefault extracts Some value` | `Option.getOrElse` | Unwrap when value exists |
| `getOrDefault returns default for None` | `Option.getOrElse` | Fallback when value is absent |

## Teaching Approach

### Socratic prompts

- "What's the difference between `null` and `Option.none()`? Why bother wrapping it?"
- "You used `Effect.map` to transform Effects. `Option.map` works the same way. What does it do when the Option is None?"
- "How is `Option.flatMap` different from `Option.map`? When would your callback need to return an Option?"
- "In `safeDivide`, the result is `Option<number>`, not `Effect<number, DivisionByZero>`. When would you choose Option over Effect with an error?"

### Common pitfalls

1. **Confusing Option.flatMap with Effect.flatMap** — they work the same way but on different types. Option.flatMap takes `A => Option<B>`, Effect.flatMap takes `A => Effect<B, E, R>`. Ask: "Are you working with an Option or an Effect here?"
2. **Using if/else instead of Option.match** — students may extract the value manually. Nudge: "Option.match handles both cases in one expression — what does it look like?"
3. **fromNullable with falsy values** — `Option.fromNullable(0)` returns `Some(0)`, not `None`. Only `null` and `undefined` produce None. Ask: "Is `0` the same as `null`?"
4. **Returning raw values from map** — `Option.map(opt, (n) => n * 2)` is correct. Students sometimes try to wrap the result in `Option.some` inside the callback. Ask: "What does `map` do with your callback's return value?"

### When stuck

1. Start with `fromNullable` — "Just pass the value to `Option.fromNullable` and return the result"
2. For `describe`: "Use `Option.match` with two handlers — `onNone` returns `'Nothing'`, `onSome` returns the formatted string"
3. For `safeDivide`: "Check if `b` is zero. Return `Option.none()` if so, `Option.some(a / b)` otherwise"
4. For `getOrDefault`: "Use `Option.getOrElse` with a function that returns the default"

## On Completion

### Insight

Option is for "might not exist" — different from errors. Use Option when absence is a normal case (e.g., looking up a key in a map), not an error condition. Notice how Option has the same vocabulary as Effect: `map`, `flatMap`, `match`. This isn't a coincidence — Effect's design reuses these patterns across types so that once you learn them, they transfer everywhere.

### Bridge

Option handles missing values. Kata 010 introduces `Either` for pure validation results (no effects needed) and `Exit` for inspecting effect outcomes after execution. `Effect.either` bridges the two worlds — converting an Effect's error channel into an Either value.
