# SENSEI — 024 Streams Basics

## Briefing

### Goal

Learn to use `Stream.fromIterable` to create streams, `Stream.map` and `Stream.filter` to transform them, `Stream.runCollect` to collect elements into a Chunk, and `Stream.runFold` to reduce a stream into a single value.

### Tasks

1. Implement `streamFromArray` -- create a Stream from an array and collect all elements back to an array.
2. Implement `filterAndDouble` -- create a stream from `[1,2,3,4,5]`, filter even numbers, double them, and collect the results.
3. Implement `sumStream` -- use `Stream.runFold` to sum all elements in a stream.

## Prerequisites

- **001–023** — all prior katas (Basics through Resource Management)

## Skills

Invoke `effect-patterns-streams-getting-started` before teaching this kata.

## Concepts Practiced

APIs the user writes in `solution.ts`:

- `Stream.fromIterable` — create a Stream from an array or iterable
- `Stream.filter` — keep only elements matching a predicate
- `Stream.map` — transform each element in the stream
- `Stream.runCollect` — consume the stream and collect all elements into a Chunk
- `Stream.runFold` — consume the stream by folding over elements with an accumulator
- `Chunk.toArray` — convert a Chunk to a plain array

> **Note**: `Effect.runSync` appears only in tests. The student does NOT write it. Never attribute it to their learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `streamFromArray collects all elements` | `Stream.fromIterable` + `Stream.runCollect` | `[1, 2, 3]` round-trips through stream and back |
| `streamFromArray handles empty array` | `Stream.fromIterable` + `Stream.runCollect` | Edge case — empty input produces empty output |
| `filterAndDouble returns [4, 8]` | `Stream.filter` + `Stream.map` | Filters evens from `[1,2,3,4,5]`, doubles them |
| `sumStream sums all elements` | `Stream.runFold` | Folds `[1,2,3,4,5]` with addition to get `15` |
| `sumStream of empty is 0` | `Stream.runFold` | Edge case — empty stream with initial value `0` |

## Teaching Approach

### Socratic prompts

- "You've been working with single Effect values. What if you need to process a *sequence* of values — like rows from a database or events from a websocket?"
- "How is a Stream different from an array? When would you prefer one over the other?"
- "After `runCollect`, you get a `Chunk`, not an array. Why do you think Effect uses its own collection type?"
- "What's the relationship between `Stream.runFold` and `Array.reduce`? What's the initial value for?"

### Common pitfalls

1. **`runCollect` returns a Chunk, not an array** — students must call `Chunk.toArray` to convert. Without it, the test comparison with `toEqual([...])` will fail. Ask: "What type does `runCollect` give you? How do you get a plain array from it?"
2. **`filterAndDouble` source data** — the stream is created from `[1, 2, 3, 4, 5]`. Evens are 2 and 4. Doubled: `[4, 8]`. Students may filter odds instead. Ask: "Which numbers from 1 to 5 are even?"
3. **`runFold` signature** — it takes an initial value, a combining function, and returns an Effect (not a Stream). Students may try to chain more stream operations after it. Ask: "Is `runFold` a transformation or a terminal operation?"
4. **Forgetting that stream operations return new streams** — `Stream.filter` and `Stream.map` don't consume the stream. You need a terminal operation like `runCollect` or `runFold` to get a result. Ask: "What turns a stream description into an actual value?"

### When stuck

1. Start with `streamFromArray` — "Create a stream with `Stream.fromIterable`, then `runCollect` it, then convert the Chunk to an array."
2. For `filterAndDouble`: "Same as `streamFromArray` but add `filter` and `map` steps between creation and collection."
3. For `sumStream`: "Instead of `runCollect`, use `runFold` — it's like `Array.reduce`. What should the initial value be for a sum?"
4. Refer them to the stream creation and terminal operation patterns in the Concepts Practiced section above

## On Completion

### Insight

Streams are lazy, pull-based sequences of values. Unlike arrays, they can represent infinite sequences and process elements one at a time without loading everything into memory. `runCollect` and `runFold` are terminal operations that "consume" the stream — until you call one, no elements are processed. This lazy evaluation model is what makes streams efficient for large or unbounded data.

### Bridge

Now that you can create, transform, and consume streams, the next step is more powerful **stream operations**. Kata 025 introduces `Stream.take` (limiting elements), `Stream.scan` (running accumulations), and `Stream.grouped` (batching) — tools for building real data processing pipelines.
