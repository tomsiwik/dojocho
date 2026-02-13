import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { useResource, useTwoResources } from "./solution.js";

describe("021 — Acquire Release", () => {
  it("useResource acquires, uses, and releases", () => {
    const log: string[] = [];
    const result = Effect.runSync(useResource("db", log));
    expect(result).toBe("db");
    expect(log).toEqual(["db:open", "db:used", "db:closed"]);
  });

  it("useTwoResources releases in reverse order", () => {
    const log: string[] = [];
    Effect.runSync(useTwoResources(log));
    expect(log[0]).toBe("a:open");
    expect(log[1]).toBe("b:open");
    // Resources used
    // Release in reverse: b first, then a
    expect(log[log.length - 2]).toBe("b:closed");
    expect(log[log.length - 1]).toBe("a:closed");
  });
});
