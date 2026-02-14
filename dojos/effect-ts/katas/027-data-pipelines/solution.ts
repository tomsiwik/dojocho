import { Effect, Stream } from "effect";

/** Use Stream.mapEffect to asynchronously process each item
 * Apply fn to each element in the stream, collect results */
export const processItems = <A, B>(
  items: A[],
  fn: (a: A) => Effect.Effect<B>,
): Effect.Effect<B[]> => {
  throw new Error("Not implemented");
};

/** Build a pipeline: take array of strings, parse to numbers (skip non-numeric),
 * filter positives, sum them */
export const sumPositiveNumbers = (items: string[]): Effect.Effect<number> => {
  throw new Error("Not implemented");
};
