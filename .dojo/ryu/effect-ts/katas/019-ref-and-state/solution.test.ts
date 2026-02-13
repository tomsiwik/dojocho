import { Effect, Ref } from "effect";
import { describe, expect, it } from "vitest";
import { counter, accumulate, getAndIncrement } from "@/katas/019-ref-and-state/solution.js";

describe("019 — Ref and State", () => {
  it("counter(5) returns 5", () => {
    expect(Effect.runSync(counter(5))).toBe(5);
  });

  it("counter(0) returns 0", () => {
    expect(Effect.runSync(counter(0))).toBe(0);
  });

  it("accumulate collects all items", () => {
    const result = Effect.runSync(accumulate(["a", "b", "c"]));
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("getAndIncrement returns current then increments", () => {
    const program = Effect.gen(function* () {
      const ref = yield* Ref.make(0);
      const a = yield* getAndIncrement(ref);
      const b = yield* getAndIncrement(ref);
      const c = yield* getAndIncrement(ref);
      return [a, b, c];
    });
    expect(Effect.runSync(program)).toEqual([0, 1, 2]);
  });
});
