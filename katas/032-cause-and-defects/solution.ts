import { Effect } from "effect";

/** Create an effect that dies with "boom" */
export const boom: Effect.Effect<never> = Effect.fail("Not implemented") as any;

/** Catch defects from an effect, returning the defect message as a string */
export const catchDefect = <A>(
  effect: Effect.Effect<A>,
): Effect.Effect<A | string> => {
  throw new Error("Not implemented");
};

/** Sandbox an effect to expose its full Cause */
export const sandboxed = <A, E>(
  effect: Effect.Effect<A, E>,
): Effect.Effect<A, unknown> => {
  throw new Error("Not implemented");
};

/** If n < 0, die with "negative". If n === 0, fail with "zero". Otherwise succeed. */
export const safeDivide = (n: number): Effect.Effect<number, string> => {
  throw new Error("Not implemented");
};
