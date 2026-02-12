import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { takeFirst, runningTotal, batchItems } from "./solution.js";

describe("025 — Stream Operations", () => {
  it("takeFirst(3) returns [1, 2, 3]", () => {
    expect(Effect.runSync(takeFirst(3))).toEqual([1, 2, 3]);
  });

  it("takeFirst(0) returns []", () => {
    expect(Effect.runSync(takeFirst(0))).toEqual([]);
  });

  it("runningTotal of [1,2,3] is [1,3,6]", () => {
    expect(Effect.runSync(runningTotal([1, 2, 3]))).toEqual([1, 3, 6]);
  });

  it("runningTotal of [] is []", () => {
    expect(Effect.runSync(runningTotal([]))).toEqual([]);
  });

  it("batchItems groups into chunks", () => {
    const result = Effect.runSync(batchItems([1, 2, 3, 4, 5], 2));
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });
});
