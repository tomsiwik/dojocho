# SENSEI — 012 Layers

## Briefing

### Goal

Learn how to compose service implementations using Layers.

### Tasks

1. Implement `ConfigLive` — a Layer that provides `Config` with `baseUrl` set to `"https://api.example.com"`
2. Implement `LoggerLive` — a Layer that provides `Logger` with a `log` function that uses `Effect.log`
3. Implement `getEndpoint` — read `Config.baseUrl` and `Logger.log` to return `"{baseUrl}/users"`

### Hints

```ts
import { Context, Effect, Layer } from "effect";

// Create a Layer from a value
const MyLayer = Layer.succeed(MyService, { value: 42 });

// Create a Layer from an effect
const MyEffectLayer = Layer.effect(
  MyService,
  Effect.succeed({ value: 42 }),
);

// Merge layers
const Combined = Layer.merge(LayerA, LayerB);

// Provide a layer to a program
const result = Effect.runSync(Effect.provide(program, Combined));
```

## Prerequisites

- **011 Services and Context** — `Context.Tag`, `yield*` on a tag, `yield*` on a service method

## Skills

None — continuing in the Dependency Injection area.

## Concepts Practiced

APIs the user writes in `solution.ts`:

- `Layer.succeed` — create a Layer from a static value
- `Layer.effect` — create a Layer from an Effect (alternative approach)
- `Effect.gen` — create Effects using generator syntax (review)
- `yield*` on services — access Config and Logger from context (review)
- `Effect.log` — log a message (for Logger implementation)

> **Note**: `Effect.runSync`, `Effect.provide`, `Layer.merge`, and `Layer.succeed` (in tests) appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `ConfigLive provides baseUrl` | `Layer.succeed` | Creating a Layer with a static service value |
| `getEndpoint returns full URL` | `yield* Config` + `yield* Logger` + format | Multi-service program using two services |

## Teaching Approach

### Socratic prompts

- "In kata 011, the tests used `provideService` to wire one service at a time. What if you have TWO services? How would you provide both?"
- "What's the difference between `Layer.succeed(Config, { baseUrl: '...' })` and directly providing the service? When would the Layer approach be better?"
- "For `getEndpoint`, you need both Config and Logger. Does the order you `yield*` them matter?"

### Common pitfalls

1. **Confusing `Layer.succeed` and `Layer.effect`** — `Layer.succeed(Tag, value)` is for static values. `Layer.effect(Tag, someEffect)` is when building the service requires running an Effect. For `ConfigLive`, a static config object works. Ask: "Is the config value known upfront, or does it need computation?"
2. **Forgetting to call Logger.log** — `getEndpoint` needs to use the Logger service. Students may skip the logging step. Check the test to see if logging is required for the test to pass.
3. **Layer type annotation** — the stub uses a type cast. Students need to replace the entire implementation with a proper `Layer.succeed(Config, { ... })` call. Nudge: "Delete the placeholder and write a fresh `Layer.succeed` call."
4. **String concatenation in getEndpoint** — the test expects `"https://test.com/users"`. Make sure to include the `/` between baseUrl and `"users"`.

### When stuck

1. Start with `ConfigLive` — "Use `Layer.succeed(Config, { baseUrl: 'https://api.example.com' })` to create a Layer that provides the Config service"
2. For `LoggerLive`: "Same pattern — `Layer.succeed(Logger, { log: (msg) => Effect.log(msg) })`"
3. For `getEndpoint`: "Yield both services, then combine `config.baseUrl + '/users'`"
4. Point to the Briefing hints showing the `Layer.succeed` pattern

## On Completion

### Insight

Layers decouple "how a service is built" from "how it's used". The program says WHAT it needs (via the R channel), the Layer says HOW to provide it. This separation is what makes Effect programs composable and testable. Notice how the test swapped in a completely different Config and a no-op Logger — your `getEndpoint` code didn't change at all.

### Bridge

You've built services and wired them with Layers. But the real power shows up in testing. Kata 013 makes this explicit: you'll write programs against a service interface, and the tests will provide different implementations — no mocking frameworks needed.
