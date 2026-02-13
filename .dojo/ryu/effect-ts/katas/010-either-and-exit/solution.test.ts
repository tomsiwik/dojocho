import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";
import { safeRun, validatePositive, inspectExit } from "@/katas/010-either-and-exit/solution.js";

describe("010 — Either and Exit", () => {
  it("safeRun wraps success", () => {
    expect(Effect.runSync(safeRun(Effect.succeed("hello")))).toBe("ok: hello");
  });

  it("safeRun wraps failure", () => {
    expect(Effect.runSync(safeRun(Effect.fail("boom")))).toBe("err: boom");
  });

  it("validatePositive returns Right for positive", () => {
    expect(validatePositive(5)).toEqual(Either.right(5));
  });

  it("validatePositive returns Left for zero", () => {
    expect(Either.isLeft(validatePositive(0))).toBe(true);
  });

  it("validatePositive returns Left for negative", () => {
    expect(Either.isLeft(validatePositive(-3))).toBe(true);
  });

  it("inspectExit returns success string", () => {
    expect(inspectExit(Effect.succeed("data"))).toBe("success: data");
  });

  it("inspectExit returns failure string", () => {
    expect(inspectExit(Effect.fail("oops"))).toBe("failure");
  });
});
