import { Effect } from "effect";

export interface ParseError {
  readonly _tag: "ParseError";
  readonly input: string;
}

/** Use Effect.gen to succeed with n * 2 */
export const fetchAndDouble = (n: number): Effect.Effect<number> => {
  throw new Error("Not implemented");
};

/** Use Effect.gen to get the length of a and b, then return their sum */
export const combinedLength = (
  a: string,
  b: string,
): Effect.Effect<number> => {
  throw new Error("Not implemented");
};

/** Use Effect.gen to:
 *   1. Parse s as an integer (fail with ParseError if invalid)
 *   2. Double the result
 *   3. Return formatted as "Result: {doubled}" */
export const pipeline = (
  s: string,
): Effect.Effect<string, ParseError> => {
  throw new Error("Not implemented");
};
