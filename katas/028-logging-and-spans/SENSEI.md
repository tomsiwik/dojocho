# SENSEI — 028 Logging and Spans

## Briefing

### Goal

Learn to use `Effect.log` for structured logging within effects, `Effect.annotateLogs` to add contextual metadata to log entries, and `Effect.withSpan` to wrap computations in named spans for tracing.

### Tasks

1. Implement `logAndReturn` -- use `Effect.log` to log a message, then return `"done"`.
2. Implement `logWithContext` -- use `Effect.annotateLogs` to add a `{ requestId }` annotation, then log the message, then return `"done"`.
3. Implement `withTracking` -- use `Effect.withSpan` to wrap a computation in a named span.

## Prerequisites

- **003 Generator Pipelines** — `Effect.gen`, `yield*`
- **011 Services and Context** — `Context.Tag`, service access

## Skills

Invoke `effect-patterns-observability` before teaching this kata.

> **Note**: `Effect.runSync` appears only in tests. Never attribute it to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `logAndReturn logs the message and returns 'done'` | `Effect.log` + sequencing | Custom logger captures "hello"; returns `"done"` |
| `logWithContext annotates logs with requestId` | `Effect.annotateLogs` + `Effect.log` | Custom logger captures `requestId: "req-1"` annotation |
| `withTracking preserves the effect result` | `Effect.withSpan` | Wrapping `Effect.succeed(42)` in a span still yields 42 |

## Teaching Approach

### Socratic prompts

- "If you removed all logging calls, would the tests still pass? What does that tell you about how the current tests verify observability?"
- "If you have a request ID and want every log in that request's scope to include it, how would you avoid passing it to every function manually? How does `annotateLogs` solve this?"
- "`withSpan` doesn't change the result of the effect. So what *does* it do, and why would you want it in production?"

### Common pitfalls

1. **Effect.log returns void** — `Effect.log("hello")` produces `Effect<void>`. You need to sequence it with the return value using `gen`, `flatMap`, or `andThen`. Writing `return Effect.log(message)` would return `Effect<void>`, not `Effect<string>`. Ask: "What type does `Effect.log` produce? How do you sequence it with returning 'done'?"
2. **annotateLogs wraps an effect** — `Effect.annotateLogs(effect, { requestId })` adds annotations to ALL logs within that effect's scope. The annotation is the outer wrapper; the logging happens inside. Ask: "Does `annotateLogs` emit a log itself, or does it modify logs emitted by the effect you give it?"
3. **withSpan is a simple wrapper** — `Effect.withSpan(effect, "name")` or `effect.pipe(Effect.withSpan("name"))` does not change the effect's result. Students may overthink it. Ask: "If you wrap `Effect.succeed(42)` in a span, what value comes out?"
4. **Argument order** — `Effect.annotateLogs` and `Effect.withSpan` have specific argument orders. Check the types if unsure.
5. **Sequencing with `Effect.gen`** — for `logAndReturn`, use `Effect.gen`: yield `Effect.log(message)`, then return `"done"`. The same pattern applies to `logWithContext` with `annotateLogs` wrapping the generator.

## On Completion

### Insight

`Effect.log` is structured — it integrates with the runtime's logging system, not just `console.log`. `annotateLogs` adds contextual metadata (like request IDs) that propagates through the entire effect tree. `withSpan` creates tracing spans for performance monitoring. All three are composable and production-ready. The key insight is that observability is a cross-cutting concern that Effect handles declaratively — you add it to your effects without changing their logic or return values.

### Bridge

With observability in place, kata 029 introduces the **HTTP client** pattern — combining services (from kata 011), schema validation (from kata 014), and retry (from kata 016) into a realistic HTTP request pipeline. This is where multiple Effect patterns come together for real-world use.
