import { Effect } from "effect";

/** Use Effect.acquireRelease to create a resource, and Effect.ensuring
 * to add additional cleanup. Log "acquire", "ensure-cleanup", "release" to the log array */
export const withEnsuring = (log: string[]): Effect.Effect<string> => {
  throw new Error("Not implemented");
};

/** Use Effect.acquireRelease where the "use" phase fails.
 * Verify the resource is still released. Return "released" if cleanup happened. */
export const releaseOnFailure = (log: string[]): Effect.Effect<string> => {
  throw new Error("Not implemented");
};
