import { Effect, Exit } from "effect";
import { describe, expect, it } from "vitest";
import { HttpClient, fetchUser, fetchUserWithRetry } from "@/katas/029-http-client/solution.js";

const TestClient = {
  get: (url: string) => {
    if (url === "/user/1") return Effect.succeed({ id: 1, name: "Alice" });
    return Effect.fail("not found");
  },
};

describe("029 — HTTP Client", () => {
  it("fetchUser succeeds with valid response", () => {
    const result = Effect.runSync(
      Effect.provideService(fetchUser("/user/1"), HttpClient, TestClient),
    );
    expect(result).toEqual({ id: 1, name: "Alice" });
  });

  it("fetchUser fails with invalid url", () => {
    const exit = Effect.runSyncExit(
      Effect.provideService(fetchUser("/user/999"), HttpClient, TestClient),
    );
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("fetchUserWithRetry succeeds with valid response", () => {
    const result = Effect.runSync(
      Effect.provideService(fetchUserWithRetry("/user/1"), HttpClient, TestClient),
    );
    expect(result).toEqual({ id: 1, name: "Alice" });
  });

  it("fetchUserWithRetry retries on failure", () => {
    let attempts = 0;
    const FlakyClient = {
      get: (_url: string) => {
        attempts++;
        if (attempts <= 2) return Effect.fail("network error");
        return Effect.succeed({ id: 1, name: "Alice" });
      },
    };
    const result = Effect.runSync(
      Effect.provideService(fetchUserWithRetry("/user/1"), HttpClient, FlakyClient),
    );
    expect(result).toEqual({ id: 1, name: "Alice" });
    expect(attempts).toBe(3);
  });
});
