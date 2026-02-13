import { Effect, Stream } from "effect";

/** Take the first n elements from a stream of numbers 1,2,3,... */
export const takeFirst = (n: number): Effect.Effect<number[]> => {
  throw new Error("Not implemented");
};

/** Use Stream.scan to compute running totals of the input array
 * e.g., [1,2,3] -> [1,3,6] */
export const runningTotal = (items: number[]): Effect.Effect<number[]> => {
  throw new Error("Not implemented");
};

/** Use Stream.grouped to batch items into chunks of size n, return as array of arrays */
export const batchItems = (items: number[], size: number): Effect.Effect<number[][]> => {
  throw new Error("Not implemented");
};
