import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { Random, getRandomNumber, rollDice } from "./solution.js";

const TestRandom = {
  next: Effect.succeed(4),
};

describe("011 — Services and Context", () => {
  it("getRandomNumber returns the service value", () => {
    const result = Effect.runSync(
      Effect.provideService(getRandomNumber, Random, TestRandom),
    );
    expect(result).toBe(4);
  });

  it("rollDice formats the result", () => {
    const result = Effect.runSync(
      Effect.provideService(rollDice, Random, TestRandom),
    );
    expect(result).toBe("Roll: 4");
  });
});
