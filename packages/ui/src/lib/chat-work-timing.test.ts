import { describe, expect, it } from "vitest";
import { updateChatWorkTiming } from "./chat-work-timing";

describe("chat work timing", () => {
  it("keeps one clock across streaming projections and freezes it on completion", () => {
    const started = updateChatWorkTiming({}, true, 1_000);
    expect(updateChatWorkTiming(started, true, 1_400)).toBe(started);
    const completed = updateChatWorkTiming(started, false, 4_700);
    expect(completed).toEqual({ startedAt: 1_000, completedAt: 4_700 });
    expect(updateChatWorkTiming(completed, false, 9_000)).toBe(completed);
  });

  it("starts a fresh clock for the next run", () => {
    expect(updateChatWorkTiming({ startedAt: 1_000, completedAt: 2_000 }, true, 5_000))
      .toEqual({ startedAt: 5_000 });
  });
});
