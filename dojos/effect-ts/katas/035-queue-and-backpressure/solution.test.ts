import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { roundTrip, backpressureDemo, producerConsumer } from "@/katas/035-queue-and-backpressure/solution.js";

describe("035 — Queue and Backpressure", () => {
  it("roundTrip offers and takes items", async () => {
    const result = await Effect.runPromise(roundTrip([1, 2, 3]));
    expect(result).toEqual([1, 2, 3]);
  });

  it("roundTrip works with empty array", async () => {
    const result = await Effect.runPromise(roundTrip([]));
    expect(result).toEqual([]);
  });

  it("backpressureDemo collects all 3 items despite bounded queue", async () => {
    const result = await Effect.runPromise(backpressureDemo());
    expect(result).toEqual([1, 2, 3]);
  });

  it("producerConsumer collects n items", async () => {
    const result = await Effect.runPromise(producerConsumer(5));
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
