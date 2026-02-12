# SENSEI — 036 Schema Advanced

## Briefing

### Goal

Learn to build refined, branded, and transformed schemas for robust domain modeling with Effect Schema.

### Tasks

1. Observe the `PositiveInt` branded type -- it is already implemented for you as a reference
2. Implement `DateFromString` -- use `Schema.transform` to convert a `"YYYY-MM-DD"` string into a `Date` object
3. Update `UserSchema` to use `PositiveInt` for `id` and `Schema.NonEmptyString` for `name`
4. Verify that `decodeUser` and `encodeUser` work correctly with the refined schema

### Hints

```ts
import { Schema } from "effect";

// Schema.brand creates a nominal type wrapper on a schema
const UserId = Schema.Number.pipe(
  Schema.filter((n) => n > 0),
  Schema.brand("UserId"),
);

// Schema.transform converts between two schemas
const BoolFromString = Schema.transform(Schema.String, Schema.Boolean, {
  decode: (s) => s === "true",
  encode: (b) => (b ? "true" : "false"),
});

// Schema.NonEmptyString rejects empty strings
const NameSchema = Schema.NonEmptyString;
```

## Prerequisites

- **014 Schema Basics** -- `Schema.Struct`, `Schema.decodeUnknown`, `Schema.NonEmptyString`
- **015 Domain Modeling** -- combining validation with typed errors

## Skills

Invoke `effect-patterns-domain-modeling` before teaching this kata.

## Test Map
> **Note**: `Effect.runSync`, `Effect.runSyncExit`, `Exit.isFailure`, and `Schema.decodeUnknown` appear only in tests. Never attribute them to the user's learning.

| Test | Concept | Verifies |
|------|---------|----------|
| `PositiveInt accepts positive integers` | `Schema.int`, `Schema.positive` | Accepts valid values AND rejects non-integers |
| `PositiveInt rejects negative numbers` | `Schema.filter` | Filter predicate rejects negatives |
| `PositiveInt rejects non-integers` | `Schema.filter` | Filter predicate rejects floats |
| `DateFromString transforms date string to Date` | `Schema.transform` | String-to-Date transformation via decode |
| `decodeUser succeeds with valid data` | `Schema.Struct` with refined fields | Accepts valid input AND rejects invalid id |
| `decodeUser fails with invalid id` | `PositiveInt` in struct | Branded field rejects invalid id |
| `decodeUser fails with empty name` | `Schema.NonEmptyString` | Refined field rejects empty string |

## Teaching Approach

### Socratic prompts

- "`PositiveInt` uses `Schema.brand`. What does branding add beyond the runtime filter? Think about what happens at the type level."
- "`Schema.transform` takes a `decode` and `encode` function. Why does a transformation schema need both directions?"
- "When you put `PositiveInt` inside a `Schema.Struct`, what happens to the overall struct's Type? Does the brand propagate?"

### Common pitfalls

1. **Schema.transform argument order** -- the first argument is the "from" (encoded) schema, the second is the "to" (type) schema. Students often reverse them. Nudge: "Which side is the raw input, and which side is the rich domain type?"
2. **DateFromString decode must return a Date** -- `new Date("2024-01-15")` is enough for valid ISO strings, but the transform also needs an `encode` direction that converts back to string. Ask: "What does `.toISOString().slice(0, 10)` give you?"
3. **Forgetting to update UserSchema** -- the stub uses `Schema.Number` and `Schema.String` as placeholders. Both need to be swapped for their refined versions. The tests for `decodeUser fails with invalid id` and `decodeUser fails with empty name` will guide you.

## On Completion

### Insight

Branded schemas are one of Effect's most powerful domain modeling tools. A `PositiveInt` is not just a number that happens to be positive -- it is a distinct type that the compiler tracks. Once data passes through `Schema.decodeUnknown`, you get a branded value that carries proof of validation. `Schema.transform` extends this further by letting you work with rich domain types (like `Date`) while keeping a simple serialization format (like a string). Together, these tools let you build schemas that are both the validation layer and the type definition -- one source of truth for runtime checks and compile-time safety.

### Bridge

You have built refined and transformed schemas. Kata 037 introduces `Cache` -- a performance primitive that memoizes effectful lookups with TTL and capacity controls. Caching is where domain modeling meets real-world performance.
