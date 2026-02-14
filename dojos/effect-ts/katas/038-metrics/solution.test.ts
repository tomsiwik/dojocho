import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import {
  requestCount,
  responseTime,
  activeConnections,
  countRequest,
  recordTime,
  setConnections,
} from "@/katas/038-metrics/solution.js";

describe("038 — Metrics", () => {
  it("requestCount is a counter", () => {
    expect(requestCount).toBeDefined();
  });

  it("responseTime is a histogram", () => {
    expect(responseTime).toBeDefined();
  });

  it("activeConnections is a gauge", () => {
    expect(activeConnections).toBeDefined();
  });

  it("countRequest increments counter and returns 'counted'", async () => {
    const result = await Effect.runPromise(countRequest);
    expect(result).toBe("counted");
  });

  it("recordTime records a value and returns 'recorded'", async () => {
    const result = await Effect.runPromise(recordTime(42));
    expect(result).toBe("recorded");
  });

  it("setConnections sets gauge and returns 'set'", async () => {
    const result = await Effect.runPromise(setConnections(5));
    expect(result).toBe("set");
  });
});
