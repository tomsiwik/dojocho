# SENSEI — 023 Resource Patterns

## Briefing

### Goal

Learn to use `Effect.ensuring` to add additional cleanup that always runs, verify that resources are released even when the use phase fails, and guarantee cleanup regardless of success or failure.

### Tasks

1. Implement `withEnsuring` -- use `Effect.acquireRelease` to create a resource and `Effect.ensuring` to add additional cleanup. Log `"acquire"`, `"ensure-cleanup"`, and `"release"` to the log array.
2. Implement `releaseOnFailure` -- use `Effect.acquireRelease` where the "use" phase fails. Verify the resource is still released. Return `"released"` if cleanup happened.

## Prerequisites

- **021 Acquire Release** — `Effect.acquireRelease`, `Effect.scoped`
- **022 Scoped Layers** — `Layer.scoped`, service lifetime

## Skills

None — final kata in the Resource Management area.

## Concepts Practiced

APIs the user writes in `solution.ts`:

- `Effect.acquireRelease` — pair acquire with guaranteed release (review)
- `Effect.ensuring` — add a finalizer that runs regardless of outcome
- `Effect.scoped` — define the scope boundary (review)
- `Effect.gen` — sequence effects in a generator
- `Effect.sync` — wrap side effects like logging
- `Effect.catchAll` or `Effect.catchTag` — recover from errors after the scoped block

> **Note**: `Effect.runSync` appears only in tests. The student does NOT write it. Never attribute it to their learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `withEnsuring runs all cleanup` | `Effect.ensuring` + `Effect.acquireRelease` | Log contains `"acquire"`, `"ensure-cleanup"`, and `"release"` |
| `releaseOnFailure still releases on error` | `Effect.acquireRelease` + error recovery | Returns `"released"`; log contains `"release"` despite use-phase failure |

## Teaching Approach

### Socratic prompts

- "You know `acquireRelease` guarantees cleanup. What if you need *additional* cleanup that isn't tied to a specific resource — like flushing a metrics buffer?"
- "If the use phase fails, does the release still run? How would you verify that?"
- "For `releaseOnFailure`, the test expects the return value `'released'`. But if the use phase fails, how do you get a success value out?"

### Common pitfalls

1. **`ensuring` execution order** — `ensuring` runs after the whole effect completes, including after `acquireRelease`'s release. Students may expect it to run before release. Ask: "If you wrap an `acquireRelease` with `ensuring`, which cleanup runs first — the release or the ensuring finalizer?"
2. **`releaseOnFailure` — catching after scoped** — the use phase fails inside the scope, but `acquireRelease` still releases. To return `"released"`, you need to catch the error *after* `Effect.scoped`. Students may try to catch inside the scope. Ask: "Where should the `catchAll` go — inside or outside the `Effect.scoped` call?"
3. **Forgetting `Effect.scoped`** — same pitfall as kata 021. The scope boundary triggers the release. Without it, nothing gets cleaned up.
4. **`withEnsuring` structure** — students need to combine `acquireRelease` (with its own release) *and* `ensuring` on the outer effect. The ensuring callback is separate from the acquireRelease release function.

### When stuck

1. For `withEnsuring`: "Start with an `acquireRelease` that logs `'acquire'` and `'release'`. Wrap the whole scoped effect with `ensuring` that logs `'ensure-cleanup'`."
2. Clarify `ensuring`: "It's like a `finally` block that runs after everything else — even after the acquireRelease release."
3. For `releaseOnFailure`: "Create an `acquireRelease` where the use phase calls `Effect.fail`. Wrap with `Effect.scoped`. Then catch the error outside the scope and return `'released'`."
4. Refer them to the `ensuring` and error recovery patterns in the Concepts Practiced section above

## On Completion

### Insight

`Effect.ensuring` adds a finalizer that runs regardless of outcome — it stacks with `acquireRelease`. For error recovery with resources, the key insight is that `acquireRelease` ALWAYS releases, even on failure. You can catch the use-phase failure after the scope closes and still verify cleanup happened. Together, these patterns give you complete control over resource lifecycles.

### Bridge

Resource Management is now complete. You can acquire and release resources, tie them to service layers, add extra finalizers, and recover from failures — all with guaranteed cleanup. Next up: **Streams**. Kata 024 introduces `Stream`, `runCollect`, and `runFold` for processing lazy sequences of data.
