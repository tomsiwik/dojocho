import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { completeAndAwait, forkThenComplete, gatedExecution } from "./solution.js";

describe("034 — Deferred and Coordination", () => {
  it("completeAndAwait resolves with the value", async () => {
    const result = await Effect.runPromise(completeAndAwait(42));
    expect(result).toBe(42);
  });

  it("completeAndAwait works with strings", async () => {
    const result = await Effect.runPromise(completeAndAwait("hello"));
    expect(result).toBe("hello");
  });

  it("forkThenComplete coordinates via deferred", async () => {
    const result = await Effect.runPromise(forkThenComplete("done"));
    expect(result).toBe("done");
  });

  it("gatedExecution both fibers run after gate opens", async () => {
    const result = await Effect.runPromise(gatedExecution("a", "b"));
    expect(result).toEqual(["a", "b"]);
  });
});
