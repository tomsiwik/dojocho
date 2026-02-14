import { Cause, Effect, Exit } from "effect";
import { describe, expect, it } from "vitest";
import { boom, catchDefect, sandboxed, safeDivide } from "@/katas/032-cause-and-defects/solution.js";

describe("032 — Cause and Defects", () => {
  it("boom dies with 'boom'", () => {
    const exit = Effect.runSyncExit(boom);
    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      expect(Cause.isDie(exit.cause)).toBe(true);
    }
  });

  it("catchDefect recovers from a die", () => {
    const result = Effect.runSync(catchDefect(Effect.die("crash")));
    expect(result).toBe("crash");
  });

  it("catchDefect recovers from an Error defect", () => {
    const result = Effect.runSync(catchDefect(Effect.die(new Error("oops"))));
    expect(result).toBe("oops");
  });

  it("catchDefect passes through normal values", () => {
    const result = Effect.runSync(catchDefect(Effect.succeed(42)));
    expect(result).toBe(42);
  });

  it("sandboxed exposes cause on failure", () => {
    const exit = Effect.runSyncExit(sandboxed(Effect.fail("bad")));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("safeDivide succeeds with positive numbers", () => {
    expect(Effect.runSync(safeDivide(5))).toBe(5);
  });

  it("safeDivide fails with 'zero' for 0", () => {
    const exit = Effect.runSyncExit(safeDivide(0));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("safeDivide dies for negative numbers", () => {
    const exit = Effect.runSyncExit(safeDivide(-1));
    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      expect(Cause.isDie(exit.cause)).toBe(true);
    }
  });
});
