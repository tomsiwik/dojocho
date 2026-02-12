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

> **Note**: `Effect.runSync` appears only in tests. Never attribute it to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `concatStreams appends second after first` | `Stream.concat` | `[1,2] ++ [3,4] = [1,2,3,4]` — sequential ordering |
| `zipStreams pairs elements` | `Stream.zip` | `[1,2] zip ["a","b"] = [[1,"a"],[2,"b"]]` — lock-step pairing |
| `mergeStreams contains all elements` | `Stream.merge` | `merge [1,2] [3,4]` sorted = `[1,2,3,4]` — all elements present regardless of order |

## Teaching Approach

### Socratic prompts

- "What ordering guarantees does `merge` give you vs `concat`? If you need results in a specific order, which do you pick?"
- "If one stream has 3 elements and the other has 5, what should `zip` produce? What about `concat`? What about `merge`? Think about the semantics of each combinator."
- "When would you choose `merge` (non-deterministic interleaving) over `concat` (sequential) in a real application?"

### Common pitfalls

1. **zip stops at the shorter stream** — `Stream.zip` produces pairs until one stream runs out. If the streams have different lengths, the extra elements from the longer one are dropped. Ask: "How many pairs do you get from zipping [1,2,3] with ['a','b']?"
2. **merge order is non-deterministic** — `Stream.merge` interleaves elements as they become available. The test uses `.sort()` to verify contents regardless of order. Ask: "Can you guarantee which element comes first from a merge? Why does the test sort the result?"
3. **Forgetting Chunk.toArray** — See kata 024 for `Chunk.toArray` -- same pattern applies here.
4. **Confusing concat and merge** — `concat` is sequential (all of A, then all of B), while `merge` is concurrent (interleaved). Ask: "If stream A takes a long time, does `concat` start B before A finishes?"
5. **All three end the same way** — every combinator function ends with `runCollect` then `Chunk.toArray`. Start with `concatStreams` (most intuitive), then apply the same pattern to `zip` and `merge`.

## On Completion

### Insight

`concat` is sequential (all of A then all of B), `zip` is lock-step (pairs up elements, stops at the shorter), `merge` is concurrent (interleaves as available). Each combinator models a different relationship between two data sources. Choosing the right one depends on whether your sources are independent and unrelated (concat), correlated by position (zip), or independent but concurrent (merge).

### Bridge

Now that you can create, transform, and combine streams, kata 027 introduces **data pipelines** — using `Stream.mapEffect` to process each element through an effectful function, and `Stream.runFold` to reduce streams to a single value. This is the ETL (Extract, Transform, Load) pattern expressed as a stream pipeline.
