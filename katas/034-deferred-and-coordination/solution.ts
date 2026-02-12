import { Deferred, Effect, Fiber } from "effect";

/** Create a Deferred, complete it with the value, and await the result */
export const completeAndAwait = <A>(
  value: A,
): Effect.Effect<A> => {
  throw new Error("Not implemented");
};

/** Create a Deferred, fork a fiber that completes it, await the result */
export const forkThenComplete = <A>(
  value: A,
): Effect.Effect<A> => {
  throw new Error("Not implemented");
};

/** Create a gate (Deferred<void>), fork two fibers that wait on it,
 * open the gate, join both fibers and return [a, b] */
export const gatedExecution = <A, B>(
  a: A,
  b: B,
): Effect.Effect<[A, B]> => {
  throw new Error("Not implemented");
};
