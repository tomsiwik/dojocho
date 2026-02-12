# SENSEI — 021 Acquire Release

## Briefing

### Goal

Learn to use `Effect.acquireRelease` to safely acquire and release resources, `Effect.scoped` to run scoped effects that manage resource lifetimes, and guaranteed cleanup so resources are always released even on failure.

### Tasks

1. Implement `useResource` -- use `Effect.acquireRelease` to acquire a resource (push `"{id}:open"` to the log, return `{ id, isOpen: true }`), release it (push `"{id}:closed"`), and use it (push `"{id}:used"`, return the resource id). Wrap with `Effect.scoped`.
2. Implement `useTwoResources` -- use `Effect.acquireRelease` with two resources sequentially in `Effect.gen`. Both should be acquired, used, and released in reverse order.

## Prerequisites

- **003 Generator Pipelines** — `Effect.gen`, `yield*`
- **011 Services and Context** — `Context.Tag`, service access
- **012 Layers** — `Layer`, composition

## Skills

Invoke `effect-patterns-resource-management` before teaching this kata.

> **Note**: `Effect.runSync` appears only in tests. The student does NOT write it. Never attribute it to their learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `useResource acquires, uses, and releases` | `Effect.acquireRelease` + `Effect.scoped` | Log contains `["db:open", "db:used", "db:closed"]` in order; returns `"db"` |
| `useTwoResources releases in reverse order` | `Effect.acquireRelease` + `Effect.gen` | Acquires a then b, releases b then a (LIFO order) |

## Teaching Approach

### Socratic prompts

- "What happens to your database connection if the code that uses it throws? How does `try/finally` handle this — and what's the Effect equivalent?"
- "If you acquire resource A, then acquire resource B, and B's use phase fails — in what order should they be released?"
- "What does `Effect.scoped` actually do? What happens if you forget it?"

### Common pitfalls

1. **Forgetting `Effect.scoped`** — without it, the scope is never closed and the release function never runs. `acquireRelease` registers a finalizer on a scope, but someone needs to provide that scope. Ask: "You've set up acquire and release — but what tells Effect *when* to release?"
2. **Release function signature** — the release function receives the acquired resource as its argument. Students may try to close over the resource variable instead. Nudge: "Look at the type of the release callback — what parameter does it get?"
3. **`useTwoResources` structure** — both resources should be acquired inside a single `Effect.gen` wrapped with `Effect.scoped`. Each `yield*` of an `acquireRelease` registers its finalizer on the same scope. Ask: "If you yield two acquireRelease calls inside one gen, how many finalizers are registered?"
4. **Using `Effect.sync` for log mutations** — pushing to the log array is a side effect. It needs to be wrapped in `Effect.sync(() => { ... })`. Students may try bare mutations inside the generator.
5. **Separate "use" phase** — the "use" phase is separate from acquire/release. After acquiring, you still need code to actually use the resource before the scope closes.

## On Completion

### Insight

`acquireRelease` guarantees cleanup — even if the "use" phase throws, fails, or is interrupted. Resources are released in reverse acquisition order (LIFO, like a stack). This is Effect's answer to `try/finally`, but compositional: you can acquire multiple resources and Effect manages all their lifetimes automatically.

### Bridge

Now that you can manage resource lifetimes, the next step is **scoped layers**. Kata 022 introduces `Layer.scoped` — combining service provisioning with resource management so that services like database connections are acquired when the layer is built and released when the scope closes.
