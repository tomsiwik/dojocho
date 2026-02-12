# SENSEI — 027 Data Pipelines

## Briefing

### Goal

Learn to use `Stream.mapEffect` to apply an effectful function to each stream element, and to build multi-step pipelines that compose stream transformations into data processing workflows.

### Tasks

1. Implement `processItems` -- use `Stream.mapEffect` to asynchronously process each item by applying `fn` to each element in the stream, then collect results.
2. Implement `sumPositiveNumbers` -- build a pipeline that takes an array of strings, parses them to numbers (skipping non-numeric values), filters positives, and sums them.

## Prerequisites

- **024 Streams Basics** — `Stream`, `Stream.fromIterable`, `Stream.runCollect`
- **025 Stream Operations** — `Stream.map`, `Stream.filter`, `Stream.take`
- **026 Combining Streams** — `Stream.concat`, `Stream.zip`, `Stream.merge`

## Skills

Invoke `effect-patterns-building-data-pipelines` before teaching this kata.

> **Note**: `Effect.runSync` appears only in tests. Never attribute it to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `processItems applies function to each` | `Stream.mapEffect` + `Stream.runCollect` | `[1,2,3]` with `n => succeed(n*10)` = `[10,20,30]` |
| `sumPositiveNumbers parses, filters, and sums` | `Stream.map` + `Stream.filter` + `Stream.runFold` | `["1","abc","-2","3","4"]` -> skip non-numeric, filter positive, sum = 8 |
| `sumPositiveNumbers of empty is 0` | `Stream.runFold` | Empty stream fold returns initial value 0 |

## Teaching Approach

### Socratic prompts

- "If one step in your pipeline fails (e.g., a bad parse or a failed API call), what happens to the partially processed data? Does the entire pipeline abort?"
- "For `sumPositiveNumbers`, there are three stages: parse, filter, sum. What happens if you reorder them -- say, filter before parse? Does the pipeline still work?"
- "What makes `mapEffect` different from `map`? When would each step in a pipeline *need* to be effectful vs pure?"

### Common pitfalls

1. **Non-numeric strings should be skipped, not fail the pipeline** — `parseInt("abc")` returns `NaN`. The pipeline should filter these out rather than failing the entire stream. Ask: "What happens when you parse 'abc'? Should that crash the whole pipeline or just skip that element?"
2. **processItems uses mapEffect, not map** — since `fn` returns an `Effect`, you need `Stream.mapEffect` to unwrap each result into the stream. Using `Stream.map` would give you a stream of Effects. Ask: "What type do you get if you `map` with a function that returns an Effect?"
3. **runFold needs an initial value and a combine function** — `Stream.runFold(0, (acc, n) => acc + n)` starts at 0 and adds each element. Ask: "What should the sum be if the stream is empty?"
4. **Filter placement matters** — filter out `NaN` values BEFORE filtering for positive numbers. Both checks can be combined, but the parse step must come first.
5. **Pipeline stage order** — break `sumPositiveNumbers` into stages: `fromIterable` -> `map(parseInt)` -> `filter(not NaN and positive)` -> `runFold` to sum.

## On Completion

### Insight

`Stream.mapEffect` is the bridge between streams and effects — each element is processed through an effectful function, making streams capable of I/O, validation, and error handling at every step. The `sumPositiveNumbers` pipeline demonstrates the ETL pattern: **Extract** (parse strings), **Transform** (filter positives), **Load** (fold into sum). This same pattern scales to real-world data processing — reading from files, transforming records, writing to databases — all expressed as a composable stream pipeline.

### Bridge

With streams and data pipelines covered, kata 028 shifts to **observability** — using `Effect.log`, `Effect.annotateLogs`, and `Effect.withSpan` to add structured logging and tracing to your effects. These tools make production applications debuggable without changing their logic.
