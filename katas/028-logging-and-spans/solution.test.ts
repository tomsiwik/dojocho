import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { logAndReturn, logWithContext, withTracking } from "./solution.js";

describe("028 — Logging and Spans", () => {
  it("logAndReturn returns 'done'", () => {
    const result = Effect.runSync(logAndReturn("hello"));
    expect(result).toBe("done");
  });

  it("logWithContext returns 'done'", () => {
    const result = Effect.runSync(logWithContext("req-1", "processing"));
    expect(result).toBe("done");
  });

  it("withTracking preserves the effect result", () => {
    const result = Effect.runSync(withTracking("my-span", Effect.succeed(42)));
    expect(result).toBe(42);
  });
});
