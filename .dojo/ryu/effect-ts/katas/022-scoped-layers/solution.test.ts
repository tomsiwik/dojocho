import { Effect, Exit } from "effect";
import { describe, expect, it } from "vitest";
import { Database, DatabaseLive, runQuery } from "./solution.js";

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

  it("DatabaseLive disconnects even when query fails", () => {
    const log: string[] = [];
    const program = Effect.scoped(
      Effect.provide(
        Effect.gen(function* () {
          const db = yield* Database;
          return yield* db.query("FAIL").pipe(
            Effect.flatMap(() => Effect.fail("query error")),
          );
        }),
        DatabaseLive(log),
      ),
    );
    const exit = Effect.runSyncExit(program);
    expect(Exit.isFailure(exit)).toBe(true);
    expect(log).toContain("db:connected");
    expect(log).toContain("db:disconnected");
  });
});
