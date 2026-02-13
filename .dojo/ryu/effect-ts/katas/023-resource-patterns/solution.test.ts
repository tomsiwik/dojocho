import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { withEnsuring, releaseOnFailure } from "./solution.js";

describe("023 — Resource Patterns", () => {
  it("withEnsuring runs all cleanup", () => {
    const log: string[] = [];
    Effect.runSync(withEnsuring(log));
    expect(log).toContain("acquire");
    expect(log).toContain("ensure-cleanup");
    expect(log).toContain("release");
  });

  it("releaseOnFailure still releases on error", () => {
    const log: string[] = [];
    const result = Effect.runSync(releaseOnFailure(log));
    expect(result).toBe("released");
    expect(log).toContain("release");
  });
});
