import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import {
  GetUser,
  makeUserResolver,
  getUser,
  getUsers,
} from "@/katas/040-request-batching/solution.js";

const testData = new Map([
  [1, "Alice"],
  [2, "Bob"],
  [3, "Charlie"],
]);

const testLookup = (ids: number[]) =>
  Effect.succeed(
    new Map(
      ids
        .filter((id) => testData.has(id))
        .map((id) => [id, testData.get(id)!]),
    ),
  );

describe("040 — Request Batching", () => {
  it("getUser fetches a single user", async () => {
    const resolver = makeUserResolver(testLookup);
    const result = await Effect.runPromise(getUser(1, resolver));
    expect(result).toBe("Alice");
  });

  it("getUser fails for unknown id", async () => {
    const resolver = makeUserResolver(testLookup);
    const result = await Effect.runPromise(
      Effect.either(getUser(99, resolver)),
    );
    expect(result._tag).toBe("Left");
  });

  it("getUsers fetches multiple users", async () => {
    const resolver = makeUserResolver(testLookup);
    const result = await Effect.runPromise(getUsers([1, 2, 3], resolver));
    expect(result).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("getUsers batches requests into a single resolver call", async () => {
    let batchCount = 0;
    const countingLookup = (ids: number[]) => {
      batchCount++;
      return testLookup(ids);
    };
    const resolver = makeUserResolver(countingLookup);
    await Effect.runPromise(getUsers([1, 2, 3], resolver));
    expect(batchCount).toBe(1);
  });
});
