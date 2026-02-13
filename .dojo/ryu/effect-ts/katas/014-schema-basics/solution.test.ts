import { Effect, Exit } from "effect";
import { describe, expect, it } from "vitest";
import { parseUser, parseStrictUser } from "@/katas/014-schema-basics/solution.js";

describe("014 — Schema Basics", () => {
  it("parseUser succeeds with valid input", () => {
    const result = Effect.runSync(parseUser({ name: "Alice", age: 30 }));
    expect(result).toEqual({ name: "Alice", age: 30 });
  });

  it("parseUser fails with missing field", () => {
    const exit = Effect.runSyncExit(parseUser({ name: "Alice" }));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("parseUser fails with wrong type", () => {
    const exit = Effect.runSyncExit(parseUser({ name: 123, age: "thirty" }));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("parseStrictUser succeeds with valid input", () => {
    const result = Effect.runSync(parseStrictUser({ name: "Alice", age: 30 }));
    expect(result).toEqual({ name: "Alice", age: 30 });
  });

  it("parseStrictUser fails with empty name", () => {
    const exit = Effect.runSyncExit(parseStrictUser({ name: "", age: 30 }));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("parseStrictUser fails with negative age", () => {
    const exit = Effect.runSyncExit(parseStrictUser({ name: "Alice", age: -1 }));
    expect(Exit.isFailure(exit)).toBe(true);
  });
});
