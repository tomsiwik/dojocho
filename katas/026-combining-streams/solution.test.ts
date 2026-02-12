import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { concatStreams, zipStreams, mergeStreams } from "./solution.js";

describe("026 — Combining Streams", () => {
  it("concatStreams appends second after first", () => {
    const result = Effect.runSync(concatStreams([1, 2], [3, 4]));
    expect(result).toEqual([1, 2, 3, 4]);
  });

  it("zipStreams pairs elements", () => {
    const result = Effect.runSync(zipStreams([1, 2], ["a", "b"]));
    expect(result).toEqual([[1, "a"], [2, "b"]]);
  });

  it("mergeStreams contains all elements", () => {
    const result = Effect.runSync(mergeStreams([1, 2], [3, 4]));
    expect(result.sort()).toEqual([1, 2, 3, 4]);
  });
});
