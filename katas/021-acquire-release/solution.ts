import { Effect } from "effect";

// Simulates a resource that tracks open/close state
export interface Resource {
  readonly id: string;
  readonly isOpen: boolean;
}

/** Use Effect.acquireRelease to:
 * - Acquire: push "{id}:open" to the log array, return { id, isOpen: true }
 * - Release: push "{id}:closed" to the log array
 * - Use: push "{id}:used" to the log array, return the resource id
 * Wrap with Effect.scoped */
export const useResource = (id: string, log: string[]): Effect.Effect<string> => {
  throw new Error("Not implemented");
};

/** Use Effect.acquireRelease with two resources sequentially in Effect.gen
 * Both should be acquired, used, and released (in reverse order) */
export const useTwoResources = (log: string[]): Effect.Effect<string> => {
  throw new Error("Not implemented");
};
