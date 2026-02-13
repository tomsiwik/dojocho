import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { streamFromArray, filterAndDouble, sumStream } from "./solution.js";

describe("024 — Streams Basics", () => {
  it("streamFromArray collects all elements", () => {
    const result = Effect.runSync(streamFromArray([1, 2, 3]));
    expect(result).toEqual([1, 2, 3]);
  });

  it("streamFromArray handles empty array", () => {
    const result = Effect.runSync(streamFromArray([]));
    expect(result).toEqual([]);
  });

  it("filterAndDouble returns [4, 8]", () => {
    const result = Effect.runSync(filterAndDouble());
    expect(result).toEqual([4, 8]);
  });

  it("sumStream sums all elements", () => {
    const result = Effect.runSync(sumStream([1, 2, 3, 4, 5]));
    expect(result).toBe(15);
  });

  it("sumStream of empty is 0", () => {
    const result = Effect.runSync(sumStream([]));
    expect(result).toBe(0);
  });
});
