import { Effect, Exit } from "effect";
import { describe, expect, it } from "vitest";
import { divide, parseInteger, safeDivide } from "./solution.js";

describe("006 — Handle Errors", () => {
  it("divide(10, 2) succeeds with 5", () => {
    expect(Effect.runSync(divide(10, 2))).toBe(5);
  });

  it("divide(10, 0) fails with DivisionByZero", () => {
    const exit = Effect.runSyncExit(divide(10, 0));
    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      const error = exit.cause;
      expect(error).toMatchObject({
        _tag: "Fail",
        error: { _tag: "DivisionByZero" },
      });
    }
  });

  it("safeDivide(10, 2) succeeds with 5", () => {
    expect(Effect.runSync(safeDivide(10, 2))).toBe(5);
  });

  it("safeDivide(10, 0) recovers with 0", () => {
    expect(Effect.runSync(safeDivide(10, 0))).toBe(0);
  });

  it("parseInteger('42') succeeds with 42", () => {
    expect(Effect.runSync(parseInteger("42"))).toBe(42);
  });

  it("parseInteger('-7') succeeds with -7", () => {
    expect(Effect.runSync(parseInteger("-7"))).toBe(-7);
  });

  it("parseInteger('abc') fails with ParseError", () => {
    const exit = Effect.runSyncExit(parseInteger("abc"));
    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      expect(exit.cause).toMatchObject({
        _tag: "Fail",
        error: { _tag: "ParseError", input: "abc" },
      });
    }
  });

  it("parseInteger('3.14') fails with ParseError", () => {
    const exit = Effect.runSyncExit(parseInteger("3.14"));
    expect(Exit.isFailure(exit)).toBe(true);
  });
});
