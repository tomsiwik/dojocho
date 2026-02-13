import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { handleAllErrors, withFallback, toResult, NetworkError, TimeoutError, AuthError } from "@/katas/008-error-patterns/solution.js";

describe("008 — Error Patterns", () => {
  it("handleAllErrors handles NetworkError", () => {
    const effect = Effect.fail(new NetworkError({ url: "https://api.com" }));
    expect(Effect.runSync(handleAllErrors(effect))).toBe("network error: https://api.com");
  });

  it("handleAllErrors handles TimeoutError", () => {
    const effect = Effect.fail(new TimeoutError({ ms: 5000 }));
    expect(Effect.runSync(handleAllErrors(effect))).toBe("timeout after 5000ms");
  });

  it("handleAllErrors handles AuthError", () => {
    const effect = Effect.fail(new AuthError({ reason: "expired token" }));
    expect(Effect.runSync(handleAllErrors(effect))).toBe("auth failed: expired token");
  });

  it("handleAllErrors passes through success", () => {
    const effect = Effect.succeed("data") as Effect.Effect<string, NetworkError | TimeoutError | AuthError>;
    expect(Effect.runSync(handleAllErrors(effect))).toBe("data");
  });

  it("withFallback uses primary on success", () => {
    expect(Effect.runSync(withFallback(Effect.succeed("primary"), Effect.succeed("fallback")))).toBe("primary");
  });

  it("withFallback uses fallback on failure", () => {
    expect(Effect.runSync(withFallback(Effect.fail("oops"), Effect.succeed("fallback")))).toBe("fallback");
  });

  it("toResult wraps success", () => {
    expect(Effect.runSync(toResult(Effect.succeed("hello")))).toBe("ok: hello");
  });

  it("toResult wraps failure", () => {
    expect(Effect.runSync(toResult(Effect.fail("boom")))).toBe("err: boom");
  });
});
