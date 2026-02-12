import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { raceTwo, withTimeout, withTimeoutFallback } from "./solution.js";

describe("018 — Race and Timeout", () => {
  it("raceTwo returns the faster result", () => {
    const fast = Effect.succeed("fast");
    const slow = Effect.succeed("slow").pipe(Effect.delay("1 second"));
    const result = Effect.runSync(raceTwo(fast, slow));
    expect(result).toBe("fast");
  });

  it("withTimeout succeeds within time", () => {
    const fast = Effect.succeed("ok");
    const result = Effect.runSync(withTimeout(fast, "1 second"));
    expect(result).toBe("ok");
  });

  it("withTimeoutFallback returns fallback on slow effect", async () => {
    const slow = Effect.succeed("slow").pipe(Effect.delay("1 second"));
    const result = await Effect.runPromise(withTimeoutFallback(slow, "10 millis", "default"));
    expect(result).toBe("default");
  });
});
