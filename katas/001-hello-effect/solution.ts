import { Effect } from "effect";

// TODO: Return an Effect that succeeds with "Hello, Effect!"
export const hello = (): Effect.Effect<string> => {
  throw new Error("Not implemented");
};

// TODO: Return an Effect that lazily produces a random number (0-1)
export const lazyRandom = (): Effect.Effect<number> => {
  throw new Error("Not implemented");
};

// TODO: Return an Effect that succeeds with "Hello, {name}!"
export const greet = (name: string): Effect.Effect<string> => {
  throw new Error("Not implemented");
};
