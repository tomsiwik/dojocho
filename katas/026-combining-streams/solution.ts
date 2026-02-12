import { Effect, Stream } from "effect";

// TODO: Concatenate two streams sequentially
export const concatStreams = (a: number[], b: number[]): Effect.Effect<number[]> => {
  throw new Error("Not implemented");
};

// TODO: Zip two streams into tuples
export const zipStreams = (a: number[], b: string[]): Effect.Effect<[number, string][]> => {
  throw new Error("Not implemented");
};

// TODO: Merge two streams (interleaved, order may vary)
export const mergeStreams = (a: number[], b: number[]): Effect.Effect<number[]> => {
  throw new Error("Not implemented");
};
