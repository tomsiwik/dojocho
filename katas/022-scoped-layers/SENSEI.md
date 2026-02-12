# SENSEI — 022 Scoped Layers

## Briefing

### Goal

Learn to use `Layer.scoped` to create layers that manage resource lifetimes, and to provide managed resources as services that acquire on layer build and release on scope close.

### Tasks

1. Implement `DatabaseLive` -- create a `Layer.scoped` that acquires a "connection" (log `"db:connected"`), provides a `Database` service whose `query` method returns `"result:{sql}"`, and releases by logging `"db:disconnected"`.
2. Implement `runQuery` -- use the `Database` service to run a query via `Effect.gen`.

## Prerequisites

- **012 Layers** — `Layer`, composition
- **021 Acquire Release** — `Effect.acquireRelease`, `Effect.scoped`

> **Note**: `Effect.runSync`, `Effect.scoped`, and `Effect.provide` appear only in tests. The student does NOT write them. Never attribute them to their learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `DatabaseLive connects and disconnects` | `Layer.scoped` + `Effect.acquireRelease` | Log contains `"db:connected"` and `"db:disconnected"`; query returns `"result:SELECT 1"` |
| `DatabaseLive disconnects even when query fails` | `acquireRelease` cleanup guarantee | Cleanup runs even when the use phase fails — `"db:disconnected"` still in log |

## Teaching Approach

### Socratic prompts

- "In kata 012 you built layers with `Layer.succeed`. What if building the service requires acquiring a resource — like opening a database connection?"
- "When should the database connection be closed? Who decides that?"
- "What's the difference between `Layer.effect` and `Layer.scoped`? Why does this kata need `scoped`?"

### Common pitfalls

1. **Understanding `Layer.scoped`'s argument** — `Layer.scoped` takes an Effect that returns the service value. Inside that effect, you use `acquireRelease` to set up the resource, then return the service implementation that uses it. Students may try to pass a Layer or a service object directly. Ask: "What type does `Layer.scoped` expect as its argument?"
2. **Returning the service, not the connection** — the acquireRelease creates and manages the connection, but the layer needs to provide a `Database` service (with a `query` method). Students may return the raw connection instead. Nudge: "What does the Database tag expect? A connection or a service with a `query` method?"
3. **`runQuery` needs to access the service** — use `yield*` with the Database tag to get the service, then call `query`. Students may try to access the database directly. Ask: "How do you get a service from the context inside `Effect.gen`?"
4. **Logging in the right places** — `"db:connected"` should be logged during acquire, `"db:disconnected"` during release. Students may log in the wrong phase.
5. **Shape of `Layer.scoped`** — inside `Layer.scoped`, write an Effect that does `acquireRelease`, then return an object with a `query` method. That object is your Database service.

## On Completion

### Insight

`Layer.scoped` combines service provisioning with resource management. The service is available as long as the scope is open; when the scope closes, the resource is released. This means database connections, file handles, and network connections can be managed declaratively — you describe *what* to acquire and release, and Effect handles *when*.

### Bridge

You've seen `acquireRelease` for resources and `Layer.scoped` for services. Kata 023 introduces additional **resource patterns** like `Effect.ensuring` for extra cleanup and handling failures during the use phase — rounding out the Resource Management area.
