import { Option } from "effect";
import { describe, expect, it } from "vitest";
import { fromNullable, describeOption, doubleOption, safeDivide, getOrDefault } from "./solution.js";

describe("009 — Option Type", () => {
  it("fromNullable converts value to Some", () => {
    expect(fromNullable(42)).toEqual(Option.some(42));
  });

  it("fromNullable converts null to None", () => {
    expect(fromNullable(null)).toEqual(Option.none());
  });

  it("fromNullable converts undefined to None", () => {
    expect(fromNullable(undefined)).toEqual(Option.none());
  });

  it("describe returns 'Found: hello' for Some", () => {
    expect(describeOption(Option.some("hello"))).toBe("Found: hello");
  });

  it("describe returns 'Nothing' for None", () => {
    expect(describeOption(Option.none())).toBe("Nothing");
  });

  it("doubleOption doubles Some(5) to Some(10)", () => {
    expect(doubleOption(Option.some(5))).toEqual(Option.some(10));
  });

  it("doubleOption returns None for None", () => {
    expect(doubleOption(Option.none())).toEqual(Option.none());
  });

  it("safeDivide(10, 2) returns Some(5)", () => {
    expect(safeDivide(10, 2)).toEqual(Option.some(5));
  });

  it("safeDivide(10, 0) returns None", () => {
    expect(safeDivide(10, 0)).toEqual(Option.none());
  });

  it("getOrDefault extracts Some value", () => {
    expect(getOrDefault(Option.some(42), 0)).toBe(42);
  });

  it("getOrDefault returns default for None", () => {
    expect(getOrDefault(Option.none(), 0)).toBe(0);
  });
});
