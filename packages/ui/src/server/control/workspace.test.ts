import { describe, expect, it } from "vitest";
import { threadOwnsSession } from "./workspace";

describe("session route ownership", () => {
  it("only resolves the exact native transcript named by the URL", () => {
    const thread = { sessionId: "current", aliases: ["superseded"] };
    expect(threadOwnsSession(thread, "current")).toBe(true);
    expect(threadOwnsSession(thread, "superseded")).toBe(false);
    expect(threadOwnsSession(thread, "unrelated")).toBe(false);
  });
});
