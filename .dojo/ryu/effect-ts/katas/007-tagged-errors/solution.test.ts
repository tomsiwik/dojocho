import { Effect, Exit } from "effect";
import { describe, expect, it } from "vitest";
import {
  findUser,
  findUserOrDefault,
  NotFoundError,
  validateAge,
  ValidationError,
} from "./solution.js";

describe("007 — Tagged Errors", () => {
  describe("findUser", () => {
    it("findUser(1) succeeds with { id: 1, name: 'User 1' }", () => {
      const result = Effect.runSync(findUser(1));
      expect(result).toEqual({ id: 1, name: "User 1" });
    });

    it("findUser(42) succeeds with { id: 42, name: 'User 42' }", () => {
      const result = Effect.runSync(findUser(42));
      expect(result).toEqual({ id: 42, name: "User 42" });
    });

    it("findUser(-1) fails with NotFoundError", () => {
      const exit = Effect.runSyncExit(findUser(-1));
      expect(Exit.isFailure(exit)).toBe(true);
      if (Exit.isFailure(exit)) {
        expect(exit.cause).toMatchObject({
          _tag: "Fail",
          error: { _tag: "NotFoundError" },
        });
      }
    });
  });

  describe("validateAge", () => {
    it("validateAge(25) succeeds with 25", () => {
      expect(Effect.runSync(validateAge(25))).toBe(25);
    });

    it("validateAge(0) succeeds with 0", () => {
      expect(Effect.runSync(validateAge(0))).toBe(0);
    });

    it("validateAge(150) succeeds with 150", () => {
      expect(Effect.runSync(validateAge(150))).toBe(150);
    });

    it("validateAge(-1) fails with ValidationError", () => {
      const exit = Effect.runSyncExit(validateAge(-1));
      expect(Exit.isFailure(exit)).toBe(true);
      if (Exit.isFailure(exit)) {
        expect(exit.cause).toMatchObject({
          _tag: "Fail",
          error: { _tag: "ValidationError" },
        });
      }
    });

    it("validateAge(151) fails with ValidationError", () => {
      const exit = Effect.runSyncExit(validateAge(151));
      expect(Exit.isFailure(exit)).toBe(true);
      if (Exit.isFailure(exit)) {
        expect(exit.cause).toMatchObject({
          _tag: "Fail",
          error: { _tag: "ValidationError" },
        });
      }
    });
  });

  describe("findUserOrDefault", () => {
    it("findUserOrDefault(1) succeeds with { id: 1, name: 'User 1' }", () => {
      const result = Effect.runSync(findUserOrDefault(1));
      expect(result).toEqual({ id: 1, name: "User 1" });
    });

    it("findUserOrDefault(-1) recovers with { id: 0, name: 'Guest' }", () => {
      const result = Effect.runSync(findUserOrDefault(-1));
      expect(result).toEqual({ id: 0, name: "Guest" });
    });
  });
});
