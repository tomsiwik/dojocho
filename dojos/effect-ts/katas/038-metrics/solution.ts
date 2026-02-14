import { Effect, Metric, MetricBoundaries } from "effect";

/** Create a counter metric named "request_count" */
export const requestCount: Metric.Metric.Counter<number> = undefined as any;

/** Create a histogram metric named "response_time" with boundaries [10, 50, 100, 500, 1000] */
export const responseTime: Metric.Metric.Histogram<number> = undefined as any;

/** Create a gauge metric named "active_connections" */
export const activeConnections: Metric.Metric.Gauge<number> = undefined as any;

/** Increment the counter and return "counted" */
export const countRequest: Effect.Effect<string> = Effect.fail("Not implemented") as any;

/** Record a value in the histogram and return "recorded" */
export const recordTime = (ms: number): Effect.Effect<string> => {
  throw new Error("Not implemented");
};

/** Set the gauge value and return "set" */
export const setConnections = (n: number): Effect.Effect<string> => {
  throw new Error("Not implemented");
};
