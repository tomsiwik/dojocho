import type { UIMessage } from "@tanstack/ai-client";
import { describe, expect, it } from "vitest";
import { projectChatTimeline } from "./chat-timeline";

const message = (id: string): UIMessage => ({ id, role: "assistant", parts: [{ type: "text", content: id }] });

describe("chat timeline projection", () => {
  it("keeps a host event anchored before later agent output", () => {
    expect(projectChatTimeline(
      [message("before"), message("agent-response")],
      [{ afterMessageId: "before", message: message("check") }],
    ).map(({ id }) => id)).toEqual(["before", "check", "agent-response"]);
  });

  it("retains an event when its anchor is no longer in the recovered window", () => {
    expect(projectChatTimeline(
      [message("recovered")],
      [{ afterMessageId: "missing", message: message("check") }],
    ).map(({ id }) => id)).toEqual(["recovered", "check"]);
  });
});
