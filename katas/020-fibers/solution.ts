import { Effect, Fiber } from "effect";

/** Fork the effect into a background fiber, then join it to get the result */
export const forkAndJoin = <A, E>(
  effect: Effect.Effect<A, E>,
): Effect.Effect<A, E> => {
  throw new Error("Not implemented");
};

/** Fork two effects, join both, return their results as a tuple */
export const forkBoth = <A, B, E>(
  a: Effect.Effect<A, E>,
  b: Effect.Effect<B, E>,
): Effect.Effect<[A, B], E> => {
  throw new Error("Not implemented");
};

/** Fork the effect, then immediately interrupt the fiber, return "interrupted" */
export const forkAndInterrupt = (
  effect: Effect.Effect<string>,
): Effect.Effect<string> => {
  throw new Error("Not implemented");
};
