# SENSEI — 039 Managed Runtime

## Briefing

### Goal

Learn to create and manage a pre-configured Effect runtime with services baked in, using `ManagedRuntime`.

### Tasks

1. Implement `makeRuntime` -- create a `ManagedRuntime` from the `GreeterLive` layer using `ManagedRuntime.make`
2. Implement `greetWith` -- use `runtime.runSync` to execute an effect that accesses the `Greeter` service
3. Implement `fullLifecycle` -- create a runtime, run an effect with `runtime.runPromise`, then `dispose` the runtime

### Hints

```ts
import { Context, Effect, Layer, ManagedRuntime } from "effect";

// ManagedRuntime.make takes a Layer and returns a ManagedRuntime
const runtime = ManagedRuntime.make(MyServiceLive);

// runtime.runSync executes an effect synchronously
const result = runtime.runSync(
  Effect.gen(function* () {
    const svc = yield* MyService;
    return svc.doSomething();
  }),
);

// runtime.runPromise executes an effect as a Promise
const promise = runtime.runPromise(myEffect);

// runtime.dispose() cleans up resources (returns Promise<void>)
await runtime.dispose();
```

## Prerequisites

- **011 Services and Context** -- `Context.Tag`, service definitions
- **012 Layers** -- `Layer.succeed`, providing services

## Test Map
> **Note**: `runtime.runSync`, `runtime.runPromise`, and `runtime.dispose` are the APIs under test. They are part of the `ManagedRuntime` interface, not test-only helpers.

| Test | Concept | Verifies |
|------|---------|----------|
| `makeRuntime creates a runtime` | `ManagedRuntime.make` | Runtime construction from a layer |
| `greetWith runs an effect using the runtime` | `runtime.runSync` | Synchronous execution with service access |
| `greetWith works with different names` | `runtime.runSync` | Runtime is reusable across multiple calls |
| `fullLifecycle creates, uses, and disposes runtime` | `runtime.runPromise` + `dispose` | Complete lifecycle: create, use, clean up |

## Teaching Approach

### Socratic prompts

- "In previous katas you used `Effect.runSync` and `Effect.provide` to supply services. `ManagedRuntime` bakes the layer in at construction time. When would pre-configuring a runtime be more convenient than providing layers each time?"
- "`runtime.runSync` executes an effect but does not require you to call `Effect.provide`. Where did the service come from?"
- "`runtime.dispose()` returns a `Promise<void>`. Why does disposing a runtime need to be asynchronous? What kind of cleanup might it perform?"

### Common pitfalls

1. **Forgetting to dispose the runtime** -- `ManagedRuntime` allocates resources when created. If you never call `dispose()`, those resources leak. In tests, always dispose in a finally block or after assertions. Ask: "What happens to the layer's resources if you never call dispose?"
2. **Trying to use `Effect.runSync` instead of `runtime.runSync`** -- the global `Effect.runSync` does not have access to the services in the managed runtime. You must call `runtime.runSync(effect)` to execute with the pre-configured context. Nudge: "Who owns the service layer -- the global runtime or your managed runtime?"
3. **Async confusion in fullLifecycle** -- `runtime.runPromise` returns a `Promise`, and `runtime.dispose()` also returns a `Promise`. You need to await both in sequence. Students may forget to chain the dispose after getting the result.

## On Completion

### Insight

`ManagedRuntime` bridges Effect with the outside world. In a typical Effect application, you compose everything as effects and run once at the top level. But in real-world scenarios -- React components, Express handlers, CLI tools -- you often need to run effects from non-Effect code. `ManagedRuntime` gives you a pre-configured entry point: create it once with your service layers, call `runSync` or `runPromise` wherever you need, and `dispose` when you are done. It is the escape hatch that makes Effect practical in mixed codebases.

### Bridge

You now know how to create and manage runtimes. Kata 040 introduces request batching -- a powerful optimization where multiple concurrent data requests are automatically grouped into a single batch call, reducing round trips and improving throughput.
