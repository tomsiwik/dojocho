import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import {
  makeUserCache,
  cachedLookup,
  demonstrateCaching,
} from "./solution.js";

describe("037 — Cache and Memoization", () => {
  it("makeUserCache creates a cache", async () => {
    const cache = await Effect.runPromise(
      makeUserCache((key) => Effect.succeed(`user:${key}`)),
    );
    expect(cache).toBeDefined();
  });

  it("cachedLookup returns the computed value", async () => {
    const cache = await Effect.runPromise(
      makeUserCache((key) => Effect.succeed(`user:${key}`)),
    );
    const result = await Effect.runPromise(cachedLookup(cache, "alice"));
    expect(result).toBe("user:alice");
  });

  it("cachedLookup returns same value on repeated calls", async () => {
    let callCount = 0;
    const cache = await Effect.runPromise(
      makeUserCache((key) =>
        Effect.sync(() => {
          callCount++;
          return `user:${key}`;
        }),
      ),
    );
    const r1 = await Effect.runPromise(cachedLookup(cache, "bob"));
    const r2 = await Effect.runPromise(cachedLookup(cache, "bob"));
    expect(r1).toBe("user:bob");
    expect(r2).toBe("user:bob");
    expect(callCount).toBe(1);
  });

  it("demonstrateCaching returns same value and only computes once", async () => {
    const [r1, r2, count] = await Effect.runPromise(demonstrateCaching());
    expect(r1).toBe(r2);
    expect(count).toBe(1);
  });
});
