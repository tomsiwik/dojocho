# SENSEI — 010 Either and Exit

## Briefing

### Goal

Use Either for pure validation and Exit to inspect effect results without throwing.

### Tasks

1. Implement `safeRun` — use `Effect.either` and `Either.match` to return "ok: {value}" or "err: {error}"
2. Implement `validatePositive` — return `Either.right(n)` if n > 0, `Either.left("not positive")` otherwise
3. Implement `inspectExit` — use `Effect.runSyncExit` and `Exit.match` to return "success: {value}" or "failure"

### Hints

```ts
import { Effect, Either, Exit } from "effect";

// Effect.either converts error channel to Either
const safe = effect.pipe(
  Effect.either,
  Effect.map(
    Either.match({
      onLeft: (e) => `err: ${e}`,
      onRight: (a) => `ok: ${a}`,
    })
  )
);

// Either for pure validation
const validated = n > 0 ? Either.right(n) : Either.left("invalid");

// Exit inspection
const exit = Effect.runSyncExit(effect);
const result = Exit.match(exit, {
  onFailure: () => "failed",
  onSuccess: (a) => `success: ${a}`,
});
```

## Prerequisites

- **009 Option Type** — `Option`, `some`, `none`, `match`, `map`, `flatMap`

## Skills

None — continuing in the Value Handling area.

## Concepts Practiced

APIs the user writes in `solution.ts`:

- `Effect.either` — convert an Effect's error channel into an Either value
- `Either.match` — handle both Left and Right cases
- `Either.right` — create a Right (success) value
- `Either.left` — create a Left (failure) value
- `Effect.runSyncExit` — run an Effect and get an Exit result
- `Exit.match` — handle both Success and Failure exit cases

> **Note**: Unlike previous katas, the user DOES write `Effect.runSyncExit` and `Exit.match` in `inspectExit`. This is intentional — inspecting an Exit is the lesson.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `safeRun wraps success` | `Effect.either` + `Either.match` | Success becomes Right, matched to string |
| `safeRun wraps failure` | `Effect.either` + `Either.match` | Failure becomes Left, matched to string |
| `validatePositive returns Right for positive` | `Either.right` | Pure validation — valid input |
| `validatePositive returns Left for zero` | `Either.left` | Pure validation — zero rejected |
| `validatePositive returns Left for negative` | `Either.left` | Pure validation — negative rejected |
| `inspectExit returns success string` | `Effect.runSyncExit` + `Exit.match` | Execute and inspect successful exit |
| `inspectExit returns failure string` | `Effect.runSyncExit` + `Exit.match` | Execute and inspect failed exit |

## Teaching Approach

### Socratic prompts

- "You've used `Effect.catchAll` to recover from errors. What if instead of recovering, you just want to see whether it succeeded or failed — without losing the information?"
- "`Effect.either` turns `Effect<A, E>` into `Effect<Either<A, E>, never>`. The error channel becomes `never`. Where did the error go?"
- "Either doesn't need an Effect to be useful. `validatePositive` is a pure function. When would you use Either without Effect?"
- "Exit looks a lot like Either. What's the difference? When do you encounter an Exit?"

### Common pitfalls

1. **Confusing Either and Effect** — Either is a pure data structure (Left or Right), not an Effect. `Either.right(5)` is a value, not a computation. Ask: "Does `Either.right(5)` need to be run?"
2. **Either.match argument order** — `Either.match` takes `{ onLeft, onRight }`. Students may mix up which handler is for success vs failure. Ask: "In Either, which side is the success — Left or Right?"
3. **Exit vs Either** — Exit is what you get after running an Effect. It's similar to Either but lives in the "execution" world, not the "pure data" world. Ask: "When do you get an Exit? Before or after running an Effect?"
4. **Forgetting Effect.either in safeRun** — students may try to use try/catch or Effect.catchAll. Nudge: "`Effect.either` gives you the Either directly — no catching needed."
5. **inspectExit uses runSyncExit** — this is the one place in the kata series where the user writes runtime execution code. It's intentional. Ask: "Why would you want to inspect the Exit rather than just running the Effect normally?"

### When stuck

1. Start with `validatePositive` — it's pure, no Effects: "If `n` is positive, return `Either.right(n)`. Otherwise, return `Either.left` with an error message."
2. For `safeRun`: "Pipe the effect through `Effect.either` to get an `Effect<Either<...>>`, then `Effect.map` with `Either.match` to turn both sides into strings"
3. For `inspectExit`: "Call `Effect.runSyncExit(effect)` to get an Exit, then use `Exit.match` to convert both cases to strings"
4. Point to the Briefing Hints section above showing the `Effect.either` and `Exit.match` patterns

## On Completion

### Insight

Either is for pure validation (no effects needed). Exit is for inspecting effect outcomes after execution. `Effect.either` bridges the two worlds — converting an Effect's error channel into an Either value. Notice the pattern: Option (might not exist), Either (might be wrong), Exit (might have failed at runtime). Each represents a different kind of "two outcomes" at a different level of abstraction.

### Bridge

Value Handling is now complete. You can model missing values (Option), validation results (Either), and execution outcomes (Exit). Next up is **Dependency Injection** — kata 011 introduces `Context.Tag` and `provideService`, giving your Effects access to external services without hardcoding them.
