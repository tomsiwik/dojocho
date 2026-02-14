import { Effect, Exit } from "effect";
import { describe, expect, it } from "vitest";
import { processNumber, processUser, pipeline } from "@/katas/005-pipe-composition/solution.js";

describe("005 — Pipe Composition", () => {
  it("processNumber(5) succeeds with '11'", () => {
    expect(Effect.runSync(processNumber(5))).toBe("11");
  });

  it("processNumber(0) succeeds with '1'", () => {
    expect(Effect.runSync(processNumber(0))).toBe("1");
  });

  it("processUser('Alice', 30) succeeds with 'Alice (age 30)'", () => {
    expect(Effect.runSync(processUser("Alice", 30))).toBe("Alice (age 30)");
  });

  it("processUser('', 30) fails with 'InvalidName'", () => {
    const exit = Effect.runSyncExit(processUser("", 30));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("processUser('Alice', -1) fails with 'InvalidAge'", () => {
    const exit = Effect.runSyncExit(processUser("Alice", -1));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("pipeline('5') succeeds with 'Value: 5'", () => {
    expect(Effect.runSync(pipeline("5"))).toBe("Value: 5");
  });

  it("pipeline('abc') fails", () => {
    const exit = Effect.runSyncExit(pipeline("abc"));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("pipeline('-3') fails with not positive", () => {
    const exit = Effect.runSyncExit(pipeline("-3"));
    expect(Exit.isFailure(exit)).toBe(true);
  });
});
