import { Data, Match } from "effect";

type ShapeDefinition = {
  readonly Circle: { readonly radius: number };
  readonly Rectangle: { readonly width: number; readonly height: number };
  readonly Triangle: { readonly base: number; readonly height: number };
};

type Shape = Data.TaggedEnum<ShapeDefinition>;

export const Shape = Data.taggedEnum<ShapeDefinition>();

/** Compute the area of a shape using pattern matching
 * Circle: π * r², Rectangle: w * h, Triangle: (b * h) / 2 */
export const area = (shape: Shape): number => {
  throw new Error("Not implemented");
};

/** Describe a shape as a string using pattern matching
 * "Circle with radius {r}", "Rectangle {w}x{h}", "Triangle {b}x{h}" */
export const describeShape = (shape: Shape): string => {
  throw new Error("Not implemented");
};

/** Classify a number as "negative", "zero", or "positive" using Match.when */
export const classifyNumber = (n: number): string => {
  throw new Error("Not implemented");
};
