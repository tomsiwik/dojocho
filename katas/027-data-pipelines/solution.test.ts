import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { processItems, sumPositiveNumbers } from "./solution.js";

describe("027 — Data Pipelines", () => {
  it("processItems applies function to each", () => {
    const result = Effect.runSync(
      processItems([1, 2, 3], (n) => Effect.succeed(n * 10)),
    );
    expect(result).toEqual([10, 20, 30]);
  });

  it("sumPositiveNumbers parses, filters, and sums", () => {
    const result = Effect.runSync(sumPositiveNumbers(["1", "abc", "-2", "3", "4"]));
    expect(result).toBe(8);
  });

  it("sumPositiveNumbers of empty is 0", () => {
    const result = Effect.runSync(sumPositiveNumbers([]));
    expect(result).toBe(0);
  });
});
