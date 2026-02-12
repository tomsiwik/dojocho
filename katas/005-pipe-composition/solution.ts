import { Effect, pipe } from "effect";

/** Use pipe to: start with Effect.succeed(n), double it, add 1, convert to string */
export const processNumber = (n: number): Effect.Effect<string> => {
  throw new Error("Not implemented");
};

/** Use .pipe() fluent style to validate name is non-empty and age >= 0,
 * then format as "{name} (age {age})"
 * Fail with "InvalidName" or "InvalidAge" respectively */
export const processUser = (name: string, age: number): Effect.Effect<string, string> => {
  throw new Error("Not implemented");
};

/** Use pipe to compose: parse string to int (fail with "ParseError"),
 * validate > 0 (fail with "NotPositive"), format as "Value: {n}" */
export const pipeline = (s: string): Effect.Effect<string, string> => {
  throw new Error("Not implemented");
};
