import { Effect, Duration } from "effect";

// TODO: Race two effects, returning whichever succeeds first
export const raceTwo = <A, E>(
  a: Effect.Effect<A, E>,
  b: Effect.Effect<A, E>,
): Effect.Effect<A, E> => {
  throw new Error("Not implemented");
};

// TODO: Add a timeout to the effect. If it doesn't complete within the duration,
// fail with "timeout"
export const withTimeout = <A>(
  effect: Effect.Effect<A, string>,
  duration: Duration.DurationInput,
): Effect.Effect<A, string> => {
  throw new Error("Not implemented");
};

// TODO: Try the effect with a timeout; if it times out, return the fallback value
export const withTimeoutFallback = <A>(
  effect: Effect.Effect<A>,
  duration: Duration.DurationInput,
  fallback: A,
): Effect.Effect<A> => {
  throw new Error("Not implemented");
};
