import { describe, expect, it } from "vitest";
import { Shape, area, describeShape, classifyNumber } from "@/katas/033-pattern-matching/solution.js";

describe("033 — Pattern Matching", () => {
  it("area of Circle", () => {
    expect(area(Shape.Circle({ radius: 5 }))).toBeCloseTo(Math.PI * 25);
  });

  it("area of Rectangle", () => {
    expect(area(Shape.Rectangle({ width: 4, height: 6 }))).toBe(24);
  });

  it("area of Triangle", () => {
    expect(area(Shape.Triangle({ base: 10, height: 5 }))).toBe(25);
  });

  it("describeShape for Circle", () => {
    expect(describeShape(Shape.Circle({ radius: 3 }))).toBe("Circle with radius 3");
  });

  it("describeShape for Rectangle", () => {
    expect(describeShape(Shape.Rectangle({ width: 4, height: 6 }))).toBe("Rectangle 4x6");
  });

  it("classifyNumber negative", () => {
    expect(classifyNumber(-5)).toBe("negative");
  });

  it("classifyNumber zero", () => {
    expect(classifyNumber(0)).toBe("zero");
  });

  it("classifyNumber positive", () => {
    expect(classifyNumber(7)).toBe("positive");
  });
});
