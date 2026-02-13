# SENSEI — 025 Stream Operations

## Briefing

### Goal

Learn to use `Stream.take` to take the first n elements from a stream, `Stream.scan` to compute running accumulations, and `Stream.grouped` to batch stream elements into fixed-size chunks.

### Tasks

1. Implement `takeFirst` -- take the first n elements from a stream of numbers 1, 2, 3, ...
2. Implement `runningTotal` -- use `Stream.scan` to compute running totals of the input array (e.g., `[1,2,3]` becomes `[1,3,6]`).
3. Implement `batchItems` -- use `Stream.grouped` to batch items into chunks of size n, returning an array of arrays.

## Prerequisites

- **024 Streams Basics** — `Stream.fromIterable`, `Stream.filter`, `Stream.map`, `Stream.runCollect`, `Stream.runFold`

## Skills

Invoke `effect-patterns-streams` before teaching this kata.

> **Note**: `Effect.runSync` appears only in tests. The student does NOT write it. Never attribute it to their learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `takeFirst(3) returns [1, 2, 3]` | `Stream.iterate` + `Stream.take` | Infinite stream limited to 3 elements |
| `takeFirst(0) returns []` | `Stream.take` | Edge case — taking zero elements |
| `runningTotal of [1,2,3] is [1,3,6]` | `Stream.scan` | Accumulating sums: 1, 1+2=3, 3+3=6 |
| `runningTotal of [] is []` | `Stream.scan` | Edge case — empty input |
| `batchItems groups into chunks` | `Stream.grouped` | `[1,2,3,4,5]` with size 2 produces `[[1,2],[3,4],[5]]` |

## Teaching Approach

### Socratic prompts

- "How does `scan` differ from `reduce` / `runFold`? When would you want *all* the intermediate results instead of just the final one?"
- "If you `take(3)` from an infinite stream, how does laziness prevent the stream from running forever?"
- "For batching, the last group might be smaller than the batch size. How does `grouped` handle that — does it drop it, pad it, or emit it as-is?"

### Common pitfalls

1. **`takeFirst` needs an infinite stream** — students must create a stream starting at 1 that counts upward. Use `Stream.iterate(1, n => n + 1)` or similar. Students may try to create a finite array first, which defeats the purpose. Ask: "Can you take 3 elements from an infinite stream without running out of memory? How?"
2. **`scan` emits every intermediate value** — unlike `runFold` which produces one final result, `scan` emits each accumulation step. For `[1, 2, 3]` with addition, scan emits `[1, 3, 6]`, not just `6`. Students may confuse scan with fold. Ask: "How many elements does the output stream have compared to the input?"
3. **`grouped` returns Chunk<Chunk<A>>** — after `runCollect`, you get a `Chunk` of `Chunk`s. You need to convert both the outer and inner chunks to arrays. Students may forget the inner conversion. Ask: "After `runCollect`, what's the type? How do you get `number[][]` from it?"
4. **`scan` initial value and empty streams** — `scan` with an initial value of 0 would emit `[0, 1, 3, 6]` for input `[1, 2, 3]`. The test expects `[1, 3, 6]` — no leading zero. Students need to think about whether to use an initial value or start from the first element. Ask: "The test expects 3 elements out for 3 elements in. Does your scan add an extra element?"
5. **`takeFirst` uses `Stream.iterate`** — create an infinite stream with `Stream.iterate(1, n => n + 1)`, then pipe through `Stream.take(n)` and collect. Don't pre-allocate a finite array.

## On Completion

### Insight

`Stream.take` on an infinite stream is safe — it only pulls n elements, then stops. `Stream.scan` is a stateful transformation that remembers the accumulator and emits each intermediate result. `Stream.grouped` batches elements without buffering the entire stream. These operations compose naturally — you build complex pipelines from simple parts, and laziness ensures only the necessary work is done.

### Bridge

You can now create, transform, limit, accumulate, and batch streams. Kata 026 introduces **combining streams** — `merge`, `zip`, and `concat` — for building pipelines that draw from multiple data sources simultaneously.
