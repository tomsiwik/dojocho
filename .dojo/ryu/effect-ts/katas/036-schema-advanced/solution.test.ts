import { Effect, Exit, Schema } from "effect";
import { describe, expect, it } from "vitest";
import {
  PositiveInt,
  DateFromString,
  UserSchema,
  decodeUser,
  encodeUser,
} from "./solution.js";

describe("036 — Schema Advanced", () => {
  it("PositiveInt accepts positive integers", () => {
    const result = Effect.runSync(Schema.decodeUnknown(PositiveInt)(5));
    expect(result).toBe(5);
    // Must reject non-integers (verifies int() filter is applied)
    const exit = Effect.runSyncExit(Schema.decodeUnknown(PositiveInt)(1.5));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("PositiveInt rejects negative numbers", () => {
    const exit = Effect.runSyncExit(Schema.decodeUnknown(PositiveInt)(-1));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("PositiveInt rejects non-integers", () => {
    const exit = Effect.runSyncExit(Schema.decodeUnknown(PositiveInt)(1.5));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("DateFromString transforms date string to Date", () => {
    const result = Effect.runSync(
      Schema.decodeUnknown(DateFromString)("2024-01-15"),
    );
    expect(result).toBeInstanceOf(Date);
    expect((result as Date).getFullYear()).toBe(2024);
  });

  it("decodeUser succeeds with valid data", () => {
    const result = Effect.runSync(decodeUser({ id: 1, name: "Alice" }));
    expect(result).toEqual({ id: 1, name: "Alice" });
    // Must reject invalid id (verifies UserSchema uses PositiveInt)
    const exit = Effect.runSyncExit(decodeUser({ id: -1, name: "Alice" }));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("decodeUser fails with invalid id", () => {
    const exit = Effect.runSyncExit(decodeUser({ id: -1, name: "Alice" }));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("decodeUser fails with empty name", () => {
    const exit = Effect.runSyncExit(decodeUser({ id: 1, name: "" }));
    expect(Exit.isFailure(exit)).toBe(true);
  });
});
