import { Effect, Exit } from "effect";
import { describe, expect, it } from "vitest";
import { fetchAll, processWithLimit } from "@/katas/017-parallel-effects/solution.js";

describe("017 — Parallel Effects", () => {
  it("fetchAll runs effects and collects results", () => {
    const effects = [Effect.succeed(1), Effect.succeed(2), Effect.succeed(3)];
    const result = Effect.runSync(fetchAll(effects));
    expect(result).toEqual([1, 2, 3]);
  });

  it("fetchAll fails if any effect fails", () => {
    const effects = [Effect.succeed(1), Effect.fail("oops"), Effect.succeed(3)];
    const exit = Effect.runSyncExit(fetchAll(effects));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("processWithLimit applies function to each item", () => {
    const result = Effect.runSync(
      processWithLimit([1, 2, 3], (n) => Effect.succeed(n * 2)),
    );
    expect(result).toEqual([2, 4, 6]);
  });

  it("processWithLimit fails if any processing fails", () => {
    const exit = Effect.runSyncExit(
      processWithLimit([1, 2, 3], (n) =>
        n === 2 ? Effect.fail("bad") : Effect.succeed(n),
      ),
    );
    expect(Exit.isFailure(exit)).toBe(true);
  });
});
