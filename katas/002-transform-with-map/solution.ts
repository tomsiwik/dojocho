import { Effect } from "effect";

// TODO: Return an Effect that succeeds with n * 2
export const double = (n: number): Effect.Effect<number> => {
  throw new Error("Not implemented");
};

// TODO: Return an Effect that succeeds with the length of s
export const strlen = (s: string): Effect.Effect<number> => {
  throw new Error("Not implemented");
};

// TODO: Use pipe + Effect.map to double n, then format as "Result: {doubled}"
export const doubleAndFormat = (n: number): Effect.Effect<string> => {
  throw new Error("Not implemented");
};
