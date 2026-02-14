import { Effect, Schedule, Ref } from "effect";

/** Retry the given effect up to 3 times using Schedule.recurs(3) */
export const retryThreeTimes = <A, E>(
  effect: Effect.Effect<A, E>,
): Effect.Effect<A, E> => {
  throw new Error("Not implemented");
};

/** Create an effect that fails n times then succeeds with "done".
 * Use a Ref to track attempt count. On each call, increment ref;
 * if count <= failCount, fail with "attempt {count}"; else succeed with "done". */
export const flakyEffect = (failCount: number): Effect.Effect<string, string> =>
  Effect.gen(function* () {
    throw new Error("Not implemented");
  });

/** Repeat the effect 3 times using Schedule.recurs(3) and collect the results */
export const repeatCollect = (
  effect: Effect.Effect<number>,
): Effect.Effect<number[]> => {
  throw new Error("Not implemented");
};
