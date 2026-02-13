import { Effect } from "effect";

/** Use Effect.log to log a message, then return "done" */
export const logAndReturn = (message: string): Effect.Effect<string> => {
  throw new Error("Not implemented");
};

/** Use Effect.annotateLogs to add { requestId } annotation,
 * then log the message, then return "done" */
export const logWithContext = (requestId: string, message: string): Effect.Effect<string> => {
  throw new Error("Not implemented");
};

/** Use Effect.withSpan to wrap a computation in a named span */
export const withTracking = <A, E>(
  name: string,
  effect: Effect.Effect<A, E>,
): Effect.Effect<A, E> => {
  throw new Error("Not implemented");
};
