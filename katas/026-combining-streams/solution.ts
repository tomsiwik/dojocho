import { Effect, Stream } from "effect";

/** Concatenate two streams sequentially */
export const concatStreams = (a: number[], b: number[]): Effect.Effect<number[]> => {
  throw new Error("Not implemented");
};

/** Zip two streams into tuples */
export const zipStreams = (a: number[], b: string[]): Effect.Effect<[number, string][]> => {
  throw new Error("Not implemented");
};

/** Merge two streams (interleaved, order may vary) */
export const mergeStreams = (a: number[], b: number[]): Effect.Effect<number[]> => {
  throw new Error("Not implemented");
};
