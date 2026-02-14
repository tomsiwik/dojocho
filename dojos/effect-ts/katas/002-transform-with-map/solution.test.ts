import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { double, doubleAndFormat, strlen } from "@/katas/002-transform-with-map/solution.js";

describe("002 — Transform with Map", () => {
  it("double(5) succeeds with 10", () => {
    expect(Effect.runSync(double(5))).toBe(10);
  });

  it("double(0) succeeds with 0", () => {
    expect(Effect.runSync(double(0))).toBe(0);
  });

  it("double(-3) succeeds with -6", () => {
    expect(Effect.runSync(double(-3))).toBe(-6);
  });

  it("strlen('hello') succeeds with 5", () => {
    expect(Effect.runSync(strlen("hello"))).toBe(5);
  });

  it("strlen('') succeeds with 0", () => {
    expect(Effect.runSync(strlen(""))).toBe(0);
  });

  it("doubleAndFormat(5) succeeds with 'Result: 10'", () => {
    expect(Effect.runSync(doubleAndFormat(5))).toBe("Result: 10");
  });

  it("doubleAndFormat(0) succeeds with 'Result: 0'", () => {
    expect(Effect.runSync(doubleAndFormat(0))).toBe("Result: 0");
  });
});
