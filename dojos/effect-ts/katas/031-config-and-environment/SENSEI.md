# SENSEI — 031 Config and Environment

## Briefing

### Goal

Read typed configuration values from a provider using Effect's `Config` module, with defaults and composition.

### Tasks

1. Implement `getAppName` — read a string config value for the key `"APP_NAME"`
2. Implement `getPort` — read a numeric config value for `"PORT"`, falling back to `3000` if missing
3. Implement `getAppConfig` — combine both reads and return `{ name, port }`

### Hints

```ts
import { Config, ConfigProvider, Effect, Layer } from "effect";

// Read a string config
const name = Config.string("MY_KEY");

// Read a number config with a default
const port = Config.withDefault(Config.number("PORT"), 3000);

// Config values are Effects — use them in generators
const program = Effect.gen(function* () {
  const n = yield* Config.string("NAME");
  const p = yield* Config.withDefault(Config.number("PORT"), 8080);
  return { n, p };
});

// Provide a config in tests
const provider = ConfigProvider.fromMap(new Map([["KEY", "value"]]));
const withProvider = Effect.provide(program, Layer.setConfigProvider(provider));
```

## Prerequisites

- **011 Services and Context** — Dependency injection with `Context`
- **012 Layers** — Building and providing layers
- **005 Pipe Composition** — Composing effects with `pipe`

## Test Map

> **Note**: `ConfigProvider.fromMap`, `Layer.setConfigProvider`, and `Effect.runSync` appear only in tests. Never attribute them to the user's learning.

| Test | Concept | Verifies |
|------|---------|----------|
| `getAppName reads APP_NAME config` | `Config.string` | Reading a string config value by key |
| `getPort reads PORT config as number` | `Config.number` | Reading a numeric config value |
| `getPort falls back to 3000 when PORT is missing` | `Config.withDefault` | Default value when config key is absent |
| `getAppConfig returns both name and port` | Composing configs | Combining multiple config reads into a single object |

## Teaching Approach

### Socratic prompts

- "Config values in Effect are described declaratively, not read imperatively. What does `Config.string('APP_NAME')` return — a string, or something else?"
- "Why does Effect treat configuration as a dependency rather than reading `process.env` directly? What does this make easier?"
- "When you compose two config reads in a generator, what happens if one of them fails? How does this compare to manually checking `process.env.PORT || 3000`?"

### Common pitfalls

1. **Treating Config as a raw value instead of an Effect** — `Config.string("APP_NAME")` returns an `Effect`, not a string. You must `yield*` it in a generator or use it in a pipeline. Ask: "What type does `Config.string` return?"
2. **Applying `withDefault` to the wrong thing** — `Config.withDefault` wraps a `Config`, not an `Effect`. It should be `Config.withDefault(Config.number("PORT"), 3000)`, not applied after yielding. Ask: "At what level does the default apply — to the config description or to the effect result?"
3. **Forgetting that Config.number parses strings** — The config provider stores strings. `Config.number` handles the parsing for you. Don't try to manually parse with `parseInt`.

## On Completion

### Insight

Effect's Config module separates _what_ configuration your program needs from _where_ it comes from. By declaring configs as typed descriptors (`Config.string`, `Config.number`), your program becomes testable and portable — you can swap `process.env` for a `Map` in tests without changing any application code. `Config.withDefault` is not just a convenience; it documents which values are optional and what the fallback behavior is, making configuration self-describing.

### Bridge

Now that you can read configuration, what happens when things go wrong in unexpected ways — not just typed errors, but crashes and defects? Kata 032 explores `Cause` and defects, the deeper error model beneath `Effect.fail`.
