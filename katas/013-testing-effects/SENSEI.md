# SENSEI — 013 Testing Effects

## Briefing

### Goal

Learn how to write testable Effect programs using service doubles.

### Tasks

1. Implement `getUser(id)` — use `UserRepo` service to find a user by id and return `"User: {name}"`
2. Implement `getUserSafe(id)` — use `UserRepo` to find a user, recovering from errors with `"Unknown"`

### Hints

```ts
import { Context, Effect } from "effect";

// Access a service inside Effect.gen
const program = Effect.gen(function* () {
  const repo = yield* MyRepo;
  const value = yield* repo.findById(1);
  return value;
});

// Recover from errors
const safe = Effect.gen(function* () {
  const repo = yield* MyRepo;
  const value = yield* repo.findById(1).pipe(
    Effect.catchAll(() => Effect.succeed("fallback")),
  );
  return value;
});

// Provide a test double
const result = Effect.runSync(
  Effect.provideService(program, MyRepo, {
    findById: (id) => Effect.succeed("test"),
  }),
);
```

## Prerequisites

- **011 Services and Context** — `Context.Tag`, `yield*` on a tag, `yield*` on a service method
- **012 Layers** — `Layer.succeed`, composing services

## Skills

Invoke `effect-patterns-testing` before teaching this kata. This is the first kata in the Testing area.

## Concepts Practiced

APIs the user writes in `solution.ts`:

- `Effect.gen` — create Effects using generator syntax (review)
- `yield*` on a service tag — access UserRepo from context (review)
- `yield*` on a service method — call `repo.findById(id)` (review)
- `Effect.catchAll` — recover from any error, providing a fallback Effect
- String formatting — template literals for `"User: {name}"`

> **Note**: `Effect.runSync`, `Effect.runSyncExit`, and `Effect.provideService` appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `getUser(1) returns 'User: Alice'` | `yield* UserRepo` + `yield* repo.findById` | Service access and method call — success path |
| `getUser(99) fails` | Error propagation | Service method failure passes through |
| `getUserSafe(1) returns 'User: Alice'` | `Effect.gen` + service access | Success path with error recovery in scope |
| `getUserSafe(99) returns 'User: Unknown'` | `Effect.catchAll` | Recovering from service errors with a fallback |

## Teaching Approach

### Socratic prompts

- "Look at the test file — `TestUserRepo` returns `Effect.succeed('Alice')` for id 1 and `Effect.fail('not found')` for anything else. Your code never sees this implementation. What does that tell you about how services work?"
- "What's the difference between `getUser` and `getUserSafe`? Both access the same service — but one lets errors through and the other catches them."
- "`catchAll` receives the error value. Do you need to inspect it here, or just replace it with a fallback?"
- "If `findById` fails, what should `getUserSafe` return instead?"

### Common pitfalls

1. **Forgetting to format the result** — `findById` returns a name like `"Alice"`, but the test expects `"User: Alice"`. Ask: "What does the test check for? Is it just the name?"
2. **Using try/catch instead of catchAll** — inside `Effect.gen`, errors short-circuit the generator. You can't catch them with JavaScript `try/catch`. Use `Effect.catchAll` on the whole effect or use `yield*` with a caught effect. Ask: "How does error handling work in Effect vs regular JavaScript?"
3. **Applying catchAll too narrowly** — `catchAll` should wrap the entire pipeline for `getUserSafe`, not just the `findById` call. The simplest approach: write `getUser(id)` first, then pipe it through `catchAll` for the safe version.
4. **Returning the wrong fallback** — `getUserSafe(99)` should return `"User: Unknown"`, not just `"Unknown"`. The `"User: "` prefix must be in the fallback too.

### When stuck

1. Start with `getUser` — "Inside `Effect.gen`, yield the `UserRepo` tag, then yield `repo.findById(id)`, then format the result as `User: ${name}`"
2. For `getUserSafe`: "Start by calling `getUser(id)` — you already wrote it. Then pipe it through `catchAll` to handle the error case."
3. The fallback in `catchAll` should return `Effect.succeed("User: Unknown")`
4. Point to the Briefing hints showing the `catchAll` pattern

## On Completion

### Insight

Because services are accessed through the R channel, tests can swap implementations without changing the program. No mocking frameworks needed — just provide a different implementation. The test file created a `TestUserRepo` with predictable behavior, and your code worked against it without modification. This is the payoff of dependency injection via Effect: the program describes WHAT it needs, tests control HOW those needs are met.

### Bridge

Services, Layers, and testing give you the architecture for real programs. But real programs also need to validate data. Kata 014 introduces **Schema** — Effect's approach to parsing and validation that gives you runtime checks AND TypeScript types from a single definition.
