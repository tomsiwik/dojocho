# SENSEI — 033 Pattern Matching

## Briefing

### Goal

Use Effect's `Match` module and `Data.taggedEnum` to perform exhaustive, type-safe pattern matching on tagged unions and plain values.

### Tasks

1. Define the `Shape` tagged enum (already provided) and implement `area(shape)` — compute the area using `Match.type` with `Match.tag` for each variant
2. Implement `describeShape(shape)` — return a formatted string for each shape variant
3. Implement `classifyNumber(n)` — match on a plain number using `Match.value` and `Match.when` predicates

### Hints

```ts
import { Match, Data } from "effect";

// Tagged enum definition
type Animal =
  | Data.TaggedEnum.Member<"Dog", { readonly name: string }>
  | Data.TaggedEnum.Member<"Cat", { readonly lives: number }>;
const Animal = Data.taggedEnum<Animal>();

// Match on a tagged type
const describe = Match.type<Animal>().pipe(
  Match.tag("Dog", (dog) => `Dog: ${dog.name}`),
  Match.tag("Cat", (cat) => `Cat: ${cat.lives} lives`),
  Match.exhaustive,
);
// describe is a function: (input: Animal) => string

// Match on a plain value
const classify = (n: number) =>
  Match.value(n).pipe(
    Match.when((x) => x < 0, () => "negative"),
    Match.when((x) => x === 0, () => "zero"),
    Match.orElse(() => "positive"),
  );
```

## Prerequisites

- **009 Option Type** — Working with `Option` and discriminated unions
- **010 Either and Exit** — Pattern matching on `Either` variants
- **015 Domain Modeling** — `Data.TaggedEnum` and `Schema`

## Test Map

> **Note**: `Shape.Circle(...)` etc. are constructors from `Data.taggedEnum`. Tests use them to create instances.

| Test | Concept | Verifies |
|------|---------|----------|
| `area of Circle` | `Match.tag` + geometry | Matching `Circle` and computing `pi * r^2` |
| `area of Rectangle` | `Match.tag` + geometry | Matching `Rectangle` and computing `w * h` |
| `area of Triangle` | `Match.tag` + geometry | Matching `Triangle` and computing `0.5 * b * h` |
| `describeShape for Circle` | `Match.tag` + string formatting | Producing formatted string per variant |
| `describeShape for Rectangle` | `Match.tag` + string formatting | Producing formatted string per variant |
| `classifyNumber negative` | `Match.when` with predicate | Matching plain values with conditions |
| `classifyNumber zero` | `Match.when` with predicate | Exact value matching |
| `classifyNumber positive` | `Match.orElse` or `Match.when` | Catch-all / else branch |

## Teaching Approach

### Socratic prompts

- "`Match.exhaustive` makes the matcher into a callable function, but it also does something at the type level. What happens if you forget to handle one of the shape variants?"
- "How does `Match.tag` know which field to match on? What convention does `Data.taggedEnum` follow?"
- "Compare `Match.when` with a plain `if/else` chain. What does Match give you that conditionals don't?"

### Common pitfalls

1. **Forgetting `Match.exhaustive` at the end of the pipe** — Without it, you get a `Matcher` object, not a callable function. The result of `Match.type<Shape>().pipe(Match.tag(...), Match.exhaustive)` is what you can call with a shape. Ask: "What does `Match.exhaustive` return — a matcher or a function?"
2. **Using `Match.when` for tagged types instead of `Match.tag`** — For tagged unions, `Match.tag("Circle", ...)` is more idiomatic and gives better type narrowing than `Match.when`. Save `Match.when` for predicate-based matching on plain values. Ask: "What is the difference between matching on a tag versus matching with a predicate?"
3. **Getting the `Match.value` vs `Match.type` distinction wrong** — `Match.type<T>()` creates a reusable matcher (returns a function). `Match.value(x)` matches a specific value (returns the result directly). For `classifyNumber`, you receive `n` as a parameter and want to match it immediately. Ask: "Do you need a reusable function or a one-shot match here?"

## On Completion

### Insight

Pattern matching with `Match` brings the exhaustiveness guarantees of languages like Rust or Haskell to TypeScript. When you use `Match.exhaustive`, the compiler ensures every variant is handled — adding a new shape variant will cause a type error at every unhandled match site. Combined with `Data.taggedEnum`, this creates a workflow where the type system guides you: define your domain as tagged unions, match exhaustively, and let the compiler tell you what you missed. This is far more reliable than `switch` statements, which silently fall through on unhandled cases.

### Bridge

Pattern matching helps you handle every case in your data. But what about coordinating between concurrent computations that need to wait for each other? Kata 034 introduces `Deferred`, Effect's primitive for one-shot synchronization between fibers.
