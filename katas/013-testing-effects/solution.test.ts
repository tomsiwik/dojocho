import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { UserRepo, getUser, getUserSafe } from "./solution.js";

// Test double
const TestUserRepo = {
  findById: (id: number) =>
    id === 1
      ? Effect.succeed("Alice")
      : Effect.fail("not found"),
};

describe("013 — Testing Effects", () => {
  it("getUser(1) returns 'User: Alice'", () => {
    const result = Effect.runSync(
      Effect.provideService(getUser(1), UserRepo, TestUserRepo),
    );
    expect(result).toBe("User: Alice");
  });

  it("getUser(99) fails", () => {
    const exit = Effect.runSyncExit(
      Effect.provideService(getUser(99), UserRepo, TestUserRepo),
    );
    expect(exit._tag).toBe("Failure");
  });

  it("getUserSafe(1) returns 'User: Alice'", () => {
    const result = Effect.runSync(
      Effect.provideService(getUserSafe(1), UserRepo, TestUserRepo),
    );
    expect(result).toBe("User: Alice");
  });

  it("getUserSafe(99) returns 'User: Unknown'", () => {
    const result = Effect.runSync(
      Effect.provideService(getUserSafe(99), UserRepo, TestUserRepo),
    );
    expect(result).toBe("User: Unknown");
  });
});
