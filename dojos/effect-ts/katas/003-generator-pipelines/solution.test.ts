import { Effect, Exit } from "effect";
import { describe, expect, it } from "vitest";
import { combinedLength, fetchAndDouble, pipeline } from "@/katas/003-generator-pipelines/solution.js";

describe("003 — Generator Pipelines", () => {
  it("fetchAndDouble(5) succeeds with 10", () => {
    expect(Effect.runSync(fetchAndDouble(5))).toBe(10);
  });

  it("fetchAndDouble(0) succeeds with 0", () => {
    expect(Effect.runSync(fetchAndDouble(0))).toBe(0);
  });

  it("combinedLength('hello', 'world') succeeds with 10", () => {
    expect(Effect.runSync(combinedLength("hello", "world"))).toBe(10);
  });

  it("combinedLength('', 'test') succeeds with 4", () => {
    expect(Effect.runSync(combinedLength("", "test"))).toBe(4);
  });

  it("pipeline('5') succeeds with 'Result: 10'", () => {
    expect(Effect.runSync(pipeline("5"))).toBe("Result: 10");
  });

  it("pipeline('0') succeeds with 'Result: 0'", () => {
    expect(Effect.runSync(pipeline("0"))).toBe("Result: 0");
  });

  it("pipeline('abc') fails with ParseError", () => {
    const exit = Effect.runSyncExit(pipeline("abc"));
    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      expect(exit.cause).toMatchObject({
        _tag: "Fail",
        error: { _tag: "ParseError", input: "abc" },
      });
    }
  });
});
