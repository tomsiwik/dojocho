import { Effect, Ref } from "effect";

// TODO: Create a Ref with initial value 0, increment it n times, return final value
export const counter = (n: number): Effect.Effect<number> => {
  throw new Error("Not implemented");
};

// TODO: Create a Ref<string[]>, push each item from the list, return the accumulated array
export const accumulate = (items: string[]): Effect.Effect<string[]> => {
  throw new Error("Not implemented");
};

// TODO: Use Ref.modify to atomically read and update: return current value and increment by 1
export const getAndIncrement = (ref: Ref.Ref<number>): Effect.Effect<number> => {
  throw new Error("Not implemented");
};
