# SENSEI — 007 Tagged Errors

## Briefing

### Goal

Model domain errors using `Data.TaggedError` for type-safe error handling.

### Tasks

1. Define `NotFoundError` and `ValidationError` as `Data.TaggedError` classes
2. Implement `findUser(id)` — fails with `NotFoundError` when `id < 0`, succeeds with `{ id, name: "User {id}" }`
3. Implement `validateAge(age)` — fails with `ValidationError` when `age < 0 || age > 150`, succeeds with the age
4. Implement `findUserOrDefault(id)` — wraps `findUser`, recovering from `NotFoundError` with a default user `{ id: 0, name: "Guest" }`

### Hints

```ts
import { Data, Effect } from "effect";

class MyError extends Data.TaggedError("MyError")<{
  readonly message: string;
}> {}

const failing = Effect.fail(new MyError({ message: "oops" }));

// catchTag matches on the _tag field
const recovered = Effect.catchTag(failing, "MyError", (e) =>
  Effect.succeed(`Recovered: ${e.message}`),
);
```

## Prerequisites

- **006 Handle Errors** — `Effect.fail`, `Effect.catchAll`, `Effect.catchTag`

> **Note**: `Effect.runSync`, `Effect.runSyncExit`, and `Exit.isFailure` appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `findUser(1) succeeds with { id: 1, name: 'User 1' }` | `Effect.succeed` | Happy path — known user |
| `findUser(42) succeeds with { id: 42, name: 'User 42' }` | `Effect.succeed` | Happy path — any positive id |
| `findUser(-1) fails with NotFoundError` | `Data.TaggedError` + `Effect.fail` | Negative id triggers typed error |
| `validateAge(25) succeeds with 25` | `Effect.succeed` | Valid age in range |
| `validateAge(0) succeeds with 0` | `Effect.succeed` | Boundary case — zero is valid |
| `validateAge(150) succeeds with 150` | `Effect.succeed` | Boundary case — 150 is valid |
| `validateAge(-1) fails with ValidationError` | `Effect.fail` | Below minimum boundary |
| `validateAge(151) fails with ValidationError` | `Effect.fail` | Above maximum boundary |
| `findUserOrDefault(1) succeeds with { id: 1, name: 'User 1' }` | `Effect.catchTag` | Pass-through on success |
| `findUserOrDefault(-1) recovers with { id: 0, name: 'Guest' }` | `Effect.catchTag` | Selective recovery from NotFoundError |

## Teaching Approach

### Socratic prompts

- "In kata 006 you used plain objects as errors. What does `Data.TaggedError` add on top of that?"
- "What is the `_tag` property on a TaggedError? How does `catchTag` use it?"
- "In `findUserOrDefault`, you only want to catch `NotFoundError`. What happens to other error types if there were any?"
- "What's the difference between `catchAll` (kata 006) and `catchTag`? Which is more precise?"

### Common pitfalls

1. **Forgetting `new` when constructing TaggedError** — `Effect.fail(NotFoundError())` won't work. It must be `Effect.fail(new NotFoundError())`. Ask: "TaggedError creates a class — how do you create an instance of a class in JavaScript?"
2. **Boundary conditions in validateAge** — the tests show `0` and `150` are valid, but `-1` and `151` are not. Ask: "What exact range is valid? Check the boundary test cases carefully."
3. **Using `catchAll` instead of `catchTag`** — for `findUserOrDefault`, `catchAll` works but `catchTag` is the lesson. Nudge: "Can you be more specific about which error you're catching?"
4. **Wrong user format** — `findUser` must return `{ id, name: 'User ${id}' }`. Students may forget the name format. Ask: "Check the test expectations — what shape does the user object need?"
5. **Start with error classes** — define `NotFoundError` and `ValidationError` using `Data.TaggedError` first, then implement the functions that use them.

## On Completion

### Insight

TaggedError gives you class-based errors with `_tag` discrimination. This enables `catchTag` to selectively recover from specific error types while letting others propagate. The pattern is powerful: define your domain errors as TaggedError classes, fail with them, and catch only the ones you want to handle. The type system ensures you know exactly which errors remain unhandled.

### Bridge

You can now create and selectively catch typed errors. Kata 008 expands your error-handling toolbox with `catchTags` (handle multiple error types at once), `orElse` (try a fallback effect), and `match` (handle both success and failure) — completing the Error Patterns area.
