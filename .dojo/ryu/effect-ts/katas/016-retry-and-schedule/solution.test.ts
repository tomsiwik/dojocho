import { Effect, Exit } from "effect";
import { describe, expect, it } from "vitest";
import { retryThreeTimes, flakyEffect, repeatCollect } from "./solution.js";

describe("016 — Retry and Schedule", () => {
  it("retryThreeTimes succeeds on first try", () => {
    expect(Effect.runSync(retryThreeTimes(Effect.succeed("ok")))).toBe("ok");
  });

  it("flakyEffect that fails 2 times then succeeds", () => {
    const result = Effect.runSync(retryThreeTimes(flakyEffect(2)));
    expect(result).toBe("done");
  });

  it("flakyEffect that fails 5 times still fails after 3 retries", () => {
    const exit = Effect.runSyncExit(retryThreeTimes(flakyEffect(5)));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("repeatCollect collects repeated values", async () => {
    let count = 0;
    const effect = Effect.sync(() => ++count);
    const result = await Effect.runPromise(repeatCollect(effect));
    expect(result.length).toBeGreaterThanOrEqual(4); // initial + 3 repeats
  });
});
