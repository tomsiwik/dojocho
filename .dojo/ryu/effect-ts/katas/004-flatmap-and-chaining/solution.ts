import { Effect } from "effect";

/** Use Effect.flatMap to look up a name by id (0→"Alice", 1→"Bob", else fail with "NotFound")
 * then return "Hello, {name}!" */
export const lookupAndGreet = (id: number): Effect.Effect<string, string> => {
  throw new Error("Not implemented");
};

/** Use Effect.andThen to first validate input is non-empty (fail with "EmptyInput" if empty),
 * then transform to uppercase */
export const validateAndProcess = (input: string): Effect.Effect<string, string> => {
  throw new Error("Not implemented");
};

/** Use Effect.tap to record the value to a mutable array (sideEffects), then return the value unchanged */
export const logAndReturn = (value: string, sideEffects: string[]): Effect.Effect<string> => {
  throw new Error("Not implemented");
};
