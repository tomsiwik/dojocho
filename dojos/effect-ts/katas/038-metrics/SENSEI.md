# SENSEI — 038 Metrics

## Briefing

### Goal

Learn to define and use Effect's built-in metric primitives: counters, histograms, and gauges.

### Tasks

1. Define `requestCount` as a counter metric named `"request_count"`
2. Define `responseTime` as a histogram metric named `"response_time"` with boundaries `[10, 50, 100, 500]`
3. Define `activeConnections` as a gauge metric named `"active_connections"`
4. Implement `countRequest` -- increment the counter and return `"counted"`
5. Implement `recordTime` -- record a value in the histogram and return `"recorded"`
6. Implement `setConnections` -- set the gauge to a value and return `"set"`

### Hints

```ts
import { Effect, Metric, MetricBoundaries } from "effect";

// Counter: tracks cumulative totals
const myCounter = Metric.counter("my_counter");

// Histogram: tracks distribution of values
const myHistogram = Metric.histogram(
  "my_histogram",
  MetricBoundaries.fromIterable([10, 50, 100]),
);

// Gauge: tracks current value
const myGauge = Metric.gauge("my_gauge");

// Increment a counter
const inc = Metric.increment(myCounter); // Effect<void>

// Record a value in a histogram
const record = Metric.update(myHistogram, 42); // Effect<void>

// Set a gauge
const set = Metric.set(myGauge, 5); // Effect<void>

// Chain with a return value
const withResult = Effect.as(Metric.increment(myCounter), "done");
```

## Prerequisites

- **001 Hello Effect** -- `Effect.succeed`, `Effect.map`
- **028 Logging and Spans** -- observability concepts

## Skills

Invoke `effect-patterns-observability` before teaching this kata.

## Test Map
> **Note**: `Effect.runPromise` appears only in tests. Never attribute it to the user's learning.

| Test | Concept | Verifies |
|------|---------|----------|
| `requestCount is a counter` | `Metric.counter` | Counter metric is defined |
| `responseTime is a histogram` | `Metric.histogram` | Histogram metric is defined with boundaries |
| `activeConnections is a gauge` | `Metric.gauge` | Gauge metric is defined |
| `countRequest increments counter and returns 'counted'` | `Metric.increment` + `Effect.as` | Counter increment produces a value |
| `recordTime records a value and returns 'recorded'` | `Metric.update` | Histogram records a measurement |
| `setConnections sets gauge and returns 'set'` | `Metric.set` | Gauge is set to an absolute value |

## Teaching Approach

### Socratic prompts

- "A counter only goes up (or tracks a running total). A gauge can go up or down. When would you use one versus the other?"
- "`Metric.histogram` requires boundaries like `[10, 50, 100, 500]`. What do these boundaries represent, and why do you choose them upfront?"
- "`Metric.increment` returns `Effect<void>`. How do you chain it with another effect so the overall result is `'counted'` instead of `void`?"

### Common pitfalls

1. **Histogram needs `MetricBoundaries`, not a raw array** -- `Metric.histogram` expects a `MetricBoundaries` value, not `number[]`. Use `MetricBoundaries.fromIterable([10, 50, 100, 500])` to convert. Ask: "What type does the second argument of `Metric.histogram` expect?"
2. **Returning a value after a void effect** -- `Metric.increment` returns `Effect<void>`. To return `"counted"`, use `Effect.as(effect, "counted")` or `Effect.map(effect, () => "counted")`. Students often forget to chain the return value.
3. **Confusing `Metric.update` and `Metric.set`** -- `update` records an observation (for histograms and counters). `set` sets the current value (for gauges). Using the wrong one will not type-check or will produce unexpected behavior.

## On Completion

### Insight

Effect metrics are not just numbers you log -- they are first-class values in the effect system. A `Metric.counter` is a reusable definition that you reference by name, and every time you call `Metric.increment`, the runtime records the observation. The boundaries in a histogram determine the buckets that aggregate your data, which is why you choose them based on your expected value distribution. Because metrics are effects, they compose naturally with your application logic -- no separate instrumentation library, no global state, just pipe and go.

### Bridge

You have learned to observe your application with metrics. Kata 039 introduces `ManagedRuntime` -- a way to create a pre-configured runtime with your services baked in, useful for integrating Effect into existing applications or running effects outside the normal Effect entry point.
