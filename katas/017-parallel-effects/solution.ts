import { Effect } from "effect";

// TODO: Run all effects in parallel using Effect.all with { concurrency: "unbounded" }
export const fetchAll = <A, E>(
  effects: Effect.Effect<A, E>[],
): Effect.Effect<A[], E> => {
  throw new Error("Not implemented");
};

// TODO: Use Effect.forEach with { concurrency: 3 } to process items
// Apply the given function to each item with at most 3 concurrent operations
export const processWithLimit = <A, B, E>(
  items: A[],
  fn: (a: A) => Effect.Effect<B, E>,
): Effect.Effect<B[], E> => {
  throw new Error("Not implemented");
};
