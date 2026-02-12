import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { greet, hello, lazyRandom } from "./solution.js";

describe("001 — Hello Effect", () => {
  it("hello() succeeds with 'Hello, Effect!'", () => {
    const result = Effect.runSync(hello());
    expect(result).toBe("Hello, Effect!");
  });

  it("lazyRandom() produces a number between 0 and 1", () => {
    const result = Effect.runSync(lazyRandom());
    expect(result).toBeTypeOf("number");
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(1);
  });

  it("lazyRandom() is lazy (re-evaluates on each run)", () => {
    const effect = lazyRandom();
    const results = Array.from({ length: 10 }, () => Effect.runSync(effect));
    const unique = new Set(results);
    // Running the same Effect 10 times should produce multiple distinct values
    expect(unique.size).toBeGreaterThan(1);
  });

  it("greet('World') succeeds with 'Hello, World!'", () => {
    const result = Effect.runSync(greet("World"));
    expect(result).toBe("Hello, World!");
  });

  it("greet('Effect') succeeds with 'Hello, Effect!'", () => {
    const result = Effect.runSync(greet("Effect"));
    expect(result).toBe("Hello, Effect!");
  });
});
