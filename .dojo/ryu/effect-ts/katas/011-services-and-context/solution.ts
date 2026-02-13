import { Context, Effect } from "effect";

// A simple "Random" service that produces random numbers
export class Random extends Context.Tag("Random")<
  Random,
  { readonly next: Effect.Effect<number> }
>() {}

/** Use Effect.flatMap or Effect.gen to access the Random service and return its next value */
export const getRandomNumber = Effect.gen(function* () {
  throw new Error("Not implemented");
});

/** Access Random service and return "Roll: {n}" where n is the random value */
export const rollDice = Effect.gen(function* () {
  throw new Error("Not implemented");
});
