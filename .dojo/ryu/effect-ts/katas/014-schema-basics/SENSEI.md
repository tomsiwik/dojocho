# SENSEI — 014 Schema Basics

## Briefing

### Goal

Learn how to validate and parse data using Effect Schema.

### Tasks

1. Implement `parseUser` — parse unknown input into a `User` (name: string, age: number)
2. Implement `parseStrictUser` — parse with stricter validation: name must be non-empty, age must be >= 0

### Hints

```ts
import { Effect, Schema } from "effect";

// Define a schema
const PersonSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
});

// Parse unknown data (returns Effect)
const parse = Schema.decodeUnknown(PersonSchema);
const result = Effect.runSync(parse({ name: "Alice", age: 30 }));

// Refined schemas
const NonEmpty = Schema.NonEmptyString;
const Positive = Schema.Number.pipe(Schema.positive());
```

## Prerequisites

- **007 Tagged Errors** — `Data.TaggedError`, domain errors
- **009 Option Type** — `Option`, `some`, `none`, `match`

## Skills

Invoke `effect-patterns-domain-modeling` before teaching this kata. This is the first kata in the Domain Modeling area.

> **Note**: `Effect.runSync`, `Effect.runSyncExit`, and `Exit.isFailure` appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `parseUser succeeds with valid input` | `Schema.decodeUnknown` | Parsing a valid object against UserSchema |
| `parseUser fails with missing field` | `Schema.decodeUnknown` | Schema rejects incomplete input |
| `parseUser fails with wrong type` | `Schema.decodeUnknown` | Schema rejects mistyped fields |
| `parseStrictUser succeeds with valid input` | Refined schema + `Schema.decodeUnknown` | Stricter schema still accepts valid data |
| `parseStrictUser fails with empty name` | `Schema.NonEmptyString` | Refinement rejects empty strings |
| `parseStrictUser fails with negative age` | `Schema.positive()` or `Schema.filter` | Refinement rejects negative numbers |

## Teaching Approach

### Socratic prompts

- "You have a `UserSchema` already defined with `Schema.Struct`. How do you use it to parse an `unknown` value into a `User`?"
- "`Schema.decodeUnknown` returns an Effect, not a plain value. Why would parsing be an Effect?"
- "For `StrictUserSchema`, the basic `Schema.String` accepts empty strings. How can you make it stricter?"
- "What's the difference between `Schema.Number` and `Schema.Number.pipe(Schema.positive())`? What does the refinement add?"

### Common pitfalls

1. **Calling Schema.decodeUnknown wrong** — the signature is `Schema.decodeUnknown(MySchema)(input)`. It's curried: first pass the schema, then the value. Ask: "What does `Schema.decodeUnknown(UserSchema)` return — a parser function or a result?"
2. **Modifying UserSchema instead of creating StrictUserSchema** — `UserSchema` should stay as-is (the first three tests use it). `StrictUserSchema` is a separate, stricter schema. Nudge: "Keep `UserSchema` untouched — build `StrictUserSchema` with refined field types."
3. **Wrong refinement for age** — the test rejects negative age (`-1`). Students might use `Schema.positive()` which also rejects zero, but the test for `parseStrictUser` with `{ name: "Alice", age: 30 }` only needs `>= 0`. Check whether `Schema.nonNegative()` or `Schema.filter` with `(n) => n >= 0` is needed. Look at what the tests actually check.
4. **Forgetting the pipe for refinements** — `Schema.NonEmptyString` is a standalone schema, but for number refinements you typically use `Schema.Number.pipe(Schema.positive())`. Students may try `Schema.positive(Schema.Number)` which isn't the API.
5. **`parseUser` is a one-liner** — `Schema.decodeUnknown(UserSchema)(input)` is all you need. The curried form takes the schema first, then the input.

## On Completion

### Insight

`Schema.decodeUnknown` returns an Effect — parsing IS an effect because it can fail. The schema defines the shape AND the validation rules in one place. This is different from validation libraries that only check at runtime — Schema also gives you the TypeScript type via `typeof UserSchema.Type`. One definition, two purposes: runtime validation and compile-time type safety.

### Bridge

You've seen Schema for data validation. Kata 015 brings together everything from the Domain Modeling area: `Data.TaggedError` for typed validation errors, `Option` for optional fields, and `Effect.gen` for composing validators. It's the capstone of domain modeling in Effect.
