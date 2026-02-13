# SENSEI — 011 Services and Context

## Briefing

### Goal

Learn how Effect manages dependencies through the R (Requirements) channel.

### Tasks

1. Implement `getRandomNumber` — access the `Random` service and return its `next` value
2. Implement `rollDice` — access the `Random` service and return `"Roll: {n}"` where `n` is the random value

### Hints

```ts
import { Context, Effect } from "effect";

// Declare a service with Context.Tag
class MyService extends Context.Tag("MyService")<
  MyService,
  { readonly getValue: Effect.Effect<number> }
>() {}

// Access the service inside Effect.gen
const program = Effect.gen(function* () {
  const svc = yield* MyService;
  const value = yield* svc.getValue;
  return value;
});

// Provide a concrete implementation
const result = Effect.runSync(
  Effect.provideService(program, MyService, {
    getValue: Effect.succeed(42),
  }),
);
```

## Prerequisites

- **001-005 Basics** — `Effect.succeed`, `Effect.sync`, `Effect.map`, `pipe`, `Effect.gen`, `yield*`, `Effect.flatMap`
- **006-008 Error Handling** — `Effect.fail`, `catchAll`, `catchTag`, `Data.TaggedError`
- **009-010 Value Handling** — `Option`, `Either`, `Exit`

## Skills

Invoke `effect-patterns-core-concepts` before teaching this kata. This is the first kata in the Dependency Injection area.

> **Note**: `Effect.runSync` and `Effect.provideService` appear only in tests. The student does NOT write them. Never attribute them to their learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `getRandomNumber returns the service value` | `yield* Random` + `yield* svc.next` | Accessing a service and calling its method |
| `rollDice formats the result` | `yield* Random` + `yield* svc.next` + string formatting | Service access plus value transformation |

## Teaching Approach

### Socratic prompts

- "You've used `yield*` to unwrap Effects. What happens if you `yield*` a Context.Tag like `Random`?"
- "After you get the service with `yield* Random`, you have an object with a `next` property. What is `next` — a value or an Effect? How do you get the value out?"
- "Look at the type of `getRandomNumber` — what does the `R` channel (the third type parameter) tell you?"

### Common pitfalls

1. **Calling Random directly** — `Random.next` doesn't exist. `Random` is a tag, not an instance. You need `yield* Random` first to get the service implementation, THEN access `.next` on it. Ask: "What does `Random` represent — the service itself, or a key to look it up?"
2. **Forgetting the second yield*** — `yield* Random` gives you the service object, but `svc.next` is still an Effect. You need a second `yield*` to unwrap it. Ask: "What's the type of `svc.next`? Is it a number or an Effect?"
3. **String formatting in rollDice** — students may return the number instead of the formatted string. The test expects `"Roll: 4"`. Nudge: "Check the test — what exact string format does `rollDice` need to produce?"
4. **Two-step yield pattern** — inside `Effect.gen`, first `yield*` the `Random` tag to get the service, then `yield*` its `next` method to get the number. The Briefing hints show this pattern.

## On Completion

### Insight

`yield* Random` doesn't call anything — it asks Effect's runtime to provide the Random service. The `R` type parameter tracks what's needed. This is dependency injection at the type level: your program declares its dependencies in its type signature, and the runtime satisfies them. Notice how the tests provide a `TestRandom` with a predictable value — your code never knew or cared where the implementation came from.

### Bridge

You've seen how to USE services, but the tests had to manually wire them with `provideService`. Kata 012 introduces **Layers** — reusable recipes for building services. Layers decouple "how a service is built" from "how it's used", making large programs composable.
