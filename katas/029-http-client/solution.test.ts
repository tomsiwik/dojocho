import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { HttpClient, fetchUser, fetchUserWithRetry } from "./solution.js";

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
    expect(exit._tag).toBe("Failure");
  });

  it("fetchUserWithRetry succeeds with valid response", () => {
    const result = Effect.runSync(
      Effect.provideService(fetchUserWithRetry("/user/1"), HttpClient, TestClient),
    );
    expect(result).toEqual({ id: 1, name: "Alice" });
  });
});
