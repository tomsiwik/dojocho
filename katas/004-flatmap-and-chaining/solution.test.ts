import { Effect, Exit } from "effect";
import { describe, expect, it } from "vitest";
import { lookupAndGreet, validateAndProcess, logAndReturn } from "./solution.js";

describe("004 — FlatMap and Chaining", () => {
  it("lookupAndGreet(0) succeeds with 'Hello, Alice!'", () => {
    expect(Effect.runSync(lookupAndGreet(0))).toBe("Hello, Alice!");
  });

  it("lookupAndGreet(1) succeeds with 'Hello, Bob!'", () => {
    expect(Effect.runSync(lookupAndGreet(1))).toBe("Hello, Bob!");
  });

  it("lookupAndGreet(99) fails with 'NotFound'", () => {
    const exit = Effect.runSyncExit(lookupAndGreet(99));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("validateAndProcess('hello') succeeds with 'HELLO'", () => {
    expect(Effect.runSync(validateAndProcess("hello"))).toBe("HELLO");
  });

  it("validateAndProcess('') fails with 'EmptyInput'", () => {
    const exit = Effect.runSyncExit(validateAndProcess(""));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("logAndReturn records side effect and returns value", () => {
    const log: string[] = [];
    const result = Effect.runSync(logAndReturn("test", log));
    expect(result).toBe("test");
    expect(log).toContain("test");
  });
});
