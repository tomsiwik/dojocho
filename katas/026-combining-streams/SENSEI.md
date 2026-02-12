# SENSEI — 026 Combining Streams

## Briefing

### Goal

Learn to use `Stream.concat` to concatenate two streams sequentially, `Stream.zip` to pair elements from two streams into tuples, and `Stream.merge` to interleave elements from two streams.

### Tasks

1. Implement `concatStreams` -- concatenate two streams sequentially.
2. Implement `zipStreams` -- zip two streams into tuples.
3. Implement `mergeStreams` -- merge two streams (interleaved, order may vary).

## Prerequisites

- **024 Streams Basics** — `Stream`, `Stream.fromIterable`, `Stream.runCollect`
- **025 Stream Operations** — `Stream.map`, `Stream.filter`, `Stream.take`

## Skills

None — continuing in the Streams area.

## Concepts Practiced

APIs the user writes in `solution.ts`:

- `Stream.fromIterable` — create a stream from an array
- `Stream.concat` — append one stream after another (sequential)
- `Stream.zip` — pair elements from two streams lock-step
- `Stream.merge` — interleave elements from two streams concurrently
- `Stream.runCollect` — collect all stream elements into a Chunk
- `Chunk.toArray` — convert a Chunk to a plain array

> **Note**: `Effect.runSync` appears only in tests. Never attribute it to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `concatStreams appends second after first` | `Stream.concat` | `[1,2] ++ [3,4] = [1,2,3,4]` — sequential ordering |
| `zipStreams pairs elements` | `Stream.zip` | `[1,2] zip ["a","b"] = [[1,"a"],[2,"b"]]` — lock-step pairing |
| `mergeStreams contains all elements` | `Stream.merge` | `merge [1,2] [3,4]` sorted = `[1,2,3,4]` — all elements present regardless of order |

## Teaching Approach

### Socratic prompts

- "You know how to create and transform a single stream. What if you have TWO streams and need to combine them? What different relationships could two data sources have?"
- "What's the difference between putting one stream after another vs pairing their elements vs running them at the same time?"
- "If one stream has 3 elements and the other has 5, what should `zip` produce? What about `concat`? What about `merge`?"

### Common pitfalls

1. **zip stops at the shorter stream** — `Stream.zip` produces pairs until one stream runs out. If the streams have different lengths, the extra elements from the longer one are dropped. Ask: "How many pairs do you get from zipping [1,2,3] with ['a','b']?"
2. **merge order is non-deterministic** — `Stream.merge` interleaves elements as they become available. The test uses `.sort()` to verify contents regardless of order. Ask: "Can you guarantee which element comes first from a merge? Why does the test sort the result?"
3. **Forgetting Chunk.toArray** — `Stream.runCollect` returns a `Chunk`, not an array. The tests expect plain arrays. Ask: "What type does `runCollect` give you? What do the tests expect?"
4. **Confusing concat and merge** — `concat` is sequential (all of A, then all of B), while `merge` is concurrent (interleaved). Ask: "If stream A takes a long time, does `concat` start B before A finishes?"

### When stuck

1. Start with `concatStreams` — it's the most intuitive: "Create two streams from the arrays, then use `concat` to join them"
2. For `zipStreams`: "Same idea — two streams, but `zip` pairs them up element by element"
3. For `mergeStreams`: "Same two streams, but `merge` runs them concurrently. The test sorts, so order doesn't matter"
4. Remind them: "All three functions end the same way — `runCollect` then `Chunk.toArray`"

## On Completion

### Insight

`concat` is sequential (all of A then all of B), `zip` is lock-step (pairs up elements, stops at the shorter), `merge` is concurrent (interleaves as available). Each combinator models a different relationship between two data sources. Choosing the right one depends on whether your sources are independent and unrelated (concat), correlated by position (zip), or independent but concurrent (merge).

### Bridge

Now that you can create, transform, and combine streams, kata 027 introduces **data pipelines** — using `Stream.mapEffect` to process each element through an effectful function, and `Stream.runFold` to reduce streams to a single value. This is the ETL (Extract, Transform, Load) pattern expressed as a stream pipeline.
