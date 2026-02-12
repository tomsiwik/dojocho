import { Effect, Stream, Chunk } from "effect";

// TODO: Create a Stream from an array and collect all elements back to an array
export const streamFromArray = (items: number[]): Effect.Effect<number[]> => {
  throw new Error("Not implemented");
};

// TODO: Create a stream from [1,2,3,4,5], filter even numbers, double them, collect
export const filterAndDouble = (): Effect.Effect<number[]> => {
  throw new Error("Not implemented");
};

// TODO: Use Stream.runFold to sum all elements
export const sumStream = (items: number[]): Effect.Effect<number> => {
  throw new Error("Not implemented");
};
