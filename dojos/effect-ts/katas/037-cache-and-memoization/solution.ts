import { Cache, Duration, Effect } from "effect";

/** Create a cache with the given lookup function, capacity 100, TTL 5 minutes */
export const makeUserCache = (
  lookup: (key: string) => Effect.Effect<string>,
): Effect.Effect<Cache.Cache<string, never, string>> => {
  throw new Error("Not implemented");
};

/** Look up a key in the cache */
export const cachedLookup = (
  cache: Cache.Cache<string, never, string>,
  key: string,
): Effect.Effect<string> => {
  throw new Error("Not implemented");
};

/** Demonstrate that two lookups for the same key only call the function once
 * Return [result1, result2, callCount] */
export const demonstrateCaching = (): Effect.Effect<
  [string, string, number]
> => {
  throw new Error("Not implemented");
};
