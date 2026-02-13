import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { forkAndJoin, forkBoth, forkAndInterrupt } from "./solution.js";

describe("020 — Fibers", () => {
  it("forkAndJoin returns the effect result", async () => {
    const result = await Effect.runPromise(forkAndJoin(Effect.succeed(42)));
    expect(result).toBe(42);
  });

  it("forkBoth returns both results", async () => {
    const result = await Effect.runPromise(
      forkBoth(Effect.succeed("a"), Effect.succeed("b")),
    );
    expect(result).toEqual(["a", "b"]);
  });

  it("forkAndInterrupt returns 'interrupted'", async () => {
    const slow = Effect.succeed("done").pipe(Effect.delay("10 seconds"));
    const result = await Effect.runPromise(forkAndInterrupt(slow));
    expect(result).toBe("interrupted");
  });
});
