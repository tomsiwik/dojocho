import { Effect, Exit, Option } from "effect";
import { describe, expect, it } from "vitest";
import { validateEmail, validateAge, createUser, formatUser } from "./solution.js";

describe("015 — Domain Modeling", () => {
  it("validateEmail succeeds with valid email", () => {
    expect(Effect.runSync(validateEmail("a@b.com"))).toBe("a@b.com");
  });

  it("validateEmail fails without @", () => {
    const exit = Effect.runSyncExit(validateEmail("invalid"));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("validateAge succeeds with valid age", () => {
    expect(Effect.runSync(validateAge(25))).toBe(25);
  });

  it("validateAge fails with negative", () => {
    const exit = Effect.runSyncExit(validateAge(-1));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("createUser succeeds with valid input", () => {
    const user = Effect.runSync(createUser("Alice", "a@b.com", 30));
    expect(user.name).toBe("Alice");
    expect(user.email).toBe("a@b.com");
    expect(user.age).toBe(30);
    expect(user.nickname).toEqual(Option.none());
  });

  it("createUser fails with invalid email", () => {
    const exit = Effect.runSyncExit(createUser("Alice", "bad", 30));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("formatUser without nickname", () => {
    const user = { name: "Alice", email: "a@b.com", age: 30, nickname: Option.none() as Option.Option<string> };
    expect(formatUser(user)).toBe("Alice <a@b.com>");
  });

  it("formatUser with nickname", () => {
    const user = { name: "Alice", email: "a@b.com", age: 30, nickname: Option.some("Al") };
    expect(formatUser(user)).toBe("Alice <a@b.com> aka Al");
  });
});
