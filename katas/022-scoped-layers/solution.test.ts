import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { DatabaseLive, runQuery } from "./solution.js";

describe("022 — Scoped Layers", () => {
  it("DatabaseLive connects and disconnects", () => {
    const log: string[] = [];
    const program = Effect.scoped(
      Effect.provide(runQuery("SELECT 1"), DatabaseLive(log)),
    );
    const result = Effect.runSync(program);
    expect(result).toBe("result:SELECT 1");
    expect(log).toContain("db:connected");
    expect(log).toContain("db:disconnected");
  });
});
